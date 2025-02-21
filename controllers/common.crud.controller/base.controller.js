const ResponseHandler = require('../../ResponseHandler/ResponseHandler');
const controllerMapping = require("./controller.mapping");
class BaseController {
    constructor(req, res, next) {
        this.controllerMapping = controllerMapping.controllerMapping
        this.responseHandler = new ResponseHandler();
        this._prepareInitialValues(req, res, next);
    };

    _prepareInitialValues(req, res, next){
        this.options = {
            selectedNodes: req.params.selectedNodes,
            widgetName: req.params.widgetName,
            request: req,
            response: res,
            next: next
        }
    };

    _addParamsInImplOptions(){
        if(!this.options.implOptions) this.options.implOptions = {};
        Object.keys(this.options.request.query).forEach((query) => {
            this.options.implOptions[query] = this.options.request.query[query];
        });
        Object.keys(this.options.request.params).forEach((param) => {
            this.options.implOptions[param] = this.options.request.params[param];
        });
    };

    _initiateAction(){
        return new Promise((resolve, reject) => {
            this.controllerMapping[this.options.request.method][this.options.widgetName](this.options.implOptions).then((result) => {
                resolve(result);
            }).catch((err) => {
                this.options.next(err);
                reject(err);
            });
        });
    };
};

module.exports = BaseController;