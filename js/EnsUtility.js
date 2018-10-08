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

        this.contractAbi = null;
        this.contract = null;
        this.initAbi();
        this.init();
    }

    init() {
        let self = this;
        this.contract = self.getUsersContract('0x717d30089a61876e085bdea87e8d4ae48fd267f6');
        if (this.contract) {
            //$('.save-blockchain').removeAttr('disabled');
        } else {
            $('.save-blockchain').attr('disabled', 'disabled');
        }

        if (typeof web3 !== 'undefined') {
            window.web3 = new Web3(web3.currentProvider);
            console.log('current provider');
            console.log(web3.currentProvider);
        } else {
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        console.log(web3);
        this.ens = new EthereumENS(window.web3.currentProvider);
        console.log('ens');
        console.log(this.ens);
        web3.version.getNetwork(function (error, result) {
            if (error) {
                console.error(error);
                $('.save-ens').hide();

                return;
            }

            let networkId = result;
            console.log('Network id: ' + networkId);
            /*if (networkId != 4) {
                alert('Please, change network to Rinkeby and reload page');
                return;
            }*/

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
            $('#currentHash').val(self.main.swarm.applicationHash);
            $('#updateEnsModal').modal('show');
        });

        $('.send-ens-transaction').click(function (e) {
            e.preventDefault();
            if (!web3.eth.defaultAccount) {
                self.main.alert('Please, select main Ethereum account and unlock MetaMask.');

                return;
            }
            self.saveDomainHash();
        });

        $('.save-blockchain').click(function (e) {
            e.preventDefault();
            if (self.contract) {
                // todo is not filled user wallet - add it to profile
                $('.save-blockchain').attr('disabled', 'disabled');
                self.contract.setHash.sendTransaction(self.main.swarm.applicationHash, function (error, result) {
                    if (error) {
                        self.main.alert('Transaction error or cancelled');
                    } else {
                        window.location.hash = '';
                        self.main.alert('Transaction complete');
                    }
                });
            } else {
                self.main.alert('Please, install Metamask');
            }
        });
    }

    initAbi() {
        this.contractAbi = [
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "hash",
                        "type": "string"
                    }
                ],
                "name": "setHash",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "User",
                        "type": "address"
                    }
                ],
                "name": "getHash",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "UsersInfo",
                "outputs": [
                    {
                        "name": "SwarmHash",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ];
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

        if (!self.isCorrectDomain(ensDomain) || !Blog.isCorrectSwarmHash(swarmHash)) {
            self.main.alert('Incorrect domain or hash');

            return;
        }

        var resultSwarmHash = '0x' + swarmHash;
        var resolver = this.ens.resolver(ensDomain);
        resolver.instancePromise.then(function () {
            return resolver.setContent(resultSwarmHash, {from: web3.eth.defaultAccount})
                .then(function (result) {
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

    getUsersContract(contractAddress) {
        if (window.web3) {
            return window.web3.eth.contract(this.contractAbi).at(contractAddress);
        } else {
            return null;
        }
    }

    registerRinkebyTestDomain(domain) {
        function namehash(name) {
            var node = '0x0000000000000000000000000000000000000000000000000000000000000000';
            if (name !== '') {
                var labels = name.split(".");
                for (var i = labels.length - 1; i >= 0; i--) {
                    node = web3.sha3(node + web3.sha3(labels[i]).slice(2), {encoding: 'hex'});
                }
            }
            return node.toString();
        }

        var ensContract = web3.eth.contract([
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    }
                ],
                "name": "resolver",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    }
                ],
                "name": "owner",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "name": "label",
                        "type": "bytes32"
                    },
                    {
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "setSubnodeOwner",
                "outputs": [],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "name": "ttl",
                        "type": "uint64"
                    }
                ],
                "name": "setTTL",
                "outputs": [],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    }
                ],
                "name": "ttl",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "name": "resolver",
                        "type": "address"
                    }
                ],
                "name": "setResolver",
                "outputs": [],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "setOwner",
                "outputs": [],
                "payable": false,
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "indexed": true,
                        "name": "label",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "NewOwner",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "name": "resolver",
                        "type": "address"
                    }
                ],
                "name": "NewResolver",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "node",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "name": "ttl",
                        "type": "uint64"
                    }
                ],
                "name": "NewTTL",
                "type": "event"
            }
        ]);

        var fifsRegistrarContract = web3.eth.contract([
            {
                "constant": true,
                "inputs": [],
                "name": "ens",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "name": "expiryTimes",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "subnode",
                        "type": "bytes32"
                    },
                    {
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "register",
                "outputs": [],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "rootNode",
                "outputs": [
                    {
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "name": "ensAddr",
                        "type": "address"
                    },
                    {
                        "name": "node",
                        "type": "bytes32"
                    }
                ],
                "type": "constructor"
            }
        ]);

        let ens = ensContract.at('0xe7410170f87102DF0055eB195163A03B7F2Bff4A');
        let publicResolverAddress = '0xb14fdee4391732ea9d2267054ead2084684c0ad8';
        let rootDomain = 'test';
        ens.owner(namehash(rootDomain), function (error, result) {
            console.log('ens owner');
            console.log(error);
            console.log(result);

            if (result) {
                let testRegistrar = fifsRegistrarContract.at(result);
                testRegistrar.register(web3.sha3(domain), web3.eth.accounts[0], function (error, result) {
                    console.log('testRegistrar.register');
                    console.log(error);
                    console.log(result);

                    if (result) {
                        ens.setResolver(namehash(domain + '.' + rootDomain), publicResolverAddress, function (error, result) {
                            console.log('ens.setResolver');
                            console.log(error);
                            console.log(result);
                        });
                    }
                });
            }
        });
    }
}

module.exports = EnsUtility;