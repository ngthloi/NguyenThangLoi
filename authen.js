var express = require('express');
const { model } = require('mongoose');
const { use } = require('.');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');
const { checkLogin, checkRole, checkRegister } = require('../middlewares/protect');

router.post('/register', validate.validator(),
  async function (req, res, next) {
    await checkRegister(req, res, next);

  });
router.post('/login', async function (req, res, next) {
  var result = await modelUser.login(req.body.userName, req.body.password);

  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  var token = result.getJWT();
  res.cookie('tokenJWT',token);
  responseData.responseReturn(res, 200, true, token);

});
router.get('/me', async function(req, res, next){
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  next();
},async function(req, res, next){
   await checkRole(req, res, next);
    
}, async function (req, res, next) { 
  var user = await modelUser.getOne(req.userID);
  res.send({ "done": user});
});

module.exports = router;