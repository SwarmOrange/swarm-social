class Settings {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-settings-tab').click(function (e) {
            e.preventDefault();
            self.main.alert('Not implemented');
        });
    }
}

module.exports = Settings;