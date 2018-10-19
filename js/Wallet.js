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

            Wallet.sendEthToUser(amount, self.main.blog.myProfile.ethereum_wallet);
        });
    }

    static sendEthToUser(amount, toUserWallet) {
        if (!toUserWallet) {
            Utils.flashMessage('Sorry, you can\'t send Ethereum. User not filled Ethereum address');
        }

        web3.eth.sendTransaction({
            to: toUserWallet,
            value: web3.toWei(amount, "ether")
        }, function (error, result) {
            console.log([error, result]);
            if (error) {
                Utils.flashMessage('Payment error or cancelled', 'danger');
            } else {
                Utils.flashMessage('Payment complete!', 'success');
            }
        });
    }
}

module.exports = Wallet;