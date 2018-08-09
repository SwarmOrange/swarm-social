class Blog {
    constructor(swarm) {
        this.prefix = "social/";
        this.swarm = swarm;
        this.version = 1;
        let elements = window.location.href.split('/').filter(word => word.length === 64 || word.length === 128);
        this.uploadedToSwarm = elements.length > 0;
        if (this.uploadedToSwarm) {
            this.uploadedSwarmHash = elements[0];
        } else {
            this.uploadedSwarmHash = '';
        }
    }

    replaceUrlSwarmHash(newHash) {
        if (this.uploadedToSwarm) {
            window.location.hash = '';
        }

        let newElements = [];
        window.location.href.split('/').forEach(function (v) {
            let item = v;
            if (Blog.isCorrectSwarmHash(v)) {
                item = newHash;
            }

            newElements.push(item);
        });
        let newUrl = newElements.join('/');
        window.history.pushState({"swarmHash": newHash}, "", newUrl);

        return newUrl;
    }

    static isCorrectSwarmHash(hash) {
        let hashLength = 64;
        let hashLengthEncrypted = 128;

        return hash && (hash.length === hashLength || hash.length === hashLengthEncrypted);
    }

    setMyProfile(data) {
        this.myProfile = data;
    }

    saveProfile(data, userHash) {
        data.version = this.version;
        return this.swarm.post(this.prefix + "profile.json", JSON.stringify(data), 'application/json', userHash);
    }

    getProfile(userHash) {
        return this.swarm.get(this.prefix + 'profile.json', userHash);
    }

    getMyProfile() {
        return this.getProfile(this.swarm.applicationHash);
    }

    addIFollow(swarmProfileHash) {
        if ('i_follow' in this.myProfile) {
            if (this.myProfile.i_follow.indexOf(swarmProfileHash) > -1) {
                throw "Hash already exists";
            }

            this.myProfile.i_follow.push(swarmProfileHash);
        } else {
            this.myProfile.i_follow = [swarmProfileHash];
        }

        return this.saveProfile(this.myProfile);
    }

    deleteIFollow(swarmProfileHash) {
        if ('i_follow' in this.myProfile) {
            if (this.myProfile.i_follow.indexOf(swarmProfileHash) > -1) {
                let index = this.myProfile.i_follow.indexOf(swarmProfileHash);
                if (index > -1) {
                    this.myProfile.i_follow.splice(index, 1);
                }
            }
        } else {
            this.myProfile.i_follow = [];
        }

        return this.saveProfile(this.myProfile);
    }

    sendRawFile(fileName, data, fileType, userHash, swarmProtocol, onProgress) {
        return this.swarm.post(fileName, data, fileType, userHash, swarmProtocol, onProgress);
    }

    uploadFileForPost(id, fileContent, contentType, fileName, onUploadProgress) {
        // structure
        // post/ID/file/[timestamp].[extension]
        let self = this;
        let extension = fileName.split('.').pop();
        let timestamp = +new Date();
        let url = this.prefix + "post/" + id + "/file/" + timestamp + "." + extension;

        return this.sendRawFile(url, fileContent, contentType, null, null, onUploadProgress).then(function (response) {
                return {
                    response: response,
                    url: url,
                    fullUrl: self.swarm.getFullUrl(url, response.data)
                };
            }
        );
    }

    uploadAvatar(fileContent) {
        // structure
        // file/avatar/original.jpg
        let self = this;
        let url = this.prefix + "file/avatar/original.jpg";

        return this.sendRawFile(url, fileContent, 'image/jpeg')
            .then(function (response) {
                console.log('avatar uploaded');
                console.log(response.data);
                self.swarm.applicationHash = response.data;
                self.myProfile.photo = {
                    original: url
                };

                return self.saveProfile(self.myProfile);
            });
    }

    createPost(id, description, attachments) {
        let self = this;
        // structure
        // /post/ID/info.json - {"id":id, "description":"my super post", "attachments":[]}
        attachments = attachments || [];
        let info = {
            id: id,
            description: description,
            attachments: attachments
        };

        return this.sendRawFile(this.prefix + "post/" + id + "/info.json", JSON.stringify(info), 'application/json')
            .then(function (response) {
                console.log('one');
                console.log(response.data);
                self.myProfile.last_post_id = id;

                // todo change with saveProfile
                return self.sendRawFile(self.prefix + "profile.json", JSON.stringify(self.myProfile), 'application/json', response.data);
            });
    }

    getPost(id, userHash) {
        return this.swarm.get(this.prefix + 'post/' + id + '/info.json', userHash);
    }

    deletePost(id) {
        return this.swarm.post(this.prefix + "post/" + id + "/info.json", JSON.stringify({
            id: id,
            is_deleted: true
        }), 'application/json');
    }

    createPhotoAlbum(id, name, description, photos) {
        let self = this;
        // structure
        // /photoalbum/info.json - [{"id": id, "name": "Album name 1", "description": "Description 1", "cover_file": "file1.jpg"}, {"id": id, "name":"Album name 2", "description": "Description 2", "cover_file": "file2.jpg"}]
        // /photoalbum/ID/info.json - {"id": id, "name": "Album name 1", "description": "My super album", "cover": "/file/name.jpg", "photos":[{"file": "123123.jpg", "description": "My description"}, {"file": "77777.jpg", "description": "My 777 description"}]}
        photos = photos || [];
        let coverFile = photos.length ? photos[0].file : photos;
        let info = {
            id: id,
            name: name,
            description: description,
            cover_file: coverFile,
            photos: photos
        };

        return this.sendRawFile(this.prefix + "photoalbum/" + id + "/info.json", JSON.stringify(info), 'application/json')
            .then(function (response) {
                console.log('Photoalbom info.json');
                console.log(response.data);
                self.swarm.applicationHash = response.data;
                self.myProfile.last_photoalbum_id = id;

                return self.getAlbumsInfo().then(function (response) {
                    let data = response.data;

                    data.push({
                        id: id,
                        name: name,
                        description: description,
                        cover_file: coverFile
                    });
                    console.log('album info');
                    console.log(data);
                    // todo use saveAlbumsInfo
                    return self.sendRawFile(self.prefix + "photoalbum/info.json", JSON.stringify(data), 'application/json')
                        .then(function (response) {
                            console.log('one');
                            console.log(response.data);
                            self.swarm.applicationHash = response.data;
                            self.myProfile.last_photoalbum_id = id;

                            return self.saveProfile(self.myProfile);
                        });
                });
            });
    }

    uploadPhotoToAlbum(photoAlbumId, photoId, fileContent) {
        //let timestamp = +new Date();
        //let fileName = this.prefix + "photoalbum/" + photoAlbumId + "/" + timestamp + ".jpg";
        let fileName = this.prefix + "photoalbum/" + photoAlbumId + "/" + photoId + ".jpg";
        return this.sendRawFile(fileName, fileContent, 'image/jpeg').then(function (response) {
            return {fileName: fileName, response: response.data};
        });
    }

    getAlbumInfo(id) {
        return this.swarm.get(this.prefix + 'photoalbum/' + id + '/info.json');
    }

    getAlbumsInfo() {
        return this.swarm.get(this.prefix + 'photoalbum/info.json');
    }

    saveAlbumsInfo(data) {
        return this.sendRawFile(this.prefix + "photoalbum/info.json", JSON.stringify(data), 'application/json');
    }

    deletePhotoAlbum(id) {
        let self = this;
        // todo delete all photos. Can we delete files from passed list?
        // todo delete from photoalbum/info.json
        return this.swarm.delete(this.prefix + 'photoalbum/' + id + '/1.jpg').then(function (response) {
            self.swarm.applicationHash = response.data;
            return self.getAlbumsInfo().then(function (response) {
                let data = response.data;
                let newAlbums = [];
                if (data && Array.isArray(data) && data.length) {
                    data.forEach(function (v) {
                        if (v.id != id) {
                            newAlbums.push(v);
                        }
                    });
                }

                return self.saveAlbumsInfo(newAlbums);
            });
        });
    }
}