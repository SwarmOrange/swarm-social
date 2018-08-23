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
    if (hash) {
        if (Blog.isCorrectSwarmHash(hash)) {

        } else {
            alert('Incorrect hash after # in url. Fix it and reload page.');

            return;
        }
    }

    console.log('hash from window hash: ' + hash);
    //let initHash = hash ? hash : localStorage.getItem('applicationHash');
    let swarmHost = window.location.protocol + "//" + window.location.hostname;
    if (window.location.hostname === "mem.lt") {
        swarmHost = "https://swarm-gateways.net";
    } else if (window.location.hostname === "tut.bike") {
        swarmHost = "http://beefree.me";
    } else if (window.location.hostname === "localhost") {
        swarmHost = "http://127.0.0.1:8500";
        //swarmHost = "https://swarm-gateways.net";
    }

    //swarmHost = window.location.hostname === "mem.lt" ? "https://swarm-gateways.net" : "http://127.0.0.1:8500";
    swarm = new SwarmApi(swarmHost, "");
    //swarm = new SwarmApi("https://swarm-gateways.net", initHash);
    blog = new Blog(swarm);
    let isValid = (hash || blog.uploadedSwarmHash).length > 0;
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

    let initHash = hash ? hash : blog.uploadedSwarmHash;
    console.log('selected hash: ' + initHash);
    swarm.applicationHash = initHash;
    console.log(swarm.applicationHash);
    if (swarm.applicationHash) {
        updateProfile();
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
        let description = postContentElement.val();
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
        console.log(description);
        console.log(attachments);
        let isContentExists = description.length || attachments.length;
        if (!isContentExists) {
            alert('Please, write text or add attachments');
            return;
        }

        let newPostId = blog.myProfile.last_post_id + 1;
        addPostByData({
            id: newPostId,
            description: description,
            attachments: attachments
        });
        $('#postBlock').addClass("disabled-content");
        blog.createPost(newPostId, description, attachments)
            .then(function (response) {
                console.log(response.data);
                postContentElement.val('');
                $('#attached-content').html('');
                onAfterHashChange(response.data, true);
            })
            .catch(function (error) {
                console.log(error);
                console.log('Some error happen');
            })
            .then(function () {
                $('#postBlock').removeClass("disabled-content");
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
        if (info) {
            $('#firstNameEdit').val(info.first_name);
            $('#lastNameEdit').val(info.last_name);
            $('#birthDateEdit').val(info.birth_date);
            $('#locationEdit').val(info.location.name);
            $('#aboutEdit').val(info.about);
        }
    });

    $('.save-info-changes').click(function () {
        let info = blog.myProfile || {
            location: {}
        };
        info.first_name = $('#firstNameEdit').val();
        info.last_name = $('#lastNameEdit').val();
        info.birth_date = $('#birthDateEdit').val();
        info.location.name = $('#locationEdit').val();
        info.about = $('#aboutEdit').val();

        $('#editInfoModal').modal('hide');
        showUploadModal();
        blog.saveProfile(info).then(function (response) {
            console.log(response.data);
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
                    onAfterHashChange(data.response.data, true);
                    progressPanel.hide();
                    setProgress(0);
                    $('#postOrAttach').removeClass("disabled-content");
                });
            };
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
                        console.log(response.data);
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
        let input = $('#input-attach-file');
        input.attr('data-type', 'photo');
        input.attr('accept', 'image/*');
        input.click();
    });

    $('.attach-video').click(function (e) {
        e.preventDefault();
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

    $('#userPosts')
        .on('click', '.delete-post', function (e) {
            e.preventDefault();
            let id = $(this).attr('data-id');
            if (confirm('Really delete?')) {
                //$('#my-post').addClass("disabled-content");
                $('#userPost' + id).hide('slow');
                blog.deletePost(id).then(function (response) {
                    onAfterHashChange(response.data, true);
                });
            }
        })
        .on('click', '.edit-post', function (e) {
            e.preventDefault();
            let id = $(this).attr('data-id');
            $('#userPost' + id + ' .description').toggle();
            $('#userPost' + id + ' .edit-post-block').toggle();
        })
        .on('click', '.save-post', function (e) {
            e.preventDefault();
            let id = $(this).attr('data-id');
            let description = $(this).closest('.edit-post-block').find('textarea').val();
            $('#userPost' + id + ' .description').text(description).toggle();
            $('#userPost' + id + ' .edit-post-block').toggle();
            blog.editPost(id, description).then(function (response) {
                onAfterHashChange(response.data, true);
            });
        });

    $('.create-profile').click(function (e) {
        e.preventDefault();

        //localStorage.setItem('applicationHash', '');
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

    $('#iFollowUsers')
        .on('click', '.load-profile', function (e) {
            e.preventDefault();
            let swarmProfileHash = $(this).attr('data-profile-id');
            // todo go to profile
            goToHash(swarmProfileHash).then(function (response) {
                //reload();
            });
        })
        .on('click', '.delete-i-follow', function (e) {
            e.preventDefault();
            let id = $(this).attr('data-profile-id');
            if (confirm('Really delete?')) {
                blog.deleteIFollow(id).then(function (response) {
                    onAfterHashChange(response.data);
                });
            }
        });

    $('.btn-delete-album').click(function (e) {
        e.preventDefault();
        let id = $(this).attr('data-album-id');
        if (confirm('Really delete?')) {
            $('#viewAlbumModal').modal('hide');

            blog.deletePhotoAlbum(id).then(function (response) {
                onAfterHashChange(response.data);
            });
        }
    });

    $('#photoAlbums').on('click', '.load-photoalbum', function (e) {
        e.preventDefault();
        let albumId = $(this).attr('data-album-id');
        let viewAlbumContent = $('#viewAlbumContent');
        $('.btn-delete-album').attr('data-album-id', albumId);
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

    $('#videoPlaylists').on('click', '.load-videoalbum', function (e) {
        e.preventDefault();
        let albumId = $(this).attr('data-album-id');
        let viewAlbumContent = $('#viewVideoAlbumContent');
        $('.btn-delete-album').attr('data-album-id', albumId);
        $('#viewVideoAlbumModal').modal('show');
        viewAlbumContent.html('<div class="col-sm-2 offset-sm-5"><div class="loader-animation"></div></div>');
        blog.getVideoAlbumInfo(albumId).then(function (response) {
            let data = response.data;
            console.log(data);
            viewAlbumContent.html('<ul id="preview-album" class="list-inline">');
            data.videos.forEach(function (v) {
                if (v.type === "youtube") {
                    viewAlbumContent.append('<li class="list-inline-item"><a href="https://youtube.com/watch?v=' + v.file + '" data-toggle="lightbox" data-title="View video" data-footer="' + v.description + '" data-gallery="gallery-video-' + albumId + '"><img src="' + v.cover_file + '" class="img-fluid preview-album-photo"></a></li>');
                } else {
                    viewAlbumContent.append('<li class="list-inline-item"><a data-type="video" href="' + swarm.getFullUrl(v.file) + '" data-toggle="lightbox" data-title="View video" data-footer="' + v.description + '" data-gallery="gallery-video-' + albumId + '"><img src="' + v.cover_file + '" class="img-fluid preview-album-photo"></a></li>');
                }
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
        swarm.axios.get('https://mem.lt/insta/go.php?limit=1&login=' + instaNick).then(function (response) {
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
        $('.upload-photos').show();
        $('.show-insta-panel').show();
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

            let attachments = [];
            currentPhotosForAlbum.forEach(function (v) {
                attachments.push({
                    type: 'photo',
                    url: v.file
                });
            });
            blog.createPost(blog.myProfile.last_post_id + 1, 'Just uploaded new photos', attachments).then(function (response) {
                onAfterHashChange(response.data);
            });
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
    loadPhotoAlbums(3, 'desc');
    loadVideoPlaylists(3, 'desc');
}

function loadPhotoAlbums(limit, sorting) {
    // todo move limits and sorting to api
    limit = limit || 'all';
    sorting = sorting || 'asc';
    let data = blog.myProfile;
    if (data.last_photoalbum_id && data.last_photoalbum_id > 0) {
        let photoAlbums = $('#photoAlbums');
        photoAlbums.html('');
        blog.getAlbumsInfo().then(function (response) {
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
                photoAlbums.append('<li class="list-inline-item col-sm-4 photoalbum-item">' +
                    '<a href="#" class="load-photoalbum" data-album-id="' + id + '"><img class="photoalbum-img" src="' + swarm.getFullUrl('social/photoalbum/' + id + '/1.jpg') + '" ></a></li>');
                i++;
            });
        });
    }
}

function loadVideoPlaylists(limit, sorting) {
    // todo move limits and sorting to api
    limit = limit || 'all';
    sorting = sorting || 'asc';
    let data = blog.myProfile;
    if (data.last_videoalbum_id && data.last_videoalbum_id > 0) {
        let videoPlaylists = $('#videoPlaylists');
        videoPlaylists.html('');
        blog.getVideoAlbumsInfo().then(function (response) {
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
                videoPlaylists.append('<li class="list-inline-item col-sm-4">' +
                    '<a href="#" class="load-videoalbum" data-album-id="' + id + '"><img class="videoalbum-img" src="' + v.cover_file + '"></a></li>');

                i++;
            });
        });
    }
}

function randomName() {
    let items = ['Johny First', 'Martin Adam', 'Gregory Grey', 'Lynn Jobs', 'Steve Works'];
    return items[Math.floor(Math.random() * items.length)];
}

function loadIFollow() {
    let data = blog.myProfile;
    let iFollowBlock = $('#iFollowUsers');
    if ('i_follow' in data && data.i_follow.length) {
        data.i_follow.forEach(function (v) {
            //iFollowBlock.append('<li class="list-inline-item i-follow-li">' +
            iFollowBlock.append('<li class="i-follow-li">' +
                //'<a href="#" class="delete-i-follow" data-profile-id="' + v + '"><img class="delete-img-i-follow" src="img/delete.png" alt=""></a>' +
                '<a onclick="return false;" href="' + swarm.getFullUrl('', v) + '" class="load-profile--" data-profile-id="' + v + '"><img src="' + swarm.getFullUrl('social/file/avatar/original.jpg', v) + '" style="width: 30px"></a> <a href="#" onclick="return false;"><span style="margin-left: 8px">' + randomName() + '</span></a></li>');
        });
    }
}

function loadPosts() {
    let maxReceivedPosts = 10;
    let data = blog.myProfile;
    let meetPostId = data.last_post_id - lastLoadedPost;
    for (let i = meetPostId; i > meetPostId - maxReceivedPosts && i > 0; i--) {
        addPostTemplate(i);
        lastLoadedPost++;

        if (lastLoadedPost >= data.last_post_id) {
            $('#loadMore').hide();
        } else {
            $('#loadMore').show();
        }

        blog.getPost(i, swarm.applicationHash).then(function (response) {
            let data = response.data;
            addPostByData(data);
        });
    }
}

function addPostTemplate(id, addToTop) {
    let userPostTemplate = $('#userPost');
    let userPosts = $('#userPosts');
    let newPost = userPostTemplate.clone().attr('id', 'userPost' + id).attr('style', '').attr('data-id', id);
    newPost.find('.description').text('Loading');
    if (addToTop) {
        userPosts.prepend(newPost);
    } else {
        userPosts.append(newPost);
    }

    return newPost;
}

function addPostByData(data) {
    let userPost = $('#userPost' + data.id);
    if (userPost.length <= 0) {
        userPost = addPostTemplate(data.id, true);
    }

    if (data.is_deleted) {
        userPost.remove();

        return;
    }

    userPost.find('.description').text(data.description);
    userPost.find('.edit-post-block textarea').val(data.description);
    userPost.find('.delete-post').attr('data-id', data.id);
    userPost.find('.edit-post').attr('data-id', data.id);
    userPost.find('.save-post').attr('data-id', data.id);
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
                userPost.append(videoAttachment.clone().attr('style', '').html('<video width="100%" controls><source src="' + swarm.getFullUrl(v.url) + '" type="video/mp4">Your browser does not support the video tag.</video>'));
            }
        });
    }
}