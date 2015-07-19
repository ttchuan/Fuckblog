var crypto = require('crypto'),
	User = require('../models/user');
module.exports = function (app) {
	app.get('/',function (req,res) {
		res.render('index',{
			title: '主页',
			user: req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.get('/index',function (req,res) {
		res.render('index',{
			title: '主页',
			user: req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.get('/login',function (req,res) {
		res.render('login',{
			title: '登录',
			user: req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		})
	});
	app.post('/login',function (req,res) {
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		User.get(req.body.name,function (err,user) {
			if (!user) {
				req.flash('error',"用户不存在");
				return res.redirect('/login');
			};
			if (user.password != password) {
				req.flash('error','密码错误');
				console.log('密码错误');
				return res.redirect('/login');
			};
			req.session.user = user;
			req.flash('success','登录成功');
			console.log('登录成功');
			res.redirect('/index');
		});
	});
	app.get('/postArticle',function (req,res) {
		res.render('post',{title: '发表文章'})
	});
	app.post('/postArticle',function (req,res) {
	});
	app.get('/reg',function (req,res) {
		res.render('reg',{
			title: '注册',
			user: req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		})
	});
	app.post('/reg',function (req,res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body.passwordRepeat;
		if (password_re != password) {
			req.flash('error','两次输入的密码不一致！');
			console.log('两次输入的密码不一致！');
			return res.redirect('./reg');
		};
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name:req.body.name,
			password:password,
			email:req.body.email
		});
		User.get(newUser.name,function (err,user) {
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			};
			if (user) {
				req.flash('error','用户名已存在！');
				console.log('用户名已存在！');
				return res.redirect('/reg');
			};
			newUser.save(function (err,user) {
				if (err) {
					req.flash('error',err);
					console.log('save报错');
					return res.redirect('/reg');
				};
				req.session.user = user;
				req.flash('success','注册成功');
				console.log('注册成功');
				res.redirect('/index');
			});
		});
	});
	app.get('/logout',function (req,res) {
		req.session.user = null;
		req.flash('success','注销成功');
		console.log('注销成功');
		res.redirect('/index');
	});
};
