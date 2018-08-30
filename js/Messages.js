class Messages {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-messages-tab').click(function (e) {
            e.preventDefault();
            self.main.alert('Not implemented');
        });
    }
}

module.exports = Messages;