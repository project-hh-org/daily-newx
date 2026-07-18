-- 2026-07-18 중복 푸시 사고 이후 추가: 발행 알림(Expo push)을 이미 보냈는지
-- 원자적으로 추적하기 위한 컬럼. daily-news POST가 같은 issue_date로 여러 번
-- (재시도·디버깅용 재게시 포함) 성공해도 브로드캐스트는 정확히 한 번만 나가야 한다.
-- apps/api/src/services/newsRepository.ts의 tryClaimNotification()이
-- "UPDATE ... WHERE notified_at IS NULL" 로 원자적 클레임에 사용.

alter table public.daily_issues add column if not exists notified_at timestamptz;
