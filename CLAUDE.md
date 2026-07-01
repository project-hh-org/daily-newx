# daily-newx — 프로젝트 규칙/컨텍스트

> 매일의 LLM 뉴스: 스케줄 루틴이 하루치 이슈를 수집 → Supabase 저장 → 공개 리더(웹+iOS)로 노출.
> 글로벌 하네스 규칙(TS strict·단방향 import·Conventional Commits·main 직접 push 금지 등)은 그대로 준수.

## 구조 (yarn workspaces 모노레포)
- `apps/api` — Next.js 14 App Router. 읽기 라우트 + Bearer 인증 인제스트, Supabase(service_role 서버 전용, RLS public-read published). `blocks jsonb` 자유 본문 블록(15종).
- `apps/reader` — Expo SDK 56 (RN 0.85, React 19, expo-router). 웹+iOS 공용.
- 데이터 파일: `apps/api/data/*.json` (루틴 산출물).

## 앱 식별 / 배포 대상
- 홈 아이콘 이름 **"브리핑 LLM"** (ASC 앱 이름은 daily-newx). 번들ID `com.projecthh.dailynewx`, Team `ZAT9VDF4D4`, App ID `6781994189`, EAS projectId는 app.json `extra.eas.projectId`.
- 안 쓰는 번들ID(kr.co.dailynewx, kr.co.danble.dailynewx) 존재 — 신규 앱/식별자 **함부로 만들지 말 것**. 식별자 관련은 반드시 사용자 확인.
- **발행 시각 = 오전 9시** (`apps/reader/src/lib/date.ts` `PUBLISH_HOUR=9`). 변경 시 이 상수만.

## 리더 디자인 규칙
- 팔레트: `apps/reader/src/lib/theme.ts` — bone `#F2F0E9` / ink `#15161A` / body `#34353A` / muted `#8B8A86` / hairline `#D8D5CC` / **spot=navy `#22324F`** / spotTint `#E7E9EF`. **강조색 절제**(스프링클 금지), 박스 카드 대신 헤어라인.
- 폰트: 제목 `NanumMyeongjo`, 본문 `Pretendard`.
- IA: `/` = 오늘 호 목차(`TodayScreen`, 없으면 발행예정/없음 배너 + 최신 호 폴백). 섹션(카테고리·주제·주체·지난 호)은 마스트헤드 메뉴.
- 크럼(‹)은 항상 `useBackOr()` 사용(뒤로가기 우선, 히스토리 없을 때만 navigate). `router.push`로 뒤로가기 만들지 말 것.
- Figma: file key `mp4GxIM04uMn6AdnfrGzQA`, `tokens` 변수 + `DS / Components`.

## 배포 / CI / OTA
- **웹**: main push → Amplify 자동 재배포(apps/reader → `expo export -p web` → dist).
- **iOS 네이티브 빌드**: `ios-v*` 태그 push → EAS Workflow(`apps/reader/.eas/workflows/ios-release.yml`)가 빌드+TestFlight 제출. (매 push 빌드 아님)
  - 예: `git tag ios-v0.1.2 && git push origin ios-v0.1.2`
  - EAS↔GitHub Base directory는 반드시 **`apps/reader`**.
- **JS-only 배포(OTA)**: `yarn ship "메시지"` (루트 `scripts/ship.sh`) = commit+push(웹 자동) + `eas update --branch production`. 리빌드 불필요.
  - runtimeVersion policy = `appVersion`: 버전 같으면 OTA, 버전 올리면 새 빌드 필요.
  - expo-updates는 native 설정 → 최초 1회 빌드해야 OTA 수신 가능.

## 함정 / 교훈
- **TestFlight "요청된 앱은 사용할 수 없거나 존재하지 않습니다"(install 404, "Error Downloading Install Data")**: 빌드·서명·계약·컴플라이언스·가용성·팀·계정이 다 정상인데도 날 수 있음 → 대개 **Apple 측 배포 반영 지연**. config 재점검에 시간 쏟지 말고: ① 시뮬레이터로 코드 정상 확인 → ② 기기 Console.app `installd` 로그로 실제 에러코드 확인 → ③ 다 정상이면 대기/Apple Developer 지원. 미출시 앱이 전 지역 "앱 출시 후 사용 가능"인 건 **정상**(가용성 원인 아님).
- 샌드박스(코워크)에서 git 쓰기는 스테일 `.git/index.lock` 권한 문제로 막힐 수 있음 → 커밋/머지/푸시는 사용자 로컬에서.
