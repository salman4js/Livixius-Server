const path = require('path');
const fs = require('fs');
const csvWriter = require('csv-writer');

class ExportToCsv {

    constructor() {
      this.csvWriter = csvWriter;
      this.infoMessage = {
          success: {
              status: true, creation: true, message: 'Export to csv operation completed'
          },
          failure: {
              status: false, creation: false, message: 'Some internal error occurred'
          }
      };
    };

    // Get the path and header value ready for the CSV writer.
    _prepareCsvWriter(){
        this.downloadPath = './' + this.options.path;
        this.writer = this.csvWriter.createObjectCsvWriter({
            path: path.resolve(this.downloadPath, this.options.fileName),
            header: this.options.headerValue
        })
    };

    // Check and clear the files in the provided filepath with the same filename to avoid unexpected behavior.
    _checkAndClearDownloadPath(){
        return new Promise((resolve) => {
            var fileToDelete = this.downloadPath + '/' +this.options.fileName;
            fs.unlink(fileToDelete, (err) => {
                resolve(); // Resolving even though we get an error while deleting the file in the provided path.
            });
        });
    };

    // Convert to csv and then send it back to the controller.
    convertToCsv(options){
       this.options = options;
       return new Promise((resolve, reject) => {
           // Prepare the path and header values for the csv writer.
           this._prepareCsvWriter();
           // Before generate the csv file, delete files in the same name as filepath
           // in the provided filepath to avoid unexpected behavior.
           this._checkAndClearDownloadPath().catch((err) => {
               this.infoMessage.failure['error'] = err;
               reject(this.infoMessage.failure);
           });
           this.writer.writeRecords(this.options.cellValues).then(() => {
               resolve(this.infoMessage.success);
           }).catch((error) => {
               this.infoMessage.failure['error'] = error;
               reject(this.infoMessage.failure);
           });
       });
    };

}

module.exports = ExportToCsv;