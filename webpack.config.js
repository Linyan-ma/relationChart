const path = require('path');

// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = (mode) => ({
    mode,
    entry: {
        app: './src/index.js',
        // vendor:['lodash','plyr','jszip','rxjs']
    },
    output: {
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/vendor.[hash].js',
        path: path.resolve(__dirname, 'dist'),
        // publicPath: mode === 'development' ? '/' : '/home/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.scss'],
        alias: {
            '@root': resolve('src'),
            '@configs': resolve('src/configs'),
            '@views': resolve('src/views'),
            '@scss': resolve('src/scss'),
            '@components': resolve('src/components'),
            '@assets': resolve('src/assets'),
        },
        symlinks: false
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new HtmlWebpackPlugin({
            title: '',
            template: path.resolve(__dirname, './src/index.html'),
            inject: 'body'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: 'css/[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        // new CopyWebpackPlugin([
        //     {from: 'lib/*.js', to: './js/', context: './src/'},
        //     {from: 'static_fonts/*.*', to: './fonts/', context: './src/'}],{debug:'debug'}),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                        minimize: true, //css压缩
                        url: true //Enable/Disable url() handling
                    }
                }
                ]
            },
            {
                test: /\.scss$/,
                include: [resolve('src/scss')],
                use: [MiniCssExtractPlugin.loader, 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [require('autoprefixer')({
                            'browsers': ['> 1%', 'last 2 versions', 'ie 10']
                        })],
                    }
                }, 'sass-loader']
            },

            // {
            //     test: /\.(png|jpg|jpeg|gif)$/i,
            //     use: [{
            //         loader: 'url-loader',
            //         options: {
            //             limit: 81,
            //             name: 'images/[name].[ext]'
            //         }
            //     }]
            // }, 

            {
                test: /\.js[x]?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            }
        ]
    }
})