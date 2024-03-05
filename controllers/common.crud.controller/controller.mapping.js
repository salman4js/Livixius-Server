const vouchersImpl = require('../voucherController/voucher.implementation');

var controllerMapping = {
    DELETE: {
        voucherTracker: (options) => vouchersImpl.deleteVoucherModel(options)
    },
    PUT: {
        voucherTracker: (options) => vouchersImpl.editVoucherModel(options)
    }
};

module.exports = { controllerMapping };