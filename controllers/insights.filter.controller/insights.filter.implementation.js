const mongoose = require('mongoose');
const UserDb = require('../../models/UserDb');

class InsightsFilterImplementation {
    constructor() {

    };

    _initializeImpl(options){
      this.implOptions = options;
    };

    _getTotalPriceAmount(){
        return UserDb.aggregate([
            {
                $match: {
                    lodge: mongoose.Types.ObjectId(this.implOptions.id),
                    dateofcheckout: {
                        $gte: this.implOptions.selectedDates.fromDate,
                        $lte: this.implOptions.selectedDates.toDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$dateofcheckout" } } },
                    totalBillAmount: { $sum: { $toDouble: "$bill" } } // Convert 'bill' to number and sum it up
                }
            },
            {
                $project: {
                    date: "$_id",
                    totalBillAmount: 1,
                    _id: 0
                }
            }
        ]).then((results) => {
            return results;
        }).catch((err) => {
            return err;
        });
    };

    _getInsightsFilterContent(){
       return new Promise((resolve, reject) => {
           this._getTotalPriceAmount().then((result) => {
               resolve(result);
           }).catch((err) => {
               reject(err);
           });
       });
    };
}

module.exports = InsightsFilterImplementation;