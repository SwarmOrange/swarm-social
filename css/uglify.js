var uglifycss = require('uglifycss');

var uglified = uglifycss.processFiles(
    [
        'node_modules/bootswatch/dist/cosmo/bootstrap.min.css',
        'node_modules/cropperjs/dist/cropper.min.css',
        'node_modules/ekko-lightbox/dist/ekko-lightbox.css'
    ]
);

console.log(uglified);