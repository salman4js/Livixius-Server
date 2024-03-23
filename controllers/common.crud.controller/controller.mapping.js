const vouchersImpl = require('../voucherController/voucher.implementation');
const multipleLoginImpl = require('../MultipleLoginController/multiple.login.implementation');

var controllerMapping = {
    DELETE: {
        voucherTracker: (options) => vouchersImpl.deleteVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.deleteLogins(options)
    },
    PUT: {
        voucherTracker: (options) => vouchersImpl.editVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.editLogins(options)
    },
    POST: {
        voucherTracker: (options) => vouchersImpl.addVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.addLogins(options)
    }
};

module.exports = { controllerMapping };