let fs = require('fs');
let indexDev = fs.readFileSync('./index_dev.html', "utf8");
let webFullJs = fs.readFileSync('./js/dist/web-full.js', "utf8");

indexDev = indexDev.split('<script src="js/scripts.js"></script>').join('<script>' + webFullJs + '</script>');
fs.writeFileSync('./index.html', indexDev);