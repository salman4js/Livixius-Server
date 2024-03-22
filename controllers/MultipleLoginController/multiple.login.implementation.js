const MultiLoginModel = require('../../models/MultipleLogins');

function getLogins(options){
    return new Promise((resolve, reject) => {
        MultiLoginModel.find({lodge: options.accId}).then(data => {
            resolve(data)
        }).catch((err) => {
           reject(err);
        });
    });
};

module.exports = {
  getLogins
}