class ResponseHandler {
  // Send success response!
  static success(res, infoMessage, data) {
    res.status(200).json({
      success: true,
      infoMessage,
      data
    });
  };

  // Send error response!
  static error(res) {
    res.status(500).json({
      success: false,
      message: "Internal error occured"
    });
  };
  
  // Get status code!
  prepareStatusCode(options){
    this.statusCode = options.status ? 200 : 500;
  };
  
  // Parser --> this method handles success and failure altogether!
  parser(res, options){
    this.prepareStatusCode(options);
    res.status(this.statusCode).json(options);
  };
};

module.exports = ResponseHandler;
