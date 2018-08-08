let swarm;
let blog;
let cropper;
let lastLoadedPost = 0;
let currentPhotoAlbum = 0;
let currentPhotosForAlbum = [];
let photoAlbumPhotoId = 0;

$(document).on('click', '[data-toggle="lightbox"]', function (event) {
    event.preventDefault();
    $(this).ekkoLightbox();
});

$(document).ready(function () {
    // hash - user id
    //console.log('hash from local storage: ' + localStorage.getItem('applicationHash'));
    let hash = window.location.hash.substring(1);
    console.log('hash from window hash: ' + hash);
    //let initHash = hash ? hash : localStorage.getItem('applicationHash');

    swarm = new SwarmApi(window.location.hostname === "mem.lt" ? "https://swarm-gateways.net" : "http://127.0.0.1:8500", "");
    //swarm = new SwarmApi("https://swarm-gateways.net", initHash);
    blog = new Blog(swarm);
    let isValid = (hash || blog.uploadedSwarmHash).length > 0;
    if (!isValid) {
        alert('Yo can\'t access this site. Add #SWARM_HASH to url and update page.');
        return;
    }

    let initHash = hash ? hash : blog.uploadedSwarmHash;
    console.log('selected hash: ' + initHash);
    swarm.applicationHash = initHash;
    console.log(swarm.applicationHash);
    if (swarm.applicationHash) {
        updateProfile();
    } else {
        $('#userInfo').hide();
        $('#mainMenu').click();
    }

    init();
});

function updateProfile() {
    return blog.getMyProfile()
        .then(function (response) {
            let data = response.data;
            console.log(data);
            // todo autoset profile after update?
            blog.setMyProfile(data);
            updateInfo(data);
            setTimeout(function () {
                $('#loadModal').modal('hide');
            }, 1000);
        })
        .catch(function (error) {
            console.log(error);
            console.log('Some error happen');
        })
        .then(function () {
            // always executed
        });
}

function showUploadModal() {
    /*$('#loadModal').modal({
        backdrop: 'static',
        show: true
    });*/
}

function onAfterHashChange(newHash, notUpdateProfile) {
    swarm.applicationHash = newHash;
    localStorage.setItem('applicationHash', newHash);
    window.location.hash = newHash;
    if (notUpdateProfile) {
        return null;
    } else {
        return updateProfile();
    }
}

function init() {
    $('.publish-post').click(function (e) {
        e.preventDefault();
        let postContentElement = $('#postContent');
        let text = postContentElement.val();
        let attachments = [];
        $('.post-attachment').each(function (k, v) {
            let type = $(v).attr('data-type');
            let url = $(v).attr('data-url');
            if (type && url) {
                attachments.push({
                    type: type,
                    url: url
                });
            }
        });
        console.log(text);
        console.log(attachments);
        let isContentExists = text.length || attachments.length;
        if (!isContentExists) {
            alert('Please, write text or add attachments');
            return;
        }

        // todo block post button and create wait animation
        //$('#postBlock').addClass("disabled-content");
        //showUploadModal();
        blog.createPost(blog.myProfile.last_post_id + 1, text, attachments)
            .then(function (response) {
                console.log(response.data);
                postContentElement.val('');
                $('#attached-content').html('');
                onAfterHashChange(response.data);
            })
            .catch(function (error) {
                console.log(error);
                console.log('Some error happen');
            })
            .then(function () {
                // always executed
            });
    });

    $('.go-user-hash').click(function (e) {
        e.preventDefault();

        let userHash = $('#navigateUserHash').val();
        /*goToHash(userHash).then(function (response) {
            $('#userInfo').show();
            $('#mainMenu').click();
            //reload();
        })*/
        onAfterHashChange(userHash).then(function () {
            $('#userInfo').show();
            $('#mainMenu').click();
        });
    });

    $('.edit-page-info').click(function (e) {
        let info = blog.myProfile;
        $('#firstNameEdit').val(info.first_name);
        $('#lastNameEdit').val(info.last_name);
        $('#birthDateEdit').val(info.birth_date);
        $('#locationEdit').val(info.location.name);
        $('#aboutEdit').val(info.about);
    });

    $('.save-info-changes').click(function () {
        // todo save and close
        let info = blog.myProfile;
        info.first_name = $('#firstNameEdit').val();
        info.last_name = $('#lastNameEdit').val();
        info.birth_date = $('#birthDateEdit').val();
        info.location.name = $('#locationEdit').val();
        info.about = $('#aboutEdit').val();

        $('#editInfoModal').modal('hide');
        showUploadModal();
        blog.saveProfile(info).then(function (response) {
            console.log(response.data);
            //localStorage.setItem('applicationHash', response.data);
            //reload();
            onAfterHashChange(response.data);
        });
    });

    $('#file-input').on('change', function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                const image = document.getElementById('avatarUpload');
                image.src = e.target.result;
                cropper = new Cropper(image, {
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

    $('#input-attach-file').on('change', function () {
        if (this.files && this.files[0]) {
            $('#postOrAttach').addClass("disabled-content");

            let progressPanel = $('#progressPanel');
            let postProgress = $('#postProgress');
            progressPanel.show();
            let fileType = $(this).attr('data-type');
            let contentType = this.files[0].type;
            let fileName = this.files[0].name;
            let setProgress = function (val) {
                postProgress.css('width', val + '%').attr('aria-valuenow', val);
            };
            let reader = new FileReader();
            reader.onload = function (e) {
                blog.uploadFileForPost(blog.myProfile.last_post_id + 1, e.target.result, contentType, fileName, function (progress) {
                    let onePercent = progress.total / 100;
                    let currentPercent = progress.loaded / onePercent;
                    setProgress(currentPercent);
                }).then(function (data) {
                    let url = data.url;
                    let fullUrl = data.fullUrl;
                    console.log(data);
                    let postAttachmentTemplate = $('#postAttachment').clone();
                    $('#attached-content').append(postAttachmentTemplate.attr('style', '').attr('data-type', fileType).attr('data-url', url).html('<a target="_blank" href="' + fullUrl + '">' + url + '</a>'));
                    //swarm.applicationHash = data.response.data;
                    onAfterHashChange(data.response.data);
                    progressPanel.hide();
                    setProgress(0);
                    $('#postOrAttach').removeClass("disabled-content");
                });
            };
            //console.log(this.files[0]);
            reader.readAsArrayBuffer(this.files[0]);
        }
    });

    $('.save-avatar').click(function () {
        if (cropper) {
            let canvas = cropper.getCroppedCanvas();
            const mimeType = 'image/jpg';
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    const arrayBuffer = reader.result;
                    $('#uploadAvatarModal').modal('hide');
                    showUploadModal();
                    blog.uploadAvatar(arrayBuffer).then(function (response) {
                        //console.log('avatar handled');
                        console.log(response.data);
                        //swarm.applicationHash = response.data;
                        //localStorage.setItem('applicationHash', response.data);
                        //reload();
                        onAfterHashChange(response.data);
                    });
                });

                reader.readAsArrayBuffer(blob);
            }, mimeType);
        } else {
            alert('Select photo before save');
        }
    });

    $('.attach-photo').click(function (e) {
        e.preventDefault();
        //alert('not implemented');
        let input = $('#input-attach-file');
        input.attr('data-type', 'photo');
        input.attr('accept', 'image/*');
        input.click();
    });

    $('.attach-video').click(function (e) {
        e.preventDefault();
        //alert('not implemented');
        let input = $('#input-attach-file');
        input.attr('data-type', 'video');
        input.attr('accept', 'video/*');
        input.click();
    });

    $('.add-youtube-video').click(function (e) {
        //e.preventDefault();
        let url = $('#youtubeUrl').val();
        if (url) {
            $('#attachYoutubeModal').modal('hide');
            let postAttachmentTemplate = $('#postAttachment').clone();
            $('#attached-content').append(postAttachmentTemplate.attr('style', '').attr('data-type', 'youtube').attr('data-url', url).html('<a target="_blank" href="' + url + '">' + url + '</a>'));
        } else {
            alert('Please, enter url');
        }
    });

    $('#userPosts').on('click', '.delete-post', function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        if (confirm('Really delete?')) {
            blog.deletePost(id).then(function (response) {
                //localStorage.setItem('applicationHash', response.data);
                //reload();
                onAfterHashChange(response.data);
            });
        }
    });

    $('.create-profile').click(function (e) {
        e.preventDefault();

        localStorage.setItem('applicationHash', '');
        // todo how to create empty hash with one file?
        //blog.saveProfile({});
    });

    $('.load-more').click(function (e) {
        e.preventDefault();
        loadPosts();
    });


    $('.add-follower').click(function (e) {
        e.preventDefault();
        let followerHash = $('#followerHash');
        let swarmHash = followerHash.val();
        console.log(swarmHash);
        if (Blog.isCorrectSwarmHash(swarmHash)) {
            $('#addFollowerModal').modal('hide');
            followerHash.val('');
            try {
                blog.addIFollow(swarmHash).then(function (response) {
                    onAfterHashChange(response.data);
                });
            } catch (e) {
                alert(e);
            }
        } else {
            alert('Please, enter correct SWARM hash');
        }
    });

    $('#iFollowUsers').on('click', '.load-profile', function (e) {
        e.preventDefault();
        let swarmProfileHash = $(this).attr('data-profile-id');
        // todo go to profile
        goToHash(swarmProfileHash).then(function (response) {
            //reload();
        });
    });

    $('#photoAlbums').on('click', '.load-photoalbum', function (e) {
        e.preventDefault();
        let albumId = $(this).attr('data-album-id');
        let viewAlbumContent = $('#viewAlbumContent');
        $('#viewAlbumModal').modal('show');
        viewAlbumContent.html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');
        blog.getAlbumInfo(albumId).then(function (response) {
            let data = response.data;
            console.log(data);
            viewAlbumContent.html('<ul id="preview-album" class="list-inline">');
            data.photos.forEach(function (v) {
                viewAlbumContent.append('<li class="list-inline-item"><a href="' + swarm.getFullUrl(v.file) + '" data-toggle="lightbox" data-title="View photo" data-footer="' + v.description + '" data-gallery="gallery-' + albumId + '"><img src="' + swarm.getFullUrl(v.file) + '" class="img-fluid preview-album-photo"></a></li>');
            });
            viewAlbumContent.append('</ul>');
        });
    });

    $('.show-insta-panel').click(function (e) {
        e.preventDefault();
        $('.import-insta-panel').show('fast');
    });

    $('.import-instagram').click(function (e) {
        e.preventDefault();
        let instaNick = $('#instaNick').val();
        if (!instaNick) {
            alert('Incorrect nickname');

            return;
        }

        $('.import-insta-panel').hide('fast');

        let uploaderPhotos = $('#uploaded-photos');
        uploaderPhotos.html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');

        //swarm.axios.get('http://content-bot.tut.bike/insta/go.php?limit=100&login=' + instaNick).then(function (response) {
        swarm.axios.get('https://mem.lt/insta/go.php?limit=100&login=' + instaNick).then(function (response) {
            let data = response.data;
            $('.upload-all-insta').show();
            uploaderPhotos.html('');

            if (data && data.length && typeof data === 'object') {

            } else {
                $('#newAlbumModal').modal('hide');
                alert('Incorrect login or error while retrieving data');
                return;
            }

            uploaderPhotos.html('<ul id="preview-insta-album" class="list-inline">');
            data.forEach(function (v) {
                uploaderPhotos.append('<li class="list-inline-item"><img data-type="insta-photo" style="max-width: 100px; max-height: 100px;" src="' + v.fullsize + '"></li>');
            });
            uploaderPhotos.append('</ul>');
        }).catch(function (error) {
            console.log(error);
            console.log('Insta error');
        });

        $('#addFromInstaModal').modal('hide');
        $('#newAlbumModal').modal('show');

    });

    $('.create-album').click(function (e) {
        e.preventDefault();
        $('#uploaded-photos').html('');
        $('.upload-all-insta').hide();
        $('#newAlbumModal').modal('show');
    });

    $('.upload-all-insta').click(function (e) {
        e.preventDefault();
        let photos = $('img[data-type=insta-photo]');
        if (photos.length) {
            $(this).hide();
            currentPhotosForAlbum = [];
            currentPhotoAlbum = blog.myProfile.last_photoalbum_id + 1;
            photoAlbumPhotoId = 1;
            uploadAllInstaPhotos();
        } else {
            alert('Photos not found');
        }
    });

    $('.import-instagram-cancel').click(function () {
        $('.import-insta-panel').hide('fast');
    });
}

function uploadAllInstaPhotos() {
    let photos = $('img[data-type=insta-photo]');
    if (photos.length) {
        let currentElement = $(photos[0]);
        let src = currentElement.attr('src');
        console.log(src);
        swarm.axios.request({
            url: src,
            method: 'GET',
            responseType: 'blob',
        }).then(function (response) {
            console.log('Photo downloaded');
            //console.log(response.data);
            currentElement.attr('data-type', '');
            currentElement.addClass('photo-uploaded-insta');
            console.log('album id ' + currentPhotoAlbum);
            blog.uploadPhotoToAlbum(currentPhotoAlbum, photoAlbumPhotoId, response.data).then(function (data) {
                console.log('Photo uploaded');
                console.log(data);
                currentPhotosForAlbum.push({
                    file: data.fileName,
                    description: ""
                });
                photoAlbumPhotoId++;
                onAfterHashChange(data.response, true);
                uploadAllInstaPhotos();
            });
        });
    } else {
        blog.createPhotoAlbum(currentPhotoAlbum, 'Insta', '', currentPhotosForAlbum).then(function (response) {
            console.log('album created');
            console.log(response.data);
            onAfterHashChange(response.data);
            $('#newAlbumModal').modal('hide');
            alert('Album created!');
        });
    }
}

function goToHash(userHash) {
    //swarm.applicationHash = userHash;
    //localStorage.setItem('applicationHash', userHash);
    onAfterHashChange(userHash);
    /*showUploadModal();
    // todo check it before load
    console.log(userHash);
    return blog.getProfile(userHash)
        .then(function (response) {
            console.log('ok, hide');
            setTimeout(function () {
                $('#loadModal').modal('hide');
            }, 1000);

            console.log(response.data);
            updateInfo(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            console.log('Some error happen');
        })*/
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function updateInfo(data) {
    blog.myProfile = data;
    $('#firstName').text(data.first_name);
    $('#lastName').text(data.last_name);
    $('#birthDate').text(data.birth_date);
    if (data.location && data.location.name) {
        $('#locationName').text(data.location.name);
    }

    if (data.photo && data.photo.original) {
        let url = swarm.getFullUrl(data.photo.original);
        $('#bigAvatar').attr('src', url);
    }

    $('#about').text(data.about);
    lastLoadedPost = 0;
    $('#userPosts').html('');
    $('#iFollowUsers').html('');
    if (data.last_post_id > 0) {
        loadPosts();
    } else {
        $('#loadMore').hide();
    }

    loadIFollow();
    loadPhotoAlbums();
}

function loadPhotoAlbums() {
    let data = blog.myProfile;
    if (data.last_photoalbum_id && data.last_photoalbum_id > 0) {
        let photoAlbums = $('#photoAlbums');
        photoAlbums.html('');
        for (let i = data.last_photoalbum_id; i > 0; i--) {
            photoAlbums.append('<li class="list-inline-item"><a href="#" class="load-photoalbum" data-album-id="' + i + '"><img src="' + swarm.getFullUrl('social/photoalbum/' + i + '/1.jpg') + '" style="width: 100%"></a></li>');
        }
    }
}

function loadIFollow() {
    let data = blog.myProfile;
    let iFollowBlock = $('#iFollowUsers');
    if ('i_follow' in data && data.i_follow.length) {
        data.i_follow.forEach(function (v) {
            iFollowBlock.append('<li class="list-inline-item"><a href="' + swarm.getFullUrl('', v) + '" class="load-profile" data-profile-id="' + v + '"><img src="' + swarm.getFullUrl('social/file/avatar/original.jpg', v) + '" style="width: 50px"></a></li>');
        });
    }
}

function loadPosts() {
    let userPostTemplate = $('#userPost');
    let userPosts = $('#userPosts');
    let maxReceivedPosts = 10;
    let data = blog.myProfile;
    let meetPostId = data.last_post_id - lastLoadedPost;
    for (let i = meetPostId; i > meetPostId - maxReceivedPosts && i > 0; i--) {
        let newPost = userPostTemplate.clone().attr('id', 'userPost' + i).attr('style', '').attr('data-id', i);
        newPost.find('.description').text('Loading');
        userPosts.append(newPost);
        lastLoadedPost++;

        if (lastLoadedPost >= data.last_post_id) {
            $('#loadMore').hide();
        } else {
            $('#loadMore').show();
        }

        blog.getPost(i, swarm.applicationHash).then(function (response) {
            let data = response.data;
            console.log(data);
            let userPost = $('#userPost' + data.id);
            if (data.is_deleted) {
                userPost.remove();

                return;
            }

            userPost.find('.description').text(data.description);
            userPost.find('.delete-post').attr('data-id', data.id);
            if (data.attachments && data.attachments.length) {
                let youtubeAttachment = $('#wallYoutubeAttachment');
                let photoAttachment = $('#photoAttachment');
                let videoAttachment = $('#videoAttachment');
                data.attachments.forEach(function (v) {
                    if (v.type === "youtube") {
                        let videoId = youtube_parser(v.url);
                        userPost.append(youtubeAttachment.clone().attr('style', '').html('<div class="embed-responsive embed-responsive-16by9">\n' +
                            '  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + videoId + '?rel=0" allowfullscreen></iframe>\n' +
                            '</div>'));
                    } else if (v.type === "photo") {
                        userPost.append(photoAttachment.clone().attr('style', '').html('<img src="' + swarm.getFullUrl(v.url) + '">'));
                    } else if (v.type === "video") {
                        userPost.append(photoAttachment.clone().attr('style', '').html('<video width="100%" controls><source src="' + swarm.getFullUrl(v.url) + '" type="video/mp4">Your browser does not support the video tag.</video>'));
                    }
                });
            }
        });
    }
}