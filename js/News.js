class News {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-news-tab').click(function (e) {
            e.preventDefault();
        });
    }
}

module.exports = News;