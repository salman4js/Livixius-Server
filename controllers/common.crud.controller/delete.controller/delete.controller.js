const BaseController = require('../base.controller');

class DeleteController extends BaseController {
    constructor(req, res, next) {
       super(req, res, next);
    };

    async doAction(){
        this.options.implOptions = this.options.request.body;
        this._addParamsInImplOptions();
        this._initiateAction().then(() => {
            this.responseHandler.parser(this.options.response, {statusCode: 204})
        });
    };
}

module.exports = DeleteController;