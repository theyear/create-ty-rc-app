const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "../../");
const HTML_TEMPLATE_PATH = path.resolve(ROOT_PATH, "./public/index.html");

const common = {
  entry: [path.resolve(ROOT_PATH, "./src/index.tsx")],
  output: {
    publicPath: process.env.PUBLIC_URL || "/",
    path: path.resolve(ROOT_PATH, "build"),
    filename: "[name].[chunkhash].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": process.env,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(ROOT_PATH, "public"),
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: [HTML_TEMPLATE_PATH],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: HTML_TEMPLATE_PATH,
      env: process.env,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        render: {
          chunks: "initial",
          test: /react|(react-dom)/,
          name: "react",
        },
      },
    },
  },
};

module.exports = {
  common,
  ROOT_PATH,
};
