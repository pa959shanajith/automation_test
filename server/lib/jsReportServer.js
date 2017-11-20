const logger = require('../../logger');
const os = require('os');
const cmd = require('node-cmd');

const jsReportServer = function () {
    //Starting jsreport server
    if (os.type() == 'Windows_NT') {
        try {
            var tmp = os.tmpdir();
            fs.unlinkSync(tmp + '\\jsreport-temp\\extensions\\locations.json');
            fs.unlinkSync(tmp + '\\jsreport-temp\\licensing\\cache.json');
        } catch (e) { }
    }
    cmd.get('netstat -ano | find "LISTENING" | find "8001"', function (data, err, stderr) {
        if (data) {
            //console.log('killing JS report server and restarting');
            //console.log('===== Process ID of jsreport =====',data);
            var thisResult = data.split("\r\n")[0].split(" ")[data.split("\r\n")[0].split(" ").length - 1];
            var cmdtoexe = "Taskkill /PID " + thisResult + " /F";
            cmd.get(cmdtoexe, function (data, err, stderr) {
                if (data) {
                    //console.log('===== Killed jsreport server =====',data);
                    cmd.get('node index.js', function (data, err, stderr) {
                        if (!err) {
                            logger.debug('the node-cmd: %s', data);
                        } else {
                            logger.error("Cannot start Jsreport server");
                        }
                    });
                }
                else {
                    logger.error("Cannot kill jsreport server");
                }
            });
        }
        else {
            cmd.get('node index.js', function (data, err, stderr) {
                if (!err) {
                    logger.info('JS report server started normally');
                } else {
                    logger.error("Cannot start Jsreport server");
                }
            });
        }
    });
}

module.exports = jsReportServer;