class Instagram {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('.import-instagram').click(function (e) {
            e.preventDefault();
            let instaNick = $('#instaNick').val();
            if (!instaNick) {
                self.main.alert('Incorrect nickname');

                return;
            }

            $('.import-insta-panel').hide('fast');

            let uploaderPhotos = $('#uploaded-photos');
            uploaderPhotos.html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');
            self.main.swarm.axios.get('https://mem.lt/insta/go.php?limit=1&login=' + instaNick).then(function (response) {
                let data = response.data;
                $('.upload-all-insta').show();
                uploaderPhotos.html('');

                if (data && data.length && typeof data === 'object') {

                } else {
                    $('#newAlbumModal').modal('hide');
                    self.main.alert('Incorrect login or error while retrieving data');
                    return;
                }

                uploaderPhotos.html('<ul id="preview-insta-album" class="list-inline">');
                data.forEach(function (v) {
                    uploaderPhotos.append('<li class="list-inline-item"><img class="preview-album-photo" data-type="insta-photo" src="' + v.fullsize + '"></li>');
                });
                uploaderPhotos.append('</ul>');
            }).catch(function (error) {
                console.log(error);
                console.log('Insta error');
            });

            $('#addFromInstaModal').modal('hide');
            $('#newAlbumModal').modal('show');
        });

        $('.show-insta-panel').click(function (e) {
            e.preventDefault();
            $('.import-insta-panel').show('fast');
        });
    }
}

module.exports = Instagram;