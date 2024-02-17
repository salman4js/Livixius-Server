const ResponseHandler = require("../../ResponseHandler/ResponseHandler");
const LivixiusMessageImpl = require('./livixius.message.implementation');
class LivixiusMessageController {
    constructor() {
        this.postLoadDependencies();
    };

    postLoadDependencies(){
        this.responseHandler = new ResponseHandler();
        this.livixiusMessageImpl = LivixiusMessageImpl;
    };

    async addNewMessage(req, res){
        const result = await this.livixiusMessageImpl.addNewMessage(req.body);
        this.responseHandler.parser(res, result);
    };

    async getAllMessages(req, res){
      const result = await this.livixiusMessageImpl.getAllMessages();
      this.responseHandler.prepareResponseJSON(result, res);
    };
}

module.exports = new LivixiusMessageController();