var cassandra = require('cassandra-driver');
const authProvider = new cassandra.auth.PlainTextAuthProvider('nineteen68', 'TA@SLK2017');
module.exports = new cassandra.Client({
    contactPoints: ['10.41.31.5'], 
    keyspace: 'icetestautomationhistory',
    authProvider: authProvider
});
console.log('Connected to cassandra with keyspace icetestautomationhistory');  