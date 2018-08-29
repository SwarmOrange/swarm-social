class Photoalbum {
    constructor() {
        this.photoalbumInfo = {
            files: [],
            uploadedInfo: [],
            uploadedId: 0
        };

        // todo what the correct form for init?
        this.init();
    }

    init() {
        let self = this;
        $('.upload-photos, .upload-photos-preview').click(function (e) {
            e.preventDefault();

            let input = $('#input-upload-photo-album');
            input.click();
        });

        $('#input-upload-photo-album').on('change', function () {
            if (this.files && this.files.length > 0) {
                this.photoalbumInfo.files = Array.from(this.files);
                this.photoalbumInfo.uploadedInfo = [];
                this.photoalbumInfo.uploadedId = 1;
                self.sendNextFile();
            }
        });

        $('.show-all-photoalbums').click(function (e) {
            e.preventDefault();
            $('#showAllPhotoalbumsModal').modal('show');
        });
    }

    sendNextFile() {
        let self = this;
        if (this.photoalbumInfo.files.length <= 0) {
            return;
        }

        let currentFile = this.photoalbumInfo.files.shift();
        let progressPanel = $('#progressPanelAlbum');
        let postProgress = $('#postProgressAlbum');
        progressPanel.show();
        let setProgress = function (val) {
            postProgress.css('width', val + '%').attr('aria-valuenow', val);
        };
        let reader = new FileReader();
        reader.onload = function (e) {
            blog.uploadPhotoToAlbum(blog.myProfile.last_photoalbum_id + 1, this.photoalbumInfo.uploadedId, e.target.result, function (progress) {
                let onePercent = progress.total / 100;
                let currentPercent = progress.loaded / onePercent;
                setProgress(currentPercent);
            }).then(function (data) {
                console.log(data);
                self.photoalbumInfo.uploadedId++;
                onAfterHashChange(data.response);
                progressPanel.hide();
                setProgress(0);
                self.photoalbumInfo.uploadedInfo.push({
                    file: data.fileName,
                    description: ""
                });

                if (self.photoalbumInfo.files.length > 0) {
                    self.sendNextFile();
                } else {
                    let newAlbumId = blog.myProfile.last_photoalbum_id + 1;
                    blog.createPhotoAlbum(newAlbumId, 'Uploaded', '', self.photoalbumInfo.uploadedInfo).then(function (response) {
                        console.log('album created');
                        console.log(response.data);
                        onAfterHashChange(response.data);
                        $('#newAlbumModal').modal('hide');
                        alert('Album created!', [
                            '<button type="button" class="btn btn-success btn-share-item" data-type="photoalbum" data-message="Just created new photoalbum!" data-id="' + newAlbumId + '">Share</button>'
                        ]);
                    });
                }
            });
        };

        reader.readAsArrayBuffer(currentFile);
    }
}

module.exports = Photoalbum;