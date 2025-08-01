/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
const {useBabelRc, addWebpackResolve, addWebpackPlugin, override} = require('customize-cra-5');
const webpack = require('webpack');

module.exports = override(
   useBabelRc(),
   addWebpackResolve({
      fallback: {
         process: require.resolve('process/browser'),
         zlib: require.resolve('browserify-zlib'),
         stream: require.resolve('stream-browserify'),
         util: require.resolve('util'),
         buffer: require.resolve('buffer'),
         assert: require.resolve('assert'),
      },
   }),
   addWebpackPlugin(
      new webpack.ProvidePlugin({
         Buffer: ['buffer', 'Buffer'],
         process: 'process/browser.js',
      })
   )
);
