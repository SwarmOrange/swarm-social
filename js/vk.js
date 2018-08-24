$(document).ready(function () {
    $('.vk-list').on('click', '.btn-import-vk-album', function (e) {
        e.preventDefault();
        let albumId = $(this).attr('data-album-id');
        let ownerId = $(this).attr('data-owner-id');
        console.log([albumId, ownerId]);
        alert('Not implemented');
    });
});

function vkAuthInfo(response) {
    if (response.session) { // Авторизация успешна
        /*vk.data.user = response.session.user;
        callback(vk.data.user);*/
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