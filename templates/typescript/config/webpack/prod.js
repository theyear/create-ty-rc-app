const { merge } = require("webpack-merge");

const WpConifg = require("./base");

module.exports = merge(WpConifg.common, {
  mode: "production",
  // target: ["web", "es5"],
});
