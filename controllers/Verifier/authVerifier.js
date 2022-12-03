const authVerify = (authToken) => {
  const auth = authToken
  Lodge.find({token : auth})
  .then(resp => {
    return true;
  })
  .catch(err => {
    console.log("Lodge Auth Error", err);
    return false;
  })
}

module.export = {
  authVerify
}
