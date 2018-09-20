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

    static getVideoImage(path, secs) {
        return new Promise((resolve, reject) => {
            let me = this, video = document.createElement('video');
            video.onloadedmetadata = function () {
                if ('function' === typeof secs) {
                    secs = secs(this.duration);
                }
                this.currentTime = Math.min(Math.max(0, (secs < 0 ? this.duration : 0) + secs), this.duration);
            };

            video.onseeked = function (e) {
                let canvas = document.createElement('canvas');
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                let img = new Image();
                img.src = canvas.toDataURL();
                let currentTime = this.currentTime;
                canvas.toBlob(function (blob) {
                    resolve({
                        me: me,
                        img: img,
                        blob: blob,
                        currentTime: currentTime,
                        e: e
                    });
                });
            };

            video.onerror = function (e) {
                console.log(e);
                reject(me, undefined, undefined, e);
            };

            if (path instanceof Blob) {
                path = Utils.getUrlForBlob(path);
            }

            video.src = path;
        });
    }
}

module.exports = Utils;