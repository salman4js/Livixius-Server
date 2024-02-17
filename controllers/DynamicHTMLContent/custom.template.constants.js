var CustomTemplateConstants = Object.freeze({
    creation: Object.freeze({
        creationSuccess: {
            status: true,
            message: 'Custom Template HTML has been added to the server',
            statusCode: 201
        },
        creationError: {
            status: false,
            message: 'Internal error occurred',
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
            message: 'Cannot retrieve template',
            statusCode: 500
        }
    }),
    deletion: Object.freeze({
        deleteSuccess: {
            status: true,
            message: 'Custom template has been deleted',
            statusCode: 200
        },
        deleteError: {
            status: false,
            message: "Internal error occurred",
            statusCode: 500
        }
    }),
    update: Object.freeze({
        updateSuccess: {
            status: true,
            message: 'Custom template has been updated!',
            statusCode: 200
        }
    })
});

module.exports = CustomTemplateConstants;