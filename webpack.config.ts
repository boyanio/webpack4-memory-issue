const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (env, options) => {
  const dist = path.resolve(__dirname, "dist");
  const enableSourceMaps = true;

  const setDevtool = (config) => {
    if (enableSourceMaps) {
      config.devtool = "source-map";
    }
  };

  const appConfig = {
    mode: "development",
    entry: {
      app: "./src/app.ts",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(dist, "js"),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: path.resolve(__dirname, "tsconfig.json"),
                compilerOptions: {
                  sourceMap: enableSourceMaps,
                },
                // If I enable this and use ForkTsCheckerWebpackPlugin below, I don't
                // get memory issues anymore when using sourcemaps
                //transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      //new ForkTsCheckerWebpackPlugin(),
      new CleanWebpackPlugin(),
      new ManifestPlugin(),
    ],
  };
  setDevtool(appConfig);

  const cssConfig = {
    mode: "development",
    entry: {
      app: "./src/app.less",
    },
    output: {
      path: path.resolve(dist, "css"),
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: "css-loader" },
            { loader: "less-loader" },
          ],
        },
      ],
    },
    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({
          // enable proper sourcemaps in the
          // default CSS processor - cssnano
          cssProcessorOptions: enableSourceMaps
            ? { map: { inline: false, annotation: true } }
            : {},
        }),
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ManifestPlugin(),
      new MiniCssExtractPlugin(),
    ],
  };
  setDevtool(cssConfig);

  return [appConfig, cssConfig];
};
