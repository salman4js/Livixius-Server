
var validSelectors = ['Filter', 'Add', 'From', 'To']; // Valid selectors!

var firstSelectors = ['Filter', 'Add']; // First Selectors!

var filterSelectors = ['From', 'To']; // Filter selectors! 


// Parse the initial query!
function analyseQuery(value){
  
  // Declaring variables!
  var filterSelectors, action, attribute, retrieveValue, fromSelector, toSelector;
  
  var parsedQuery = value.query.match(/[^\s']+|'([^']+)'/g).map(each => each.replace(/'/g, ''));
  // Check if the parsed query has any advanced filter params,
  // If yes change the filtering method!
  // Check if the query has From and To selectors!
  filterSelectors = checkFilterSelectors(parsedQuery);
  action = analyseAction(parsedQuery[0]);
  attribute = parsedQuery[1];
  
  if(attribute === "All"){ // Return all the data from the table!
    return {action, attribute}
  }
  
  if(!filterSelectors){
    retrieveValue = parsedQuery[2];
    return {action, attribute, retrieveValue}
  } else {
    fromSelector = parsedQuery[2];
    toSelector = parsedQuery[4];
    return {action, attribute, fromSelector, toSelector}
  }
  
}

// Analyse the action based on the parsed query!
function analyseAction(parsedQuery){
  switch(parsedQuery.toUpperCase()){
    case "FILTER":
      return "Filter"
      break;
    case "ADD":
      return "Add";
      break;
    default:
      return "No valid query"
      break;
  }
}

// Check for advanced query selectors like 'from', 'to'.
function checkFilterSelectors(parsedQuery){
  var result = false;
  filterSelectors.map((options, key) => {
    if(parsedQuery.includes(options)){
      result = true;
    }
  })
  
  return result;
}


module.exports = {
  analyseQuery, analyseAction
}