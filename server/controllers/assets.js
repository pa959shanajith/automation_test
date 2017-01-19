// This is the assets controller. Goal is to serve css, js, partials, images.
module.exports = {
    partials: {
        handler: {
            directory: { path: './public/partials' }
        },
        app: {
            name: 'partials'
        }
    },
    imgs: {
        handler: {
            directory: { path: './public/imgs' }
        },
        app: {
            name: 'images'
        }
    },
    css: {
        handler: {
            directory: { path: './public/css' }
        },
        app: {
            name: 'css'
        }
    },
    js: {
        handler: {
            directory: { path: './public/js' }
        },
        app: {
            name: 'js'
        }
    },
    fonts: {
        handler: {
            directory: { path: './public/fonts' }
        },
        app: {
            name: 'fonts'
        }
    }
}