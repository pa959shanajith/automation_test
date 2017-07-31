var options = require('./options');
var cassandra = require('cassandra-driver');
const authProvider = new cassandra.auth.PlainTextAuthProvider(options.storageConfig.username, options.storageConfig.password);
module.exports = new cassandra.Client({
    contactPoints: [options.storageConfig.host], 
    keyspace: 'nineteen68history',
    authProvider: authProvider
});
console.log('Keyspace nineteen68history will be enabled.');  

