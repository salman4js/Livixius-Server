class ResponseHandler {
  // Send success response!
  static success(res, infoMessage, data) {
    res.status(200).json({
      success: true,
      infoMessage,
      data,
    });
  }

  // Send error response!
  static error(res) {
    res.status(500).json({
      success: false,
      message: "Internal error occured"
    });
  }
}

module.exports = ResponseHandler;
