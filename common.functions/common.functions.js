const brewDate = require('brew-date');

var time = [
  '12:00 AM', '12:30 AM', '01:00 AM',  '01:30 AM',
  '02:00 AM',  '02:30 AM',  '03:00 AM',  '03:30 AM',
  '04:00 AM',  '04:30 AM',  '05:00 AM',  '05:30 AM',
  '06:00 AM',  '06:30 AM',  '07:00 AM',  '07:30 AM',
  '08:00 AM',  '08:30 AM',  '09:00 AM',  '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM',  '01:30 PM',
  '02:00 PM',  '02:30 PM',  '03:00 PM',  '03:30 PM',
  '04:00 PM',  '04:30 PM',  '05:00 PM',  '05:30 PM',
  '06:00 PM',  '06:30 PM',  '07:00 PM',  '07:30 PM',
  '08:00 PM',  '08:30 PM',  '09:00 PM',  '09:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];

// Get time between dates!
function getTimeBetweenWithDate(date, dateTime){
      
  var result = [];
  
  date.forEach((d, index) => {
    time.forEach((time, ind) => {
      result.push(d + " " + time); // Date time for every time value!
    })
  })
    
  const checkin = result.indexOf(dateTime[0]);
  const checkout = result.indexOf(dateTime[1]);

  return result.slice(checkin, checkout + 1);
}

// trim data as per the need!
function trimData(data, modelData, inArray){
    var actualData = [];
    var values = Object.keys(modelData)
   
    data.map((options, index) => {
        var result = {};
        values.forEach((op) => {
            const id = modelData[op];
            result[op] = options[id];
          })
          actualData.push(result);
    });
    
   return actualData;
}

// Add model data attribute!
function addModelDataAttribute(modelData, attribute){ // here attribute means the attribute to get added!
  let result = 0;
  modelData.map((options) => {
    result += Number(options[attribute]);
  })
  
  return result;
}

// Function to verify that the value is a valid one!
// Not undefined, Not null, not empty!
// If it is invalid, it will change that into the passed arguments and return it!
function transformNonValidValues(data, transformInto){
  data.map((obj, key) => {
    for (let key in obj){
      if(obj.hasOwnProperty(key)){
        if(obj[key] === undefined || obj[key] === null || obj[key] === ''){
          obj[key] = transformInto
        }
      }
    }
  })
  return data;
}

// This method will verify the mandatory fields provided.
  /**
    @params fields Object
    @params mandatoryFields Array
  **/
function verifyMandatoryFields(fields, mandatoryFields){
  for(let i = 0; i <= mandatoryFields.length - 1; i++){
    if(!fields.includes(mandatoryFields[i])){
      return false;
    }
  }
  return true;
};

// Check if the data is valid or not,
// Not undefined, Not null, Not empty and any other additional checks!
function checkIfValid(data, additionalCheck){
  if(data !== undefined && data !== null && data !== '' && 
  data !== additionalCheck && data !== 'function String() { [native code] }'){ // Will also check mongodb schema instance!
    return true;
  } else {
    return false;
  }
};

// Get gst percent!
function getGSTPercent(amount){
  return amount > 7500 ? 0.18 : 0.12;
}

// Get taxable amount for each payment!
function getTaxableAmount(amountPaid, pricePerDay){
  var gstPercent = getGSTPercent(pricePerDay);
  var amountWithoutGST = amountPaid / (1 + gstPercent);
  return amountPaid - amountWithoutGST;
};

// Convert date into server readable format, In which the date has been stored in the database format.
function convertServerFormat(date){
  try{
    const result = date.split("/");
    return `${result[2]}/${result[1]}/${result[0]}`
  } catch(err){
    return date;
  }
}

// Convert date object into readable date format!
function formatCustomDateIntoDateFormat(dateString){
  return convertServerFormat(brewDate.formatCustomDateToDateFormat(dateString));
}

// Convert date into custom format!
function convertDateIntoCustomFormat(dateString, format, options){
  return brewDate.convertDateInto(dateString, format, options)
}

module.exports = {
  getTimeBetweenWithDate, trimData, addModelDataAttribute, transformNonValidValues,
  checkIfValid, getTaxableAmount, convertDateIntoCustomFormat,
  verifyMandatoryFields, formatCustomDateIntoDateFormat
}