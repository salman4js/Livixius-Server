const userControllerImpl = require('../user.controller.implementation/user.controller.implementation');
const maintainanceLogImpl = require('../room.maintainance.log/room.maintainance.implementation');
const paymentTrackerImpl = require('../payment.tracker/payment.tracker.implementation');

var controllerMapping = {
    history: (opts) => userControllerImpl.getBookingHistory(opts),
    logTable: (opts) => maintainanceLogImpl.getSelectedNodeEntries(opts),
    paymentTrackerView: (opts) => paymentTrackerImpl.getPaymentDetails(opts)
};

module.exports = { controllerMapping }