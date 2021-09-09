var path = require('path');
var webpack = require('webpack');
module.exports={
    mode: "production",
    devtool: "source-map",
    entry: './src/index.ts',
    output:{
        path: '/Users/user/workspace/crux/oviz',
        filename: 'index.js'
    },
    resolve:{
        extensions:  ['.js', '.jsx', '.ts', '.tsx']
    },
    module:{
        rules: 
        [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }]
    }
}