$(document).ready(function () {
    initMru();
});

function initMru() {
    $('.save-mru').hide();
    $('.save-mru').click(function (e) {
        e.preventDefault();
        if (blog.myProfile.mru) {
            blog.saveMru(blog.myProfile.mru, swarm.applicationHash);
        } else {
            // todo check address
            console.log(web3.eth.defaultAccount);
            blog.createMru(web3.eth.defaultAccount).then(function (response) {
                console.log('mru');
                console.log(response.mru);
                response.response.then(function (response) {
                    onAfterHashChange(response.data);
                });
                //blog.saveMru(response.data, swarm.applicationHash);
            });
        }
    });
}