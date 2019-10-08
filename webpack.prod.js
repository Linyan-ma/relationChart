const path = require('path');


const common = require('./webpack.config.js');
const webpack = require('webpack')
const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const os = require('os');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');
module.exports = merge(common('production'), {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        // new CopyWebpackPlugin([ {from:'images/**/*',to:'./',context: './src/'}], {debug:'debug'}),
        new CleanWebpackPlugin(),
        new UglifyJsParallelPlugin({
            workers: os.cpus().length,
            mangle: true,
            compressor: {
               warnings: false,
               drop_console: true,
               drop_debugger: true
            }
         })
    ],
    // optimization: {
    //     minimizer: [new UglifyJsPlugin({
    //         uglifyOptions:{
    //             exclude:  /(node_modules|bower_components)/,
    //             compress:{
    //                 drop_console:true
    //             }
    //         }

    //     })],
    //   },
});