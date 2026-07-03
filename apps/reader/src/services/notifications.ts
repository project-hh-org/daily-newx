import * as Notifications from "expo-notifications";

// 발행 시점 서버 푸시(원격)로 일원화 — 로컬 예약 리마인더는 제거됨.
// 여기선 포그라운드 표시 핸들러와 권한 요청만 담당.

// 포그라운드에서도 배너 표시.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}
