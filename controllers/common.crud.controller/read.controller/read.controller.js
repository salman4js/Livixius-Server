const BaseController = require('../base.controller');

class ReadController extends BaseController {
    constructor(req, res, next) {
        super(req, res, next);
    };

    async doAction(){
        this._addParamsInImplOptions();
        this._initiateAction().then((result) => {
            this.responseHandler.parser(this.options.response, {statusCode: 200, result: result, success: true});
        })
    };
}

module.exports = ReadController;