const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const AssetsPlugin = require('assets-webpack-plugin')
const path = require('path');
const fileLoaderName = 'fonts/[name].[ext]';
const hashDate = Date.now();

//Generates view object for us
let views = function(env) {
    let viewsToReturn = {};

    //Generates object mapping { dir: directory, file: file (from 'fs') }
    function genViewsFromDir(dir) {
        return fs.readdirSync(dir).map((file) => {
            return {dir: dir, file};
        });
    };

    const viewFiles = [].concat(
        genViewsFromDir('./app/platform/views/'),
        genViewsFromDir('./app/public/views/')
    );

    viewFiles.forEach((view) => {
        if(['app.js', '.DS_Store'].indexOf(view.file) != -1) return;

        viewsToReturn[view.file.replace('.js', '')] = [view.dir + view.file];
    });

    return viewsToReturn;
};

//Generates plugins for webpack
let plugins = function(env) {
    //Base plugins
    let plugins = [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new ExtractTextPlugin('css/[name].css'),
        new AssetsPlugin({
            path: './public/build',
            filename: 'assets.json',
            prettyPrint: true
        })
    ];

    if(env === 'production') {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        );
        plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify("production")
                }
            })
        );
    }

    return plugins;
}

//Define output obj. for webpack
let output = function(env) {
    if(env === 'production') {
        return {
            path: `./public/build/${hashDate}/`,
            filename: 'js/[name].js',
            publicPath: `/build/${hashDate}/`
        }
    } else {
        return {
            path: './public/build/',
            filename: 'js/[name].js',
            publicPath: '/build/'
        }
    }
}

/**
 * Exports webpack JSON config
 * @param  {String} env The environment we're in
 * @return {Object} Webpack confing
 */
module.exports = (env = 'dev') => {
    return {
        entry: views(env),
        output: output(env),
        plugins: plugins(env),
        watch: env === 'dev',
        devtool: env === 'dev' ? 'eval-source-map' : null,
        module: {
            loaders: [
                //Babel
                {
                    test: /.jsx?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        presets: ['es2015', 'react'],
                        plugins: ['transform-object-rest-spread', 'transform-es2015-destructuring'],
                    }
                },
                //Extract sass files
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract("style-loader", "!css!resolve-url!sass?sourceMap")
                },
                {
                    test: /.(woff(2)?)(\?[a-z0-9=\.]+)?$/,
                    loader: 'url',
                    query: {
                        limit: '10000',
                        mimetype: 'application/font-woff',
                        name: fileLoaderName
                    }
                },
                {
                    test: /.(ttf)(\?[a-z0-9=\.]+)?$/,
                    loader: 'url',
                    query: {
                        limit: '10000',
                        mimetype: 'application/octet-stream',
                        name: fileLoaderName
                    }
                },
                {
                    test: /.(svg)(\?[a-z0-9=\.]+)?$/,
                    loader: 'url',
                    query: {
                        limit: '10000',
                        mimetype: 'image/svg+xml',
                        name: fileLoaderName
                    }
                },
                {
                    test: /.(eot)(\?[a-z0-9=\.]+)?$/,
                    loader: 'file',
                    query: {
                        name: fileLoaderName
                    }
                },
                {
                    test: /\.(eot|ttf|svg|gif|png)$/,
                    loader: 'file-loader',
                    query: {
                        name: fileLoaderName
                    }
                }
            ]
        },
        resolve: {
            //All these extensions will be resolved without specifying extension in the `require` function
            extensions: ['', '.js', '.scss'],
            //Files in these directory can be required without a relative path
            modulesDirectories: [
                'node_modules',
                'bower_components',
                'lib',
                './',
            ]
        }
    }
}
