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
                users.forEach(function (v) {
                    newsUsers.append('<li class="list-group i-follow-news-li">' +
                        '<a onclick="return false;" href="' + self.main.swarm.getFullUrl('', v) + '" class="load-profile-------" data-profile-id="' + v + '"><img src="' + self.main.swarm.getFullUrl('social/file/avatar/original.jpg', v) + '" style="width: 80px"></a>' +
                        '</li>');
                });
                self.compileNews(users, 5);
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
        return this.main.blog.getProfile(currentUser)
            .then(function (response) {
                let lastPostId = response.data.last_post_id;
                if (!lastPostId || lastPostId <= 0) {
                    return self.compileNews(users, maxPostsFromUser);
                }

                let minPostId = Math.max(1, lastPostId - maxPostsFromUser);
                console.log('Received profile: ' + currentUser + ', ' + lastPostId + ', ' + minPostId);
                let userId = 'userNews' + currentUser;
                let getUserPost = function (userId, postId) {
                    let userHolderName = '#userNews' + userId;
                    let userSection = $(userHolderName);
                    console.log([postId, userId]);
                    return self.main.blog.getPost(postId, userId)
                        .then(function (response) {
                            let post = response.data;
                            userSection.append('<div id="newsPost' + post.id + '"></div>');
                            self.main.addPostByData(post, '#newsPost' + userId, userHolderName);
                            console.log('Received post: ' + userId + ', ' + postId);

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
                    newsContent.append('<div id="' + userId + '"></div>');

                    return getUserPost(currentUser, minPostId)
                } else {
                    return self.compileNews(users, maxPostsFromUser);
                }
            });
    }
}

module.exports = News;