const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}

module.exports = {
  devtool: 'cheap-source-map',
	mode: 'development',
  performance: {
    hints: false,
  },
  devServer: {
    contentBase: root('.'),
    watchContentBase: true,
    port: 9090,
    stats: 'errors-only'
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', 'ts', '.json'],
  },
  entry: ['./src/index.tsx'],
  output: {
    path: root('.'),
    filename: 'dist/main.js',
    sourceMapFilename: '[file].map',
  },
  module: {
    rules: [
			{
				test: /\.mjs$/,
				include: /node_modules/,
				type: 'javascript/auto',
			},
      {
        test: /.[jt]sx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'dist/main.css',
      allChunks: true,
    }),
    // Workaround for https://github.com/graphql/graphql-language-service/issues/128
    new webpack.IgnorePlugin(/\.js\.flow$/, /graphql-language-service-interface[\\/]dist$/)
	],
	optimization: {
    minimizer: [
      // new UglifyJsPlugin({
      //   cache: true,
      //   parallel: true,
      //   sourceMap: true // set to true if you want JS source maps
      // }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
};
