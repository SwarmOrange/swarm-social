/* All scripts for production */
window.$ = require('jquery');
window.jQuery = require('jquery');
window.SwarmApi = require('./SwarmApi');
window.EthereumENS = require('ethereum-ens');
window.Cropper = require('cropperjs');
require('bootstrap');
require('ekko-lightbox');

let Main = require('./Main');
window.Blog = require('./Blog.js');
let Photoalbum = require('./Photoalbum.js');
let VKImport = require('./VKImport.js');
let Videoplaylist = require('./Videoplaylist.js');
let EnsUtility = require('./EnsUtility.js');
let FacebookImport = require('./FacebookImport.js');
let StartNow = require('./StartNow.js');
//let YoutubeImport = require('./YoutubeImport.js');
let ImportButtons = require('./ImportButtons.js');
let News = require('./News.js');
let Messages = require('./Messages.js');

/* todo use one init section for dev and production */
//window.youtubeImport = new YoutubeImport();
let myMain = new Main();
new Photoalbum(myMain);
window.vkImport = new VKImport(myMain);
new Videoplaylist(myMain);
new EnsUtility(myMain);
new FacebookImport();
new StartNow();
new ImportButtons(myMain);
new News(myMain);
new Messages(myMain);
new Wallet(myMain);
new Settings(myMain);
