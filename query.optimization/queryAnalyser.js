
// Parse the initial query!
function analyseQuery(value){
  var parsedQuery = value.query.match(/[^\s']+|'([^']+)'/g).map(each => each.replace(/'/g, ''));
  console.log("Parsed Query", parsedQuery)
  const action = analyseAction(parsedQuery[0]);
  const attribute = parsedQuery[1];
  const retrieveValue = parsedQuery[2];
  return {action, attribute, retrieveValue}
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


module.exports = {
  analyseQuery, analyseAction
}