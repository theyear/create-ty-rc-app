const { merge } = require("webpack-merge");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const prodConifg = require("./prod");

module.exports = merge(prodConifg, {
  plugins: [new BundleAnalyzerPlugin()],
});
