const PaymentTracker = require("../../models/payment.tracker/payment.tracker");
const commonUtils = require("../../common.functions/common.functions");
const User = require("../../models/User");
const PreBookUser = require("../../models/PreBookUser");

async function getPaymentDetails(options) {

    // Model data for paymentTracker
    var modelData = {
        "paymentId" : '_id',
        "roomno" : 'roomno',
        'dateTime' : "dateTime",
        "amountFor": "amountFor",
        "amount": "amount",
    }

    // Model data for customer details for checkin property!
    var customerData = {
        "customername" : "username",
        "phonenumber" : "phonenumber"
    }

    // Model data for customer details for prebook property!
    var prebookCustomerData = {
        "customername" : "prebookUsername",
        "phonenumber": "prebookPhoneNumber"
    }

    // total amount handler!
    var totalAmount = 0;

    try {
        var promises = options.nodes.map(async (id) => {
            // Check to see if the selection are of the same customers, in prebook scenario!
            const paymentTracker = await PaymentTracker.findById({ _id: id });
            return paymentTracker;
        });
        const paymentTracker = await PaymentTracker.findById({_id: options.nodes[0]}); //  Since we are dealing with the same room
        // By payment id, we can able to get room id!
        // Get customer details for receipt generation!
        var filterQuery = {
            room: paymentTracker.room,
            _id: paymentTracker.userId,
            isPrebook: options.isPrebook
        }
        const customerDetails = await getCustomerDetails(filterQuery);
        const modelDataForCustomerDetails = options.isPrebook ? prebookCustomerData : customerData; // Send the modelData based on the state the user in!
        const customizedCustomerDetails = commonUtils.trimData(customerDetails, modelDataForCustomerDetails);

        var result = await Promise.all(promises);
        // Check for same selection!
        const checkSelections = await checkValidSelections(result);
        if(checkSelections){
            let trimmedData = commonUtils.trimData(result, modelData);

            // When the amount field is empty or not provided, set the field amount into zero value!
            trimmedData = commonUtils.transformNonValidValues(trimmedData, "0");

            // Generate total amount for the selected paymentTracker!
            trimmedData.map((options, index) => {
                totalAmount += Number(options.amount);
            })

            return {
                success: true,
                message: trimmedData,
                customerDetails: customizedCustomerDetails[0], // We always get one object
                // in the array as we can only able to checkin one customer at a time!
                // But in case of prebook receipt generation, we might get multiple objects!
                totalAmount: totalAmount,
                tableHeaders: ['Room No', 'Date & Time', "Amount For", 'Amount']
            }
        } else {
            return {
                success: false,
                message: "Multiple different users selections!"
            }
        }
    } catch (err) {
        console.log(err);
        return {
            success: false,
            message: "Some internal error occurred!"
        }
    }
};

// Get customer details from the userController!
async function getCustomerDetails(filterQuery){
    if(!filterQuery.isPrebook){
        const result = await User.find(filterQuery);
        return result;
    } else {
        const result = await PreBookUser.find(filterQuery);
        return result;
    }
};

// Check for same customer selections!
async function checkValidSelections(data){
    // Take first userId as the reference!
    const refUserId = data[0].userId;
    const areValidSelections = data.every(obj => obj.userId === refUserId);
    return areValidSelections;
};

module.exports = {
    getPaymentDetails
}