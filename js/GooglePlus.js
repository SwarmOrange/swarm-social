class GooglePlus {
    constructor(main) {
        this.main = main;
        this.info = {};
        this.init();
    }

    init() {
        let self = this;
        $('.btn-profile-import-google-plus').click(function (e) {
            e.preventDefault();
            $('#googlePlusImportModal').modal('show');
        });

        $('.btn-save-google-plus-info').click(function (e) {
            e.preventDefault();
            self.main.blog.myProfile.first_name = self.info.first_name;
            self.main.blog.myProfile.last_name = self.info.last_name;
            self.main.blog.myProfile.about = self.info.about;
            self.main.swarm.axios.request({
                url: self.info.photo,
                method: 'GET',
                responseType: 'blob',
            })
                .then(function (response) {
                    return self.main.blog.uploadAvatar(response.data);
                })
                .then(function (response) {
                    self.main.onAfterHashChange(response.data);
                    return self.main.blog.saveProfile(self.main.blog.myProfile);
                })
                .then(function (response) {
                    self.main.onAfterHashChange(response.data);
                });

        });
    }

    setInfo(firstName, lastName, avatarUrl, about) {
        this.info = {
            first_name: firstName,
            last_name: lastName,
            photo: avatarUrl,
            about: about
        };
    }
}

module.exports = GooglePlus;