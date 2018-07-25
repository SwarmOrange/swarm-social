// Swarm blogpost logic

var sApi;
var gData;

function placePost(postNumber) {
    sApi.getFile("/data/post" + postNumber + "/html.txt", function (data) {
        data = JSON.parse(data);
        data = data.replace(/\\n/g, " ");
        var div = document.createElement('div');
        div.innerHTML = data.substr(1, data.length - 2);
        div.align = "center";
        document.body.appendChild(div);
        if (postNumber > 0)
            placePost(postNumber - 1);
    });
}

function loadPosts(number) {
    gData.postCount = number;
    if (number > 0)
        placePost(number - 1);
}

window.onload = function () {
    gData = new Object;
    sApi = new swarmAPI();
    sApi.getFile("/data/info.txt", function (data) {
        var obj = JSON.parse(data);
        loadPosts(obj.count); // set gData
        document.getElementById("id_pagePosts").innerHTML = obj.count;
    });
}

function resizeImage(fileReaderResult, MAX_WIDTH, MAX_HEIGHT, onReady) {
    var arrayBufferView = new Uint8Array(fileReaderResult);
    var blob = new Blob([arrayBufferView], {type: "image/jpeg"});
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    var img = document.createElement("img");
    img.src = imageUrl;

    img.onload = function () {
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        if (img.width > img.height) {
            if (img.width > MAX_WIDTH) {
                canvas.height = img.height * MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
            }
        } else {
            if (img.height > MAX_HEIGHT) {
                canvas.width = img.width * MAX_HEIGHT / img.height;
                canvas.height = MAX_HEIGHT;
            }
        }

        // draw the img into canvas (resize)
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob, then Blob to ArrayBuffer.
        const mimeType = 'image/jpg';
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const arrayBuffer = reader.result;
                //bufferByteLen.textContent = arrayBuffer.byteLength + ' bytes.';
                onReady(arrayBuffer);
            });

            reader.readAsArrayBuffer(blob);
        }, mimeType);

    }
}

function attachFiles(onSuccess) {
    var currentFile = 0;
    var maxFiles = $('#id_uploadFile').prop('files').length;

    var fileReader = new FileReader();
    fileReader.onload = function () {

        //When data loaded from openfile button
        var file = $('#id_uploadFile').prop('files')[currentFile];
        var fileName = file.name.split('.').slice(0, -1).join('.');
        sApi.putImage("/data/post" + gData.postCount + "/" + fileName + ".jpg", fileReader.result, function (data) {

            //When original file uploaded
            resizeImage(fileReader.result, 510, 340, function (data) {

                //When resize complete
                sApi.putImage("/data/post" + gData.postCount + "/thumbs/" + fileName + "_resized.jpg", data, function (data) {

                    //When resized image uploaded
                    currentFile += 1;
                    if (currentFile < maxFiles)
                        fileReader.readAsArrayBuffer($('#id_uploadFile').prop('files')[currentFile]);
                    else {
                        onSuccess();
                    }

                });
            });
        });
    };
    if (maxFiles > 0)
        fileReader.readAsArrayBuffer($('#id_uploadFile').prop('files')[currentFile]);
    else
        onSuccess();
}

function putHtmlIntoSwarm(postHtml, imgElements) {
    var postObj = new Object;
    postObj.text = "";
    postObj.text += "<div style='border-style:groove; width:75%;' ></br>";
    postObj.text += postHtml;

    if (imgElements != "")
        postObj.text += "</br><div align='center'>" + imgElements + "</div>";

    postObj.text += "</br><p/></div>"


    postObj.text = postObj.text.replace(/"/g, "'");
    var jsonEncoded = JSON.stringify(postObj.text);
    sApi.putFile("/data/post" + gData.postCount + "/html.txt", jsonEncoded, function (data) {

        var count = Number(gData.postCount) + 1;
        var dataToPut = {'count': count};
        sApi.putFile("/data/info.txt", dataToPut, function (data) {

            sApi.reloadPage();

        });
    });
}

function updatePostHtml() {
    var postHtml = document.getElementById("id_mainTextArea").value.trim();

    //Insert Attached images into the blogPost
    if ($('#id_uploadFile').prop('files').length > 0) {
        sApi.getFileList("/data/post" + gData.postCount + "/thumbs/", function (data) {

            var imgElements = "";
            if (data.length > 3) {
                var manifest = JSON.parse(data);
                for (var i = 0; i < manifest.entries.length; i++) {
                    if (manifest.entries[i].contentType == "image/jpg") {
                        var fpath = manifest.entries[i].path;
                        var imgResizedFilename = fpath;
                        var resizedPos = fpath.lastIndexOf("_resized");
                        var filenameStart = fpath.lastIndexOf("/");
                        var imgOriginalFilename = "/data/post" + gData.postCount + "/" + fpath.substr(filenameStart, resizedPos - filenameStart) + ".jpg";
                        imgElements += "<a href ='./" + imgOriginalFilename + "' ><img src= './" + imgResizedFilename + "'/></a>";
                    }
                }
            }

            putHtmlIntoSwarm(postHtml, imgElements);

        });
    }
    else {
        putHtmlIntoSwarm(postHtml, "");
    }
}