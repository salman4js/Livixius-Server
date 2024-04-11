const BaseController = require('../base.controller');

class DeleteController extends BaseController {
    constructor(req, res, next) {
       super(req, res, next);
    };

    async doAction(){
        this.options.implOptions = this.options.request.body;
        this._addParamsInImplOptions();
        this._initiateAction().then((result) => {
            if(!result?.notDeleted){
                this.responseHandler.parser(this.options.response, {statusCode: 204})
            } else {
                this.responseHandler.parser(this.options.response, {statusCode: 200, message: result.message, success: false});
            }
        }).catch((err) => {
           this.responseHandler.parser(this.options.response, {statusCode: 500, error: err});
        });
    };
}

module.exports = DeleteController;