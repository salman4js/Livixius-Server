const ExportToCsvController = require('../export.to.csv/export.to.csv.controller');

class GenerateReceiptController {
    constructor() {
        this.resultname = 'result';
        this.infoMessage = {
            success: {
                status: true, creation: true, message: 'Export to csv operation completed'
            },
            failure: {
                status: false, creation: false, message: 'Some internal error occurred'
            }
        };
    };

    generateReceipt(req, res){
      ExportToCsvController._prepareInitialValues(req, res);
      // As of now, Export controller looks for result in the 'result' in the returned object.
      // Some impl returns result in the different keys, so send as a param to align with export controller _getCellValues method.
      ExportToCsvController.params.resultname = this.resultname;
      ExportToCsvController.params.extendedOptions = ['totalAmount', 'customerDetails']
      ExportToCsvController._getCellValues().then(() => {
          this.infoMessage.success['cellValues'] = ExportToCsvController.options.cellValues;
          this.infoMessage.success['totalAmount'] = ExportToCsvController.options.totalAmount;
          this.infoMessage.success['customerDetails'] = ExportToCsvController.options.customerDetails;
          ExportToCsvController.responseHandler.parser(res, this.infoMessage.success);
      }).catch((err) => {
          ExportToCsvController.responseHandler.parser(res, this.infoMessage.failure);
      })
    };
}

module.exports = new GenerateReceiptController();