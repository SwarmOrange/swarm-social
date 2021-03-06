/* All scripts for production */
window.$ = require('jquery');
window.jQuery = require('jquery');
window.SwarmApi = require('../node_modules/free-core/js/SwarmApi.js');
window.EthereumENS = require('ethereum-ens');
window.Cropper = require('cropperjs');
require('bootstrap');
require('ekko-lightbox');
window.JSZip = require('jszip');
window.saveAs = require('file-saver');

let Main = require('./Main');
let Blog = require('../node_modules/free-core/js/Blog.js');
let Photoalbum = require('./Photoalbum.js');
let VKImport = require('./VKImport.js');
let Videoplaylist = require('./Videoplaylist.js');
let EnsUtility = require('./EnsUtility.js');
let FacebookImport = require('./FacebookImport.js');
let StartNow = require('./StartNow.js');
let ImportButtons = require('./ImportButtons.js');
let News = require('./News.js');
let Messages = require('./Messages.js');
let Wallet = require('./Wallet.js');
let Settings = require('./Settings.js');
let Utils = require('./Utils.js');
let Post = require('./Post.js');
let Instagram = require('./Instagram.js');
let GooglePlus = require('./GooglePlus.js');
window.socialModules = {
    Main: Main,
    Blog: Blog,
    Photoalbum: Photoalbum,
    VKImport: VKImport,
    Videoplaylist: Videoplaylist,
    EnsUtility: EnsUtility,
    FacebookImport: FacebookImport,
    StartNow: StartNow,
    ImportButtons: ImportButtons,
    News: News,
    Messages: Messages,
    Wallet: Wallet,
    Settings: Settings,
    Utils: Utils,
    Post: Post,
    Instagram: Instagram,
    GooglePlus: GooglePlus
};
require('./initDev.js');