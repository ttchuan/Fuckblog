var mongod = require('./db');
var markdown = require('markdown').markdown;
function Post (name,head,title,tags,post) {
	this.name = name;
	this.title = title;
	this.tags = tags;
	this.post = post;
	this.head =head;
};
module.exports = Post;
Post.prototype.save = function(callback) {
	var date = new Date();
	var time = {
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	var post = {
		name:this.name,
		head:this.head,
		time:time,
		title:this.title,
		tags:this.tags,
		post:this.post,
		comments:[],
		pv:0
	}
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.insert(post,{
				safe:true
			},function (err,user) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
};

Post.getTen = function (name,page,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			var query = {};
			if (name) {
				query.name = name;
			};
			collection.count(query,function (err,total) {
				collection.find(query,{
					skip:(page -1) * 10,
					limit:10
				}).sort({
					time:-1
				}).toArray(function (err,docs) {
					mongod.close();
					if (err) {
						return callback(err);
					};
					docs.forEach(function (doc) {
						doc.post = markdown.toHTML(doc.post);
					})
					callback(null,docs,total);
				});
			});
		});
	});
};
Post.getOne = function (name,day,title,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.findOne({
				"name":name,
				"time.day":day,
				"title":title,
			},function (err,doc) {
				if (err) {
					mongod.close();
					return callback(err);
				};
				if (doc) {
					collection.update({
						"name":name,
						"time.day":day,
						"title":title
					},{
						$inc:{"pv":1}
					},function (err) {
						mongod.close();
						if (err) {
							return callback(err);
						};
					});
					doc.post = markdown.toHTML(doc.post);
					doc.comments.forEach(function (comment) {
						comment.content = markdown.toHTML(comment.content);
					});
				};
				callback(null,doc);
			});
		});
	});
};
Post.edit = function (name,day,title,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.findOne({
				"name":name,
				"time.day":day,
				"title":title,
			},function (err,doc) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,doc);
			});
		});
	});
};
Post.update = function (name,day,title,post,callback) {
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
				"title":title,
			},{
				$set:{post:post}
			},function (err) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
};
Post.remove = function (name,day,title,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.remove({
				"name":name,
				"time.day":day,
				"title":title,
			},{
				w:1
			},function (err) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
};
Post.getArchive = function (callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.find({},{
					"name":1,
					"time":1,
					"title":1
			}).sort({
				time:-1
			}).toArray(function (err,docs) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,docs);
			});
		});
	});
};
Post.getTags = function (callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.distinct("tags",function (err,docs) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,docs);
			});
		});
	});
};
Post.getTag = function (tag,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			collection.find({
				"tags":tag
			},{
					"name":1,
					"time":1,
					"title":1
			}).sort({
				time:-1
			}).toArray(function (err,docs) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,docs);
			});
		});
	});
};
Post.search = function (keyword,callback) {
	mongod.open(function (err,db) {
		if (err) {
			return callback(err);
		};
		db.collection('posts',function (err,collection) {
			if (err) {
				mongod.close();
				return callback(err);
			};
			var pattern = new RegExp(keyword,"i");
			collection.find({
				"title":pattern
			},{
					"name":1,
					"time":1,
					"title":1
			}).sort({
				time:-1
			}).toArray(function (err,docs) {
				mongod.close();
				if (err) {
					return callback(err);
				};
				callback(null,docs);
			});
		});
	});
};