/* All scripts for production */
window.$ = require('jquery');
window.jQuery = require('jquery');
window.SwarmApi = require('./SwarmApi');
window.EthereumENS = require('ethereum-ens');
window.Cropper = require('cropperjs');
require('bootstrap');
require('ekko-lightbox');

let Main = require('./Main');
let Blog = require('./Blog.js');
let Photoalbum = require('./Photoalbum.js');
let VKImport = require('./VKImport.js');
let Videoplaylist = require('./Videoplaylist.js');
let EnsUtility = require('./EnsUtility.js');
let FacebookImport = require('./FacebookImport.js');
let StartNow = require('./StartNow.js');
let ImportButtons = require('./ImportButtons.js');
let News = require('./News.js');
let Messages = require('./Messages.js');
let Wallet = require('./Messages.js');
let Settings = require('./Messages.js');
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
    Settings: Settings
};
require('./initDev.js');