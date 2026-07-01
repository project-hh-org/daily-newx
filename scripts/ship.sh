#!/usr/bin/env bash
# JS-only 변경 배포: 커밋 + push(웹 Amplify 자동배포) + OTA(eas update).
# 사용법: yarn ship "메시지"
set -euo pipefail

MSG="${1:?사용법: yarn ship \"커밋/업데이트 메시지\"}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
git add -A
# 변경이 있을 때만 커밋(없으면 통과)
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
fi
git push

# OTA: production 채널 빌드에 JS 반영 (리빌드 없음)
cd "$ROOT/apps/reader"
eas update --branch production --message "$MSG" --non-interactive

echo "✅ git push + OTA(production) 완료: $MSG"
echo "   ↳ 웹은 Amplify 자동 재배포, iOS/설치앱은 다음 실행 시 JS 갱신."
