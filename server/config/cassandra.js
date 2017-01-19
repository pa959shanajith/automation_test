var cassandra = require('cassandra-driver');
const authProvider = new cassandra.auth.PlainTextAuthProvider('nineteen68', 'TA@SLK2017');
module.exports = new cassandra.Client({
    contactPoints: ['127.0.0.1'], 
    keyspace: 'nineteen68',
    authProvider: authProvider
});
console.log('Connected to cassandra');  
