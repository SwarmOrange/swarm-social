class Videoplaylist {
    constructor(main) {
        this.main = main;
        this.videoInfo = {
            files: [],
            uploadedInfo: [],
            uploadedId: 0
        };

        this.initVideoPlaylist();
    }

    initVideoPlaylist() {
        let self = this;
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
                self.videoInfo.files = Array.from(this.files);
                self.videoInfo.uploadedInfo = [];
                self.videoInfo.uploadedId = 1;
                self.sendNextVideoFile();
            }
        });

        $('.show-all-videoalbums').click(function (e) {
            e.preventDefault();
            //$('#showAllPhotoalbumsModal').modal('show');
        });
    }

    sendNextVideoFile() {
        let self = this;

        if (self.videoInfo.files.length <= 0) {
            return;
        }

        let currentFile = self.videoInfo.files.shift();
        let contentType = currentFile.type;
        let progressPanel = $('#progressPanelVideoAlbum');
        let postProgress = $('#postProgressVideoAlbum');
        progressPanel.show();
        let setProgress = function (val) {
            postProgress.css('width', val + '%').attr('aria-valuenow', val);
        };
        let reader = new FileReader();
        reader.onload = function (e) {
            self.main.blog.uploadVideoToAlbum(self.main.blog.myProfile.last_photoalbum_id + 1, self.videoInfo.uploadedId, e.target.result, contentType, function (progress) {
                let onePercent = progress.total / 100;
                let currentPercent = progress.loaded / onePercent;
                setProgress(currentPercent);
            }).then(function (data) {
                console.log(data);
                self.main.onAfterHashChange(data.response);
                progressPanel.hide();
                setProgress(0);
                self.videoInfo.uploadedInfo.push({
                    id: self.videoInfo.uploadedId,
                    name: "",
                    description: "",
                    cover_file: "img/video-cover.jpg",
                    file: data.fileName,
                    type: "video",
                });
                self.videoInfo.uploadedId++;
                if (self.videoInfo.files.length > 0) {
                    self.sendNextVideoFile();
                } else {
                    let newAlbumId = self.main.blog.myProfile.last_videoalbum_id + 1;
                    self.main.blog.createVideoAlbum(newAlbumId, 'Uploaded', '', self.videoInfo.uploadedInfo).then(function (preResponse) {
                        let info = preResponse.info;
                        preResponse.response.then(function (response) {
                            console.log('album created');
                            console.log(response);
                            self.main.onAfterHashChange(response.data);
                            $('#newVideoModal').modal('hide');
                            self.main.alert('Video playlist created!', [
                                '<button type="button" class="btn btn-success btn-share-item" data-type="videoalbum" data-info=\'' + JSON.stringify(info) + '\' data-message="Just created new video playlist!" data-id="' + newAlbumId + '">Share</button>'
                            ]);
                        });

                    });
                }
            });
        };

        reader.readAsArrayBuffer(currentFile);
    }
}

module.exports = Videoplaylist;