let fs = require('fs');
let indexDev = fs.readFileSync('./index_dev.html', "utf8");
let webFullJs = fs.readFileSync('./js/dist/web-full.js', "utf8");
let uglifyCss = fs.readFileSync('./css/uglify.css', "utf8");
let styleCss = fs.readFileSync('./css/style.css', "utf8");
styleCss = styleCss.replace('../', './');
let allCss = uglifyCss + styleCss;

indexDev = indexDev.split('<script src="js/scripts.js"></script>').join('<script>' + webFullJs + '</script>');
indexDev = indexDev.replace('<link href="css/uglify.css" rel="stylesheet">', '').replace('<link href="css/style.css" rel="stylesheet">', '').replace('<!-- CSS auto paste here -->', '<style>' + allCss + '</style>');
fs.writeFileSync('./index.html', indexDev);