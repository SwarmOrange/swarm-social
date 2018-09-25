class SwarmApi {
    constructor(apiUrl, applicationHash) {
        this.isWeb = typeof window !== undefined;
        this.axios = require('axios');
        this.applicationHash = applicationHash;
        // todo check is generates correct url when web and empty url
        this.apiUrl = apiUrl || (this.isWeb ? location.protocol + "//" + location.host : "https://swarm-gateways.net");
        this.c_hashLength = 64;
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

    delete(file, userHash, swarmProtocol) {
        return this.request("delete", file, userHash, swarmProtocol)
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
}

module.exports = SwarmApi;