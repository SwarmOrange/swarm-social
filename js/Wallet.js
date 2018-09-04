class Wallet {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-wallet-tab').click(function (e) {
            if ('ethereum_wallet' in self.main.blog.myProfile) {
                $('#myEthereumWallet').val(self.main.blog.myProfile.ethereum_wallet);
            }
        });

        $('.wallet-save').click(function (e) {
            $('#wallet-form').addClass("disabled-content");
            let wallet = $('#myEthereumWallet').val();
            if (!web3.isAddress(wallet)) {
                $('#wallet-form').removeClass("disabled-content");
                self.main.alert('Incorrect Ethereum address');
                return;
            }

            self.main.blog.myProfile.ethereum_wallet = wallet;
            self.main.blog.saveProfile(self.main.blog.myProfile).then(function (response) {
                $('#wallet-form').removeClass("disabled-content");
                self.main.onAfterHashChange(response.data, true);
            });
        });
    }
}

module.exports = Wallet;