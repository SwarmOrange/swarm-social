$(document).ready(function () {
    initStartNow();
});

function initStartNow() {
    $('.btn-start-now').click(function (e) {
        e.preventDefault();
        $('#userRegistration').fadeOut('slow');
        $('#importData').show('fast');
    });

    $('.btn-create-empty').click(function (e) {
        e.preventDefault();
        $('.edit-page-info').click();
        showContent();

    });

    $('.btn-import-instagram').click(function (e) {
        e.preventDefault();
        $('.show-insta-panel').click();
        $('.upload-photos').hide();
        $('.show-insta-panel').hide();
        $('.upload-all-insta').hide();
        $('#newAlbumModal').modal('show');

        showContent();
    });
}

function showContent() {
    $('#importData').hide('fast');
    $('#userRegistration').hide('fast');
    $('#userInfo').show();
}