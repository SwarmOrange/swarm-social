let swarm;
let blog;
$(document).ready(function () {
    // hash - user id
    // chernish - b76381c89954d0d54565655886faf58bb12ab5a7900330ac61dcb832a33c1be6
    swarm = new SwarmApi("http://127.0.0.1:8500", "3374ee40a324edfb734683005c5f59b7a288ca61bd405ae20728ab85aec9af1d");
    blog = new Blog(swarm);
    blog.getMyProfile()
        .then(function (response) {
            // handle success
            let data = response.data;

            console.log(data);
            // todo autoset profile after update?
            blog.setMyProfile(data);
            updateInfo(data)
        })
        .catch(function (error) {
            // handle error
            //console.log(error);
            console.log('Some error happen');
        })
        .then(function () {
            // always executed
        });

    init();
});

function init() {
    $('.publish-post').click(function (e) {
        e.preventDefault();
        let postContentElement = $('#postContent');
        let text = postContentElement.val();
        console.log(text);
        // todo block post button and create wait animation
        blog.createPost(blog.myProfile.last_post_id + 1, text)
            .then(function (response) {
                console.log(response.data);
                postContentElement.val('');
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
        // todo check it before load
        console.log(userHash);
        blog.getProfile(userHash).then(function (response) {
            // handle success
            console.log(response.data);
            updateInfo(response.data)
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
}

function updateInfo(data) {
    $('#firstName').text(data.first_name);
    $('#lastName').text(data.last_name);
    $('#birthDate').text(data.birth_date);
    if (data.location && data.location.name) {
        $('#locationName').text(data.location.name);
    }

    if (data.photo && data.photo.big_avatar) {
        $('#bigAvatar').attr('src', data.photo.big_avatar);
    }

    $('#about').text(data.about);
    $('#lastPostId').text(data.last_post_id);
}