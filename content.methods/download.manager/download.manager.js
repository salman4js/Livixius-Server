const path = require('path');

class DownloadManager {
    constructor() {
        this.basePath = 'content.methods/export.to.csv/downloads'
    };

    // Prepare the initial request and response values.
    _prepareInitialValues(req, res){
      this.options = req.params;
      this.response = res;
    };

    // Get the downloadable content from the file system.
    _getDownloadContent(){
        // Use the basePath if there is no filepath in the options.
        var filePathToSearch = this.options.filepath !== undefined ? this.options.filepath : this.basePath;
        // Get the content from the filepath in the params.
        var filepath = path.resolve(filePathToSearch, this.options.filename);
        this.response.sendFile(filepath);
    };

    downloadContent(req, res){
        this._prepareInitialValues(req, res);
        this._getDownloadContent();
    };
}

module.exports = new DownloadManager();