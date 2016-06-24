/**
 * Created by Administrator on 2016/6/13.
 */
//module.exports={
//    entry:{
//        animation:"./src/animation.js",
//    },
//    output:{
//        path:__dirname + '/build',
//        filename:'[name].js',
//        library:'animation',
//        libraryTarget:'umd'
//    }
//}

var path = require("path");
var HtmlwebpackPlugin = require("html-webpack-plugin");
require("css-loader");
require("style-loader");


var ROOT_PATH=path.resolve(__dirname);
var TEST_PATH=path.resolve(ROOT_PATH,"./test/demo/test.js");
var BUILD_PATH=path.resolve(ROOT_PATH,"./test/build");

module.exports={
    entry:TEST_PATH,
    output:{
        path:BUILD_PATH,
        filename:"[name].js"
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                include: path.resolve(ROOT_PATH,"./test/demo/")
            },
            {
                test:/\.scss$/,
                loaders: ['style-loader', 'css-loader','sass-loader'],
                include: path.resolve(ROOT_PATH,"./test/demo/")
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url?limit=999'
            }
        ]
    },

    plugins:[new HtmlwebpackPlugin({
        title:"test webpack"
    })]
}
