const ResponseHandler = require('../../ResponseHandler/ResponseHandler');
const CustomTemplateImpl = require('./custom.template.implementation')
class CustomTemplateController {
    constructor() {
      this.postLoadDependencies();
    };

    postLoadDependencies(){
        this.responseHandler = new ResponseHandler();
        this.customTemplateImpl = CustomTemplateImpl;
    };

    async addNewEntry(req, res){
        var result = await this.customTemplateImpl.addNewEntry(req.body);
        this.responseHandler.parser(res, result);
    };

    async getAllEntry(req, res){
        var response = await this.customTemplateImpl.getAllEntry(req.params);
        this.responseHandler.prepareResponseJSON(response, res);
    };

    async deleteEntry(req, res){
      var result = await this.customTemplateImpl.deleteEntry(req.params);
      this.responseHandler.prepareResponseJSON(result, res);
    };
}

module.exports = new CustomTemplateController();