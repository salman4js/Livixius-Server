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
    },
    customReport: {
        generation: {
            mandatoryValues: ['selectedNodes', 'accId']
        }
    }
});

module.exports = CustomConfigBaseConstants;