$(document).ready(function () {
    initImportButton();
});

function initImportButton() {
    $('.btn-profile-import-instagram').click(function (e) {
        e.preventDefault();
        $('.show-insta-panel').click();
        $('.upload-photos').hide();
        $('.show-insta-panel').hide();
        $('.upload-all-insta').hide();
        $('#newAlbumModal').modal('show');
    });

    $('.btn-profile-import-facebook').click(function (e) {
        e.preventDefault();
        alert('Not implemented yet');
        /*$('.show-insta-panel').click();
        $('.upload-photos').hide();
        $('.show-insta-panel').hide();
        $('.upload-all-insta').hide();
        $('#newAlbumModal').modal('show');*/
    });
}