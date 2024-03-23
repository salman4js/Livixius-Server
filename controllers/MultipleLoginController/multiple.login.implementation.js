const mongoose = require('mongoose');
const MultiLoginModel = require('../../models/MultipleLogins');
const Lodge = require('../../models/Lodges');

function getLogins(options){
    return new Promise((resolve, reject) => {
        MultiLoginModel.find({lodge: options.accId}).then(data => {
            resolve(data)
        }).catch((err) => {
           reject(err);
        });
    });
};

function addLogins(options){
  return new Promise((resolve, reject) => {
      options['lodge'] = options.accId;
      const multipleLogin = new MultiLoginModel(options);
      if(multipleLogin){
          Lodge.findByIdAndUpdate({_id: options.accId}, {$push: {multipleLogin: multipleLogin._id}}).then(() => {
             multipleLogin.save().then(() => {
                 resolve(multipleLogin);
             }).catch((err) => {
                 reject(err);
             })
          }).catch((err) => {
              reject(err);
          });
      };
  });
};

function editLogins(options){
    return new Promise((resolve, reject) => {
        MultiLoginModel.findByIdAndUpdate(options.selectedNodes, {
           username: options.username,
           password: options.password,
           loginAs: options.loginAs
        }, {new: true}).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        })
    });
};

async function deleteLogins(options) {
    return new Promise((resolve, reject) => {
        const loginIdsArray = JSON.parse(options.selectedNodes).map(id => mongoose.Types.ObjectId(id));
        Lodge.updateMany(
            {_id: options.accId},
            {$pullAll: {multipleLogin: loginIdsArray}}
        ).then(() => {
            MultiLoginModel.deleteMany({_id: {$in: loginIdsArray}}).then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        }).catch(() => {
            reject();
        });
    });
};

module.exports = {
  getLogins, addLogins, editLogins, deleteLogins
}