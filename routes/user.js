var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var csrfProtection = csrf();
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var User = require('../models/user');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');

//var Product = require('../models/product');

router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('user/profile', {user:req.user});
});

router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  req.flash('info', 'Logout efetuado com sucesso!');
  res.redirect('/signin');
});

router.use('/singin', notLoggedIn, function(req, res, next){
  next();
})

router.get('/signup', function(req, res, next) {
    var form = {},
    formFlash = req.flash('form');
    if (formFlash.length) {
      form.email = formFlash[0].email,
      form.nome = formFlash[0].nome,
      form.sobrenome = formFlash[0].sobrenome
    }
    var messages = req.flash('error');
    res.render('user/signup', {title: 'Login', csrfToken: req.csrfToken(), form:form, messages: messages, hasErrors: messages.length > 0});
});
  
router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    badRequestMessage: 'Insira um e-mail e senha válidos!',
    failureFlash: true
}));

  
router.get('/signin', function(req, res, next) {
    var form = {},
    formFlash = req.flash('form');
    if (formFlash.length) {
      form.email = formFlash[0].email;
    }
    
    var messages2 = req.flash('error');
    res.render('user/signin', {title: 'Entrar', csrfToken: req.csrfToken(), form: form, messages2: messages2, hasErrors: messages2.length > 0});
});
  
router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    badRequestMessage: 'Insira um e-mail e senha válidos!',
    failureFlash: true
}));
  
router.get('/forgot', function(req, res) {
    res.render('user/forgot', { csrfToken: req.csrfToken()});
});
  
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        if(!req.body.email) {
          req.flash('error', 'Insira um e-mail válido');
          return res.redirect('/forgot');
        }
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'Não há nenhum usuário com esse e-mail');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        let smtpTransport = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: 'apikey', // generated ethereal user
              pass: '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' // generated ethereal password
          },
          /*tls: {
            rejectUnauthorized: false
          }*/
      });
  
        var saida = `
          <p> Você recebeu esse e-mail para redefinir sua senha do Moom Notes. Clique no link abaixo para concluir a redefinição.</p>
          <h3>http://${req.headers.host}/reset/${token}</h3>
          <a href="http://${req.headers.host}/reset/${token}">Redefinir senha</a>
          <a class="btn btn-primary" href='http://${req.headers.host}/reset/${token}'>Redefinir senha</a>
        `;
        var mailOptions = {
          to: user.email,
          from: '"Redefinir senha 👻" <contato@moom.com>',
          subject: 'E-mail para redefinir sua senha!',
          html: saida
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('info', 'Confira sua caixa de entrada no e-mail: ' + user.email + '.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
        req.flash('error', 'Token para redefinição de senha está expirado ou inválido.');
        return res.redirect('/forgot');
    }
    res.render('user/reset', {user: req.user, csrfToken: req.csrfToken(), resetPasswordToken: req.params.token});
    });
});
  
  router.post('/reset/:token', function(req, res) {
    if(!req.body.password) {
      req.flash('error', 'Insira uma senha válida!');
      return res.redirect('back');
    }
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Token para redefinição de senha está expirado ou inválido.');
            return res.redirect('/reset');
          }
          user.password = bcrypt.hashSync(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
  
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        let smtpTransport = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: 'apikey', // generated ethereal user
              pass: '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' // generated ethereal password
          },
          tls: {
            rejectUnauthorized: false
          }
      });
  
        var saida = `
          <p>Sua senha foi alterada.</p>
        `;
        var mailOptions = {
          to: user.email,
          from: '"Senha alterada 👻" <contato@moom.com>',
          subject: 'Sua senha já foi alterada!',
          html: saida
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('info', 'Senha alterada com sucesso!');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
        res.redirect('/signin');
    });
  });
  
module.exports = router;

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'Página apenas para assinantes!');
    res.redirect('/signin');
}