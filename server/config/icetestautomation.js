var cassandra = require('cassandra-driver');
const authProvider = new cassandra.auth.PlainTextAuthProvider('nineteen68', 'TA@SLK2017');
module.exports = new cassandra.Client({
    contactPoints: ['10.44.10.55'], 
    keyspace: 'icetestautomation',
    authProvider: authProvider
});
console.log('Connected to cassandra with keyspace icetestautomation');  