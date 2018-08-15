var uglifycss = require('uglifycss');

var uglified = uglifycss.processFiles(
    [
        'node_modules/bootswatch/dist/cosmo/bootstrap.min.css',
        'node_modules/cropperjs/dist/cropper.min.css',
        'node_modules/ekko-lightbox/dist/ekko-lightbox.css',
        'node_modules/html5-device-mockups/dist/device-mockups.min.css'
    ]
);

console.log(uglified);