const nodemailer = require('nodemailer');
const exphbs = require('express-handlebars');
const hbs = require("nodemailer-express-handlebars");
const path = require('path');

class SMTP {
	constructor(opts = {}) {
		this.name = opts.name;
		this.type = "smtp";
		this.opts = opts;
		this.transport = null;
		this.sender = {
			name: opts.sender.name || "Avo Assure Alerts",
			address: opts.sender.email || opts.defaultSender
		};
		this.loadConfig(opts);
	};

	async loadConfig(opts) {
		console.log("WIP!!");
	};

	async send(msg, rcvrs) {
		if (!this.transport) {
			logger.error("Notify Failed: SMTP Transport not available");
			return { error: { code: "INVALID_PROVIDER_TRANSPORT", msg: `SMTP Transport not available` } };
		}
		return { error: null, status: "success" };
		// For test => transporter.verify
		rcvrs.forEach(rcvr => {
			// Cloning msgObj so while calling sendMail, it does not refer to the same msg object
			const rcvrMsg = {...msg};
			rcvrMsg.to = rcvr;
			this.transport.sendMail(rcvrMsg, (err, info) => {
				if (err) {
					log.error("MAIL Delivery Error :: " + JSON.stringify(err));
					return;
				}
				log.debug("MAIL Delivery Success : Response Payload - " + JSON.stringify(info));
			});
		});
		return res;
	};

	async destroy() {
		if (this.transport && this.transport.transporter && this.transport.transporter.name === "SMTP (pool)") {
			// To cleanup all open connections when SMTP pool is used
			this.transport.close();
		}
		this.transport = null;
	};
}

module.exports = SMTP;

const x = {
	name: "smtp",

	/**
	 * load config for smtp module
	 * @param {Object} cnfg - nodemailer config 
	 */
	loadConfig: function (cnfg) {
		/*
		* Assumptions:
		* 1. when cnfg passed to this function all fields were already
		*	validated in api module, 
		* 2. Password stored for 'password user type' is in encrypted format
		*/
		let smtpConfig = {
			host: cnfg.host,
			port: +cnfg.port || 25
		};


		/** Security Configuration
		 * Require TLS  : Mandatory TLS Connection
		 * ignore TLS   : If Server expects TLS only then SMTP client will not
		 *			  make connection to it.
		 * secure	   : If true starts connection with TLS, otherwise starts connection with
		 *			  plaintext and upgrades to TLS when server request for STARTTLS, STARTTLS by
		 *			  default is prone to MTM(man in the middle) attack. mostly true for port 465
		 *			  and false for port 587, 25
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
				let rcvrMsg = {...msg};
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
	}
}