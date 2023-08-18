const nodemailer = require('nodemailer');
const exphbs = require('express-handlebars');
const hbs = require("nodemailer-express-handlebars");
const path = require('path');
const logger = require('../../../logger');

class SMTP {
	constructor(opts = {}) {
		opts.tls = opts.tls || {};
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
		const conf = {
			host: opts.smtpHost ? opts.smtpHost : opts.host,
			port: (opts.smtpPort ? +opts.smtpPort : +opts.host) || 25,
			name: opts.name
		};
		
		const globals = {
			from: this.sender
		};

		/** Security Configuration
		 * Require TLS	: Mandatory TLS Connection
		 * ignore TLS 	: If Server expects TLS only then SMTP client will not make connection to it.
		 * secure		: If true starts connection with TLS, otherwise starts connection with
		 *				  plaintext and upgrades to TLS when server request for STARTTLS, STARTTLS by
		 *				  default is prone to MTM(man in the middle) attack. mostly true for port 465
		 *				  and false for port 587, 25
		 */
		if (!opts.tls.security) conf.secure = (conf.port === 465);
		else {
			if (opts.tls.security === 'auto') {
				conf.secure = (conf.port === 465);
			} else if (opts.tls.security === 'ignoreTLS') {
				conf.secure = false;
				conf.ignoreTLS = true;
			} else if (opts.tls.security === 'requireTLS') {
				conf.secure = false;
				conf.requireTLS = true;
			}
		}

		//Allow Invalid Certificates if insecure is set to true
		conf.tls = {
			rejectUnauthorized: !opts.tls.insecure
		}

		// conf.logger = true;
		// conf.debug = true;

		/** Pool Configuration*/
		if (opts.pool && opts.pool.enable) {
			conf.pool = true;
			/** For Default values we do not need maxConnections, maxMessages,
			 * in such a case, pool will be true, otherwise an object with values
			 */
			if (opts.pool.maxconnections) {
				// By default 5 max connections are used
				conf.maxConnections = +opts.pool.maxconnections;
			}
			if (opts.pool.maxmessages) {
				// By default max 100 messages can be sent using a single connection
				conf.maxMessages = +opts.pool.maxmessages;
			}
		}

		/** Connection Configuration */
		if (opts.timeouts) {
			if (opts.timeouts.connection) {
				/** Milliseconds to wait for connection to establish. Default value is 2 min */
				conf.connectionTimeout = +opts.timeouts.connection;
			}
			if (opts.timeouts.greeting) {
				/** Milliseconds to wait for greeting command(HELO, EHLO),
				 *  after connection is establised, Defaults to 30 seconds */
				conf.greetingTimeout = +opts.timeouts.greeting;
			}
			if (opts.timeouts.socket) {
				/** Milliseconds of inactivity allowed, Defaults to 10 minutes */
				conf.socketTimeout = +opts.timeouts.socket;
			}
		}

		/** Authentication Configuration */
		if (opts.auth && opts.auth.hasOwnProperty('type')) {
			if (opts.auth.type === 'basic') {
				//Default authType is 'login' for NodeMailer. Thus, no need to pass type explicitly
				conf.auth = {
					user: opts.auth.username,
					pass: opts.auth.password
				};
			} else if (opts.auth.type === 'oauth2') {
				//TODO - add support for OAuth2
			}
		}

		/** Proxy Configuration */
		if (opts.proxy && opts.proxy.enable) {
			if (opts.proxy.auth) {
				const proxy = new URL(opts.proxy.url);
				proxy.username = opts.proxy.user;
				proxy.password = opts.proxy.pass;
				conf.proxy = proxy.toString();
			} else conf.proxy = opts.proxy.url;
			if (conf.proxy.endsWith('/')) conf.proxy = conf.proxy.slice(0, -1);
		}

		this.destroy();
		this.transport = nodemailer.createTransport(conf, globals);
		const layoutsPath = path.join(__dirname, '../views/email/layouts/');
		const partialsPath = path.join(__dirname, '../views/email/partials/');
		this.transport.use('compile', hbs({
			viewEngine: exphbs.create({
				defaultLayout: 'main',
				extname: '.hbs',
				layoutsDir: layoutsPath,
				partialsDir: [partialsPath]
			}), // Using Express-handlebar as the view engine
			viewPath: layoutsPath, // Location of handlebar templates
			extName: '.hbs' // Handlebar extension
		}));

		this.transport.verify((err, success) => {
			if (err) {
				logger.error(`SMTP Module "${this.opts.name}" Initialization Failed! Error: ${err}`);
				logger.debug("SMTP Module Initialization Failure Stacktrace: " + err.stack);
			} else if (success) logger.info(`SMTP Module "${this.opts.name}" Initialization Succesful!`)
			else logger.error(`SMTP Module "${this.opts.name}" Initialization Failed! Invalid configuration details`);
		});

		/*try {
			const status = await this.transport.verify();
			if (status) logger.info(`SMTP Module "${this.opts.name}" Initialization Succesful!`)
			else logger.error(`SMTP Module "${this.opts.name}" Initialization Failed! Invalid configuration details`);
		} catch (e) {
			logger.error(`SMTP Module "${this.opts.name}" Initialization Failed! Error: ${e}`);
			logger.debug("SMTP Module Initialization Failure Stacktrace: " + e.stack);
		}*/
	};

	async send(msg, rcvrs) {
		if (!this.transport) {
			logger.error("Notify Failed: SMTP Transport not available");
			return { error: { code: "INVALID_PROVIDER_TRANSPORT", msg: `SMTP Transport not available` } };
		}
		const res = [];
		const resPromiseList = rcvrs.map(rcvr => (async () => {
			// Cloning msgObj so while calling sendMail, it does not refer to the same msg object
			const rcvrMsg = {...msg};
			rcvrMsg.to = rcvr;
			try {
				const info = await this.transport.sendMail(rcvrMsg);
				if (info) logger.debug("MAIL Delivery Success : Response Payload - " + JSON.stringify(info));
				res.push({ error: null, status: "success" });
			} catch (e) {
				logger.error("MAIL Delivery Error :: " + e);
				res.push({ error: {code: "DELIVERY_FAIL", msg: e}, status: "fail" });
			}
		})());
		await Promise.all(resPromiseList);
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
