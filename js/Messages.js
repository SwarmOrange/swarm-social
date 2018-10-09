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
                let writeMsg = $('.write_msg');
                let userMessage = writeMsg.val();

                let userHash = $(this).attr('data-user-id');
                let messageId = $(this).attr('data-message-id');
                messageId = messageId || 1;

                $('.input_msg_write').addClass("disabled-content");
                let incoming = $('.chat-message[data-message-id]');

                // todo fix wallets
                self.setMessage(userHash, 'MY_WALLET_ID_HERE', messageId, false, 'img/swarm-avatar.jpg', userMessage, '');
                writeMsg.val('');
                $(this).attr('data-message-id', messageId + 1);
                let afterMessageId = 0;
                let isAfterReceiverMessage = false;
                if (incoming.length) {
                    let lastMsg = $(incoming[incoming.length - 1]);
                    afterMessageId = lastMsg.attr('data-message-id');
                    isAfterReceiverMessage = lastMsg.hasClass('incoming_msg');
                }

                self.main.blog.saveMessage(userHash, userMessage, isAfterReceiverMessage, afterMessageId, null, false)
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

            self.setDialogByWallet(newUserWallet)
                .then(function (data) {
                    $('.chat_list[data-user-hash="' + newUserWallet + '"]').click();
                });
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
        let maxMessagesFromUser = 10;
        /*let reorderMessage = function (msgElement, isAfterReceiverMessage, afterMessageId) {
            console.log(afterMessageId);
            // todo check after_message_id field
            //console.log([msgElement, isAfterReceiverMessage, afterMessageId]);
            let afterMessage = null;
            // let template = $('.chat-message[data-from-author-id="' + fromAuthorId + '"][data-to-author-id="' + toAuthorId + '"][data-message-id="' + messageId + '"]');
            if (isAfterReceiverMessage) {
                afterMessage = $('.chat-message[data-from-author-id="' + receiverWallet + '"][data-message-id="' + afterMessageId + '"]');
            } else {
                afterMessage = $('.chat-message[data-from-author-id="' + myWallet + '"][data-message-id="' + afterMessageId + '"]');
            }

            if (afterMessage.length) {
                console.log([msgElement, afterMessage]);
                msgElement.insertAfter(afterMessage);
            }
        };*/

        let reorderMessages = function (holderDiv, messages) {
            messages.forEach(function (v) {
                console.log($(v).attr('data-timestamp'));
            });

            messages.sort(function (a, b) {
                return $(a).attr("data-timestamp") - $(b).attr("data-timestamp")
            });
            holderDiv.html(messages);
        };

        let drawMy = function () {
            let promises = [];
            if (receiverWallet in myMsgInfo) {
                lastMessageId = myMsgInfo[receiverWallet].last_message_id;
                if (lastMessageId <= 0) {
                    return;
                }

                let minId = Math.max(1, lastMessageId - maxMessagesFromUser);
                let maxId = lastMessageId;
                $('.messages-send-message').attr('data-message-id', maxId + 1);

                let msg = null;
                for (let i = minId; i <= maxId; i++) {
                    let avatar = 'img/swarm-avatar.jpg';
                    self.setMessage(myWallet, receiverWallet, i, false, avatar, '...', '');
                    let promise = self.main.blog.getMessage(i, receiverWallet)
                        .then(function (response) {
                            let data = response.data;
                            //console.log([data, i, receiverWallet, myWallet]);
                            msg = self.setMessage(myWallet, receiverWallet, i, false, avatar, data.message, '', data.after_message_id, data.after_receiver_message, data.timestamp);
                            //reorderMessage(msg, data.after_receiver_message, data.after_message_id);
                            return msg;
                        })
                        .catch(function () {
                            msg = self.setMessage(myWallet, receiverWallet, i, false, avatar, 'Message deleted', '');
                        });
                    promises.push(promise);
                }
            }

            return promises;
        };

        let drawReceiver = function () {
            let promises = [];
            if (myWallet in receiverMsgInfo) {
                lastMessageId = receiverMsgInfo[myWallet].last_message_id;
                if (lastMessageId <= 0) {
                    return;
                }

                let minId = Math.max(1, lastMessageId - maxMessagesFromUser);
                let maxId = lastMessageId;
                //$('.messages-send-message').attr('data-message-id', maxId + 1);

                let msg = null;
                let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', receiverSwarmHash);
                for (let i = minId; i <= maxId; i++) {
                    self.setMessage(receiverWallet, myWallet, i, true, avatar, '...', '');
                    let promise = self.main.blog.getMessage(i, myWallet, receiverSwarmHash)
                        .then(function (response) {
                            let data = response.data;
                            //console.log([i, data]);
                            msg = self.setMessage(receiverWallet, myWallet, i, true, avatar, data.message, '', data.after_message_id, data.after_receiver_message, data.timestamp);
                            //reorderMessage(msg, data.after_receiver_message, data.after_message_id);

                            return msg;
                        })
                        .catch(function () {
                            msg = self.setMessage(receiverWallet, myWallet, i, true, avatar, 'Message deleted', '');
                        });
                    promises.push(promise);
                }
            }

            return promises;
        };

        self.main.blog.getSwarmHashByWallet(receiverWallet)
            .then(function (receiverHash) {
                receiverSwarmHash = receiverHash;
                return self.main.blog.getSwarmHashByWallet(myWallet);
            })
            .then(function (myHash) {
                let promises = [];
                mySwarmHash = myHash;

                console.log([receiverSwarmHash, mySwarmHash]);
                let myPromises = drawMy();
                let receiverPromises = drawReceiver();
                promises = promises.concat(myPromises);
                promises = promises.concat(receiverPromises);
                Promise.all(promises)
                    .then(values => {
                        //console.log(values);
                        reorderMessages($('.msg_history'), values);
                    });
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

        return new Promise((resolve, reject) => {
            self.main.blog.getSwarmHashByWallet(wallet)
                .then(function (hash) {
                    // todo use preview
                    let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', hash);
                    self.main.blog.getProfile(hash)
                        .then(function (response) {
                            let data = response.data;
                            let result = self.setDialog(wallet, data.first_name + ' ' + data.last_name, avatar);
                            resolve(result);
                        });
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

    // todo pass message object as last param but not so much params
    setMessage(fromAuthorId, toAuthorId, messageId, isIncome, avatar, text, date, afterMessageId, afterReceiverMessage, timestamp) {
        let template = $('.chat-message[data-from-author-id="' + fromAuthorId + '"][data-to-author-id="' + toAuthorId + '"][data-message-id="' + messageId + '"]');

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
            .attr('data-from-author-id', fromAuthorId)
            .attr('data-to-author-id', toAuthorId)
            .attr('data-message-id', messageId)
            .attr('data-after-message-id', afterMessageId)
            .attr('data-timestamp', timestamp)
            .attr('data-receiver-message', afterReceiverMessage);
        template.find('.message-text').text(text);
        template.find('.time_date').text(date);

        let messageDialog = $('.msg_history');
        messageDialog.append(template);
        //console.log(template);

        return template;
    }
}

module.exports = Messages;