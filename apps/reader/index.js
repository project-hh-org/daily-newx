// 로컬 entry — 모노레포 hoist 환경에서 안전한 진입점.
// expo-router/entry 를 bare import 로 불러 metro 의 nodeModulesPaths(루트 node_modules)로 해석되게 한다.
// (main 을 "expo-router/entry" 로 두면 프로젝트 상대경로 ./node_modules/... 로 찾다가 hoist 때문에 404 남)
import "expo-router/entry";
import { Platform } from "react-native";

// Android 홈 위젯 헤드리스 태스크 등록(iOS/웹엔 해당 네이티브 모듈이 없어 로드하지 않음).
if (Platform.OS === "android") {
  const { registerWidgetTaskHandler } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./src/widgets/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}
