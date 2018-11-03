var passport = require('passport');
var User = require('../models/user');
var localStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'E-mail inválido').notEmpty().isEmail();
    req.checkBody('password', 'Insira uma senha').notEmpty();
    req.checkBody('nome', 'Insira um nome').notEmpty();
    req.checkBody('sobrenome', 'Insira um sobrenome').notEmpty();
    req.checkBody('password', 'Senha inválida').isLength({ min: 5 }).withMessage('Senha deve ter no mínimo 5 caracteres').equals(req.body.password_again).withMessage('Senhas não conferem');
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        verificar()
        return done(null, false, req.flash('error', messages));
    }
    function verificar(){
        req.flash('form', {
            email: req.body.email,
            nome: req.body.nome,
            sobrenome: req.body.sobrenome
        });
    }
    User.findOne({'email': email}, function(err, user){
        if(err) {
            verificar()
            return done(err);
        }
        if(user) {
            verificar()
            return done(null, false, {message: 'Email já está sendo usado!'});
        }
        var newUser = new User();
            newUser.email = email;
            newUser.nome = req.param('nome');
            newUser.sobrenome = req.param('sobrenome');
            newUser.password = newUser.encryptPassword(password);
            newUser.save(function(err, result){
                if(err) {
                    return done(err);
                }
                return done(null, newUser);
            });
    });
}));

passport.use('local.signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'E-mail inválido').notEmpty().isEmail();
    req.checkBody('password', 'Insira uma senha').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        verificar();
        return done(null, false, req.flash('error', messages));
    }

    function verificar(){
        req.flash('form', {
            email: req.body.email
        });
    }

    User.findOne({'email': email}, function(err, user){
        if(err) {
            return done(err);
        }
        if(!user) {
            verificar();
            return done(null, false, {message: 'Usuário não encontrado!'});
        }
        if(!user.validPassword(password)) {
            verificar();
            return done(null, false, {message: "Senha está errada!"});
        }
        return done(null, user);
    });
}));