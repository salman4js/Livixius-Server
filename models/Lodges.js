const mongoose = require("mongoose");

const lodgeSchema = new mongoose.Schema({
    username : String,
    password : String,
    emailId : String,
    area : String,
    branch : String,
    token : String,
    gstin: String,
    pan: String,
    name: String,
    number: String,
    isLocked: {type: Boolean, default: 'true'},
    rooms : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Rooms"
    }],
    services : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Services"
    }],
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Dishes"
    }],
    types : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "RoomType"
    }],
    dishtype : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "DishType"
    }],
    tMode : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "tMode"
    }],
    tVehicle : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "tVehicle"
    }],
    config : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Config"
    }],
    invoice: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice"
    }],
    vouchers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vouchers"
    }],
    multipleLogin: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "MultipleLogins"
    }],
    paymentTracker: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTracker"
    }],
    refundTrackers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefundTracker"
    }],
    roomStatus: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomStatus"
    }],
    preferenceCollections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PreferenceCollections'
    }],
    maintainanceLogType: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintainanceLogType'
    }],
    afterCheckedout: {type: String},
    inCleaning: {type: String},
    afterCleaned: {type: String},
    afterCheckin: {type: String},
    isRefundTrackerEnabled: {type: Boolean, default: false},
    refundPercentage: {type: Number, default: 10},
    invoiceCount: {type: Number, default: 0},
    isGst: {type: Boolean, default: false},
    isHourly: {type: Boolean, default: false},
    isChannel: {type: Boolean, default: false},
    updatePrice: {type: Boolean, default: false},
    isExtra: {type: Boolean, default: false},
    isExclusive: {type: Boolean, default: false},
    isInsights: {type: Boolean, default: false},
    isSpecific: {type: Boolean, default: false},
    canDelete: {type: Boolean, default: false},
    extraCalc: {type: Boolean, default: false},
    grcPreview: {type: Boolean, default: false},
    multipleLogins: {type: Boolean, default: false},
    redirectTo: {type: String, default: "livixius"},
    validateInvoiceDetails: {type: Boolean, default: true},
    printManager: {type: Boolean, default: false},
    removePan: {type: Boolean, default: false},
    restrictAdvance: {type: Boolean, default: false},
    checkinDateEditable: {type: Boolean, default: false},
    linkVouchersWithLivixius: {type: Boolean, default: false},
    showFullDetails: {type: Boolean, default: false},
    universalMessage: {
      show: {type: Boolean, default: false},
      message: String
    }
})

module.exports = mongoose.model("Lodges", lodgeSchema);
