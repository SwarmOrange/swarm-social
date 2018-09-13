class Settings {
    constructor(main) {
        this.main = main;
        this.zip = null;
        this.receivedFiles = [];
        this.currentFileId = 0;
        this.totalSize = 0;
        this.init();
    }

    init() {
        let self = this;
        $('#v-pills-settings-tab').click(function (e) {
            self.setExportStatus('');
            $('.export-download-button').hide();
            $('#exportDataProgress').hide();
            self.setExportProgress(0);
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

        $('.settings-export-download').click(function (e) {
            e.preventDefault();

            let progressPanel = $('#exportDataProgress');
            progressPanel.show();
            self.setExportProgress(0);
            let downloadNext = function () {
                if (self.currentFileId >= self.receivedFiles.length) {
                    self.setExportStatus('All files downloaded! Creating archive..');
                    self.zip.generateAsync({type: "blob"})
                        .then(function (content) {
                            self.setExportProgress(0);
                            saveAs.saveAs(content, "social-backup.zip");
                        });
                    return;
                }

                let fileName = self.receivedFiles[self.currentFileId];
                let url = self.main.swarm.getFullUrl(fileName);
                self.main.swarm.axios.request({
                    url: url,
                    method: 'GET',
                    responseType: 'blob',
                }).then(function (response) {
                    self.zip.file(fileName, response.data);
                    self.setExportProgress((self.currentFileId + 1) / self.receivedFiles.length * 100);
                    self.currentFileId++;
                    downloadNext();
                });
            };

            downloadNext();
        });

        $('.settings-export-all-data').click(function (e) {
            e.preventDefault();

            self.setExportProgress(0);
            $('.export-download-button').hide();
            self.zip = new JSZip();
            self.receivedFiles = [];
            self.currentFileId = 0;
            self.totalSize = 0;
            self.setExportStatus('Find all files...');
            self.findAllFiles(null, null, function (files) {
                self.setExportStatus('Found ' + files.length + ' files. Total size: ' + (self.totalSize / 1024 / 1024).toFixed(2) + ' Mb');
                $('.export-download-button').show();
                self.receivedFiles = files;
            });
        });
    }

    setExportProgress(val) {
        $('#exportDataProgressBar').css('width', val + '%').attr('aria-valuenow', val);
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

        self.setExportStatus('Receive files from: ' + currentDirectory);
        self.main.swarm.request('get', currentDirectory, '', 'bzz-list:')
            .then(function (response) {
                let data = response.data;
                if ('entries' in data) {
                    data.entries.forEach(function (v) {
                        foundFiles[v.path] = 1;
                        self.totalSize += v.size;
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