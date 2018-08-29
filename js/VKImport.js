class VKImport {
    constructor(main) {
        this.vkSettings = {
            vkPhotoUrls: [],
            photosForAlbum: [],
            uploadedPhotoId: 1,
            currentPhotoAlbum: 0
        };
        this.main = main;
        this.init()
    }

    init() {
        let self = this;
        $('.btn-profile-import-vk').click(function (e) {
            e.preventDefault();
            $('#receiveVkPhotos').text('');
            $('#importFromVKModal').modal('show');
        });

        $('.vk-list').on('click', '.btn-import-vk-album', function (e) {
            e.preventDefault();
            $(this).attr('disabled', 'disabled');
            let albumId = $(this).attr('data-album-id');
            let ownerId = $(this).attr('data-owner-id');
            VK.Api.call('photos.get', {owner_id: ownerId, album_id: albumId, v: '5.80'}, function (r) {
                console.log(r);
                if (r.response) {
                    let items = r.response.items;
                    self.vkSettings.vkPhotoUrls = [];
                    self.vkSettings.photosForAlbum = [];
                    self.vkSettings.uploadedPhotoId = 1;
                    self.vkSettings.currentPhotoAlbum = self.main.blog.myProfile.last_photoalbum_id + 1;
                    items.forEach(function (v) {
                        let url = v.sizes[v.sizes.length - 1].url;
                        self.vkSettings.vkPhotoUrls.push(url);
                    });
                    self.importNextVkPhoto();
                }
            });
        });
    }

    importNextVkPhoto() {
        let self = this;
        let textHolder = $('#receiveVkPhotos');
        if (self.vkSettings.uploadedPhotoId >= self.vkSettings.vkPhotoUrls.length) {
            textHolder.text('All photos imported!');

            self.main.blog.createPhotoAlbum(self.vkSettings.currentPhotoAlbum, 'VK', '', self.vkSettings.photosForAlbum).then(function (response) {
                console.log('album created');
                console.log(response.data);
                self.main.onAfterHashChange(response.data);
                $('#importFromVKModal').modal('hide');
                self.main.alert('Album created!', [
                    '<button type="button" class="btn btn-success btn-share-item" data-type="photoalbum" data-message="Just created new photoalbum from Instagram!" data-id="' + self.vkSettings.currentPhotoAlbum + '">Share</button>'
                ]);
            });

            return;
        }

        textHolder.text('Receiving ' + self.vkSettings.uploadedPhotoId + '/' + self.vkSettings.vkPhotoUrls.length + ' photo..');
        let url = self.vkSettings.vkPhotoUrls[self.vkSettings.uploadedPhotoId - 1];
        console.log(url);
        self.main.swarm.axios.request({
            url: url,
            method: 'GET',
            responseType: 'blob',
        }).then(function (response) {
            console.log('VK photo downloaded ');
            //console.log(response);
            self.main.blog.uploadPhotoToAlbum(self.vkSettings.currentPhotoAlbum, self.vkSettings.uploadedPhotoId, response.data).then(function (data) {
                console.log('Photo uploaded');
                console.log(data);
                self.vkSettings.photosForAlbum.push({
                    file: data.fileName,
                    description: ""
                });
                self.vkSettings.uploadedPhotoId++;
                self.main.onAfterHashChange(data.response, true);
                self.importNextVkPhoto();
            });
        });
    }

    static vkAuthInfo(response) {
        if (response.session) {
            console.log(response);
            let id = response.session.mid;
            console.log(id);
            let vkContent = $('.vk-list');
            VK.Api.call('photos.getAlbums', {owner_id: id, photo_sizes: 1, need_covers: '1', v: '5.80'}, function (r) {
                console.log(r);
                if (r.response) {
                    let albums = r.response.items;
                    vkContent.html();
                    albums.forEach(function (v) {
                        let thumb = v.sizes.length >= 4 ? v.sizes[3].src : v.sizes[v.sizes.length - 1].src;
                        vkContent.append('<li class="list-inline-item col-sm-3">' +
                            '<p><img class="vk-album-img" src="' + thumb + '"></p>' +
                            '<p><button type="button" class="btn btn-primary btn-sm btn-import-vk-album" data-album-id="' + v.id + '" data-owner-id="' + v.owner_id + '">Import</button></p>' +
                            '</li>');
                    });
                }
            });
        } else {
            alert("Not authorized");
        }
    }
}

module.exports = VKImport;