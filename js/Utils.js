class Utils {
    constructor() {
    }

    static resizeImages(imageBlob, resultSizes) {
        return new Promise((resolve, reject) => {
            let result = {};
            let img = new Image();
            img.onload = function () {
                resultSizes.forEach(function (v) {
                    let canvas = document.createElement("canvas");
                    let ctx = canvas.getContext("2d");
                    canvas.width = v.width;
                    canvas.height = v.height;
                    if (v.width !== v.height) {
                        throw  "Method support only square preview";
                    }

                    let sourceWidth = img.width;
                    let sourceHeight = img.height;
                    let sourceXOffset = 0;
                    let sourceYOffset = 0;
                    if (img.width > img.height) {
                        // landscape
                        sourceWidth = img.height;
                        sourceHeight = img.height;
                        //sourceXOffset = v.width / 2;
                        sourceXOffset = (img.width - img.height) / 2;
                    } else if (img.width < img.height) {
                        // portrait
                        sourceWidth = img.width;
                        sourceHeight = img.width;
                        //sourceYOffset = v.width / 2;
                        sourceYOffset = (img.height - img.width) / 2;
                    } else {
                        // square, do nothing
                    }

                    ctx.drawImage(img, sourceXOffset, sourceYOffset, sourceWidth, sourceHeight, 0, 0, v.width, v.height);
                    const mimeType = 'image/jpg';
                    canvas.toBlob((blob) => {
                        result[v.width + 'x' + v.height] = blob;
                        resolve(result);
                    }, mimeType);
                });
            };
            img.src = Utils.getUrlForBlob(imageBlob);
        });
    }

    static getUrlForBlob(blob) {
        let urlCreator = window.URL || window.webkitURL;
        return urlCreator.createObjectURL(blob);
    }
}

module.exports = Utils;