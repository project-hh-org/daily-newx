module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // reanimated 4 — 내비게이션 등이 reanimated 를 쓸 수 있어 worklets 플러그인 유지(마지막).
    plugins: ["react-native-worklets/plugin"],
  };
};
