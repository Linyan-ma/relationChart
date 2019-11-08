const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env,options)=>{    
    return merge(common('development'), {
        devtool: 'inline-source-map',
        devServer: {
            contentBase: "/",
            open: true,
            port: 8070,
            inline: true,
            hot: true,
            // host: '0.0.0.0',
            compress: false,
            historyApiFallback:true,
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('development')
                }
            }),
            new webpack.HotModuleReplacementPlugin(),
            new CopyWebpackPlugin([ {from:'assets/*.json',to:'./',context: './src/'}], {debug:'debug'}),
            // new ExtractTextPlugin({
            //     filename: './css/[name].css'
            // }),
        ]
    });
} 