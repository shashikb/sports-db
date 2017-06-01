var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : 'cs290_bandas',
  password        : '7248',
  database        : 'cs290_bandas'
});

module.exports.pool = pool;
