'use strict';

var _            = require('lodash');
var gulp         = require('gulp');
var environments = require('gulp-environments');
var less         = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var cssmin       = require('gulp-minify-css');
var sourcemaps   = require('gulp-sourcemaps');
var jsmin        = require('gulp-jsmin');
var lazypipe     = require('lazypipe');
var gulpwebpack  = require('gulp-webpack');
var webpack      = require('webpack');
var development  = environments.development;
var production   = environments.production;

const DEFAULT_COMMON = {
    file: 'app',
    before: function() {},
    done: function() {}
};

/**
 *
 * @param [opts]
 * @returns {*}
 */
function lessTask(opts) {
    opts = assign(opts, {
        file: 'app.css',
        autoprefixer: {}
    });
    
    var pipe = lazypipe()
        .pipe(development, sourcemaps.init())
        .pipe(less)
        .pipe(autoprefixer, opts.autoprefixer)
        .pipe(development, concat(opts.file))
        .pipe(production, concat(min(opts.file)))
        .pipe(production, cssmin())
        .pipe(development, sourcemaps.write());
        
    return pipe();
}

/**
 *
 * @param [opts]
 * @returns {*}
 */
function scriptsTask(opts) {
    opts = assign(opts, {
        file: 'app.js',
        webpack: {
            output: {
                sourceMapFilename: '[file].map'
            },
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: require.resolve('babel-loader'),
                        query: {
                            presets: [
                                'babel-preset-es2015',
                                'babel-preset-react'
                            ].map(require.resolve)
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['', '.js', '.jsx'],
                alias: {
                    'masonry': 'masonry-layout',
                    'isotope': 'isotope-layout'
                }
            }
        }
    });
    
    if (development()) {
        opts.webpack.output.filename = opts.file;
        opts.webpack.devtool = 'source-map';
    } else {
        opts.webpack.output.filename = min(opts.file);
        opts.webpack.plugins = [
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.OccurenceOrderPlugin()
        ];
    }
    
    var pipe = lazypipe()
        .pipe(gulpwebpack, opts.webpack);
    
    return pipe();
}

function assign(opts, defaults) {
    return _.assign({}, DEFAULT_COMMON, defaults, opts);
}

function min(filename) {
    return filename.replace(/(.*?)\.(.*?)$/, '$1.min.$2');
}

module.exports = {
    less  : lessTask,
    scripts : scriptsTask
};