// import agenda and mongoAuthStore modules
const Agenda = require('agenda');
const mongoAuthStore = require('./mongoAuthStore');

// connecting agenda with mongo db server
const mongoConfig = { "host": process.env.DB_IP, "port": process.env.DB_PORT, "database": process.env.DB_NAME, "username": mongoAuthStore.getMongoDBAuth().username, "password": mongoAuthStore.getMongoDBAuth().password };
const mongoConnectionString = `mongodb://${mongoConfig.username}:${encodeURIComponent(mongoConfig.password)}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}?authSource=admin`;

// instantiating the agenda object
const agenda = new Agenda({
    db: { address: mongoConnectionString, collection: 'agendaJobs' },
    useUnifiedTopology: true
});

module.exports = agenda;