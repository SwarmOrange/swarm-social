class Blog {
    constructor(swarm) {
        this.swarm = swarm;
    }

    getMyProfile() {
        return this.swarm.get('profile.json');
    }

    setMyProfile(data) {
        this.myProfile = data;
    }

    saveProfile(data, userHash) {
        return this.swarm.post("profile.json", JSON.stringify(data), 'application/json', userHash);
    }

    getProfile(userHash) {
        return this.swarm.get('profile.json', userHash);
    }

    sendRawFile(fileName, data, fileType, userHash, swarmProtocol) {
        return this.swarm.post(fileName, data, fileType, userHash, swarmProtocol);
    }

    uploadFile() {

    }

    createPost(id, text, attachments) {
        let self = this;
        // structure
        // /post/ID/info.json - {"id":id, "description":"my super post", "attachments":[]}
        attachments = attachments || [];
        let info = {
            id: id,
            description: text,
            attachments: attachments
        };

        return this.sendRawFile("post/" + id + "/info.json", JSON.stringify(info), 'application/json')
            .then(function (response) {
                console.log('one');
                console.log(response.data);
                self.myProfile.last_post_id = id;

                // todo change with saveProfile
                return self.sendRawFile("profile.json", JSON.stringify(self.myProfile), 'application/json', response.data);
            });
    }

    getPost(id, userHash) {
        return this.swarm.get('post/' + id + '/info.json', userHash);

    }
}