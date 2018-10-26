class Utils {
    constructor() {
    }

    static resizeImages(imageBlob, resultSizes) {
        return new Promise((resolve, reject) => {
            let result = {};
            let img = new Image();
            let resultsCount = 0;
            img.onload = function () {
                resultSizes.forEach(function (v) {
                    let canvas = document.createElement("canvas");
                    let ctx = canvas.getContext("2d");
                    canvas.width = v.width;
                    canvas.height = v.height;
                    let sourceWidth = img.width;
                    let sourceHeight = img.height;
                    let sourceXOffset = 0;
                    let sourceYOffset = 0;
                    let dstW = v.width;
                    let dstH = v.height;
                    if (!v.format || v.format === "box") {
                        if (v.width !== v.height) {
                            throw  "Method support only square preview";
                        }

                        if (img.width > img.height) {
                            // landscape
                            sourceWidth = img.height;
                            sourceHeight = img.height;
                            sourceXOffset = (img.width - img.height) / 2;
                        } else if (img.width < img.height) {
                            // portrait
                            sourceWidth = img.width;
                            sourceHeight = img.width;
                            sourceYOffset = (img.height - img.width) / 2;
                        } else {
                            // square, do nothing
                        }
                    } else if (v.format === "maxsize") {
                        if (img.width > img.height) {
                            if (img.width > v.width) {
                                canvas.height = img.height * v.width / img.width;
                                dstH = canvas.height;
                                canvas.width = v.width;
                            }
                        } else {
                            if (img.height > v.height) {
                                canvas.width = img.width * v.height / img.height;
                                dstW = canvas.width;
                                canvas.height = v.height;
                            }
                        }
                    }

                    ctx.drawImage(img, sourceXOffset, sourceYOffset, sourceWidth, sourceHeight, 0, 0, dstW, dstH);
                    const mimeType = 'image/jpeg';
                    canvas.toBlob((blob) => {
                        resultsCount++;
                        result[v.width + 'x' + v.height] = blob;
                        if (resultsCount >= resultSizes.length) {
                            resolve(result);
                        }
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

    static getVideoImage(file, secs) {
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

            if (file instanceof Blob) {
                file = Utils.getUrlForBlob(file);
            } else if (file instanceof File) {
                file = value.slice(0, file.size, file.type);
            }

            video.src = file;
        });
    }

    static getTemplate(id, params) {
        params = params || [];
        let element = $('#' + id)
            .clone()
            .removeAttr('id')
            .removeAttr('style');
        let elementHtml = element[0].outerHTML;
        Object.keys(params).forEach(function (key) {
            let value = params[key];
            let myKey = '{{' + key + '}}';
            elementHtml = elementHtml.replace(new RegExp(myKey, 'g'), value);
        });
        element = $(elementHtml);

        return element;
    }

    static flashMessage(text, type, maxAlerts) {
        type = type || 'primary';
        maxAlerts = maxAlerts || 3;
        let alertsBlock = $('.alerts');
        if (!alertsBlock.length || !alertsBlock.is(':visible')) {
            alertsBlock = $('<div class="alerts"></div>').insertAfter('header');
        } else if (alertsBlock.length > 1 && $(alertsBlock[0]).is(':visible') && $(alertsBlock[1]).is(':visible')) {
            // hide created after registration alerts block
            $(alertsBlock[0]).remove();
        }

        let html = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">\n' +
            text +
            '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
            '    <span aria-hidden="true">&times;</span>\n' +
            '  </button>\n' +
            '</div>';
        let existAlerts = alertsBlock.find('.alert');
        if (existAlerts.length >= maxAlerts) {
            existAlerts[existAlerts.length - 1].remove();
        }

        alertsBlock.prepend(html);
    }

    static stripHtml(html) {
        if (html) {
            let tmp = document.createElement("div");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        } else {
            return '';
        }
    }

    static getRecommendedGas() {
        return 51000;
    }
}

module.exports = Utils;