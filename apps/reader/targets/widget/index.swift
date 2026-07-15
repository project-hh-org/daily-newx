import WidgetKit
import SwiftUI
import UIKit

// 위젯이 직접 호출하는 경량 엔드포인트 (앱과 데이터 공유 불필요).
private let apiURL = URL(string: "https://daily-newx.vercel.app/api/today")!
private let appURL = URL(string: "dailynewx://")!
private let cacheKey = "brief.cache.v1"

struct Brief: Codable {
  struct Item: Codable {
    let id: String?
    let title: String
    let source_name: String
  }
  let issue_date: String
  let issue_no: Int?
  let is_today: Bool
  let items: [Item]
}

/// 갤러리 미리보기·플레이스홀더용 샘플(네트워크 대기 없음).
private let sampleBrief = Brief(
  issue_date: "2026-07-09",
  issue_no: 24,
  is_today: true,
  items: [
    .init(id: "sample-1", title: "오늘의 핵심을 3줄로 요약", source_name: "브리핑 LLM"),
    .init(id: "sample-2", title: "모든 기사에 원문 출처 표기", source_name: "브리핑 LLM"),
    .init(id: "sample-3", title: "광고 없이, 핵심만", source_name: "브리핑 LLM"),
  ]
)

enum BriefState {
  case fresh(Brief)      // 방금 받아옴
  case cached(Brief)     // 네트워크 실패 → 마지막 성공분
  case empty             // 캐시도 없음
}

struct BriefEntry: TimelineEntry {
  let date: Date
  let state: BriefState
}

private func saveCache(_ brief: Brief) {
  guard let data = try? JSONEncoder().encode(brief) else { return }
  UserDefaults.standard.set(data, forKey: cacheKey)
}

private func loadCache() -> Brief? {
  guard let data = UserDefaults.standard.data(forKey: cacheKey) else { return nil }
  return try? JSONDecoder().decode(Brief.self, from: data)
}

/// 아티클 상세로 이동하는 딥링크. id 가 없으면(구버전 캐시 등) nil → 탭 시 앱만 열림.
private func articleURL(_ id: String?) -> URL? {
  guard let id, !id.isEmpty else { return nil }
  let encoded = id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? id
  return URL(string: "dailynewx://article/\(encoded)")
}

private func isAccessoryFamily(_ family: WidgetFamily) -> Bool {
  switch family {
  case .accessoryCircular, .accessoryRectangular, .accessoryInline: return true
  default: return false
  }
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> BriefEntry {
    BriefEntry(date: Date(), state: .fresh(sampleBrief))
  }

  func getSnapshot(in context: Context, completion: @escaping (BriefEntry) -> Void) {
    // 갤러리 미리보기는 즉시 그려야 하므로 샘플(또는 캐시)로 응답.
    if context.isPreview {
      completion(BriefEntry(date: Date(), state: .fresh(loadCache() ?? sampleBrief)))
      return
    }
    resolve { completion(BriefEntry(date: Date(), state: $0)) }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<BriefEntry>) -> Void) {
    resolve { state in
      let entry = BriefEntry(date: Date(), state: state)
      // 성공하면 1시간 뒤, 실패하면 15분 뒤 재시도.
      let minutes: Int
      switch state {
      case .fresh: minutes = 60
      case .cached, .empty: minutes = 15
      }
      let next = Calendar.current.date(byAdding: .minute, value: minutes, to: Date())
        ?? Date().addingTimeInterval(TimeInterval(minutes * 60))
      completion(Timeline(entries: [entry], policy: .after(next)))
    }
  }

  /// 네트워크 → 실패 시 캐시 → 그것도 없으면 empty.
  private func resolve(_ done: @escaping (BriefState) -> Void) {
    var req = URLRequest(url: apiURL)
    req.cachePolicy = .reloadIgnoringLocalCacheData
    req.timeoutInterval = 10
    URLSession.shared.dataTask(with: req) { data, response, _ in
      let ok = (response as? HTTPURLResponse).map { (200..<300).contains($0.statusCode) } ?? false
      if ok, let data, let brief = try? JSONDecoder().decode(Brief.self, from: data) {
        saveCache(brief)
        done(.fresh(brief))
        return
      }
      if let cached = loadCache() {
        done(.cached(cached))
        return
      }
      done(.empty)
    }.resume()
  }
}

// MARK: - 홈 화면 위젯 (small / medium / large)

struct HomeScreenBriefView: View {
  let family: WidgetFamily
  let entry: BriefEntry

  private var maxItems: Int {
    switch family {
    case .systemSmall: return 1
    case .systemMedium: return 2
    default: return 3
    }
  }

  private var brief: Brief? {
    switch entry.state {
    case .fresh(let b), .cached(let b): return b
    case .empty: return nil
    }
  }

  /// 우상단 상태 배지 — 오프라인(캐시) / 최신호 폴백.
  private var badge: String? {
    switch entry.state {
    case .cached: return "오프라인"
    case .fresh(let b): return b.is_today ? nil : "최신"
    case .empty: return nil
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 6) {
        Text("$ today --llm")
          .font(.system(size: 10, weight: .semibold, design: .monospaced))
          .foregroundStyle(.secondary)
        Spacer(minLength: 0)
        if let badge {
          Text(badge)
            .font(.system(size: 9, weight: .semibold))
            .foregroundStyle(.secondary)
        }
      }

      if let brief, !brief.items.isEmpty {
        let items = Array(brief.items.prefix(maxItems).enumerated())
        if family == .systemLarge {
          // 가장 큰 위젯: 리스트 영역을 아이템 수만큼 균등 분할해 남는 여백 없이 채운다.
          // 각 행을 Link 로 감싸 탭하면 해당 아티클 상세로 바로 이동.
          VStack(alignment: .leading, spacing: 0) {
            ForEach(items, id: \.offset) { index, item in
              itemRow(index: index, item: item, large: true)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
          }
        } else {
          VStack(alignment: .leading, spacing: 8) {
            ForEach(items, id: \.offset) { index, item in
              itemRow(index: index, item: item, large: false)
            }
          }
          Spacer(minLength: 0)
        }
      } else {
        VStack(alignment: .leading, spacing: 4) {
          Text("아직 받아온 브리핑이 없어요")
            .font(.system(size: 12, weight: .semibold))
          Text("연결되면 자동으로 채워집니다")
            .font(.system(size: 10))
            .foregroundStyle(.secondary)
        }
        Spacer(minLength: 0)
      }
    }
    .padding(12)
  }

  @ViewBuilder
  private func itemRow(index: Int, item: Brief.Item, large: Bool) -> some View {
    let row = HStack(alignment: .top, spacing: 6) {
      Text(String(format: "[%02d]", index + 1))
        .font(.system(size: 10, design: .monospaced))
        .foregroundStyle(.secondary)
      VStack(alignment: .leading, spacing: 2) {
        Text(item.title)
          .font(.system(size: large ? 15 : (family == .systemSmall ? 12 : 13), weight: .semibold))
          .lineLimit(large ? 3 : (family == .systemSmall ? 4 : 2))
          .truncationMode(.tail)
        if large {
          Text(item.source_name)
            .font(.system(size: 11))
            .foregroundStyle(.secondary)
            .lineLimit(1)
            .truncationMode(.tail)
        }
      }
    }

    // 가장 큰 위젯의 각 행만 개별 탭 타겟(iOS 17+ 다중 Link) → 아티클 상세.
    if large, let url = articleURL(item.id) {
      Link(destination: url) { row }
    } else {
      row
    }
  }
}

// MARK: - 잠금화면 / StandBy 위젯 (accessory)

struct AccessoryCircularBriefView: View {
  let entry: BriefEntry

  private var count: Int {
    switch entry.state {
    case .fresh(let b), .cached(let b): return b.items.count
    case .empty: return 0
    }
  }

  var body: some View {
    ZStack {
      AccessoryWidgetBackground()
      VStack(spacing: 1) {
        Text("LLM")
          .font(.system(size: 9, weight: .bold, design: .monospaced))
        Text("\(count)")
          .font(.system(size: 15, weight: .bold))
      }
    }
    .widgetAccentable()
  }
}

struct AccessoryRectangularBriefView: View {
  let entry: BriefEntry

  private var firstItem: Brief.Item? {
    switch entry.state {
    case .fresh(let b), .cached(let b): return b.items.first
    case .empty: return nil
    }
  }

  var body: some View {
    // 라벨 한 줄을 없애고 헤드라인에 공간을 몰아준다 — 위젯 이름은 잠금화면이 아이콘으로 이미 보여준다.
    // lineLimit 을 늘려 사각형 위젯의 세로 공간을 최대한 텍스트로 채운다.
    let content = VStack(alignment: .leading, spacing: 3) {
      Text("$ today --llm")
        .font(.system(size: 9, weight: .semibold, design: .monospaced))
        .foregroundStyle(.secondary)
        .widgetAccentable()
      if let firstItem {
        Text(firstItem.title)
          .font(.system(size: 13, weight: .semibold))
          .lineLimit(3)
          .truncationMode(.tail)
      } else {
        Text("연결되면 자동으로 채워집니다")
          .font(.system(size: 13))
          .foregroundStyle(.secondary)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

    if let url = articleURL(firstItem?.id) {
      Link(destination: url) { content }
    } else {
      content
    }
  }
}

struct AccessoryInlineBriefView: View {
  let entry: BriefEntry

  private var firstTitle: String? {
    switch entry.state {
    case .fresh(let b), .cached(let b): return b.items.first?.title
    case .empty: return nil
    }
  }

  var body: some View {
    if let firstTitle {
      Text("오늘의 LLM: \(firstTitle)")
    } else {
      Text("오늘의 LLM 소식")
    }
  }
}

// MARK: - 진입점

struct BriefWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: BriefEntry

  var body: some View {
    Group {
      switch family {
      case .accessoryCircular:
        AccessoryCircularBriefView(entry: entry)
      case .accessoryRectangular:
        AccessoryRectangularBriefView(entry: entry)
      case .accessoryInline:
        AccessoryInlineBriefView(entry: entry)
      default:
        HomeScreenBriefView(family: family, entry: entry)
      }
    }
    .widgetURL(appURL)
    .containerBackground(for: .widget) {
      if isAccessoryFamily(family) {
        Color.clear
      } else {
        Color(UIColor.systemBackground)
      }
    }
  }
}

@main
struct BriefWidget: Widget {
  private let kind = "BriefWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      BriefWidgetView(entry: entry)
    }
    .configurationDisplayName("브리핑 LLM")
    .description("오늘의 LLM 소식 헤드라인")
    .supportedFamilies([
      .systemSmall, .systemMedium, .systemLarge,
      .accessoryCircular, .accessoryRectangular, .accessoryInline,
    ])
  }
}
