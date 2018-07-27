let swarm;
let blog;
let cropper;
$(document).ready(function () {
    // hash - user id
    // chernish - 6f364876a50f1b4438faf5281df4af4ac04aafff8b688fe90ff503b9234e2e71
    //swarm = new SwarmApi("http://127.0.0.1:8500", "202a740db9d1442099a906bb69d2660422949c3244da4797a0aacf13c754dc35");
    console.log('current hash');
    console.log(localStorage.getItem('applicationHash'));
    swarm = new SwarmApi("http://127.0.0.1:8500", localStorage.getItem('applicationHash'));
    //swarm = new SwarmApi("https://swarm-gateways.net", localStorage.getItem('applicationHash'));
    blog = new Blog(swarm);
    if (swarm.applicationHash) {
        blog.getMyProfile()
            .then(function (response) {
                let data = response.data;
                console.log(data);
                // todo autoset profile after update?
                blog.setMyProfile(data);
                updateInfo(data)
            })
            .catch(function (error) {
                //console.log(error);
                console.log('Some error happen');
            })
            .then(function () {
                // always executed
            });
    } else {
        $('#userInfo').hide();
        $('#mainMenu').click();
    }

    init();
});

function init() {
    $('.publish-post').click(function (e) {
        e.preventDefault();
        let postContentElement = $('#postContent');
        let text = postContentElement.val();
        console.log(text);
        let attachments = [];
        $('.post-attachment').each(function (k, v) {
            let type = $(v).attr('data-type');
            let url = $(v).attr('data-url');
            attachments.push({
                type: type,
                url: url
            });
        });
        console.log(attachments);
        // todo block post button and create wait animation
        blog.createPost(blog.myProfile.last_post_id + 1, text, attachments)
            .then(function (response) {
                swarm.applicationHash = response.data;
                console.log(response.data);
                postContentElement.val('');
                localStorage.setItem('applicationHash', response.data);
                location.reload();
            })
            .catch(function (error) {
                console.log('Some error happen');
            })
            .then(function () {
                // always executed
            });
    });

    $('.go-user-hash').click(function (e) {
        e.preventDefault();

        let userHash = $('#navigateUserHash').val();
        swarm.applicationHash = userHash;
        localStorage.setItem('applicationHash', userHash);
        // todo check it before load
        console.log(userHash);
        blog.getProfile(userHash)
            .then(function (response) {
                // handle success
                console.log(response.data);
                updateInfo(response.data);
                $('#userInfo').show();
                $('#mainMenu').click();
                location.reload();

            })
            .catch(function (error) {
                // handle error
                //console.log(error);
                console.log('Some error happen');
            })
            .then(function () {
                // always executed
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

        // todo show wait animation
        blog.saveProfile(info).then(function (response) {
            console.log(response.data);
            localStorage.setItem('applicationHash', response.data);

            $('#editInfoModal').modal('hide');
            location.reload();
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

    $('.save-avatar').click(function () {
        if (cropper) {
            let canvas = cropper.getCroppedCanvas();
            const mimeType = 'image/jpg';
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    const arrayBuffer = reader.result;
                    // todo show upload animation
                    blog.uploadAvatar(arrayBuffer).then(function (response) {
                        $('#uploadAvatarModal').modal('hide');
                        console.log('avatar handled');
                        console.log(response.data);
                        //swarm.applicationHash = response.data;
                        localStorage.setItem('applicationHash', response.data);

                        location.reload();
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
        alert('not implemented');
    });

    $('.attach-video').click(function (e) {
        e.preventDefault();
        alert('not implemented');
    });

    $('.add-youtube-video').click(function (e) {
        //e.preventDefault();
        let url = $('#youtubeUrl').val();
        if (url) {
            $('#attachYoutubeModal').modal('hide');
            let postAttachmentTemplate = $('#postAttachment');
            $('#attached-content').append(postAttachmentTemplate.attr('style', '').attr('data-type', 'youtube').attr('data-url', url).html('<a target="_blank" href="' + url + '">' + url + '</a>'));
        } else {
            alert('Please, enter url');
        }
    });
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function updateInfo(data) {
    $('#firstName').text(data.first_name);
    $('#lastName').text(data.last_name);
    $('#birthDate').text(data.birth_date);
    if (data.location && data.location.name) {
        $('#locationName').text(data.location.name);
    }

    if (data.photo && data.photo.original) {
        $('#bigAvatar').attr('src', swarm.getFullUrl(data.photo.original));
    }

    $('#about').text(data.about);
    //$('#lastPostId').text(data.last_post_id);
    if (data.last_post_id > 0) {
        let userPostTemplate = $('#userPost');
        let userPosts = $('#userPosts');
        for (let i = data.last_post_id; i > 0; i--) {
            userPosts.append(userPostTemplate.clone().attr('id', 'userPost' + i).attr('style', '').attr('data-id', i).html('Loading...'));
            blog.getPost(i, swarm.applicationHash).then(function (response) {
                let data = response.data;
                console.log(data);
                let userPost = $('#userPost' + data.id);
                userPost.text(data.description);
                if (data.attachments && data.attachments.length) {
                    let youtubeAttachment = $('#wallYoutubeAttachment');
                    data.attachments.forEach(function (v) {
                        if (v.type === "youtube") {
                            let videoId = youtube_parser(v.url);
                            userPost.append(youtubeAttachment.attr('style', '').html('<div class="embed-responsive embed-responsive-16by9">\n' +
                                '  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + videoId + '?rel=0" allowfullscreen></iframe>\n' +
                                '</div>'));
                        }
                    });

                }
            });
        }
    }
}