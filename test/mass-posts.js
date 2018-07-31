var fs = require('fs')
    , gm = require('gm');

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

let rootDir = 'mass-posts/';
fs.mkdirSync(rootDir);
fs.mkdirSync(rootDir + "file");
fs.mkdirSync(rootDir + "file/avatar");
rootDir = 'mass-posts/post/';
fs.mkdirSync(rootDir);
gm(500, 500, "#ddff99f3")
    .drawText(100, 500, makeid(500))
    .write("mass-posts/file/avatar/original.jpg", function (err) {
        if (err) {
            console.log('err');
            console.log(err);
        }
    });

let maxPosts = 100000;
let currentNumber = 1;

function createImage() {
    let i = currentNumber;
    console.log(i);
    fs.mkdirSync(rootDir + i);
    fs.mkdirSync(rootDir + i + '/file');
    fs.writeFileSync(rootDir + i + "/info.json", '{"id":' + i + ',"description":"My photo","attachments":[{"type":"photo","url":"post/' + i + '/file/test.jpg"}]}');
    fs.writeFileSync("mass-posts/profile.json", '{"first_name": "My","last_name": "User","birth_date": "20/20/1991","location": {"coordinates": {},"name": "Belarus, Minsk"},"photo": {"original": "file/avatar/original.jpg"},"about": "Drink master","last_post_id":' + maxPosts + '}');

    gm(1920, 1080, "#ddff99f3")
        .drawText(100, 500, makeid(500))
        .write(rootDir + i + "/file/test.jpg", function (err) {
            if (err) {
                console.log('err');
                console.log(err);
            }

            currentNumber++;
            if (currentNumber <= maxPosts) {
                createImage();
            }
        });
}

createImage();


