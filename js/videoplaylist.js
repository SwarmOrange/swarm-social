let videoInfo = {
    files: [],
    uploadedInfo: [],
    uploadedId: 0
};

$(document).ready(function () {
    initVideoPlaylist();
});

function initVideoPlaylist() {
    $('.upload-videos-preview').click(function (e) {
        e.preventDefault();

        $('#newVideoModal').modal('show');
    });

    $('.upload-videos').click(function (e) {
        e.preventDefault();

        let input = $('#input-upload-video-album');
        input.click();
    });

    $('#input-upload-video-album').on('change', function () {
        if (this.files && this.files.length > 0) {
            videoInfo.files = Array.from(this.files);
            videoInfo.uploadedInfo = [];
            videoInfo.uploadedId = 1;
            sendNextVideoFile();
        }
    });

    $('.show-all-videoalbums').click(function (e) {
        e.preventDefault();
        //$('#showAllPhotoalbumsModal').modal('show');
    });
}

function sendNextVideoFile() {
    if (videoInfo.files.length <= 0) {
        return;
    }

    let currentFile = videoInfo.files.shift();
    let contentType = currentFile.type;
    let progressPanel = $('#progressPanelVideoAlbum');
    let postProgress = $('#postProgressVideoAlbum');
    progressPanel.show();
    let setProgress = function (val) {
        postProgress.css('width', val + '%').attr('aria-valuenow', val);
    };
    let reader = new FileReader();
    reader.onload = function (e) {
        blog.uploadVideoToAlbum(blog.myProfile.last_photoalbum_id + 1, videoInfo.uploadedId, e.target.result, contentType, function (progress) {
            let onePercent = progress.total / 100;
            let currentPercent = progress.loaded / onePercent;
            setProgress(currentPercent);
        }).then(function (data) {
            console.log(data);
            onAfterHashChange(data.response);
            progressPanel.hide();
            setProgress(0);
            videoInfo.uploadedInfo.push({
                id: videoInfo.uploadedId,
                name: "",
                description: "",
                cover_file: "img/video-cover.jpg",
                file: data.fileName,
                type: "video",
            });
            videoInfo.uploadedId++;
            if (videoInfo.files.length > 0) {
                sendNextVideoFile();
            } else {
                blog.createVideoAlbum(blog.myProfile.last_videoalbum_id + 1, 'Uploaded', '', videoInfo.uploadedInfo).then(function (response) {
                    console.log('album created');
                    console.log(response.data);
                    onAfterHashChange(response.data);
                    $('#newVideoModal').modal('hide');
                    alert('Album created!');
                    /*let attachmnets = [];
                    videoInfo.uploadedInfo.forEach(function (v) {
                        attachmnets.push({
                            type: 'photo',
                            url: v.file
                        });
                    });
                    blog.createPost(blog.myProfile.last_post_id + 1, '', attachmnets).then(function (response) {
                        onAfterHashChange(response.data);
                    });*/
                });
            }
        });
    };

    reader.readAsArrayBuffer(currentFile);
}