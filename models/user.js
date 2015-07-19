var mongod = require('./db');

function User (user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

User.prototype.save = function(callback) {
	var user = {
		name:this.name,
		password:this.password,
		email:this.email
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

