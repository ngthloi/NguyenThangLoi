var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');
var modelUser = require('../models/user')
const { validationResult } = require('express-validator');
var responseData = require('../helper/responseData');

module.exports = {
    checkLogin:
        async function (req) {
            var result = {}
            var token = req.headers.authorization;
            if (!token) {
                return result.err = "Vui long dang nhap";
            }
            if (token.startsWith("Bearer")) {
                token = token.split(" ")[1];
                try {
                    var userID = await jwt.verify(token, configs.SECRET_KEY);
                    return userID.id;
                } catch (error) {
                    return result.err = "Vui long dang nhap";
                }
            } else {
                return result.err = "Vui long dang nhap";
            }
        },

    checkRole:
    async function (req, res, next) {
        var user = await modelUser.getOne(req.userID);
        var role = user.role;
        console.log(role);
        var DSRole = ['admin','publisher'];
        if(DSRole.includes(role)){
          next();
        }
        else{
          responseData.responseReturn(res, 403, true,"ban khong du quyen");
        }
    },
    checkRegister:
    async function (req, res, next) {
        var errors = validationResult(req);
        if (!errors.isEmpty()) {
          responseData.responseReturn(res, 400, false, errors.array().map(error => error.msg));
          return;
        }
        var user = await modelUser.getByName(req.body.userName);
        if (user) {
          responseData.responseReturn(res, 404, false, "user da ton tai");
        } else {
          const newUser = await modelUser.createUser({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            role:req.body.role
          })
          responseData.responseReturn(res, 200, true, newUser);
        }
      },
    
}