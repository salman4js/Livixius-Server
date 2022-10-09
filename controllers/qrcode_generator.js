const qrcode = require('qrcode');


const options = {
  errorCorrectionLevel : 'H',
  type : 'terminal',
  quality : 0.95,
  margin : 0,
  color : {
    dark : '#208698',
    light: '#FFF',
  },
}

const generator = (req,res,next) => {
  const option = JSON.stringify(req.body.room_spec_id);
  qrcode.toDataURL(option, {type : 'terminal'},
    function(err, qrcode){
      if(err){
        console.log(err);
        res.status(200).json({
          success : false,
          message : "Some internal error occured"
        })
      }
      res.status(200).json({
        success : true,
        message : qrcode
      })
    }
  )
}

module.exports = {
  generator
}

