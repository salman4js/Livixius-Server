const path = require('path');

class DownloadManager {
    constructor() {
        
    };

    // Prepare the initial request and response values.
    _prepareInitialValues(req, res){
      this.options = req.params;
      this.response = res;
    };

    // Get the downloadable content from the file system.
    _getDownloadContent(){
        // Get the content from the filepath in the params.
        var filepath = path.resolve(this.options.filepath, this.options.filename);
        this.response.sendFile(filepath);
    };

    downloadContent(req, res){
        this._prepareInitialValues(req, res);
        this._getDownloadContent();
    };
}

module.exports = new DownloadManager();