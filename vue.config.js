const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  publicPath: "",
  outputDir: "addon/dist",
  configureWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      config.mode = "production";
      config.devtool = false;
    } else {
      config.mode = "development";
      config.devtool = "source-map";
    }

    config.plugins.push(new MonacoWebpackPlugin());
  }
};
