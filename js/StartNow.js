class StartNow {
    constructor() {
        this.init();
    }

    init() {
        let self = this;
        $('.btn-start-now').click(function (e) {
            e.preventDefault();
            $('#userRegistration').fadeOut('slow');
            $('#importData').show('fast');
        });

        $('.btn-create-empty').click(function (e) {
            e.preventDefault();
            $('.edit-page-info').click();
            self.showContent();

        });

        $('.btn-import-instagram').click(function (e) {
            e.preventDefault();
            $('.show-insta-panel').click();
            $('.upload-photos').hide();
            $('.show-insta-panel').hide();
            $('.upload-all-insta').hide();
            $('#newAlbumModal').modal('show');

            self.showContent();
        });
    }

    showContent() {
        $('#importData').hide('fast');
        $('#userRegistration').hide('fast');
        $('#userInfo').show();
    }
}

module.exports = StartNow;