var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var app = express();
var port = normalizePort(process.env.PORT || '3000');
var debug = require('debug')('blog:server');
var http = require('http');
var server = http.createServer(app);
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:settings.cookieSecret,
  key:settings.db,
  cookie:{maxAge: 1000*60*60*24*30},
  resave:true,
  saveUninitialized:true,
  store:new MongoStore({
    db:settings.db,
    host:settings.host,
    port:settings.port
  })
}));
routes(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
module.exports = app;
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}