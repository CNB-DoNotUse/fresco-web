const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const autoprefixer = require('autoprefixer');
const fileLoaderName = 'fonts/[name].[ext]';
const hashDate = Date.now();

// Generates view object for us
const views = () => {
    const viewsToReturn = {};

    // Generates object mapping { dir: directory, file: file (from 'fs') }
    function genViewsFromDir(dir) {
        return fs.readdirSync(dir).map((file) => (
            { dir, file }
        ));
    }

    const viewFiles = [].concat(
        genViewsFromDir('./app/platform/views/'),
        genViewsFromDir('./app/public/views/')
    );

    viewFiles.forEach((view) => {
        if (['app.js', '.DS_Store'].indexOf(view.file) !== -1) return;

        viewsToReturn[view.file.replace('.js', '')] = [view.dir + view.file, 'babel-polyfill'];
    });

    return viewsToReturn;
};

// Generates plugins for webpack
const plugins = (env) => {
    // Base plugins
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
        }),
    ];

    if (env === 'dev') {
        plugins.push(
            new webpack.DefinePlugin({
                'process.env': { __DEV__: true },
            })
        );
    }

    if (env === 'production') {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        );
        plugins.push(
            new webpack.DefinePlugin({
                'process.env': { NODE_ENV: JSON.stringify('production') }
            })
        );
    }

    return plugins;
};

// Define output obj. for webpack
const output = (env) => {
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
};

const loaders = (env) => {
    let arr = [
        // Babel
        {
            test: /.jsx?$/,
            loader: 'babel',
            exclude: /(node_modules|bower_components)/,
            query: {
                presets: ['es2015', 'react'],
                plugins: [
                    'transform-object-rest-spread',
                    'transform-es2015-destructuring',
                    'transform-class-properties',
                ],
            },
        },
        {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css?sourceMap!resolve-url!sass?sourceMap!postcss'),
        },
        {
            test: /.(woff(2)?)(\?[a-z0-9=\.]+)?$/,
            loader: 'url',
            query: {
                limit: '10000',
                mimetype: 'application/font-woff',
                name: fileLoaderName,
            },
        },
        {
            test: /.(ttf)(\?[a-z0-9=\.]+)?$/,
            loader: 'url',
            query: {
                limit: '10000',
                mimetype: 'application/octet-stream',
                name: fileLoaderName,
            },
        },
        {
            test: /.(svg)(\?[a-z0-9=\.]+)?$/,
            loader: 'url',
            query: {
                limit: '10000',
                mimetype: 'image/svg+xml',
                name: fileLoaderName,
            },
        },
        {
            test: /.(eot)(\?[a-z0-9=\.]+)?$/,
            loader: 'file',
            query: { name: fileLoaderName },
        },
        {
            test: /\.(eot|ttf|svg|gif|png)$/,
            loader: 'file-loader',
            query: { name: fileLoaderName },
        },
    ];

    return arr;
};

/**
 * Exports webpack JSON config
 * @param  {String} env The environment we're in
 * @return {Object} Webpack confing
 */
module.exports = (env = 'dev') => ({
    entry: views(env),
    output: output(env),
    plugins: plugins(env),
    watch: env === 'dev',
    devtool: env === 'dev' ? 'eval-source-map' : null,
    module: {
        loaders: loaders(env),
        postcss: () => [autoprefixer],
    },
    resolve: {
        // All these extensions will be resolved without specifying extension in the `require` function
        extensions: ['', '.js', '.scss'],
        // Files in these directory can be required without a relative path
        modulesDirectories: [
            'node_modules',
            'bower_components',
            'lib',
            './',
        ],
    },
    externals: {
        // http://airbnb.io/enzyme/docs/guides/webpack.html
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
    },
});
