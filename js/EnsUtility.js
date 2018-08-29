class EnsUtility {
    constructor(main) {
        this.networkName = {
            '1': 'mainnet',
            '3': 'ropsten',
            '4': 'rinkeby'
        };
        this.currentNetworkTitle = null;
        this.ens = null;
        this.main = main;

        this.init();
    }

    init() {
        let self = this;
        if (typeof web3 !== 'undefined') {
            window.web3 = new Web3(web3.currentProvider);
            console.log('current provider');
            console.log(web3.currentProvider);
        } else {
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        console.log(web3);
        this.ens = new EthereumENS(window.web3.currentProvider);
        web3.version.getNetwork(function (error, result) {
            if (error) {
                console.error(error);
                $('.save-ens').hide();

                return;
            }

            var networkId = result;
            console.log('Network id: ' + networkId);
            self.currentNetworkTitle = self.networkName[networkId];

            web3.eth.getAccounts(function (error, result) {
                if (error) {
                    console.error(error);
                }

                console.log(result);
                if (result.length === 0) {
                    //alert('Please, select main Ethereum account, unlock MetaMask and reload this page.');
                } else {
                    web3.eth.defaultAccount = result[0];
                }
            });

        });

        $('.save-ens').click(function (e) {
            e.preventDefault();
            $('#currentHash').val(swarm.applicationHash);
            $('#updateEnsModal').modal('show');
        });

        $('.send-ens-transaction').click(function (e) {
            e.preventDefault();
            if (!web3.eth.defaultAccount) {
                alert('Please, select main Ethereum account and unlock MetaMask.');

                return;
            }
            saveDomainHash();
        });
    }

    isCorrectDomain(domain) {
        var minDomainLength = 3;

        return domain && domain.length >= minDomainLength;
    }

    saveDomainHash() {
        let self = this;
        let ensDomain = $('#ensDomain').val();
        let swarmHash = $('#currentHash').val();
        console.log([ensDomain, swarmHash]);

        if (!isCorrectDomain(ensDomain) || !Blog.isCorrectSwarmHash(swarmHash)) {
            alert('Incorrect domain or hash');

            return;
        }

        var resultSwarmHash = '0x' + swarmHash;
        var resolver = ens.resolver(ensDomain);
        resolver.instancePromise.then(function () {
            return resolver.setContent(resultSwarmHash, {from: web3.eth.defaultAccount}).then(function (result) {
                $('#updateEnsModal').modal('hide');
                // user complete transaction
                var subdomain = '';
                if (self.currentNetworkTitle && self.currentNetworkTitle !== 'mainnet') {
                    subdomain = self.currentNetworkTitle + '.';
                }

                var shortResult = result.substring(0, 50) + '...';
                self.main.blog.replaceUrlSwarmHash(swarmHash);
                self.main.alert('Transaction complete. View transaction on Etherscan: <a href="https://' + subdomain + 'etherscan.io/tx/' + result + '" target="_blank">' + shortResult + '</a>');
            }).catch(function (r) {
                self.main.alert('Transaction rejected');
            });
        }).catch(function (e) {
            self.main.alert('Domain name not found, resolver not set or it does not belong to you');
        });
    }
}

module.exports = EnsUtility;