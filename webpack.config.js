const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const posthtml = require('posthtml');
const posthtmlWebp = require('posthtml-webp');
const posthtmlReplace = require('posthtml-replace');

const SRC = path.resolve(__dirname, 'src');
const DIST = path.resolve(__dirname, 'dist');

const PAGES_DIR = `${SRC}/pug/pages`;
const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.pug'));

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: { chunks: 'all' },
  };

  if (isProd) {
    config.minimizer = [

      new CssMinimizerPlugin(),

      new TerserPlugin(),

      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['mozjpeg', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
            ],
          },
        },
        generator: [
          {
            preset: 'webp',
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ['imagemin-webp'],
            },
          },
        ],
      }),

    ];
  }

  return config;
};

module.exports = {
  context: SRC,
  mode: process.env.NODE_ENV,
  entry: {
    index: ['@babel/polyfill', './index.js'],
    script: './script.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: DIST,
    assetModuleFilename: '[path][name][ext]',
  },
  resolve: {
    // Массив расширений которые можно будет не указывать в import
    extensions: ['.js'],
    alias: {
      '@': SRC,
    },
  },
  optimization: optimization(),
  devServer: {
    port: 666,
    watchFiles: `${SRC}/**/*.pug`,
  },
  devtool: isDev ? 'source-map' : false,
  plugins: [

    // Удалет старый /dist
    new CleanWebpackPlugin(),

    // html
    ...PAGES.map((page) => new HtmlWebpackPlugin({
      template: `${PAGES_DIR}/${page}`,
      filename: `./${page.replace(/\.pug/, '.html')}`,
      minify: {
        collapseWhitespace: false,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
    })),

    // Обработка css - собирает все в один файл
    new MiniCssExtractPlugin({
      filename: './css/[name].[contenthash].css',
    }),

    // eslint
    new ESLintPlugin({
      extensions: ['js'],
    }),

  ],
  module: {
    rules: [

      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },

      { test: /\.s[ac]ss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },

      {
        test: /\.(png|jpe?g|gif|webp|ico|svg)$/,
        type: 'asset/resource',
      },

      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            // plugins: [], // Плагины для babel сюда
          },
        },
      },

      {
        test: /\.pug/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false,
              preprocessor: (content, loaderContext) => {
                let result;

                try {
                  result = posthtml([
                    // Делаем из img -> picture
                    // img(src=*.jpg) -> picture [ source(srcset=*.jpg.webp) img(src=*.jpg) ]
                    posthtmlWebp(),
                    // Чтоб правильно конвертировались картинки в webp нужно передать ?as=webp
                    posthtmlReplace([
                      {
                        match: { tag: 'source' },
                        attrs: { srcset: { from: '.webp', to: '?as=webp' } },
                      },
                    ]),
                  ])
                    .process(content, { sync: true });
                } catch (error) {
                  loaderContext.emitError(error);
                  return content;
                }

                return result.html;
              },
            },
          },
          { loader: 'pug-html-loader', options: { pretty: true } },
        ],
      },

    ],
  },
};
