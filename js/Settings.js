class Settings {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-settings-tab').click(function (e) {
            self.setStatus('');
        });

        $('.settings-export-all-data').click(function (e) {
            e.preventDefault();
            let zip = new JSZip();
            let receivedFiles = [];
            let currentFileId = 0;
            let downloadNext = function () {
                if (currentFileId >= receivedFiles.length) {
                    console.log('COMPLETE');
                    zip.generateAsync({type: "blob"})
                        .then(function (content) {
                            saveAs.saveAs(content, "social-backup.zip");
                        });
                    return;
                }

                let fileName = receivedFiles[currentFileId];
                let url = self.main.swarm.getFullUrl(fileName);
                currentFileId++;
                self.main.swarm.axios.request({
                    url: url,
                    method: 'GET',
                    responseType: 'blob',
                }).then(function (response) {
                    zip.file(fileName, response.data);
                    downloadNext();
                });
            };

            self.setStatus('Find all files...');
            self.findAllFiles(null, null, function (files) {
                self.setStatus('Found ' + files.length + ' files');
                receivedFiles = files;
                downloadNext();
            });
        });
    }

    setStatus(text) {
        $('.export-status').html(text);
    }

    findAllFiles(foundFiles, foundDirectories, onComplete) {
        let self = this;
        let currentDirectory = self.main.blog.prefix;
        foundFiles = foundFiles || {};
        if (foundDirectories) {
            currentDirectory = Object.keys(foundDirectories)[0];
            delete foundDirectories[currentDirectory];
        } else {
            foundDirectories = {};
        }

        self.main.swarm.request('get', currentDirectory, '', 'bzz-list:').then(function (response) {
            let data = response.data;
            if ('entries' in data) {
                data.entries.forEach(function (v) {
                    foundFiles[v.path] = 1;
                });
            }

            if ('common_prefixes' in data) {
                data.common_prefixes.forEach(function (v) {
                    foundDirectories[v] = 1;
                });
            }

            if (Object.keys(foundDirectories).length > 0) {
                self.findAllFiles(foundFiles, foundDirectories, onComplete);
            } else {
                if (onComplete) {
                    onComplete(Object.keys(foundFiles));
                }
            }
        });
    }
}

module.exports = Settings;