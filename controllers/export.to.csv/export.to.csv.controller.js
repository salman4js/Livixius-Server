const ExportToCsv = require('../../content.methods/export.to.csv/export.to.csv.js');
const controllerMapping = require('./controller.mapping');
const ResponseHandler = require("../../ResponseHandler/ResponseHandler");
class ExportToCsvController extends ExportToCsv {
    constructor() {
        super();
        this.controllerMapping = controllerMapping.controllerMapping;
        this.defaultDownloadPath = 'downloads';
        this.responseHandler = new ResponseHandler();
    };

    // Prepare the initial values.
    _prepareInitialValues(req, res){
        this.options = req.body;
        this.options.path = this.options.path !== undefined ? this.options.path : this.defaultDownloadPath;
        this.params = req.params;
        this.response = res;
    };

    // When the creation is done, build a download url to let the UI download the file.
    _buildDownloadUrl(){
        // Get the baseUrl and then append the accId into it to identify the lodgeId.
        this.url = this.options.baseUrl + '/' + this.options.accId + '/' + this.options.path + '/' + this.options.fileName;
    };

    async _getCellValues(){
        // In case of export to csv, User can select the desired nodes to export.
        // So adding the nodes values as part of the params.
        this.params.nodes = this.options.nodes;
        // Get the desired table cell values.
        this.cellValues = await this.controllerMapping[this.options.widgetValue](this.params);
        // When the cellValues is retrieved, add it in the options body.
        this.options['cellValues'] = this.cellValues.result;
    };

    // Main function when export csv route has been triggered.
    exportCsv(req, res){
        this._prepareInitialValues(req, res);
        this._getCellValues().then(() => {
            this.convertToCsv(this.options).then((result) => {
                // If the creation of csv file is success, then build a GET request url to send it to UI so that the file can be downloaded from there.
                this._buildDownloadUrl();
                result['downloadUrl'] = this.url;
                this.responseHandler.parser(this.response, result);
            }).catch((error) => {
                this.responseHandler.parser(this.response, error);
            })
        }).catch((error) => {
            this.responseHandler.parser(this.response, error);
        });
    };

}

module.exports = new ExportToCsvController();