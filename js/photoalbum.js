let photoalbumInfo = {
    files: [],
    uploadedInfo: [],
    uploadedId: 0
};

$(document).ready(function () {
    initPhotoalbum();
});

function initPhotoalbum() {
    $('.upload-photos, .upload-photos-preview').click(function (e) {
        e.preventDefault();

        let input = $('#input-upload-photo-album');
        input.click();
    });

    $('#input-upload-photo-album').on('change', function () {
        if (this.files && this.files.length > 0) {
            photoalbumInfo.files = Array.from(this.files);
            photoalbumInfo.uploadedInfo = [];
            photoalbumInfo.uploadedId = 1;
            sendNextFile();
        }
    });

    $('.show-all-photoalbums').click(function (e) {
        e.preventDefault();
        $('#showAllPhotoalbumsModal').modal('show');
    });
}

function sendNextFile() {
    if (photoalbumInfo.files.length <= 0) {
        return;
    }

    let currentFile = photoalbumInfo.files.shift();
    let progressPanel = $('#progressPanelAlbum');
    let postProgress = $('#postProgressAlbum');
    progressPanel.show();
    let setProgress = function (val) {
        postProgress.css('width', val + '%').attr('aria-valuenow', val);
    };
    let reader = new FileReader();
    reader.onload = function (e) {
        blog.uploadPhotoToAlbum(blog.myProfile.last_photoalbum_id + 1, photoalbumInfo.uploadedId, e.target.result, function (progress) {
            let onePercent = progress.total / 100;
            let currentPercent = progress.loaded / onePercent;
            setProgress(currentPercent);
        }).then(function (data) {
            console.log(data);
            photoalbumInfo.uploadedId++;
            onAfterHashChange(data.response);
            progressPanel.hide();
            setProgress(0);
            photoalbumInfo.uploadedInfo.push({
                file: data.fileName,
                description: ""
            });

            if (photoalbumInfo.files.length > 0) {
                sendNextFile();
            } else {
                blog.createPhotoAlbum(blog.myProfile.last_photoalbum_id + 1, 'Uploaded', '', photoalbumInfo.uploadedInfo).then(function (response) {
                    console.log('album created');
                    console.log(response.data);
                    onAfterHashChange(response.data);
                    $('#newAlbumModal').modal('hide');
                    alert('Album created!');
                    /*let attachmnets = [];
                    photoalbumInfo.uploadedInfo.forEach(function (v) {
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