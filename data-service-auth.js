const express = require("express");
const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
   "userName":  {
      type: String,
      unique: true
   },
   "password": String,
   "email": String,
   "loginHistory": [{
     "dateTime": Date,
     "userAgent": String
   }],
   "isAdmin": Boolean
});
 
let User; // to be defined on new connection (see initialize)

module.exports = {
   initialize,
   registerUser,
   checkUser
}

function initialize () {
   return new Promise(function (resolve, reject) {
      let db = mongoose.createConnection("mongodb+srv://dbUser:kgcDAdrrzJDSEPDL@senecaweb.knip3qo.mongodb.net/?retryWrites=true&w=majority");

      db.on('error', (err)=>{
           reject(err); // reject the promise with the provided error
      });
      db.once('open', ()=>{
         User = db.model("users", userSchema);
         resolve();
      });
   });
};

function registerUser(userData){
   return new Promise(function (resolve, reject) {
      bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
         bcrypt.compare(userData.password2, hash).then((result) => {
            if(result){
            userData.password = hash;
            userData.isAdmin = (userData.isAdmin) ? true : false;
            let newUser = new User(userData);
            console.log("userData", userData.isAdmin);
            console.log("newUser", newUser.isAdmin);
            newUser.save()
               .then((data) => {
                  resolve(data);
               }).catch((err)=>{
                  if(err.code === 11000) reject("User Name already taken");
                  else console.log(err); reject("There was an error creating the user: " + err);
               });
            }else{
               reject("Passwords didn't match!")
            }
        });
      })
      .catch(err=>{
         // console.log(err);
         reject("There was an error encrypting the password")
      });
   });
}

function checkUser(userData){
   return new Promise(function(resolve, reject){
      User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
         if(users[0] == null){
            reject("Unable to find user: " + userData.userName);
         }
         bcrypt.compare(userData.password, users[0].password).then((result) => { //BCRYPT.COMPARE()
            if(result){
               try {
                  users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                  User.updateOne(
                     { userName: users[0].userName},
                     { $set: { loginHistory: users[0].loginHistory } }
                  ).exec();
               } catch (error) {
                  // console.log(error);
                  reject("There was an error verifying the user: " + error);
               }
               resolve(users[0]);
            } else {
               reject("Incorrect Password for user: " + userData.userName);
            }
         }).catch((err)=>{
            reject("Incorrect Password for user: " + userData.userName);
         });
      }).catch((err)=>{
         reject("Unable to find user: " + userData.userName);
      });
   });
}