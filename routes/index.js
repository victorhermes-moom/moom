var express = require('express');
var router = express.Router();
const Request = require('request');
//var csrf = require('csurf');
//var passport = require('passport');
//var nodemailer = require('nodemailer');
//var crypto = require('crypto');
//var User = require('../models/user');
//var async = require('async');
//var bcrypt = require('bcrypt-nodejs');
//var csrfProtection = csrf();
//router.use(csrfProtection);

var Product = require('../models/product');

router.get('/', function(req, res, next) {
  Product.find(function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for(var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, user:req.user });
  });
});

router.get('/a', function(req, res, next) {
  Request.get("http://moom-nontes-2.herokuapp.com/notas", (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      var data = JSON.parse(body);
      console.log(data);
      res.render('shop/index2', {data:data});
  });
});


module.exports = router;