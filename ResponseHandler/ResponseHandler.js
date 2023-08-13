class ResponseHandler {
  static success(res, data, infoMessage) {
    res.status(200).json({
      success: true,
      infoMessage,
      data,
    });
  }

  static error(res) {
    res.status(500).json({
      success: false,
      message: "Internal error occured"
    });
  }
}

module.exports = ResponseHandler;
