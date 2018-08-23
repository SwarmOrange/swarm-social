$(document).ready(function () {
    initImportButton();
});

function initImportButton() {
    $('.fake-nav a').click(function (e) {
        e.preventDefault();
        alert('Not implemented yet');
    });

    $('.btn-profile-import-instagram').click(function (e) {
        e.preventDefault();
        $('.show-insta-panel').click().hide();
        $('.upload-photos').hide();
        $('.upload-all-insta').hide();
        $('#newAlbumModal').modal('show');
    });

    $('.btn-profile-import-facebook').click(function (e) {
        e.preventDefault();
        //alert('Not implemented yet');
        $('#importFromFacebookModal').modal('show');
    });

    $('.btn-profile-import-vk').click(function (e) {
        e.preventDefault();
        //alert('Not implemented yet');
        $('#importFromVKModal').modal('show');
    });

    $('.btn-profile-import-youtube').click(function (e) {
        e.preventDefault();
        $('#youtubeImportContent').html('');
        $('#youtubePlaylistVideos').html('');
        $('#youtubeImportModal').modal('show');
    });

    $('.btn-send-crypto,.btn-receive-crypto').click(function (e) {
        e.preventDefault();
        alert('Not implemented yet');
    });

    $('#youtubeImportModal').on('click', '.btn-import-all-videos', function (e) {
        e.preventDefault();
        let videos = [];
        let i = 1;
        $('.youtube-video-import').each(function (k, v) {
            let id = $(v).attr('data-id');
            let cover_file = $(v).attr('data-cover-file');
            videos.push({
                id: i,
                type: "youtube",
                file: id,
                cover_file: cover_file,
                description: '',
                name: ''
            });
            i++;
        });

        let albumId = typeof blog.myProfile.last_videoalbum_id === 'undefined' ? 1 : blog.myProfile.last_videoalbum_id + 1;

        blog.createVideoAlbum(albumId, 'Videos', '', videos).then(function (response) {
            console.log('album created');
            console.log(response.data);
            onAfterHashChange(response.data);
            $('#youtubeImportModal').modal('hide');
            alert('Album created!');

            let attachments = [];
            videos.forEach(function (v) {
                attachments.push({
                    type: 'youtube',
                    url: "https://www.youtube.com/watch?v=" + v.file
                });
            });
            blog.createPost(blog.myProfile.last_post_id + 1, 'Just added videos from YouTube', attachments).then(function (response) {
                onAfterHashChange(response.data);
            });
        });
    });
}