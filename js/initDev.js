let modules = window.socialModules || {
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
    Utils: Utils
};

window.Blog = new modules.Blog();
window.myMain = new modules.Main(modules.Blog, window.Blog);
new modules.Photoalbum(myMain);
window.vkImport = new modules.VKImport(myMain);
new modules.Videoplaylist(myMain);
new modules.EnsUtility(myMain);
new modules.FacebookImport();
new modules.StartNow();
new modules.ImportButtons(myMain);
new modules.ImportButtons(myMain);
new modules.News(myMain);
new modules.Messages(myMain);
new modules.Wallet(myMain);
new modules.Settings(myMain);
new modules.Utils();
