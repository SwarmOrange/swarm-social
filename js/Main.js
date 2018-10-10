class Main {

    constructor(blogClass, blog) {
        this.blogClass = blogClass;
        this.swarm = null;
        this.blog = blog;
        this.cropper = null;
        this.lastLoadedPost = 0;
        this.currentPhotoAlbum = 0;
        this.currentPhotosForAlbum = [];
        this.photoAlbumPhotoId = 0;

        this.initDocument();
    }

    initDocument() {
        let self = this;
        $(document).on('click', '[data-toggle="lightbox"]', function (event) {
            event.preventDefault();
            $(this).ekkoLightbox();
        });

        $(document).ready(function () {
            let hash = window.location.hash.substring(1);
            if (hash) {
                if (window.web3 && window.web3.isAddress(hash)) {
                    if (ensUtility.contract) {
                        ensUtility.contract.getHash.call(hash, function (error, result) {
                            console.log([error, result]);
                            if (error) {
                                self.alert('Can not receive user');
                            } else if (result) {
                                self.initByHash(result);
                            } else {
                                self.alert('User not found. Enter correct Ethereum wallet');
                            }
                        });
                    } else {
                        self.alert('To open user page by Ethereum wallet, you need to install Metamask');
                    }

                } else if (self.blogClass.isCorrectSwarmHash(hash)) {
                    self.initByHash(hash);
                } else {
                    self.alert('Incorrect hash after # in url. Fix it and reload page.');

                    return;
                }
            } else {
                // todo check with not only metamask but official client
                if (web3.currentProvider.isMetaMask) {
                    console.log('yes, metamask');
                    web3.version.getNetwork(function (error, result) {
                        let networkId = result;
                        console.log('Network id: ' + networkId);
                        if (networkId != 4) {
                            alert('Please, change network in Metamask to Rinkeby and reload page');
                            return;
                        }

                        web3.eth.getAccounts(function (error, result) {
                            if (error) {
                                console.error(error);
                            }

                            console.log(result);
                            if (result.length === 0) {
                                alert('Please, select main Ethereum account, unlock MetaMask and reload this page.');
                            } else {
                                web3.eth.defaultAccount = result[0];
                                ensUtility.contract.getHash.call(web3.eth.defaultAccount, function (error, result) {
                                    console.log([error, result]);
                                    if (error) {
                                        // todo show info about error
                                        console.log(error);
                                        self.initByHash();
                                    } else if (result) {
                                        self.initByHash(result);
                                    } else {
                                        // user has metamask but he is not registered
                                        self.initByHash();
                                        self.alert('Hi! Please enter information about you and click "Save page to Blockchain"');
                                    }
                                });
                            }
                        });
                    });
                } else {
                    console.log('not metamask');
                    self.initByHash();
                    self.alert('Hi! Please install Metamask plugin, enter information about you and click "Save page to Blockchain"');
                }
            }
        });
    }

    initByHash(hash) {
        let self = this;
        console.log('hash from window hash: ' + hash);
        let swarmHost = window.location.protocol + "//" + window.location.host;
        if (window.location.hostname === "mem.lt") {
            swarmHost = "https://swarm-gateways.net";
        } else if (window.location.hostname === "tut.bike") {
            swarmHost = "http://beefree.me";
        } else if (window.location.hostname === "localhost") {
            swarmHost = "http://127.0.0.1:8500";
            //swarmHost = "https://swarm-gateways.net";
        }

        self.swarm = new SwarmApi(swarmHost, "");
        self.blog.swarm = self.swarm;
        let isValid = (hash || self.blog.uploadedSwarmHash).length > 0;
        if (isValid) {
            $('#userRegistration').hide();
            $('#userInfo').show();
        } else {
            //alert('You can\'t access this site. Add #SWARM_HASH to url and update page.');
            //return;
            $('#userRegistration').show();
            //$('#importData').show();
            $('#userInfo').hide();
        }

        let initHash = hash ? hash : self.blog.uploadedSwarmHash;
        console.log('selected hash: ' + initHash);
        self.swarm.applicationHash = initHash;
        console.log(self.swarm.applicationHash);
        if (self.swarm.applicationHash) {
            self.updateProfile();
        }

        self.init();
    }

    updateProfile() {
        let self = this;
        return this.blog.getMyProfile()
            .then(function (response) {
                let data = response.data;
                console.log(data);
                self.blog.setMyProfile(data);
                self.updateInfo(data);
            })
            .catch(function (error) {
                console.log(error);
                // todo check is debug version. if debug - show message that Debug version not support create new user
                self.alert('User not found or swarm hash expired - ' + self.swarm.applicationHash);
            })
            .then(function () {
                // always executed
            });
    }

    onAfterHashChange(newHash, notUpdateProfile) {
        this.swarm.applicationHash = newHash;
        localStorage.setItem('applicationHash', newHash);
        window.location.hash = newHash;
        $('.save-blockchain').removeAttr('disabled');
        if (notUpdateProfile) {
            return null;
        } else {
            return this.updateProfile();
        }
    }

    init() {
        //$('#v-pills-messages-tab').click();
        let self = this;
        $('.additional-buttons').on('click', '.btn-share-item', function (e) {
            let itemType = $(this).attr('data-type');
            let itemInfo = $(this).attr('data-info');
            let itemId = $(this).attr('data-id');
            let message = $(this).attr('data-message');
            $('#messageModal').modal('hide');
            self.blog.createPost(self.blog.myProfile.last_post_id + 1, message, [{
                type: itemType,
                url: itemId,
                info: itemInfo
            }])
                .then(function (response) {
                    self.onAfterHashChange(response.data);
                });
        });

        $('.go-user-hash').click(function (e) {
            e.preventDefault();
            let self = this;

            let userHash = $('#navigateUserHash').val();
            self.onAfterHashChange(userHash).then(function () {
                $('#userInfo').show();
                $('#mainMenu').click();
            });
        });

        $('.save-info-changes').click(function () {
            let info = self.blog.myProfile || {
                location: {}
            };
            info.first_name = $('#firstNameEdit').val();
            info.last_name = $('#lastNameEdit').val();
            info.birth_date = $('#birthDateEdit').val();
            info.location.name = $('#locationEdit').val();
            info.about = $('#aboutEdit').val();

            self.updateInfo(info, true);
            $('.user-info-filled').show();
            $('.user-info-edit').hide();
            self.blog.saveProfile(info).then(function (response) {
                console.log(response.data);
                self.onAfterHashChange(response.data, true);
            });
        });

        $('.save-info-changes-cancel').click(function () {
            $('.user-info-filled').show();
            $('.user-info-edit').hide();
        });

        $('.user-info-filled')
            .hover(function (e) {
                $('.edit-field-icon').removeClass('hide');
            }, function (e) {
                $('.edit-field-icon').addClass('hide');
            });

        $('.edit-field-icon').click(function (e) {
            e.preventDefault();
            let info = self.blog.myProfile;
            if (info) {
                $('#firstNameEdit').val(info.first_name);
                $('#lastNameEdit').val(info.last_name);
                $('#birthDateEdit').val(info.birth_date);
                $('#locationEdit').val(info.location.name);
                $('#aboutEdit').val(info.about);
            }

            $('.user-info-filled').hide();
            $('.user-info-edit').show();
        });

        $('#file-input').on('change', function () {
            if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    const image = document.getElementById('avatarUpload');
                    image.src = e.target.result;
                    self.cropper = new Cropper(image, {
                        aspectRatio: 1,
                        crop(event) {
                            /*console.log(event.detail.x);
                            console.log(event.detail.y);
                            console.log(event.detail.width);
                            console.log(event.detail.height);
                            console.log(event.detail.rotate);
                            console.log(event.detail.scaleX);
                            console.log(event.detail.scaleY);*/
                        },
                    });
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        $('.save-avatar').click(function () {
            if (self.cropper) {
                let canvas = self.cropper.getCroppedCanvas();
                const mimeType = 'image/jpg';
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.addEventListener('loadend', () => {
                        const arrayBuffer = reader.result;
                        $('#uploadAvatarModal').modal('hide');
                        self.blog.uploadAvatar(arrayBuffer).then(function (response) {
                            console.log(response.data);
                            self.onAfterHashChange(response.data);
                        });
                    });

                    reader.readAsArrayBuffer(blob);
                }, mimeType);
            } else {
                self.alert('Select photo before save');
            }
        });

        $('.load-more').click(function (e) {
            e.preventDefault();
            self.loadPosts();
        });

        $('.add-follower').click(function (e) {
            e.preventDefault();
            let followerHash = $('#followerHash');
            let swarmHash = followerHash.val();
            console.log(swarmHash);
            //if (self.blogClass.isCorrectSwarmHash(swarmHash)) {
            if (web3.isAddress(swarmHash)) {
                $('#addFollowerModal').modal('hide');
                followerHash.val('');
                try {
                    self.blog.addIFollow(swarmHash).then(function (response) {
                        self.onAfterHashChange(response.data);
                    });
                } catch (e) {
                    self.alert(e);
                }
            } else {
                self.alert('Please, enter correct SWARM hash');
            }
        });

        $('#iFollowUsers')
            .on('click', '.load-profile', function (e) {
                e.preventDefault();
                let swarmProfileHash = $(this).attr('data-profile-id');
                if (self.blogClass.isCorrectSwarmHash(swarmProfileHash)) {
                    self.onAfterHashChange(swarmProfileHash)
                        .then(function (response) {
                            //reload();
                        });

                } else if (web3.isAddress(swarmProfileHash)) {
                    // todo show load window
                    self.blog.getSwarmHashByWallet(swarmProfileHash)
                        .then(function (result) {
                            self.onAfterHashChange(result)
                                .then(function (response) {
                                    //reload();
                                });
                        });
                }
            })
            .on('click', '.delete-i-follow', function (e) {
                e.preventDefault();
                let id = $(this).attr('data-profile-id');
                if (confirm('Really delete?')) {
                    self.blog.deleteIFollow(id).then(function (response) {
                        self.onAfterHashChange(response.data);
                    });
                }
            });

        $('.btn-delete-album').click(function (e) {
            e.preventDefault();
            let id = $(this).attr('data-album-id');
            if (confirm('Really delete?')) {
                $('#viewAlbumModal').modal('hide');

                self.blog.deletePhotoAlbum(id)
                    .then(function (response) {
                        self.onAfterHashChange(response.data);
                    });
            }
        });

        $('.create-album').click(function (e) {
            e.preventDefault();
            $('#uploaded-photos').html('');
            $('.upload-all-insta').hide();
            $('.upload-photos').show();
            $('.show-insta-panel').show();
            $('#newAlbumModal').modal('show');
        });

        $('.upload-all-insta').click(function (e) {
            e.preventDefault();
            let photos = $('img[data-type=insta-photo]');
            if (photos.length) {
                $(this).hide();
                self.currentPhotosForAlbum = [];
                self.currentPhotoAlbum = self.blog.myProfile.last_photoalbum_id + 1;
                self.photoAlbumPhotoId = 1;
                self.uploadAllInstaPhotos();
            } else {
                self.alert('Photos not found');
            }
        });

        $('.import-instagram-cancel').click(function () {
            $('.import-insta-panel').hide('fast');
        });
    }

    uploadAllInstaPhotos() {
        let self = this;
        let photos = $('img[data-type=insta-photo]');
        if (photos.length) {
            let previewFileName = null;
            let currentElement = $(photos[0]);
            let src = currentElement.attr('src');
            let downloadedFile = null;
            console.log(src);
            self.swarm.axios.request({
                url: src,
                method: 'GET',
                responseType: 'blob',
            })
                .then(function (response) {
                    downloadedFile = response.data;
                    console.log('Photo downloaded');
                    currentElement.attr('data-type', '');
                    currentElement.addClass('photo-uploaded-insta');
                    console.log('album id ' + self.currentPhotoAlbum);
                    return Utils.resizeImages(response.data, [{width: 250, height: 250}]);
                })
                .then(function (result) {
                    let key = '250x250';
                    let imagePreview = result[key];

                    return self.blog.uploadPhotoToAlbum(self.currentPhotoAlbum, self.photoAlbumPhotoId + '_' + key, imagePreview);
                })
                .then(function (data) {
                    previewFileName = data.fileName;
                    self.onAfterHashChange(data.response, true);
                    return self.blog.uploadPhotoToAlbum(self.currentPhotoAlbum, self.photoAlbumPhotoId, downloadedFile);
                })
                .then(function (data) {
                    console.log('Photo uploaded');
                    console.log(data);
                    self.currentPhotosForAlbum.push({
                        file: data.fileName,
                        description: "",
                        previews: {'250x250': previewFileName}
                    });
                    self.photoAlbumPhotoId++;
                    self.onAfterHashChange(data.response, true);
                    self.uploadAllInstaPhotos();
                });
        } else {
            self.blog.createPhotoAlbum(self.currentPhotoAlbum, 'Insta', '', self.currentPhotosForAlbum)
                .then(function (response) {
                    console.log('album created');
                    console.log(response.data);
                    self.onAfterHashChange(response.data);
                    $('#newAlbumModal').modal('hide');
                    self.alert('Album created!', [
                        '<button type="button" class="btn btn-success btn-share-item" data-type="photoalbum" data-message="Just created new photoalbum from Instagram!" data-id="' + self.currentPhotoAlbum + '">Share</button>'
                    ]);
                });
        }
    }

    youtube_parser(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }

    updateInfo(data, isLoadOnlyProfile) {
        let self = this;
        self.blog.myProfile = data;
        $('#firstName').text(data.first_name);
        $('#lastName').text(data.last_name);
        $('#birthDate').text(data.birth_date);
        if (data.location && data.location.name) {
            $('#locationName').text(data.location.name);
        }

        $('#about').text(data.about);

        if (!isLoadOnlyProfile) {
            if (data.photo && data.photo.original) {
                let url = self.swarm.getFullUrl(data.photo.original);
                $('#bigAvatar').attr('src', url);
            }

            self.lastLoadedPost = 0;
            $('#userPosts').html('');
            $('#iFollowUsers').html('');
            if (data.last_post_id > 0) {
                self.loadPosts();
            } else {
                $('#loadMore').hide();
            }

            self.loadIFollow();
            self.loadPhotoAlbums(3, 'desc');
            self.loadVideoPlaylists(2, 'desc');
        }
    }

    loadPhotoAlbums(limit, sorting) {
        let self = this;
        // todo move limits and sorting to api
        limit = limit || 'all';
        sorting = sorting || 'asc';
        let data = self.blog.myProfile;
        if (data.last_photoalbum_id && data.last_photoalbum_id > 0) {
            let photoAlbums = $('#photoAlbums');
            photoAlbums.html('');
            self.blog.getPhotoAlbumsInfo().then(function (response) {
                let data = response.data;
                if (sorting === 'desc') {
                    data.reverse();
                }

                let i = 0;
                data.forEach(function (v) {
                    if (limit !== 'all' && i >= limit) {
                        return;
                    }

                    let id = v.id;
                    let previewUrl = self.swarm.getFullUrl('social/photoalbum/' + id + '/1_250x250.jpg');
                    photoAlbums.append('<li class="list-inline-item col-sm-4 photoalbum-item">' +
                        '<a href="#" class="load-photoalbum" data-album-id="' + id + '"><img class="photoalbum-img" src="' + previewUrl + '" ></a></li>');
                    i++;
                });
            }).catch(function (error) {

            });
        }
    }

    loadVideoPlaylists(limit, sorting) {
        let self = this;
        // todo move limits and sorting to api
        limit = limit || 'all';
        sorting = sorting || 'asc';
        let data = self.blog.myProfile;
        if (data.last_videoalbum_id && data.last_videoalbum_id > 0) {
            let videoPlaylists = $('#videoPlaylists');
            videoPlaylists.html('');
            self.blog.getVideoAlbumsInfo().then(function (response) {
                let data = response.data;
                console.log(data);
                if (sorting === 'desc') {
                    data.reverse();
                }

                let i = 0;
                data.forEach(function (v) {
                    if (limit !== 'all' && i >= limit) {
                        return;
                    }

                    let id = v.id;
                    if (v.type === "youtube") {
                        videoPlaylists.append('<li class="list-unstyled">' +
                            '<a href="#" class="load-videoalbum page-videoalbum-item" data-album-id="' + id + '"><img class="videoalbum-img type-youtube" src="' + v.cover_file + '"></a></li>');
                    } else if (v.type === "vk") {
                        videoPlaylists.append('<li class="list-unstyled">' +
                            '<a href="#" class="load-videoalbum page-videoalbum-item" data-album-id="' + id + '"><img class="videoalbum-img type-vk" src="' + v.cover_file + '"></a></li>');
                    } else {
                        videoPlaylists.append('<li class="list-unstyled">' +
                            '<a data-type="video" href="#" class="load-videoalbum page-videoalbum-item" data-album-id="' + id + '"><img class="videoalbum-img type-other" src="' + self.swarm.getFullUrl(v.cover_file) + '"></a></li>');
                    }

                    i++;
                });
            }).catch(function () {

            });
        }
    }

    loadIFollow() {
        let self = this;
        let data = self.blog.myProfile;
        let iFollowBlock = $('#iFollowUsers');
        if ('i_follow' in data && data.i_follow.length) {
            data.i_follow.forEach(function (v) {
                //let avatarUrl = self.swarm.getFullUrl('social/file/avatar/original.jpg', v);
                let avatarUrl = 'img/swarm-avatar.jpg';
                let userUrl = self.swarm.getFullUrl('', v);
                iFollowBlock.append('<li class="list-inline-item i-follow-li">' +
                    '<a href="#" class="delete-i-follow" data-profile-id="' + v + '"><img class="delete-img-i-follow" src="img/delete.png" alt=""></a>' +
                    '<a onclick="return false;" href="' + userUrl + '" class="load-profile" data-profile-id="' + v + '"><img class="follower-user-avatar" data-profile-id="' + v + '" src="' + avatarUrl + '" style="width: 30px"></a></li>');
                self.blog.getSwarmHashByWallet(v)
                    .then(function (result) {
                        let avatarUrl = self.swarm.getFullUrl('social/file/avatar/original.jpg', result);
                        $('.follower-user-avatar[data-profile-id="' + v + '"]').attr('src', avatarUrl)
                    });
            });
        }
    }

    loadPosts() {
        let self = this;
        let maxReceivedPosts = 10;
        let data = self.blog.myProfile;
        let meetPostId = data.last_post_id - self.lastLoadedPost;
        for (let i = meetPostId; i > meetPostId - maxReceivedPosts && i > 0; i--) {
            self.addPostTemplate(i);
            self.lastLoadedPost++;

            if (self.lastLoadedPost >= data.last_post_id) {
                $('#loadMore').hide();
            } else {
                $('#loadMore').show();
            }

            self.blog.getPost(i, self.swarm.applicationHash).then(function (response) {
                let data = response.data;
                self.addPostByData(data);
            }).catch(function () {
                $('#userPost' + i).remove();
            });
        }
    }

    addPostTemplate(id, addToTop, containerName, postNamePrefix) {
        postNamePrefix = postNamePrefix || 'userPost';
        let userPostTemplate = $('#userPost');
        containerName = containerName || '#userPosts';
        let userPosts = $(containerName);
        let newPost = userPostTemplate.clone().attr('id', postNamePrefix + id).attr('style', '').attr('data-id', id);
        newPost.find('.description').text('Loading');
        if (addToTop) {
            userPosts.prepend(newPost);
        } else {
            userPosts.append(newPost);
        }

        return newPost;
    }

    addPostByData(data, prefix, containerName, isReadOnly, userHash) {
        let self = this;
        userHash = userHash || self.swarm.applicationHash;
        prefix = prefix || '#userPost';
        let userPost = $(prefix + data.id);
        if (userPost.length <= 0) {
            userPost = self.addPostTemplate(data.id, true, containerName, prefix.substring(1));
        }

        if (data.is_deleted) {
            userPost.remove();

            return;
        }

        userPost.find('.description').text(data.description);
        userPost.find('.edit-post-block textarea').val(data.description);
        if (isReadOnly) {
            userPost.find('.delete-post').remove();
            userPost.find('.edit-post').remove();
        } else {
            userPost.find('.delete-post').attr('data-id', data.id);
            userPost.find('.edit-post').attr('data-id', data.id);
        }

        userPost.find('.save-post').attr('data-id', data.id);
        if (data.attachments && data.attachments.length) {
            let youtubeAttachment = $('#wallYoutubeAttachment');
            let photoAttachment = $('#photoAttachment');
            let videoAttachment = $('#videoAttachment');
            let photoalbumAttachment = $('#photoalbumAttachment');
            let videoalbumAttachment = $('#videoalbumAttachment');
            data.attachments.forEach(function (v) {
                if (v.type === "youtube") {
                    let videoId = self.youtube_parser(v.url);
                    userPost.append(youtubeAttachment.clone().attr('style', '').html('<div class="embed-responsive embed-responsive-16by9">\n' +
                        '<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + videoId + '?rel=0" allowfullscreen></iframe>\n' +
                        '</div>'));
                } else if (v.type === "photo") {
                    let content = photoAttachment
                        .clone()
                        .attr('id', '')
                        .attr('style', '')
                        .attr('data-post-id', data.id)
                        .attr('data-attachment-id', v.id);
                    content.find('.delete-post-content').attr('data-post-id', data.id).attr('data-attachment-id', v.id);
                    let fullUrl = self.swarm.getFullUrl(v.url, userHash);
                    let previewUrl = self.swarm.getFullUrl(v.url, userHash);
                    if ('previews' in v) {
                        previewUrl = self.swarm.getFullUrl(v.previews['250x250'], userHash);
                        content
                            .addClass('list-inline-item')
                            .find('.content')
                            .html('<a href="' + fullUrl + '" data-toggle="lightbox" data-title="View photo" data-footer="" data-gallery="post-images-' + data.id + '"><img class="size-179" src="' + previewUrl + '"></a>');
                    } else {
                        content.find('.content').html('<img src="' + fullUrl + '">');
                    }

                    userPost.append(content);
                } else if (v.type === "audio") {
                    // todo move to html
                    userPost.append(videoAttachment
                        .clone()
                        .attr('id', '')
                        .attr('style', '')
                        .html('<audio controls style="display: block; width: 100%"> <source src="' + self.swarm.getFullUrl(v.url, userHash) + '" type="audio/mpeg"> Your browser does not support the audio element. </audio>'));
                } else if (v.type === "video") {
                    // todo move to html
                    userPost.append(videoAttachment
                        .clone()
                        .attr('id', '')
                        .attr('style', '')
                        .html('<video width="100%" controls><source src="' + self.swarm.getFullUrl(v.url, userHash) + '" type="video/mp4">Your browser does not support the video tag.</video>'));
                } else if (v.type === "photoalbum") {
                    // todo move to html
                    let previewUrl = self.swarm.getFullUrl("social/photoalbum/" + v.url + "/1_250x250.jpg", userHash);
                    userPost.append(photoalbumAttachment.clone().attr('id', '').attr('style', '').html('<li class="list-inline-item col-sm-4 photoalbum-item post-photoalbum-item"><a href="#" class="load-photoalbum" data-album-id="' + v.url + '"><img class="photoalbum-img" src="' + previewUrl + '"></a></li>'));
                } else if (v.type === "videoalbum") {
                    // todo move to html
                    let info;
                    let cover;

                    try {
                        info = JSON.parse(v.info);
                        if (info.type === "video") {
                            cover = self.swarm.getFullUrl(info.cover_file, userHash);
                        } else {
                            cover = info.cover_file;
                        }
                    } catch (ex) {
                        cover = self.swarm.getFullUrl('img/video-cover.jpg', userHash);
                    }

                    userPost.append(videoalbumAttachment.clone().attr('id', '').attr('style', '').html('<li class="list-inline-item col-sm-4 videoalbum-item post-videoalbum-item"><a href="#" class="load-videoalbum" data-album-id="' + v.url + '"><img class="videoalbum-img" src="' + cover + '"></a></li>'));
                }
            });
        }
    }

    alert(message, buttons) {
        let show = function () {
            console.log(message);
            if (typeof message === 'string') {

            } else {
                console.log('Not string, skip');
                return;
            }

            let messageModal = $('#messageModal');
            $('#messageBody').html(message);
            messageModal.modal('show');
            let btns = messageModal.find('.additional-buttons');
            btns.html('');
            if (buttons && buttons.length) {
                buttons.forEach(function (v) {
                    btns.append(v);
                });
            }
        };

        let modalShow = $('.modal.show');
        if (modalShow.length) {
            modalShow.on('hidden.bs.modal', function () {
                show();
            });
            modalShow.modal('hide');
        } else {
            show();
        }
    }
}

module.exports = Main;