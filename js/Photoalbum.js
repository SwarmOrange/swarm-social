class Photoalbum {
    constructor(main) {
        this.main = main;
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
            console.log(this.files);
            if (this.files && this.files.length > 0) {
                self.photoalbumInfo.files = Array.from(this.files);
                self.photoalbumInfo.uploadedInfo = [];
                self.photoalbumInfo.uploadedId = 1;
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
            self.main.blog.uploadPhotoToAlbum(self.main.blog.myProfile.last_photoalbum_id + 1, self.photoalbumInfo.uploadedId, e.target.result, function (progress) {
                let onePercent = progress.total / 100;
                let currentPercent = progress.loaded / onePercent;
                setProgress(currentPercent);
            }).then(function (data) {
                console.log(data);
                self.photoalbumInfo.uploadedId++;
                self.main.onAfterHashChange(data.response);
                progressPanel.hide();
                setProgress(0);
                self.photoalbumInfo.uploadedInfo.push({
                    file: data.fileName,
                    description: ""
                });

                if (self.photoalbumInfo.files.length > 0) {
                    self.sendNextFile();
                } else {
                    let newAlbumId = self.main.blog.myProfile.last_photoalbum_id + 1;
                    self.main.blog.createPhotoAlbum(newAlbumId, 'Uploaded', '', self.photoalbumInfo.uploadedInfo).then(function (response) {
                        console.log('album created');
                        console.log(response.data);
                        self.main.onAfterHashChange(response.data);
                        $('#newAlbumModal').modal('hide');
                        self.main.alert('Album created!', [
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