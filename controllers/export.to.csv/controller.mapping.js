const userControllerImpl = require('../user.controller.implementation/user.controller.implementation');

var controllerMapping = {
    history: (opts) => userControllerImpl.getBookingHistory(opts)
};

module.exports = { controllerMapping }