class Messages {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-messages')
            .on('change', '#messageUserHash', function (e) {
                let currentHash = $(this).val();
                if (self.main.blogClass.isCorrectSwarmHash(currentHash)) {
                    let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', currentHash);
                    $('#message-to-avatar').attr('src', avatar);
                } else {
                    $('#message-to-avatar').attr('src', 'img/swarm-avatar.jpg');
                }
            })
            .on('click', '.messages-enter-user-hash', function (e) {
                $('#message-to-avatar').attr('src', 'img/swarm-avatar.jpg');
                self.showMessageInput(true);
            })
            .on('click', '.chat_list', function (e) {
                e.preventDefault();
                $('.chat_list').removeClass('active_chat');
                $(this).addClass('active_chat');
                let userHash = $(this).attr('data-user-hash');
                $('.messages-send-message').attr('data-user-id', userHash);
                let messageDialog = $('.msg_history');
                messageDialog.html('');
                self.showLoadingBar(true);
                let myMsgInfo = null;
                let receiverMsgInfo = null;
                if (!web3.eth.defaultAccount) {
                    self.main.alert('To send messages - please, install Metamask');
                    return;
                }

                self.main.blog.getMessageInfo()
                    .then(function (response) {
                        myMsgInfo = response.data;
                        return self.main.blog.getSwarmHashByWallet(userHash);
                    })
                    .then(function (userHash) {
                        console.log(userHash);
                        return self.main.blog.getMessageInfo(userHash);
                    })
                    .then(function (response) {
                        receiverMsgInfo = response.data;
                        console.log(receiverMsgInfo);
                        self.showLoadingBar(false);
                        self.drawCorrespondence(web3.eth.defaultAccount, userHash, myMsgInfo, receiverMsgInfo);
                    })
                    .catch(function () {
                        self.showLoadingBar(false);
                    });
            })
            .on('click', '.messages-write-message', function (e) {
                let userId = $(this).attr('data-user-id');
                //let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', userId);
                let avatar = 'img/swarm-avatar.jpg';
                self.showMessageInput(true);
                $('#messageUserHash').val(userId);
                $('#message-to-avatar').attr('src', avatar);
            })
            .on('click', '.messages-send-message', function (e) {
                e.preventDefault();
                let userHash = $('.messages-send-message').attr('data-user-id');
                let userMessage = $('.write_msg').val();
                $('.input_msg_write').addClass("disabled-content");
                let messageId = $('.messages-send-message').attr('data-message-id');
                self.setMessage(userHash, 'MY_WALLET_ID_HERE', messageId, false, 'img/swarm-avatar.jpg', userMessage, '');
                $('.write_msg').val('');
                $('.messages-send-message').attr('data-message-id', messageId + 1);

                self.main.blog.saveMessage(userHash, userMessage, false)
                    .then(function (response) {
                        let data = response.data;
                        $('.input_msg_write').removeClass("disabled-content");
                        self.main.onAfterHashChange(data, true);
                    });
            });


        $('.btn-messages-add-dialog').click(function (e) {
            let newUserWallet = $('.messages-new-dialog').val();
            if (!newUserWallet) {
                self.main.alert('Enter wallet');
                return;
            }

            self.setDialogByWallet(newUserWallet);
            $('#addDialogModal').modal('hide');
        });

        $('#v-pills-messages-tab').click(function (e) {
            let usersList = $('.messages-users-list');
            let messageDialogs = $('.message-dialogs');
            usersList.html('<button class="dropdown-item messages-enter-user-hash" type="button">Enter user wallet</button>');
            messageDialogs.html('');
            let users = self.main.blog.getIFollow();
            users.forEach(function (v) {
                let avatar = 'img/swarm-avatar.jpg';
                usersList.append('<button class="dropdown-item text-center messages-write-message" type="button" data-user-id="' + v + '"><img data-user-id="' + v + '" src="' + avatar + '" alt="" class="message-drop-users size-36"></button>');
                self.main.blog.getSwarmHashByWallet(v)
                    .then(function (hash) {
                        // todo use preview
                        let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', hash);
                        $('.message-drop-users[data-user-id="' + v + '"]').attr('src', avatar);
                    });
            });

            self.main.blog.getMessageInfo()
                .then(function (response) {
                    let data = response.data;
                    Object.keys(data).forEach(function (userHash) {
                        self.setDialogByWallet(userHash);
                    });
                })
                .catch(function (e) {
                    console.log(e);
                });
        });
    }

    drawCorrespondence(myWallet, receiverWallet, myMsgInfo, receiverMsgInfo) {
        console.log([myWallet, receiverWallet, myMsgInfo, receiverMsgInfo]);
        let self = this;
        let lastMessageId = 0;
        let receiverSwarmHash = null;
        let mySwarmHash = null;
        let drawMy = function () {
            if (receiverWallet in myMsgInfo) {
                lastMessageId = myMsgInfo[receiverWallet].last_message_id;
                if (lastMessageId <= 0) {
                    return;
                }

                let maxId = Math.min(10, lastMessageId);
                $('.messages-send-message').attr('data-message-id', maxId + 1);

                let msg = null;
                for (let i = 1; i <= maxId; i++) {
                    self.setMessage(receiverWallet, myWallet, i, false, 'img/swarm-avatar.jpg', '...', '');
                    self.main.blog.getMessage(i, receiverWallet)
                        .then(function (response) {
                            //console.log([i, response.data.message]);
                            let data = response.data;
                            msg = self.setMessage(receiverWallet, myWallet, i, false, 'img/swarm-avatar.jpg', data.message, '');
                        })
                        .catch(function () {
                            msg = self.setMessage(receiverWallet, myWallet, i, false, 'img/swarm-avatar.jpg', 'Message deleted', '');
                        });
                }


                // todo scroll down
                //msg.scrollTop(msg.scrollHeight);

            } else {
                // todo check it
                //messageDialog.append('<p>Empty dialog</p>');
            }
        };

        let drawReceiver = function () {
            if (myWallet in receiverMsgInfo) {
                lastMessageId = receiverMsgInfo[myWallet].last_message_id;
                if (lastMessageId <= 0) {
                    return;
                }

                let maxId = Math.min(10, lastMessageId);
                //$('.messages-send-message').attr('data-message-id', maxId + 1);

                let msg = null;
                self.main.blog.getSwarmHashByWallet(receiverWallet)
                    .then(function (receiverSwarmHash) {
                        let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', mySwarmHash);
                        for (let i = 1; i <= maxId; i++) {
                            self.setMessage(myWallet, receiverWallet, i, true, avatar, '...', '');
                            self.main.blog.getMessage(i, myWallet, receiverSwarmHash)
                                .then(function (response) {
                                    console.log([i, response.data.message]);
                                    let data = response.data;
                                    msg = self.setMessage(myWallet, receiverWallet, i, true, avatar, data.message, '');
                                })
                                .catch(function () {
                                    msg = self.setMessage(myWallet, receiverWallet, i, true, avatar, 'Message deleted', '');
                                });
                        }
                    });
            }
        };

        self.main.blog.getSwarmHashByWallet(receiverWallet)
            .then(function (receiverHash) {
                receiverSwarmHash = receiverHash;
                return self.main.blog.getSwarmHashByWallet(myWallet);
            })
            .then(function (myHash) {
                mySwarmHash = myHash;

                console.log([receiverSwarmHash, mySwarmHash]);
                drawMy();
                drawReceiver();
            });

        /*let template = $('#sendMessageTemplate')
            .clone()
            .removeAttr('id')
            .removeAttr('style');
        messageDialog.append(template);*/
    }

    showMessageInput(isShow) {
        if (isShow) {
            $('#send-message-to').show();
        } else {
            $('#send-message-to').hide();
        }
    }

    showLoadingBar(isShow) {
        let selector = $('.messages-loader, .messages-loader > .loader-animation');
        if (isShow) {
            selector.show();
        } else {
            selector.hide('slow');
        }
    }

    setDialogByWallet(wallet) {
        let self = this;
        self.setDialog(wallet);

        self.main.blog.getSwarmHashByWallet(wallet)
            .then(function (hash) {
                // todo use preview
                let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', hash);
                self.main.blog.getProfile(hash)
                    .then(function (response) {
                        let data = response.data;
                        self.setDialog(wallet, data.first_name + ' ' + data.last_name, avatar);
                    });
            });
    }

    setDialog(userId, name, avatar, lastMessages, lastDate, isActive) {
        name = name || '... ...';
        avatar = avatar || 'img/swarm-avatar.jpg';
        lastMessages = lastMessages || '...';
        lastDate = lastDate || '...';
        let inbox = $('.inbox_chat');
        let item = $('.chat_list[data-user-hash="' + userId + '"]');
        if (!item.length) {
            item = $('#messagesDialogItem').clone().removeAttr('id').removeAttr('style').attr('data-user-hash', userId);
            inbox.append(item);
        }

        item.find('.messages-user-dialog-avatar').attr('src', avatar).attr('alt', name);
        item.find('.chat_user_name').text(name); //add -<span class="chat_date">Dec 25</span>
        item.find('.chat_date').text(lastDate);
        item.find('.chat_message').text(lastMessages);
        if (isActive) {
            item.addClass('active_chat');
        } else {
            item.removeClass('active_chat');
        }

        return item;
    }

    setMessage(dialogId, authorId, messageId, isIncome, avatar, text, date) {
        let template = $('.chat-message[data-dialog-id="' + dialogId + '"][data-author-id="' + authorId + '"][data-message-id="' + messageId + '"]');

        if (!template.length) {
            if (isIncome) {
                template = $('#incomeMessageTemplate').clone();
            } else {
                template = $('#outgoingMessageTemplate').clone();
            }

            template.find('.income-user-avatar').attr('src', avatar);
        }

        template
            .removeAttr('id')
            .removeAttr('style')
            .attr('data-dialog-id', dialogId)
            .attr('data-author-id', authorId)
            .attr('data-message-id', messageId);
        template.find('.message-text').text(text);
        template.find('.time_date').text(date);

        let messageDialog = $('.msg_history');
        messageDialog.append(template);
        //console.log(template);

        return template;
    }
}

module.exports = Messages;