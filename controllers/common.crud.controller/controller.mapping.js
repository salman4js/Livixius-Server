const vouchersImpl = require('../voucherController/voucher.implementation');
const roomImpl = require('../room.controller.implementation/room.controller.implementation');
const multipleLoginImpl = require('../MultipleLoginController/multiple.login.implementation');

var controllerMapping = {
    DELETE: {
        voucherTracker: (options) => vouchersImpl.deleteVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.deleteLogins(options),
        roomAction: (options) => roomImpl._deleteRoomModel(options)
    },
    PUT: {
        voucherTracker: (options) => vouchersImpl.editVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.editLogins(options),
        roomAction: (options) => roomImpl._editRoomData(options)
    },
    POST: {
        voucherTracker: (options) => vouchersImpl.addVoucherModel(options),
        multipleLogin: (options) => multipleLoginImpl.addLogins(options)
    }
};

module.exports = { controllerMapping };