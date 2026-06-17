// Expo + yarn workspaces 모노레포 metro 설정.
// 루트(hoist된) node_modules 를 watch/해석하도록 구성해야 번들이 깨지지 않는다.
// 참고: https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1) 모노레포 전체를 watch
config.watchFolders = [monorepoRoot];

// 2) 로컬 → 루트 순으로 node_modules 해석
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
