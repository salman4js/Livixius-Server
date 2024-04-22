class CustomMiddleWares{
  
  static addParamsInBody(req,res,next){
    const id = req.params.id;
    const protocol = req.protocol;
    const host = req.get('host');
    const dynamicBaseUrl = `${protocol}://${host}`;
    // Add the params id in the request body!
    req.body.accId = id;
    req.body.baseUrl = dynamicBaseUrl;
    next();
  }
  
}

module.exports = {
  CustomMiddleWares
}