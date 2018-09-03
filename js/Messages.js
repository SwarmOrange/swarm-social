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
            .on('click', '.messages-write-message', function (e) {
                let userId = $(this).attr('data-user-id');
                let avatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', userId);
                self.showMessageInput(true);
                $('#messageUserHash').val(userId);
                $('#message-to-avatar').attr('src', avatar);
            })
            .on('click', '.messages-send-message', function (e) {
                e.preventDefault();
                let userHash = $('#messageUserHash').val();
                let userMessage = $('#messageUserMessage').val();
                $('#send-message-to').addClass("disabled-content");

                self.main.blog.saveMessage(userHash, userMessage, false).then(function (response) {
                    let data = response.data;
                    $('#send-message-to').removeClass("disabled-content");
                    $('#messageUserMessage').val('');
                    self.main.onAfterHashChange(data, true);
                });
            });

        $('#v-pills-messages-tab').click(function (e) {
            let usersList = $('.messages-users-list');
            usersList.html('<button class="dropdown-item messages-enter-user-hash" type="button">Enter user hash</button>');
            let users = self.main.blog.getIFollow();
            users.forEach(function (v) {
                usersList.append('<button class="dropdown-item text-center messages-write-message" type="button" data-user-id="' + v + '"><img src="' + self.main.swarm.getFullUrl('social/file/avatar/original.jpg', v) + '" alt="" class="size-36"></button>');
            })
        });
    }

    showMessageInput(isShow) {
        if (isShow) {
            $('#send-message-to').show();
        } else {
            $('#send-message-to').hide();
        }
    }
}

module.exports = Messages;