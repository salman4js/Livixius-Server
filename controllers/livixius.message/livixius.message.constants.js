var LivixiusMessageConstants = Object.freeze({
    creation: Object.freeze({
        creationSuccess: {
            status: true,
            message: 'Message Received.',
            statusCode: 201
        },
        creationError: {
            status: false,
            message: 'Internal error occurred.',
            statusCode: 500
        },
        badRequest: {
            status: false,
            message: 'Input message not readable.',
            statusCode: 400
        }
    }),
    read: Object.freeze({
        readSuccess: {
            status: true,
            statusCode: 200
        },
        readError: {
            status: false,
            message: 'Cannot retrieve messages at this moment.',
            statusCode: 500
        }
    })
});

module.exports = LivixiusMessageConstants;