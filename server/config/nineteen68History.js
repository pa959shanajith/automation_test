var cassandra = require('cassandra-driver');
const authProvider = new cassandra.auth.PlainTextAuthProvider('nineteen68', 'TA@SLK2017');
module.exports = new cassandra.Client({
    contactPoints: ['10.41.31.5'], 
    keyspace: 'nineteen68history',
    authProvider: authProvider
});
console.log('Keyspace nineteen68history will be enabled.');  