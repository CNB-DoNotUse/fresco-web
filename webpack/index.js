const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const autoprefixer = require('autoprefixer');

const fileLoaderName = 'fonts/[name].[ext]';
const hashDate = Date.now();
const appDirectory = './app';
const platformDirectory = `${appDirectory}/platform/views/`
const publicDirectory = `${appDirectory}/public/views/`

// Generates view object for us
const views = () => {
    const viewsToReturn = {};

    const viewFiles = [].concat(
        genViewsFromDir(platformDirectory),
        genViewsFromDir(publicDirectory)
    );

    viewFiles.forEach((view) => {
        if (['app.js', '.DS_Store'].indexOf(view.file) !== -1) return;

        viewsToReturn[view.file.replace('.js', '')] = ['babel-polyfill', view.dir + view.file];
    });

    return viewsToReturn;
};

// Generates object mapping { dir: directory, file: file (from 'fs') }
const genViewsFromDir = (dir) => {
    return fs.readdirSync(dir).map((file) => (
        { dir, file }
    ));
}

// Generates plugins for webpack
const plugins = (env) => {
    // Base plugins
    let arr = [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new ExtractTextPlugin('css/[name].css'),
        new AssetsPlugin({
            path: './public/build',
            filename: 'assets.json',
            prettyPrint: true,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: 'js/commons.js',
            // (Only use these entries)
            chunks: genViewsFromDir(platformDirectory).map(obj => obj.file.replace('.js', '')),
        }),
    ];

    if (env === 'dev') {
        arr.push(
            new webpack.DefinePlugin({
                'process.env': { NODE_ENV: JSON.stringify('development') },
            })
        );
    }

    if (env === 'production') {
        arr.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: false },
                sourceMap: false,
            })
        );
        arr.push(new webpack.optimize.DedupePlugin());
        arr.push(
            new webpack.DefinePlugin({
                'process.env': { NODE_ENV: JSON.stringify('production') },
            })
        );
    }

    return arr;
};

// Define output obj. for webpack
const output = (env) => {
    const jsPath = `js/[name].js`;

    if(env === 'production') {
        return {
            path: `./public/build/${hashDate}/`,
            filename: jsPath,
            chunkFilename: jsPath,
            publicPath: `/build/${hashDate}/`
        }
    } else {
        return {
            path: './public/build/',
            filename: jsPath,
            chunkFilename: jsPath,
            publicPath: '/build/'
        }
    }
};

const loaders = (env) => {
    const arr = [
        // Babel
        {
            test: /.jsx?$/,
            loader: 'babel',
            exclude: /(node_modules|bower_components)/,
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
        {
            test: /\.json$/,
            loader: 'json',
            query: { name: fileLoaderName },
        },
    ];

    return arr;
};

const externals = (env) => {
    if(env === 'dev') {
        return {
            // http://airbnb.io/enzyme/docs/guides/webpack.html
            'react/addons': true,
            'react/lib/ExecutionEnvironment': true,
            'react/lib/ReactContext': true
        }
    } else {
        return {};
    }
}

/**
 * Exports webpack JSON config
 * @param  {String} `env` The environment we're in
 * @return {Object} Webpack confing
 */
module.exports = (env = 'dev') => ({
    entry: views(env),
    output: output(env),
    plugins: plugins(env),
    watch: env === 'dev',
    devtool: env === 'dev' ? 'eval-source-map' : null,
    module: { loaders: loaders(env) },
    postcss: () => [autoprefixer],
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
    externals: externals(env),
});
