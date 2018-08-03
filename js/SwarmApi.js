class SwarmApi {
    constructor(apiUrl, applicationHash) {
        this.isWeb = typeof window !== undefined;
        this.axios = require('axios');
        this.applicationHash = applicationHash;
        // todo check is generates correct url when web and empty url
        this.apiUrl = apiUrl || (this.isWeb ? location.protocol + "//" + location.host : "https://swarm-gateways.net");
        this.c_hashLength = 64;
        //this.c_host = location.protocol + "//" + location.host;
        //this.resetPageHash();
    }

    request(method, fileName, userHash, swarmProtocol, data, fileType, responseType, onUploadProgress) {
        swarmProtocol = swarmProtocol || "bzz:";
        if (typeof userHash == null) {
            userHash = "";
        } else {
            userHash = userHash || this.applicationHash;
        }

        data = data || {};
        fileType = fileType || "application/text";
        //responseType = responseType || "json";
        let headers = {'Content-type': fileType};
        let url = [this.apiUrl, swarmProtocol, userHash, fileName].filter(function (n) {
            return n !== ""
        }).join("/");
        console.log(url);

        return this.axios({
            url: url,
            method: method,
            data: data,
            headers: headers,
            onUploadProgress: onUploadProgress
            //responseType: responseType
        });
    }

    get(file, userHash, swarmProtocol) {
        return this.request("get", file, userHash, swarmProtocol)
    }

    post(fileName, data, fileType, userHash, swarmProtocol, onUploadProgress) {
        return this.request("post", fileName, userHash, swarmProtocol, data, fileType, null, onUploadProgress);
    }

    getFullUrl(urlPart, userHash, swarmProtocol) {
        userHash = userHash || this.applicationHash;
        swarmProtocol = swarmProtocol || "bzz:";
        return [this.apiUrl, swarmProtocol, userHash, urlPart].filter(function (n) {
            return n !== ""
        }).join("/");
    }

    getFile(filename, onSuccess) {
        $.ajax({
                url: this.c_host + '/bzz:/' + this.pageManifestHash + filename,
                success: function (data, textStatus, jqXHR) {
                    onSuccess(data);
                },
                dataType: 'text'
            }
        );
    }

    putFile(filename, filedata, onSuccess) {
        var self = this;
        $.ajax(this.c_host + '/bzz:/' + this.pageManifestHash + filename,
            {
                type: 'post',
                data: JSON.stringify(filedata),
                dataType: 'text',
                contentType: 'application/text',
                success: function (data, textStatus, jqXHR) {
                    self.updateHash(data);
                    onSuccess(data);
                }
            });
    }

    putImage(filename, filedata, onSuccess) {
        var self = this;
        $.ajax(this.c_host + '/bzz:/' + this.pageManifestHash + filename,
            {
                type: 'post',
                data: filedata,
                contentType: 'image/jpg',
                processData: false,
                success: function (data, textStatus, jqXHR) {
                    self.updateHash(data);
                    onSuccess(data);
                }
            });
    }

    reloadPage() {
        window.location.href = this.c_host + '/bzz:/' + this.pageManifestHash + "/index.html";
    }

    getFileList(url, callback) {
        $.ajax({
                url: this.c_host + '/bzz-list:/' + this.pageManifestHash + url,
                success: function (data, textStatus, jqXHR) {
                    callback(data);
                },
                dataType: 'text'
            }
        );
    }

    resetPageHash() {
        var url = document.URL; //'https://open.swarm-gateways.net/bzz:/e692a33726cda6c8cb71575316c7960f2f26d26a96f9097fb6e51f5bd7915d2d/posts/info.txt';
        var pageHash = url.substr(url.indexOf("bzz:/") + 5, this.c_hashLength);
        if (this.checkHash(pageHash))
            this.updateHash(pageHash);
        return;
        // Try Get A Hash from MRU
        var self = this;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", this.c_host + '/bzz-resource:/' + pageHash, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response;
            var str = "";
            var byteArray = new Uint8Array(arrayBuffer);
            for (var i = 2; i < byteArray.length; i++) {
                if (byteArray[i] < 16)
                    str += "0";
                str += parseInt(byteArray[i] & 0xff).toString(16);
            }
            self.updateHash(str);
        };
        oReq.send();
    }

    checkHash(hash) {
        if (hash.length == this.c_hashLength) {
            return true;
        } else {

            //alert("getPageHash() Error: " + hash);
            return false;
        }
    }

    updateHash(hash) {
        if (this.checkHash(hash)) {
            this.pageManifestHash = hash;
            document.getElementById("id_pageHash").innerHTML = 'Page Hash: ' + this.pageManifestHash;
        }
        //else
        //alert("Error updating page hash! " + hash);
    }
}

module.exports = SwarmApi;