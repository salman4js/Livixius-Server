class CustomMiddleWares{
  
  static addParamsInBody(req,res,next){
    var id = req.params.id;
    // Add the params id in the request body!
    req.body.accId = id;
    next();
  }
  
}

module.exports = {
  CustomMiddleWares
}