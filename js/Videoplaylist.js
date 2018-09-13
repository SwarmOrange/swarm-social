class Videoplaylist {
    constructor(main) {
        this.main = main;
        this.videoInfo = {
            files: [],
            uploadedInfo: [],
            uploadedId: 0
        };

        this.init();
    }

    init() {
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

        $('html').on('click', '.load-videoalbum', function (e) {
            e.preventDefault();
            let albumId = $(this).attr('data-album-id');
            let viewAlbumContent = $('#viewVideoAlbumContent');
            $('.btn-delete-album').attr('data-album-id', albumId);
            let shownModals = $('.modal.show');
            if (shownModals.length) {
                shownModals.one('hidden.bs.modal', function (e) {
                    $('#viewVideoAlbumModal').modal('show');
                });
                shownModals.modal('hide');
            } else {
                $('#viewVideoAlbumModal').modal('show');
            }

            viewAlbumContent.html('<div class="d-flex justify-content-center"><div class="loader-animation"></div></div>');
            self.main.blog.getVideoAlbumInfo(albumId).then(function (response) {
                let data = response.data;
                console.log(data);
                viewAlbumContent.html('<ul id="preview-album" class="list-inline">');
                data.videos.forEach(function (v) {
                    if (v.type === "youtube") {
                        viewAlbumContent.append('<li class="list-inline-item"><a href="https://youtube.com/watch?v=' + v.file + '" data-toggle="lightbox" data-title="View video" data-footer="' + v.description + '" data-gallery="gallery-video-' + albumId + '"><img src="' + v.cover_file + '" class="img-fluid preview-album-photo"></a></li>');
                    } else {
                        viewAlbumContent.append('<li class="list-inline-item"><a data-type="video" href="' + self.main.swarm.getFullUrl(v.file) + '" data-toggle="lightbox" data-title="View video" data-footer="' + v.description + '" data-gallery="gallery-video-' + albumId + '"><img src="' + self.main.swarm.getFullUrl(v.cover_file) + '" class="img-fluid preview-album-photo"></a></li>');
                    }
                });
                viewAlbumContent.append('</ul>');
            });
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
            let albumsModal = $('#showAllVideoalbumsModal');
            let content = albumsModal.find('.modal-body');
            albumsModal.modal('show');
            content.html('<div class="d-flex justify-content-center"><div class="loader-animation"></div></div>');
            self.main.blog.getVideoAlbumsInfo()
                .then(function (response) {
                    let data = response.data;
                    data = data || [];
                    if (data.length) {
                        let html = '<ul class="list-inline preview-images">';
                        data.forEach(function (v) {
                            let imgUrl = v.type === "video" ? self.main.swarm.getFullUrl(v.cover_file) : v.cover_file;
                            html += '<li class="list-inline-item"><a href="#" class="load-videoalbum" data-album-id="' + v.id + '"><img class="preview-album-photo" src="' + imgUrl + '">' + '</a></li>';
                        });
                        html += '</ul>';
                        content.html(html);
                    } else {
                        content.html('<p>Playlists not found</p>');
                    }
                })
                .catch(function () {
                    content.html('<p>Playlists not found</p>');
                });
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
                self.main.onAfterHashChange(data.response, true);
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