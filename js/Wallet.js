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
            self.main.blog.saveProfile(self.main.blog.myProfile)
                .then(function (response) {
                    $('#wallet-form').removeClass("disabled-content");
                    self.main.onAfterHashChange(response.data, true);
                });
        });

        $('.send-crypto-ethereum').click(function (e) {
            e.preventDefault();
            // todo check is user saved ethereum address
            if (web3 && web3.currentProvider.isMetaMask) {

            } else {
                self.main.alert('Please, install Metamask');
                return;
            }

            let amount = $('#sendCryptoAmount').val();
            if (amount) {

            } else {
                self.main.alert('Enter the amount to be sent');
                return;
            }

            // todo add wait animation
            self.main.blog.getProfile()
                .then(function (response) {
                    // todo hide wait animation
                    let data = response.data;
                    if (data.ethereum_wallet && web3.isAddress(data.ethereum_wallet)) {
                        web3.eth.sendTransaction({
                            to: data.ethereum_wallet,
                            value: web3.toWei(amount, "ether")
                        }, function (error, result) {
                            console.log([error, result]);
                            if (error) {
                                self.main.alert('Payment error or cancelled');
                            } else {
                                self.main.alert('Payment complete!');
                            }
                        });
                    } else {
                        self.main.alert('User not filled Ethereum wallet');
                    }
                });
        });
    }
}

module.exports = Wallet;