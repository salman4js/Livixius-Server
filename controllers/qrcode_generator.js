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

const generator = async (req,res,next) => {
  // With image qr code
  const option = JSON.stringify(`https://brew-classic.vercel.app/${req.body.room_spec_id}/static`);
  const optionWithoutQuotes = option.replace(/['"]/g, '');
  qrcode.toDataURL(optionWithoutQuotes, {type : 'terminal'},
    function(err, qrcode){
      if(err){
        console.log(err);
        res.status(200).json({
          success : false,
          message : "Some internal error occured"
        })
      }
      // Change the message params based on the qr code needed!
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

