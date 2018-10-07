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
            .on('click', '.message-open-dialog', function (e) {
                e.preventDefault();
                let userHash = $(this).attr('data-user-hash');
                let messageDialog = $('.message-dialog');
                messageDialog.html('');
                self.showLoadingBar(true);
                self.main.blog.getMessageInfo()
                    .then(function (response) {
                        self.showLoadingBar(false);
                        let data = response.data;
                        console.log(data);
                        let lastMessageId = 0;
                        if (userHash in data) {
                            lastMessageId = data[userHash].last_message_id;
                            if (lastMessageId > 0) {
                                let maxId = Math.min(10, lastMessageId);
                                for (let i = 1; i <= maxId; i++) {
                                    messageDialog.append('<p class="messages-dialog-item" data-user-to="' + userHash + '" data-id="' + i + '"></p>');
                                    let msg = $('.messages-dialog-item[data-user-to="' + userHash + '"]');
                                    self.main.blog.getMessage(i, userHash)
                                        .then(function (response) {
                                            let data = response.data;
                                            msg.text(data.message);

                                        })
                                        .catch(function () {
                                            msg.text('Message deleted');
                                        });
                                }
                            }
                        } else {
                            messageDialog.append('<p>Empty dialog</p>');
                        }

                        let template = $('#sendMessageTemplate')
                            .clone()
                            .removeAttr('id')
                            .removeAttr('style');
                        messageDialog.append(template);
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
                let userHash = $('#messageUserHash').val();
                let userMessage = $('#messageUserMessage').val();
                $('#send-message-to').addClass("disabled-content");

                self.main.blog.saveMessage(userHash, userMessage, false)
                    .then(function (response) {
                        let data = response.data;
                        $('#send-message-to').removeClass("disabled-content");
                        $('#messageUserMessage').val('');
                        self.main.onAfterHashChange(data, true);
                    });
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
                        let info = data[userHash];
                        //let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', userHash);
                        let avatar = 'img/swarm-avatar.jpg';

                        messageDialogs.append('<div class="message-dialog-user">' +
                            '<p><img data-user-id="' + userHash + '" class="message-dialog-avatar size-30" src="' + avatar + '"> <a class="message-open-dialog" href="#" data-user-hash="' + userHash + '">... ...</a></p>' +
                            '</div>');

                        self.main.blog.getSwarmHashByWallet(userHash)
                            .then(function (hash) {
                                let imgElement = $('.message-dialog-avatar[data-user-id="' + userHash + '"]');
                                let textElement = $('.message-open-dialog[data-user-hash="' + userHash + '"]');
                                // todo use preview
                                let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', hash);
                                imgElement.attr('src', avatar);
                                self.main.blog.getProfile(hash)
                                    .then(function (response) {
                                        let data = response.data;
                                        textElement.text(data.first_name + ' ' + data.last_name);
                                    });
                            });
                    });
                })
                .catch(function (e) {
                    console.log(e);
                });
        });

        setTimeout(function () {
            $('#v-pills-messages-tab').click();
        }, 1000);
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
}

module.exports = Messages;