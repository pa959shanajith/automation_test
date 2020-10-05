const logger = require('../../../logger');
const defaultEmailFrom = "avoassure-alerts@avoautomation.com";
const SMTP = require('./smtp');

class Email {
	constructor(opts = {}) {
		opts.defaultSender = defaultEmailFrom;
		if (!opts.sender) opts.sender = {};
		this.mode = opts.provider;
		this.opts = opts;
		this.mailer = null;
		if (opts.provider == "smtp") {
			this.mailer = new SMTP(opts);
		} else {
			logger.error("Email Module Initialization Failed: email module of type " + this.mode + " not found");
		}
	}

	async send(...args) {
		if (!this.mailer) {
			logger.error("Notify Failed: Email channel does not support " + this.mode + " provider");
			return { error: { code: "INVALID_PROVIDER", msg: `Email channel does not support ${this.mode} Provider` } };
		}
		const res = await this.mailer.send(...args);
		return res;
	};

	async destroy() {
		if (this.mailer) {
			logger.info(`${this.mode} Mailer '${this.opts.name}' destroyed!`);
			await this.mailer.destroy();
			this.mailer = null;
		} else {
			logger.info("No Mailer available to destroy!");
		}
	};
}

module.exports = Email;
