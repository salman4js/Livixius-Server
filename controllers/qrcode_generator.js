const qrcode = require('qrcode');
const { createCanvas, loadImage } = require("canvas");
const fs = require('fs');
const path = require("path");


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

// Image convertor.
function base64_encode() {
  const file = path.join(__dirname, './Brew_LodZee.jpeg')
  return "data:image/gif;base64,"+fs.readFileSync(file, 'base64')
}

const generator = async (req,res,next) => {
  // With image qr code
  var image_qr = await canvas_generator();
  const option = JSON.stringify(`https://brew-classic.vercel.app/${req.body.room_spec_id}/static`);
  const withoutQuotes = option.replace(/['"]/g, '');
  // Non-Image QR code
  qrcode.toDataURL(withoutQuotes, {type : 'terminal'},
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

async function create(dataForQRcode, center_image, width, cwidth) {
  const canvas = createCanvas(width, width);
  qrcode.toCanvas(
    canvas,
    dataForQRcode,
    {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }
  );

  const ctx = canvas.getContext("2d");
  const img = await loadImage(center_image);
  const center = (width - cwidth) / 2;
  ctx.drawImage(img, center, center, cwidth, cwidth);
  return canvas.toDataURL("image/png");
}

const canvas_generator = () => {
  const convertedImage = base64_encode();
  const image_qr = create(
    "https://google.com",
    convertedImage,
    125,
    50
  );
  return image_qr;
}

module.exports = {
  generator, canvas_generator
}

