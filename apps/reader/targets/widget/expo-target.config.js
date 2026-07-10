/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  // Xcode 타깃/번들 이름은 ASCII 로 유지(EAS appExtensions 매칭·서명 안정성).
  // 위젯 갤러리에 보이는 이름은 index.swift 의 configurationDisplayName 이 담당.
  name: "widget",
  icon: "../../assets/icon.png",
  deploymentTarget: "17.0",
};
