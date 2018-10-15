class News {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-news-tab').click(function (e) {
            let newsUsers = $('.news-users');
            let newsContent = $('.news-content');
            newsUsers.html('');
            newsContent.html('');
            let users = self.main.blog.getIFollow();
            users.reverse();
            if (users.length) {
                self.showLoadingBar(true);
                self.compileNews(users, 5)
                    .then(function () {
                        // nothing
                    });
            } else {
                self.showLoadingBar(false);
                newsContent.html('You are not subscribed to anyone');
            }
        });
    }

    showLoadingBar(isShow) {
        let selector = $('.news-update, .news-update > .loader-animation');
        if (isShow) {
            selector.show();
        } else {
            selector.hide('slow');
        }
    }

    compileNews(users, maxPostsFromUser) {
        maxPostsFromUser = maxPostsFromUser || 10;
        if (users.length <= 0) {
            console.log('compileNews complete!');
            this.showLoadingBar(false);

            return;
        }

        let self = this;
        let newsContent = $('.news-content');
        let currentUser = users.shift();
        let currentUserHash = null;
        let currentUserProfile = null;
        return self.main.blog.getSwarmHashByWallet(currentUser)
            .then(function (result) {
                currentUserHash = result;
                return self.main.blog.getProfile(currentUserHash);
            })
            .then(function (response) {
                currentUserProfile = response.data;
                let lastPostId = response.data.last_post_id;
                if (!lastPostId || lastPostId <= 0) {
                    return self.compileNews(users, maxPostsFromUser);
                }

                let minPostId = Math.max(1, lastPostId - maxPostsFromUser);
                //console.log('Received profile: ' + currentUserHash + ', ' + lastPostId + ', ' + minPostId);
                let userId = 'userNews' + currentUserHash;
                let getUserPost = function (userId, postId) {
                    let userHolderName = '#userNews' + userId;
                    console.log([postId, userId]);
                    return self.main.blog.getPost(postId, userId)
                        .then(function (response) {
                            let post = response.data;
                            self.main.addPostByData(post, {
                                'prefix': '#newsPost' + userId,
                                'containerName': userHolderName,
                                'isReadOnly': true,
                                'userHash': currentUserHash,
                                'userProfile': currentUserProfile
                            });
                            console.log('Received post: ' + userId + ', ' + postId);
                            console.log(post);

                            postId++;
                            if (postId <= lastPostId) {
                                return getUserPost(userId, postId);
                            } else {
                                return self.compileNews(users, maxPostsFromUser);
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                            postId++;
                            return getUserPost(userId, postId);
                        });
                };

                if (lastPostId > 0) {
                    //let userUrl = self.main.swarm.getFullUrl('', currentUserHash);
                    let userAvatar = self.main.swarm.getFullUrl('social/file/avatar/original.jpg', currentUserHash);
                    /*newsContent.append('<div class="news-owner">' +
                        '<img class="size-50 circle-element" src="' + userAvatar + '">' +
                        '</div>');*/
                    newsContent.append('<div id="' + userId + '">' +
                        '</div>');

                    return getUserPost(currentUserHash, minPostId)
                } else {
                    return self.compileNews(users, maxPostsFromUser);
                }
            });
    }
}

module.exports = News;