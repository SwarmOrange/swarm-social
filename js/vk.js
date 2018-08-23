function onVkLogin(data) {
    console.log('vk');
    console.log(data);
    let id = data.uid;

    VK.Api.call('photos.getAlbums', {owner_id: id, need_covers: '1', v: '5.80'}, function (r) {
        console.log(r);
        /*if(r.response) {
            alert(r.response[0].bdate);
        }*/
    });
}