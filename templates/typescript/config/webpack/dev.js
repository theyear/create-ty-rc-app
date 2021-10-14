const { merge } = require("webpack-merge");
const path = require("path");

const WpConifg = require("./base");

const PORT = process.env.PORT || 3000;

module.exports = merge(WpConifg.common, {
  mode: "development",
  target: "web",
  devServer: {
    host: "0.0.0.0",
    port: PORT,
    historyApiFallback: {
      index: WpConifg.common.output.publicPath,
    },
    hot: true,
  },
  output: {
    path: path.resolve(WpConifg.ROOT_PATH, "dist"),
  },
});
