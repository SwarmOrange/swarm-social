class StartNow {
    constructor() {
        this.init();
    }

    init() {
        let self = this;

        $('.btn-register-user').click(function (e) {
            e.preventDefault();
            let username = $('#regUsername').val().trim().toLowerCase();
            if (username.length < 3) {
                alert('Too short username');
                return;
            }

            $(this).attr('disabled', 'disabled');
            ensUtility.contract.setUsername.sendTransaction(username, function (error, result) {
                console.log([error, result]);
                // todo answer can be as tx hash
                if (result === 'already registered') {
                    alert('Nickname is not available');
                } else if (result === 'ok') {
                    myMain.alert('Nickname registered for your wallet successfully');
                    myMain.showRegistration(false);
                    $('#registrationModal').modal('hide');
                } else if (!result) {
                    alert('Empty response from smart contract. Please, try again.');
                } else {
                    myMain.alert('Nickname registered for your wallet successfully');
                    myMain.showRegistration(false);
                    $('#registrationModal').modal('hide');
                }
            });
        });

        $('.btn-start-now,.btn-start-now-login').click(function (e) {
            e.preventDefault();
            let isLogin = $(this).hasClass('btn-start-now-login');
            /*$('#userRegistration').fadeOut('slow');
            //$('#importData').show('fast');
            $('header').show();
            $('#userInfo').show('fast');*/
            if (web3 && web3.currentProvider && web3.currentProvider.isMetaMask) {
                if (web3.eth.defaultAccount) {
                    let isRegistered = false;
                    if (isRegistered) {
                        // todo check is already registered, then show user page (situation when user unlock his account)
                        alert('already registered');
                        return;
                    }

                    if (isLogin) {

                    }

                    $('.btn-register-user').removeAttr('disabled');

                    $('#registrationModal').modal('show');
                } else {
                    myMain.alert('Please, unlock your Metamask account (click by plugin icon and enter password)', []);
                }
            } else {
                myMain.alert('Please, install <a target="_blank" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Metamask</a>', []);
            }
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