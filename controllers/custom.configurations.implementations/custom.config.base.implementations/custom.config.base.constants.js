const CustomConfigBaseConstants = Object.freeze({
    customConfigCalc: {
        creation: {
            mandatoryValues: ['configName', 'accId'],
            allowedValues: ['totalAmount', 'extraBedPrice', 'discount', 'advance']
        }
    },
    customConfigReport: {
        creation: {
            mandatoryValues: ['configName', 'accId']
        }
    }
});

module.exports = CustomConfigBaseConstants;