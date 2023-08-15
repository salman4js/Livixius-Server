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
]

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
      
  const value = result.slice(checkin, checkout + 1);

  return value;  
}

// trim data as per the need!
function trimData(data, modelData, inArray){
    var actualData = [];
    var values = Object.keys(modelData)
   
    data.map((options, index) => {
        var result = {}; // Move the declaration inside the loop
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
  var result = 0;
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

// Check if the data is valid or not
// Not undefined, Not null, Not empty and any other additional checks!
function checkIfValid(data, additionalCheck){
  if(data !== undefined && data !== null && data !== '' && 
  data !== additionalCheck && data !== 'function String() { [native code] }'){ // Will also mongodb schema instance!
    return true;
  } else {
    return false;
  }
};

// Get room status constant line up!
function getRoomStatusConstants(){
  // Default room status order!
  var roomStatusOrder = ['afterCheckedout', 'inCleaning', 'afterCleaned', 'afterCheckin'];
  return roomStatusOrder;
};

// Get gst percent!
function getGSTPercent(amount){
  return amount > 7500 ? 0.18 : 0.12;
}

// Get taxable amount for each payments!
function getTaxableAmount(amount){
  var gstPercent = getGSTPercent(amount);
  var amountWithoutGST = amount / (1 + gstPercent);
  var taxableAmount = amount - amountWithoutGST;
  return taxableAmount;
}

module.exports = {
  getTimeBetweenWithDate, trimData, addModelDataAttribute, transformNonValidValues,
  checkIfValid, getRoomStatusConstants, getTaxableAmount
}