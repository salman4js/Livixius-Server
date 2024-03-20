const mongoose = require('mongoose');
const UserDb = require('../../models/UserDb');

class InsightsFilterImplementation {
    constructor() {

    };

    _initializeImpl(options){
      this.implOptions = options;
    };

    _getTotalAmountWithFilterAndDateApplied(){
        return UserDb.aggregate([
            {
                $match: {
                    lodge: mongoose.Types.ObjectId(this.implOptions.id),
                    dateofcheckout: {
                        $gte: this.implOptions.selectedDates.fromDate,
                        $lte: this.implOptions.selectedDates.toDate
                    },
                    roomType: { $in: this.implOptions.filters.roomType }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$dateofcheckout" } } },
                        roomType: "$roomType"
                    },
                    totalBillAmount: { $sum: { $toDouble: "$bill" } } // Convert 'bill' to number and sum it up
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    roomTypes: {
                        $push: {
                            roomType: "$_id.roomType",
                            totalBillAmount: "$totalBillAmount"
                        }
                    },
                    totalBillAmount: { $sum: "$totalBillAmount" }
                }
            },
            {
                $project: {
                    date: "$_id",
                    roomTypes: 1,
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
           this._getTotalAmountWithFilterAndDateApplied().then((result) => {
               resolve(result);
           }).catch((err) => {
               reject(err);
           });
       });
    };
}

module.exports = InsightsFilterImplementation;