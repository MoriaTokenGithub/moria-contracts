const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var webpack = require('webpack')
var test = require('json-loader')
require('truffle-solidity-loader')

module.exports = {
    entry: './app/javascripts/app.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js'
    },
    plugins: [
        // Copy our app's index.html to the build folder.
        new CopyWebpackPlugin([
            { from: './app/index.html', to: "index.html" }
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                'RPC': process.env.RPCPORT
            }
        }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      })
    ],
    module: {
        rules: [
            // {
            //   enforce: 'pre',
            //   test: /\.js(x)?$/,
            //   loader: 'eslint-loader'
            // },
            {
                test: /\.js(x)?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.(s)?css$/,
                use: [
                    {
                        loader: 'style-loader'
                    }, 
                    {
                        loader: 'css-loader',
                        options: {
                            camelCase: true,
                            importLoaders: 1,
                            localIdentName: '[path][name]__[local]--[hash:base64:5]',
                            modules: true,
                            sourceMap: true
                        }
                    }, 
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            },
            {
                test: /\.sol$/,
                use: [
                    { loader: 'json-loader' },
                    { loader: 'truffle-solidity-loader?migrations_directory=' + path.resolve(__dirname, './migrations') + '&network=development' }
                ]
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            },            
        ],
        noParse: /lie\.js|[\s\S]*.(svg|ttf|eot)$/
    },
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/api\/balance/, to: '/app/dummy-balance.html' },
        { from: /^\/api\/total/, to: '/app/dummy-total.html' },
        { from: /^\/api\/dividends/, to: '/app/dummy-total.html' },
      ]
    }  
  }
}

