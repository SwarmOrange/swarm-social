class GooglePlus {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('.btn-profile-import-google-plus').click(function (e) {
            e.preventDefault();
            $('#googlePlusImportModal').modal('show');
        });
    }
}

module.exports = GooglePlus;