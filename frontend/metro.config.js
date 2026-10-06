const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem 16 makes rem-based sizes (text-sm, p-4, ...) match the web on phones;
// NativeWind's native default is 14, which shrinks every size by 12.5%.
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
