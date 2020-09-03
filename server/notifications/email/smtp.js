const nodemailer = require('nodemailer');
const clone = require('clone');
const exphbs = require('express-handlebars');
const hbs = require("nodemailer-express-handlebars");
const path = require('path');
const auth = require('basic-auth');
const when = require('when');

let log;
let transporter;
let emailFrom;
let crypt;
let companyLogo;
let productLogo;

module.exports = {
    name: "smtp",

    /**
     * Initialize smtp email provider
     * @param {Object} _log - logger module
     * @param {Object} _crypt - encryption module
     */
    init: function (_log, _crypt, _settings) {
        log = _log;
        crypt = _crypt;
        companyLogo = _settings.listenPath + '/red/images/slk.ico';
        productLogo = _settings.listenPath + '/red/images/RAID-256.png';
    },

    /**
     * load config for smtp module
     * @param {Object} cnfg - nodemailer config 
     */
    loadConfig: function (cnfg) {
        /*
        * Assumptions:
        * 1. when cnfg passed to this function all fields were already
        *    validated in api module, 
        * 2. Password stored for 'password user type' is in encrypted format
        */
        let smtpConfig = {
            host: cnfg.host,
            port: +cnfg.port || 25
        };


        /** Security Configuration
         * Require TLS  : Mandatory TLS Connection
         * ignore TLS   : If Server expects TLS only then SMTP client will not
         *              make connection to it.
         * secure       : If true starts connection with TLS, otherwise starts connection with
         *              plaintext and upgrades to TLS when server request for STARTTLS, STARTTLS by
         *              default is prone to MTM(man in the middle) attack. mostly true for port 465
         *              and false for port 587, 25
         */
        if (cnfg.security) {
            if (cnfg.security === 'auto') {
                smtpConfig.secure = (smtpConfig.port === 465);
            } else if (cnfg.security === 'ignoreTLS') {
                smtpConfig.secure = false;
                smtpConfig.ignoreTLS = true;
            } else if (cnfg.security === 'requireTLS') {
                smtpConfig.secure = false;
                smtpConfig.requireTLS = true;
            }
        }
        if (cnfg.certValidation === false) {
            smtpConfig.tls = {
                //Allow Invalid Certificates
                rejectUnauthorized: false
            }
        }

        // smtpConfig['logger'] = true;
        // smtpConfig['debug'] = true;

        /** Pool Configuration*/
        if (cnfg.pool) {
            smtpConfig.pool = true;
            /** For Default values we do not need maxConnections, maxMessages,
             * in such a case, pool will be true, otherwise an object with values
             */
            if (typeof (cnfg.pool) === 'object') {
                if (cnfg.pool.maxConnections) {
                    /**By default 5 max connections are used*/
                    smtpConfig.maxConnections = +cnfg.pool.maxConnections;
                }
                if (cnfg.pool.maxMessages) {
                    /**By default max 100 messages can be sent using a single connection  */
                    smtpConfig.maxMessages = +cnfg.pool.maxConnections;
                }
            }
        }


        /**Connection Configuration */
        if (cnfg.connectionTimeout) {
            /**Milliseconds to wait for connection to establish. Default value is 2 min */
            smtpConfig.connectionTimeout = +cnfg.connectionTimeout;
        }
        if (cnfg.greetingTimeout) {
            /** Milliseconds to wait for greeting command(HELO, EHLO),
             *  after connection is establised, Defaults to 30 seconds */
            smtpConfig.greetingTimeout = +cnfg.greetingTimeout;
        }
        if (cnfg.socketTimeout) {
            /** Milliseconds of inactivity allowed, Defaults to 10 minutes*/
            smtpConfig.smtpConfig = +cnfg.smtpConfig;
        }


        /**Authentication Configuration */
        if (cnfg.auth && cnfg.auth.hasOwnProperty('type')) {
            if (cnfg.auth.type === 'basic') {
                //Default authType is 'login' for NodeMailer. Thus, no need to pass type explicitly
                smtpConfig.auth = {
                    user: cnfg.auth.username,
                    pass: crypt.decrypt(cnfg.auth.password)
                };
            } else if (auth.type === 'oauth2') {
                //for auth type as OAuth2
                //TODO - add support for OAuth2
            }
        }
        cnfg.displayName = cnfg.displayName ? cnfg.displayName : "RAID Alerts"
        cnfg.fromAddress = cnfg.fromAddress ? cnfg.fromAddress : "raid-alerts@slkgroup.com"
        emailFrom = cnfg.displayName + " <" + cnfg.fromAddress + ">";

        this.destroy();
        transporter = nodemailer.createTransport(smtpConfig);
        let layoutsPath = path.join(__dirname, '../views/email/layouts/');
        let partialsPath = path.join(__dirname, '../views/email/partials/');
        transporter.use('compile', hbs({
            viewEngine: exphbs.create({
                defaultLayout: 'main',
                extname: ".hbs",
                layoutsDir: layoutsPath,
                partialsDir: [partialsPath]
            }), //Using Express-handlebar as the view engine
            viewPath: layoutsPath, //Location of handlebar templates
            extName: '.hbs' //Handlebar extension
        }));
    },

    /**
     * send email through configured smtp transporter
     * @param {Object} msg - message object
     * @param {Array} rcvrs - Receivers list 
     */
    send: function (msg, rcvrs) {
        /*
        * Sending email addresses in 'To' field as sending in bcc needs TO field to be there
        * and there is a possibility that when mail with lot many recepients in 
        * BCC can be marked spam by mail filters. Also it increases the dependency on TO field.
        * */
        if (transporter) {
            rcvrs.forEach((rcvr) => {
                //Cloning so while calling sendMail, it does not refer to the same msg object
                let rcvrMsg = clone(msg);
                rcvrMsg.to = rcvr;
                if(!rcvrMsg.hasOwnProperty('context')){
                    rcvrMsg.context = {};
                }
                rcvrMsg.context.companyLogo = companyLogo;
                rcvrMsg.context.productLogo = productLogo;
                rcvrMsg.from = emailFrom;
                transporter.sendMail(rcvrMsg, (err, info) => {
                    if (err) {
                        log.error("MAIL Delivery Error :: " + JSON.stringify(err));
                        return;
                    }
                    log.debug("MAIL Delivery Success : Response Payload - " + JSON.stringify(info));
                });
            });
        } else {
            log.warn("Send Email :: Transporter not available skipping sending email");
        }

    },

    /**Destroy smtp transporter, closing connection when transported is a pooled one */
    destroy: function () {
        if (transporter && transporter.transporter && transporter.transporter.name === "SMTP (pool)") {
            //transporter to cleanup all open connections when SMTP pool is used
            transporter.close();
        }
        transporter = null;
    },

    /**
     * Sends test email to the receiver to verify smtp configuration
     * @param {String} receiverAddress - receiver Email Address 
     */
    test: function (receiverAddress) {
        return when.promise((resolve, reject) => {
            let msg = {
                'subject': 'RAID: Test Email',
                'template': 'test',
                'context': {
                    'companyLogo': companyLogo,
                    'productLogo': productLogo
                },
                'to': receiverAddress,
                'from': emailFrom
            };
            transporter.sendMail(msg, (err, info) => {
                if (err) {
                    log.error("MAIL Delivery Error :: " + JSON.stringify(err));
                    return reject({ error: { code: "", msg: err.message } });
                }
                log.info("Mail Delivery - Test Email :: " + JSON.stringify(info));
                return resolve({ data: { msg: "Email sent sucessfully" } });
            });
        });
    }
}