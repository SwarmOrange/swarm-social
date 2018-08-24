let vkSettings = {
    vkPhotoUrls: [],
    photosForAlbum: [],
    uploadedPhotoId: 1,
    currentPhotoAlbum: 0
};

$(document).ready(function () {
    $('.vk-list').on('click', '.btn-import-vk-album', function (e) {
        e.preventDefault();
        $(this).attr('disabled', 'disabled');
        let albumId = $(this).attr('data-album-id');
        let ownerId = $(this).attr('data-owner-id');
        VK.Api.call('photos.get', {owner_id: ownerId, album_id: albumId, v: '5.80'}, function (r) {
            console.log(r);
            if (r.response) {
                let items = r.response.items;
                vkSettings.vkPhotoUrls = [];
                vkSettings.photosForAlbum = [];
                vkSettings.uploadedPhotoId = 1;
                vkSettings.currentPhotoAlbum = blog.myProfile.last_photoalbum_id + 1;
                items.forEach(function (v) {
                    let url = v.sizes[v.sizes.length - 1].url;
                    vkSettings.vkPhotoUrls.push(url);
                });
                importNextVkPhoto();
            }
        });
    });
});

function importNextVkPhoto() {
    let textHolder = $('#receiveVkPhotos');
    if (vkSettings.uploadedPhotoId >= vkSettings.vkPhotoUrls.length) {
        textHolder.text('All photos imported!');

        blog.createPhotoAlbum(vkSettings.currentPhotoAlbum, 'VK', '', vkSettings.photosForAlbum).then(function (response) {
            console.log('album created');
            console.log(response.data);
            onAfterHashChange(response.data);
            $('#importFromVKModal').modal('hide');
            alert('Album created!');

            /*let attachments = [];
            vkSettings.photosForAlbum.forEach(function (v) {
                attachments.push({
                    type: 'photo',
                    url: v.file
                });
            });
            blog.createPost(blog.myProfile.last_post_id + 1, 'Just uploaded new photos', attachments).then(function (response) {
                onAfterHashChange(response.data);
            });*/
        });

        return;
    }

    textHolder.text('Receiving ' + vkSettings.uploadedPhotoId + '/' + vkSettings.vkPhotoUrls.length + ' photo..');
    let url = vkSettings.vkPhotoUrls[vkSettings.uploadedPhotoId - 1];
    console.log(url);
    swarm.axios.request({
        url: url,
        method: 'GET',
        responseType: 'blob',
    }).then(function (response) {
        console.log('VK photo downloaded ');
        //console.log(response);
        blog.uploadPhotoToAlbum(vkSettings.currentPhotoAlbum, vkSettings.uploadedPhotoId, response.data).then(function (data) {
            console.log('Photo uploaded');
            console.log(data);
            vkSettings.photosForAlbum.push({
                file: data.fileName,
                description: ""
            });
            vkSettings.uploadedPhotoId++;
            onAfterHashChange(data.response, true);
            importNextVkPhoto();
        });
    });
}

function vkAuthInfo(response) {
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