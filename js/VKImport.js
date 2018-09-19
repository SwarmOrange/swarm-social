class VKImport {
    constructor(main) {
        this.vkSettings = {
            vkPhotoUrls: [],
            photosForAlbum: [],
            uploadedPhotoId: 1,
            currentPhotoAlbum: 0
        };
        this.main = main;
        this.userInfo = {};
        this.init()
    }

    init() {
        let self = this;
        $('.vk-select-photos').click(function (e) {
            e.preventDefault();
            $('.import-vk-content ul').addClass('hide');
            $('.vk-list-photos').removeClass('hide')
        });

        $('.vk-select-videos').click(function (e) {
            e.preventDefault();
            $('.import-vk-content ul').addClass('hide');
            $('.vk-list-videos').removeClass('hide')
        });

        $('.btn-profile-import-vk').click(function (e) {
            e.preventDefault();
            $('#receiveVkPhotos').text('');
            $('#importFromVKModal').modal('show');
        });

        $('#importFromVKModal')
            .on('click', '.vk-albums-select-all', function (e) {
                e.preventDefault();
                $('.vk-checkbox-photo').attr('checked', 'checked');
            })
            .on('click', '.vk-albums-deselect-all', function (e) {
                e.preventDefault();
                $('.vk-checkbox-photo').removeAttr('checked');
            });
    }

    vkAuthInfo(response) {
        let self = this;
        console.log(response);
        if (response.session) {
            let id = response.session.mid;
            console.log(id);
            let vkListPhotos = $('.vk-list-photos');
            let vkListVideos = $('.vk-list-videos');
            $('.vk-authorized').removeClass('hide');
            $('.btn-vk-authorize').addClass('hide');
            VK.Api.call('photos.getAlbums', {owner_id: id, photo_sizes: 1, need_covers: '1', v: '5.80'}, function (r) {
                console.log(r);
                if (r.response) {
                    let albums = r.response.items;
                    vkListPhotos.html('<p><a class="vk-albums-select-all" href="#">Select all</a> / <a class="vk-albums-deselect-all"  href="#">Deselect all</a></p>');
                    albums.forEach(function (v) {
                        let thumb = v.sizes.length >= 4 ? v.sizes[3].src : v.sizes[v.sizes.length - 1].src;
                        vkListPhotos.append('<li class="list-inline-item col-sm-3" style="margin-bottom: 18px">' +
                            '<img class="vk-album-img" src="' + thumb + '">' +
                            //'<p><button type="button" class="btn btn-primary btn-sm btn-import-vk-album" data-album-id="' + v.id + '" data-owner-id="' + v.owner_id + '">Import</button></p>' +
                            '<div class="form-check form-check-inline"><input class="form-check-input vk-checkbox-photo" type="checkbox" data-album-id="' + v.id + '" data-owner-id="' + v.owner_id + '" checked></div>' +
                            '</li>');
                    });
                }
            });

            VK.Api.call('video.getAlbums', {owner_id: id, extended: '1', v: '5.80'}, function (r) {
                console.log(r);
                if (r.response) {
                    let albums = r.response.items;
                    vkListVideos.html('');
                    albums.forEach(function (v) {
                        let thumb = v.photo_320;
                        vkListVideos.append('<li class="list-inline-item col-sm-3" style="margin-bottom: 18px">' +
                            '<img class="vk-album-img" src="' + thumb + '">' +
                            '<div class="form-check form-check-inline"><input class="form-check-input vk-checkbox-video" type="checkbox" data-video-album-id="' + v.id + '" data-owner-id="' + v.owner_id + '" checked></div>' +
                            '</li>');
                    });
                }
            });

            VK.Api.call('users.get', {
                user_ids: id,
                fields: 'bdate,city,country,photo_max_orig,about',
                v: '5.80'
            }, function (r) {
                console.log(r);
                if (r.response) {
                    self.userInfo = r.response[0];
                }
            });
        } else {
            alert("Not authorized");
        }
    }

    transferAll() {
        let self = this;
        let isTransferUserInfo = $('#vkTransferUserInfo').prop('checked');
        let isTransferPhoto = $('#vkTransferPhoto').prop('checked');
        let isTransferVideo = $('#vkTransferVideo').prop('checked');
        // todo block transfer button
        self.transferUserInfo(isTransferUserInfo)
            .then(function () {
                return self.transferPhotos(isTransferPhoto);
            })
            .then(function () {
                return self.transferVideos(isTransferVideo);
            })
            .then(function () {
                //todo log complete
                console.log('Promises complete');
                $('#importFromVKModal').modal('hide');
                /*self.main.alert('Added', [
                   '<button type="button" class="btn btn-success btn-share-item" data-type="photoalbums" data-message="Just created new photoalbum from VK!" data-id="' + currentPhotoAlbum + '">Share</button>'
               ]);*/
            });
    }

    transferPhotos(isTransfer) {
        let self = this;
        let albumsList = [];

        let photosChecked = $('.vk-checkbox-photo:checked');
        photosChecked.each(function (k, v) {
            let albumId = $(v).attr('data-album-id');
            let ownerId = $(v).attr('data-owner-id');
            albumsList.push({
                albumId: albumId,
                ownerId: ownerId
            });
        });

        if (isTransfer) {
            return self
                .vkReceiveAlbumsPhotos(albumsList)
                .then(function (vkAlbumsWithPhotos) {
                    console.log('vkAlbumsWithPhotos');
                    console.log(vkAlbumsWithPhotos);
                    return self
                        .createPhotoAlbums(vkAlbumsWithPhotos)
                        .then(function (createdAlbums) {
                            console.log('All created albums');
                            console.log(createdAlbums);
                        });
                });
        } else {
            return self.consistently([]);
        }
    }

    vkReceiveAlbumsPhotos(albumsList) {
        let self = this;
        return self.consistently(albumsList, function (album, onComplete) {
            let result = [];
            VK.Api.call('photos.get', {
                owner_id: album.ownerId,
                album_id: album.albumId,
                v: '5.80'
            }, function (r) {
                console.log(r);
                if (r.response) {
                    let items = r.response.items;
                    if (items.length) {
                        result.push({
                            owner_id: album.ownerId,
                            album_id: album.albumId,
                            items: items
                        });
                    }
                }

                // timeout between requests
                setTimeout(function () {
                    onComplete(result);
                }, 1000);
            });
        })
    }

    createPhotoAlbums(vkAlbumsWithPhotos) {
        let self = this;
        let currentPhotoAlbum = self.main.blog.myProfile.last_photoalbum_id;

        return self
            .consistently(vkAlbumsWithPhotos, function (album, onComplete) {
                let result = [];
                console.log(album);
                currentPhotoAlbum++;
                self
                    .uploadPhotos(album.items, currentPhotoAlbum)
                    .then(function (photosForAlbum) {
                        return self.main.blog
                            .createPhotoAlbum(currentPhotoAlbum, 'VK', '', photosForAlbum)
                            .then(function (response) {
                                console.log('album created');
                                console.log(response.data);
                                self.main.onAfterHashChange(response.data);
                                result.push({createdAlbum: currentPhotoAlbum});
                                onComplete(result);
                            });
                    });
            });
    }

    uploadPhotos(photos, currentPhotoAlbum) {
        let self = this;
        let uploadedPhotoId = 1;

        return self
            .consistently(photos, function (photo, onComplete) {
                let result = [];
                let url = photo.sizes[photo.sizes.length - 1].url;
                let downloadedPhoto = null;
                let previewUrl = null;

                self.main.swarm.axios
                    .request({
                        url: url,
                        method: 'GET',
                        responseType: 'blob',
                    })
                    .then(function (response) {
                        return response.data;
                    })
                    .then(function (photo) {
                        downloadedPhoto = photo;
                        console.log('VK photo downloaded ');
                        return Utils.resizeImages(downloadedPhoto, [{width: 250, height: 250}]);
                    })
                    .then(function (r) {
                        let key = '250x250';
                        return {key: key, value: r[key]};
                    })
                    .then(function (r) {
                        return self.main.blog.uploadPhotoToAlbum(currentPhotoAlbum, uploadedPhotoId + '_' + r.key, r.value);
                    })
                    .then(function (data) {
                        previewUrl = data.fileName;
                        self.main.onAfterHashChange(data.response, true);
                        return self.main.blog.uploadPhotoToAlbum(currentPhotoAlbum, uploadedPhotoId, downloadedPhoto);
                    })
                    .then(function (data) {
                        console.log('Photo uploaded');
                        console.log(data);
                        result.push({
                            file: data.fileName,
                            description: "",
                            previews: {'250x250': previewUrl}
                        });
                        uploadedPhotoId++;
                        self.main.onAfterHashChange(data.response, true);
                        onComplete(result);
                    });
            });
    }

    transferVideos(isTransfer) {
        let self = this;
        if (isTransfer) {
            let albumsList = [];
            let videosChecked = $('.vk-checkbox-video:checked');
            videosChecked.each(function (k, v) {
                let albumId = $(v).attr('data-video-album-id');
                let ownerId = $(v).attr('data-owner-id');
                albumsList.push({
                    albumId: albumId,
                    ownerId: ownerId
                });
            });

            return self
                .vkReceiveVideosAlbums(albumsList)
                .then(function (result) {
                    console.log('vkReceiveVideosAlbums');
                    console.log(result);
                    return self
                        .createVideoAlbums(result)
                        .then(function (result) {
                            console.log('createVideoAlbums');
                            console.log(result);
                        });
                });
        } else {
            return self.consistently([]);
        }
    }

    vkReceiveVideosAlbums(albumsList) {
        let self = this;
        return self.consistently(albumsList, function (album, onComplete) {
            let result = [];
            VK.Api.call('video.get', {
                owner_id: album.ownerId,
                album_id: album.albumId,
                v: '5.80'
            }, function (r) {
                console.log(r);
                if (r.response) {
                    let items = r.response.items;
                    if (items.length) {
                        result.push({
                            owner_id: album.ownerId,
                            album_id: album.albumId,
                            items: items
                        });
                    }
                }

                // timeout between requests
                setTimeout(function () {
                    onComplete(result);
                }, 1000);
            });
        })
    }

    createVideoAlbums(vkVideoAlbums) {
        let self = this;
        let currentVideoAlbum = self.main.blog.myProfile.last_videoalbum_id;

        return self
            .consistently(vkVideoAlbums, function (album, onComplete) {
                console.log(album);
                let result = [];
                currentVideoAlbum++;
                let videosForAlbum = [];
                let currentVideoId = 1;
                album.items.forEach(function (v) {
                    let platform = v.platform ? v.platform.toLowerCase() : 'vk';
                    let coverKey = null;
                    Object.keys(v).reverse().forEach(function (v) {
                        console.log(v);
                        if (coverKey) {
                            return;
                        }

                        if (v.search('photo_') >= 0) {
                            coverKey = v;
                        }
                    });
                    videosForAlbum.push({
                        "id": currentVideoId,
                        "name": "",
                        "description": "",
                        "cover_file": v[coverKey],
                        "file": v.player,
                        "type": platform
                    });
                    currentVideoId++;
                });
                console.log(videosForAlbum);
                console.log(currentVideoAlbum);
                self.main.blog
                    .createVideoAlbum(currentVideoAlbum, 'VK', '', videosForAlbum)
                    .then(function (preResponse) {
                        console.log('video album created');
                        preResponse.response.then(function (response) {
                            self.main.onAfterHashChange(response.data);
                            result.push({createdAlbum: currentVideoAlbum});
                            onComplete(result);
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            });
    }

    transferUserInfo(isTransfer) {
        let self = this;
        return new Promise((resolve, reject) => {
            console.log('transferUserInfo');
            if (isTransfer) {
                self.main.blog.myProfile.first_name = self.userInfo.first_name;
                self.main.blog.myProfile.last_name = self.userInfo.last_name;
                self.main.blog.myProfile.birth_date = self.userInfo.bdate;
                self.main.blog.myProfile.about = self.userInfo.about;
                let locationName = self.userInfo.country.title + ', ' + self.userInfo.city.title;
                self.main.blog.myProfile.location = {name: locationName};
                return self.main.swarm.axios.request({
                    url: self.userInfo.photo_max_orig,
                    method: 'GET',
                    responseType: 'blob',
                }).then(function (response) {
                    let data = response.data;
                    return self.main.blog.uploadAvatar(data).then(function (response) {
                        self.main.onAfterHashChange(response.data);
                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
    }

    consistently(items, eachItem) {
        let storedItems = items.slice(0);
        return new Promise((resolve, reject) => {
            let result = [];
            let handler = function () {
                let item = storedItems.shift();
                if (item) {
                    eachItem(item, function (eachResult) {
                        result = result.concat(eachResult);
                        handler();
                    }, storedItems);
                } else {
                    resolve(result);
                }
            };

            handler();
        });
    }

}

module.exports = VKImport;