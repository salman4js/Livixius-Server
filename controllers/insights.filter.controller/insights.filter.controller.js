const InsightsFilterImplementation = require('./insights.filter.implementation');
const ResponseHandler = require("../../ResponseHandler/ResponseHandler");
class InsightsFilterController extends InsightsFilterImplementation {
    constructor(options) {
        super();
        this.responseHandler = new ResponseHandler();
        this._prepareInitialValues(options);
    };

    _prepareInitialValues(options){
        this.options = {
            implOptions: {
                id: options.req.params.id,
                filters: JSON.parse(options.req.params.filters),
                selectedDates: JSON.parse(options.req.params.selectedDates)
            },
            req: options.req,
            res: options.res,
            next: options.next
        }
        this._initializeImpl(this.options.implOptions);
    };

    async _getFilterContent(){
        this._getInsightsFilterContent().then((result) => {
            this.responseHandler.parser(this.options.res, {statusCode: 200, result: result, success: true});
        }).catch((err) => {
            console.log(this.options)
            this.options.next(err);
        });
    };
}

module.exports = InsightsFilterController;