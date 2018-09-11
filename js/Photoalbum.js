class Photoalbum {
    constructor(main) {
        this.main = main;
        this.photoalbumInfo = {
            files: [],
            uploadedInfo: [],
            uploadedId: 0
        };

        this.init();
    }

    init() {
        let self = this;
        $('.upload-photos, .upload-photos-preview').click(function (e) {
            e.preventDefault();

            let input = $('#input-upload-photo-album');
            input.click();
        });

        $('body').on('click', '.load-photoalbum', function (e) {
            e.preventDefault();
            let albumId = $(this).attr('data-album-id');
            let viewAlbumContent = $('#viewAlbumContent');
            $('.btn-delete-album').attr('data-album-id', albumId);
            let shownModals = $('.modal.show');
            if (shownModals.length) {
                shownModals.one('hidden.bs.modal', function (e) {
                    $('#viewAlbumModal').modal('show');
                });
                shownModals.modal('hide');
            } else {
                $('#viewAlbumModal').modal('show');
            }

            viewAlbumContent.html('<div class="d-flex justify-content-center"><div class="loader-animation"></div></div>');
            self.main.blog.getAlbumInfo(albumId).then(function (response) {
                let data = response.data;
                viewAlbumContent.html('<ul id="preview-album" class="list-inline">');
                data.photos.forEach(function (v) {
                    viewAlbumContent.append('<li class="list-inline-item"><a href="' + self.main.swarm.getFullUrl(v.file) + '" data-toggle="lightbox" data-title="View photo" data-footer="' + v.description + '" data-gallery="gallery-' + albumId + '"><img src="' + self.main.swarm.getFullUrl(v.file) + '" class="img-fluid preview-album-photo"></a></li>');
                });
                viewAlbumContent.append('</ul>');
            });
        });

        $('#input-upload-photo-album').on('change', function () {
            if (this.files && this.files.length > 0) {
                self.photoalbumInfo.files = Array.from(this.files);
                self.photoalbumInfo.uploadedInfo = [];
                self.photoalbumInfo.uploadedId = 1;
                self.sendNextFile();
            }
        });

        $('.show-all-photoalbums').click(function (e) {
            e.preventDefault();
            let albumsModal = $('#showAllPhotoalbumsModal');
            let content = albumsModal.find('.modal-body');
            albumsModal.modal('show');
            content.html('<div class="d-flex justify-content-center"><div class="loader-animation"></div></div>');
            self.main.blog.getPhotoAlbumsInfo().then(function (response) {
                let data = response.data;
                data = data || [];
                if (data.length) {
                    let html = '<ul class="list-inline preview-images">';
                    data.forEach(function (v) {
                        let imgUrl = self.main.swarm.getFullUrl(v.cover_file);
                        html += '<li class="list-inline-item"><a href="#" class="load-photoalbum" data-album-id="' + v.id + '"><img class="preview-album-photo" src="' + imgUrl + '">' + '</a></li>';
                    });
                    html += '</ul>';
                    content.html(html);
                } else {
                    content.html('<p>Albums not found</p>');
                }
            });
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
                self.main.onAfterHashChange(data.response, true);
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