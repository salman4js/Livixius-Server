class CustomMiddleWares{
  
  static addParamsInBody(req,res,next){
    var id = req.params.id;
    var protocol = req.protocol;
    var host = req.get('host');
    var dynamicBaseUrl = `${protocol}://${host}`;
    // Add the params id in the request body!
    req.body.accId = id;
    req.body.baseUrl = dynamicBaseUrl;
    next();
  }
  
}

module.exports = {
  CustomMiddleWares
}