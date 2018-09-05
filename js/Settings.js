class Settings {
    constructor(main) {
        this.main = main;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-settings-tab').click(function (e) {
            self.setExportStatus('');
        });

        $('#settings-import-file').on('change', function (evt) {
            self.setImportStatus('');
            let userFiles = [];
            if (this.files && this.files.length === 1) {
                function uploadFiles() {
                    if (userFiles.length <= 0) {
                        self.setImportStatus('Uploading complete! Refresh this page');

                        return;
                    }

                    let uploadFile = userFiles.shift();
                    uploadFile.async('blob').then(function (content) {
                        self.setImportStatus('Uploading file: ' + uploadFile.name + '...');
                        return self.main.swarm.post(uploadFile.name, content).then(function (response) {
                            self.main.onAfterHashChange(response.data, true);
                            uploadFiles();
                        });
                    });
                }

                function handleFile(f) {
                    JSZip.loadAsync(f).then(function (zip) {
                        let isProfileFound = false;
                        zip.forEach(function (relativePath, zipEntry) {
                            if (zipEntry.name === "social/profile.json") {
                                isProfileFound = true;
                            }
                            if (!zipEntry.dir) {
                                userFiles.push(zipEntry);
                            }
                        });

                        if (isProfileFound) {
                            uploadFiles();

                        } else {
                            self.main.alert('Incorrect archive');
                        }
                    }, function (e) {
                        self.setImportStatus("Error reading " + f.name + ": " + e.message);
                    });
                }

                handleFile(evt.target.files[0]);
            }
        });

        $('.settings-import-data').click(function (e) {
            e.preventDefault();
            $('#settings-import-file').click();
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

            self.setExportStatus('Find all files...');
            self.findAllFiles(null, null, function (files) {
                self.setExportStatus('Found ' + files.length + ' files. Downloading all to zip archive..');
                receivedFiles = files;
                downloadNext();
            });
        });
    }

    setExportStatus(text) {
        $('.export-status').html(text);
    }

    setImportStatus(text) {
        $('.import-status').html(text);
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