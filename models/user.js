var crypto = require('crypto')
var mongod = require('./db');
function User (user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

User.prototype.save = function(callback) {
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "http://cdn.v2ex.com/gravatar/"+email_MD5+"?s=48";
	var user = {
		name:this.name,
		password:this.password,
		email:this.email,
		head:head
	}
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('users',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.insert(user,{
				safe:true
			},function (err,user) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,user[0]);
			});
		});
	});
};

User.get = function (name,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('users',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.findOne({
				name:name
			},function (err,user) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,user);
			});
		});
	});
};

