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

  // Bad Request
  static badRequest(res){
    res.status(400).json({
      success: false,
      message: 'Input message is not readable!'
    });
  };
  
  // Get status code!
  prepareStatusCode(options){
    this.statusCode = options.status ? 200 : 500;
    if(options.statusCode){
      this.statusCode = options.statusCode;
    }
  };

  // Handle creation of responseJSON!
  // This method adds data into the responseTxt.
  prepareResponseJSON(options, res){
    if(options?.constants?.status && options.name){
      options[options.name] = options.result;
      options.status = options.constants.status;
      options.statusCode = options.constants.statusCode;
      delete options.constants;
      delete options.name;
      delete options.result;
    }
    this.parser(res, options);
  };
  
  // Parser --> this method handles success and failure altogether!
  parser(res, options){
    this.prepareStatusCode(options);
    res.status(this.statusCode).json(options);
  };
};

module.exports = ResponseHandler;
