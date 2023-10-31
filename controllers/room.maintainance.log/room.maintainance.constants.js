var maintainanceLogConstants = Object.freeze({
  creation: Object.freeze({
    needRequiredFields: {
      status: false,
      message: 'All the fields are neccesary!'
    },
    creationSuccess: {
      status: true,
      message: 'New log entry created!'
    },
    creationFailure: {
      status: false,
      message: 'Some internal error occured.'
    }
  }),
  read: Object.freeze({
    success: {
      status: true
    },
    error: {
      status: false,
      message: 'Some internal error occured, while getting the data!'
    }
  })
});

module.exports = maintainanceLogConstants