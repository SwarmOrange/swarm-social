window.module = {};
window.module.exports = {};

let host = location.host;
//let host = 'tut.com';
if (host === 'localhost') {
    document.write('<script src="js/dist/web-modules.js"></script>' +
        '<script src="js/Blog.js"></script>' +
        '<script src="js/Photoalbum.js"></script>' +
        '<script src="js/Videoplaylist.js"></script>' +
        '<script src="js/StartNow.js"></script>' +
        '<script src="js/ImportButtons.js"></script>' +
        '<script src="js/Main.js"></script>' +
        '<script src="js/EnsUtility.js"></script>' +
        //'<script src="js/mru.js"></script>' +
        //'<script src="js/YoutubeImport.js"></script>' +
        '<script src="js/FacebookImport.js"></script>' +
        '<script src="js/VKImport.js"></script>' +
        '<script src="js/anal.js"></script>' +
        '<script src="js/initDev.js"></script>'
        //'<script src="js/youtube-load.js"></script>'
    );
} else {
    document.write('<script src="js/dist/web-full.js"></script>');
}