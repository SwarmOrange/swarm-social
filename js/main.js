let swarm;
$(document).ready(function () {
    // hash - user id
    swarm = new SwarmApi("http://127.0.0.1:8500", "d69dae79356b7b944c1cbcaf423e1b71e90c9de13f744b55e69765bd22ed897d");
    swarm.get('profile.json').then(function (response) {
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

    init();
});

function init() {
    $('.publish-post').click(function (e) {
        e.preventDefault();
        let text = $('#postContent').val();
        console.log(text);
    });
}

function updateInfo(data) {
    $('#firstName').text(data.firstName);
    $('#lastName').text(data.lastName);
    $('#birthDate').text(data.birthDate);
    if (data.location && data.location.name) {
        $('#locationName').text(data.location.name);
    }

    $('#about').text(data.about);
}