const BaseController = require('../base.controller');

class CreateController extends BaseController {
    constructor(req, res, next) {
        super(req, res, next);
    };

    async doAction(){
      this.options.implOptions = this.options.request.body;
      this._addParamsInImplOptions();
      this._initiateAction().then((result) => {
          if(!result?.notCreated){
              this.responseHandler.parser(this.options.response, {statusCode: 201, result: result, success: true});
          } else {
              this.responseHandler.parser(this.options.response, {statusCode: 400, message: result.message, success: false});
          }
      })
    };
}

module.exports = CreateController;