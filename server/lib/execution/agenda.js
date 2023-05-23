// import agenda and mongoAuthStore modules
const Agenda = require('agenda');
const mongoAuthStore = require('./mongoAuthStore');

// connecting agenda with mongo db server
let mongoConfig = '';
let mongoConnectionString = '';

if (process.env.DB_NAME == "avoassure") {
    mongoConfig = { "host": process.env.DB_IP, "port": process.env.DB_PORT, "database": process.env.DB_NAME, "username": mongoAuthStore.getMongoDBAuth().usernameavoassure, "password": mongoAuthStore.getMongoDBAuth().passwordavoassure };
    mongoConnectionString = `mongodb://${mongoConfig.username}:${encodeURIComponent(mongoConfig.password)}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`;
}
else {
    mongoConfig = { "host": process.env.DB_IP, "port": process.env.DB_PORT, "database": process.env.DB_NAME, "username": mongoAuthStore.getMongoDBAuth().usernameadmin, "password": mongoAuthStore.getMongoDBAuth().passwordadmin };
    mongoConnectionString = `mongodb://${mongoConfig.username}:${encodeURIComponent(mongoConfig.password)}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}?authSource=admin`;
}

// instantiating the agenda object
const agenda = new Agenda({
    db: { address: mongoConnectionString, collection: 'agendaJobs' },
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = agenda;