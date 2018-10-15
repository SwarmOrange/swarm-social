class Post {
    constructor(main) {
        this.init();
        this.main = main;
        this.blog = main.blog;
    }

    init() {
        let self = this;
        $('.publish-post').click(function (e) {
            e.preventDefault();
            let postContentElement = $('#postContent');
            let description = postContentElement.val();
            let attachments = [];
            let id = 1;
            $('.post-attachment').each(function (k, v) {
                let type = $(v).attr('data-type');
                let url = $(v).attr('data-url');
                let previews = $(v).attr('data-previews');
                previews = previews ? JSON.parse(previews) : {};
                if (type && url) {
                    attachments.push({
                        id: id,
                        type: type,
                        url: url,
                        previews: previews
                    });
                    id++;
                }
            });
            let isContentExists = description.length || attachments.length;
            if (!isContentExists) {
                self.main.alert('Please, write text or add attachments');
                return;
            }

            let newPostId = self.blog.myProfile.last_post_id + 1;
            self.main.addPostByData({
                id: newPostId,
                description: description,
                attachments: attachments
            }, {
                userProfile: self.main.blog.myProfile
            });
            $('#postBlock').addClass("disabled-content");
            self.blog.createPost(newPostId, description, attachments)
                .then(function (response) {
                    console.log(response.data);
                    postContentElement.val('');
                    $('#attached-content').html('');
                    self.main.onAfterHashChange(response.data, true);
                })
                .catch(function (error) {
                    console.log(error);
                    console.log('Some error happen');
                })
                .then(function () {
                    $('#postBlock').removeClass("disabled-content");
                });
        });

        $('#postBlock')
            .on('click', '.delete-post-attachment', function (e) {
                e.preventDefault();
                let url = $(this).attr('data-url');
                let type = $(this).attr('data-type');
                $('.post-attachment[data-url="' + url + '"]').hide('slow', function () {
                    $(this).remove();
                });
                if (type !== 'youtube') {
                    self.main.swarm.delete(url).then(function (response) {
                        self.main.onAfterHashChange(response.data, true);
                    });
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

        $('.attach-audio').click(function (e) {
            e.preventDefault();
            let input = $('#input-attach-file');
            input.attr('data-type', 'audio');
            input.attr('accept', 'audio/*');
            input.click();
        });

        $('#input-attach-file').on('change', function () {
            if (this.files && this.files[0]) {
                $('#postOrAttach').addClass("disabled-content");

                let progressPanel = $('#progressPanel');
                let postProgress = $('#postProgress');
                progressPanel.show();
                let fileType = $(this).attr('data-type');
                let setProgress = function (val) {
                    postProgress.css('width', val + '%').attr('aria-valuenow', val);
                };
                let updateProgress = function (progress) {
                    let onePercent = progress.total / 100;
                    let currentPercent = progress.loaded / onePercent;
                    setProgress(currentPercent);
                };

                let currentPostId = self.blog.myProfile.last_post_id + 1;
                let formData = new FormData();
                let lastName = null;
                let lastNameWithoutExtension = null;
                let lastBlob = null;
                let lastExtension = null;
                let timestamp = +new Date();
                let lastValue = null;
                $.each(this.files, function (key, value) {
                    lastValue = value;
                    let blob = value.slice(0, value.size, value.type);
                    lastBlob = blob;
                    let extension = value.name.split('.').pop();
                    lastNameWithoutExtension = timestamp + '_' + key;
                    lastName = lastNameWithoutExtension + '.' + extension;
                    lastExtension = extension;
                    let file = new File([blob], lastName, {type: value.type});
                    formData.append(key, file);
                });

                let onComplete = function (data) {
                    self.main.onAfterHashChange(data, true);
                    progressPanel.hide();
                    setProgress(0);
                    $('#postOrAttach').removeClass("disabled-content");
                };

                let afterUploadingFiles = function (data) {
                    console.log(data);
                    let url = data.url + lastName;
                    let fullUrl = data.fullUrl + lastName;
                    let postAttachmentTemplate = $('#postAttachment')
                        .clone()
                        .removeAttr('id')
                        .attr('style', '')
                        .attr('data-type', fileType)
                        .attr('data-url', url);
                    postAttachmentTemplate
                        .find('.content')
                        .html('<a href="#" class="delete-post-attachment" data-url="' + url + '" data-type="' + fileType + '"><img src="img/delete.png" alt=""></a> <a target="_blank" href="' + fullUrl + '">' + url + '</a>')
                    $('#attached-content').append(postAttachmentTemplate);
                    onComplete(data.response.data);
                };

                let beforeUploadingPhoto = function (file) {
                    let url = Utils.getUrlForBlob(file);
                    let postAttachmentTemplate = $('#postAttachment')
                        .clone()
                        .addClass('list-inline-item')
                        .removeAttr('id')
                        .attr('style', '')
                        .attr('data-name', file.name);
                    postAttachmentTemplate
                        .find('.content')
                        .html('<img class="img-preview" src="' + url + '">');
                    $('#attached-content').append(postAttachmentTemplate);
                };

                let afterUploadingPhoto = function (previewFile, originalFile, data) {
                    let previewUrl = Utils.getUrlForBlob(previewFile);
                    let originalUrl = data.fullUrl + originalFile.name;
                    let dataUrl = data.url + originalFile.name;
                    let attachment = $('.post-attachment[data-name="' + previewFile.name + '"]');
                    attachment
                        .attr('data-type', fileType)
                        .attr('data-url', dataUrl)
                        .attr('data-previews', JSON.stringify({'250x250': data.url + previewFile.name}));
                    attachment.append('<div class="delete-post-content" data-url="' + dataUrl + '">×</div>');
                    attachment.find('.content').html('<a target="_blank" href="' + originalUrl + '"><img class="img-preview" src="' + previewUrl + '"></a>');
                    onComplete(data.response.data);
                };

                let beforeUploadingVideo = function (fileId, file) {
                    let postAttachmentTemplate = $('#postAttachment')
                        .clone()
                        .addClass('list-inline-item')
                        .removeAttr('id')
                        .attr('style', '')
                        .attr('data-name', fileId);
                    postAttachmentTemplate
                        .find('.content')
                        .html('<img data-video-name="' + fileId + '" class="img-preview" src="img/video-cover.jpg">');
                    $('#attached-content').append(postAttachmentTemplate);
                    Utils.getVideoImage(file, function (seconds) {
                        return seconds / 2;
                    })
                        .then(function (data) {
                            console.log(data);
                            if (data.img) {
                                $('img[data-video-name="' + fileId + '"]').attr('src', data.img.src);
                            } else {
                                self.main.alert('Can not create preview for video');
                            }

                            return data.blob;
                        })
                        .then(function (blob) {
                            // todo create wide and square preview
                            // todo upload preview to swarm
                            /*self.blog.uploadFilesForPost(currentPostId, formData, updateProgress)
                                .then(function (data) {
                                    afterUploadingPhoto(file, formData.get(0), data);
                                });*/
                        });
                };

                let afterUploadingVideo = function (fileId, data) {
                    let url = data.url + lastName;
                    let fullUrl = data.fullUrl + lastName;
                    $('img[data-video-name="' + fileId + '"]').wrap('<a href="' + fullUrl + '" target="_blank"></a>');
                    let attachment = $('.post-attachment[data-name="' + fileId + '"]');
                    attachment
                        .attr('data-type', fileType)
                        .attr('data-url', url);
                    onComplete(data.response.data);
                };

                if (fileType === 'photo') {
                    Utils.resizeImages(lastBlob, [
                        {width: 250, height: 250, format: "box"},
                        {width: 1200, height: 800, format: "maxsize"}
                    ])
                        .then(function (result) {
                            let key = '250x250';
                            let keyBigPreview = '1200x800';
                            let imagePreview = result[key];
                            let imageBigPreview = result[keyBigPreview];
                            let previewFilename = lastNameWithoutExtension + '_' + key + '.' + lastExtension;
                            let bigPreviewFilename = lastNameWithoutExtension + '_' + keyBigPreview + '.' + lastExtension;
                            let file = new File([imagePreview], previewFilename, {type: lastValue.type});
                            let fileBig = new File([imageBigPreview], bigPreviewFilename, {type: lastValue.type});
                            beforeUploadingPhoto(file);
                            formData.append(1, file);
                            formData.append(2, fileBig);
                            self.blog.uploadFilesForPost(currentPostId, formData, updateProgress)
                                .then(function (data) {
                                    afterUploadingPhoto(file, formData.get(0), data);
                                });
                        });
                } else if (fileType === 'video') {
                    let fileId = Math.random().toString(36).substr(2, 10);
                    beforeUploadingVideo(fileId, lastBlob);
                    self.blog.uploadFilesForPost(currentPostId, formData, updateProgress)
                        .then(function (data) {
                            afterUploadingVideo(fileId, data);
                        });
                } else {
                    self.blog.uploadFilesForPost(currentPostId, formData, updateProgress)
                        .then(function (data) {
                            afterUploadingFiles(data);
                        });
                }
            }

            $(this).val(null);
        });

        $('.add-youtube-video').click(function (e) {
            //e.preventDefault();
            let url = $('#youtubeUrl').val();
            if (url) {
                $('#attachYoutubeModal').modal('hide');
                let postAttachmentTemplate = $('#postAttachment')
                    .clone()
                    .removeAttr('id')
                    .attr('style', '')
                    .attr('data-type', 'youtube')
                    .attr('data-url', url);
                postAttachmentTemplate
                    .find('.content')
                    .html('<a href="#" class="delete-post-attachment" data-url="' + url + '" data-type="youtube"><img src="img/delete.png" alt=""></a> <a target="_blank" href="' + url + '">' + url + '</a>');
                $('#attached-content').append(postAttachmentTemplate);
            } else {
                self.main.alert('Please, enter url');
            }
        });

        $('#userPosts')
            .on('click', '.delete-post', function (e) {
                e.preventDefault();
                let id = $(this).attr('data-id');
                if (confirm('Really delete?')) {
                    $('#userPost' + id).hide('slow');
                    self.main.blog.deletePost(id)
                        .then(function (response) {
                            self.main.onAfterHashChange(response.data, true);
                        });
                }
            })
            .on('click', '.edit-post', function (e) {
                e.preventDefault();
                let id = $(this).attr('data-id');
                $('#userPost' + id + ' .description').toggle();
                $('#userPost' + id + ' .edit-post-block').toggle();
                $('#userPost' + id + ' .delete-post-content').toggle();
            })
            .on('click', '.save-post', function (e) {
                e.preventDefault();
                let id = $(this).attr('data-id');
                let description = $(this).closest('.edit-post-block').find('textarea').val();
                $('#userPost' + id + ' .description').text(description).toggle();
                $('#userPost' + id + ' .edit-post-block').toggle();
                self.blog.editPost(id, description)
                    .then(function (response) {
                        self.main.onAfterHashChange(response.data, true);
                    });
            });
    }
}

module.exports = Post;