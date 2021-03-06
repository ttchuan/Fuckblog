var mongod = require('mongodb').Db;
var settings = require('../settings');
function Comment (name,day,title,comment) {
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
};
module.exports = Comment;
Comment.prototype.save = function(callback) {
	var name = this.name,
		day = this.day,
		title = this.title,
		comment = this.comment;
	console.log(title);
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.update({
				"name":name,
				"time.day":day,
				"title":title
			},{
				$push:{"comments":comment}
			},function (err) {
				console.log(1);
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
};