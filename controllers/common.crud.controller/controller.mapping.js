const VouchersImpl = require('../voucherController/voucher.implementation');
const RoomImpl = require('../room.controller.implementation/room.controller.implementation');
const MultipleLoginImpl = require('../MultipleLoginController/multiple.login.implementation');
const CustomConfigCalcImpl = require('../custom.configurations.implementations/custom.config.calc.implementations');

var controllerMapping = {
    DELETE: {
        voucherTracker: (options) => VouchersImpl.deleteVoucherModel(options),
        multipleLogin: (options) => MultipleLoginImpl.deleteLogins(options),
        roomAction: (options) => RoomImpl._deleteRoomModel(options),
        customConfigCalc: (options) => new CustomConfigCalcImpl(options).deleteCustomConfig()
    },
    PATCH: {
        voucherTracker: (options) => VouchersImpl.editVoucherModel(options),
        multipleLogin: (options) => MultipleLoginImpl.editLogins(options),
        roomAction: (options) => RoomImpl._editRoomData(options),
        roomTypeAction: (options) => RoomImpl._editRoomTypeModel(options),
        customConfigCalc: (options) => new CustomConfigCalcImpl(options).editCustomConfig()
    },
    POST: {
        voucherTracker: (options) => VouchersImpl.addVoucherModel(options),
        multipleLogin: (options) => MultipleLoginImpl.addLogins(options),
        roomAction: (options) => RoomImpl._createRoomModel(options),
        roomTypeAction: (options) => RoomImpl._createRoomTypeModel(options),
        customConfigCalc: (options) => new CustomConfigCalcImpl(options).addNewCustomFormula()
    },
    GET: {
        customConfigCalc: (options) => new CustomConfigCalcImpl(options).getCustomConfig()
    }
};

module.exports = { controllerMapping };