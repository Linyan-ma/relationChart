const path = require('path');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = (mode) => ({
    mode,
    entry: {
        app:'./src/index.js',
        // vendor:['lodash','plyr','jszip','rxjs']
    },
    output: {
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/vendor.[hash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: mode === 'development' ? '/' : '/home/'
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
    optimization:{
        splitChunks: {
            cacheGroups: {
                vendors: {
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendor',
                  chunks:'all'
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
        // new CopyWebpackPlugin([
        //     {from: 'lib/*.js', to: './js/', context: './src/'},
        //     {from: 'static_fonts/*.*', to: './fonts/', context: './src/'}],{debug:'debug'}),
    ],
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/i,
                exclude: /(static_fonts)/,
                include:[resolve('src/fonts')],
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[hash:5].[ext]',
                        publicPath: "../"
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ['style-loader', {
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
                include:[resolve('src/scss'),resolve('src/components')],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: "css-loader",
                        options: {
                            sourceMap: false,
                            minimize: true, //css压缩
                            url: true //Enable/Disable url() handling
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [require('autoprefixer')({
                                'browsers': ['> 1%', 'last 2 versions','ie 10']
                            })],
                        }
                    }, {
                        loader: "sass-loader",
                        options: {
                            sourceMap: false,
                            sourceMapContents: false
                        }
                    }, {
                        loader: 'sass-resources-loader',
                        options: {
                            sourceMap: false,
                            resources: ['./src/scss/theme.scss', './src/scss/mixins.scss']
                        }
                    }]
                })

                // use style-loader in development
                // fallback: "style-loader"
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
                        cacheDirectory:true,
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    }
})