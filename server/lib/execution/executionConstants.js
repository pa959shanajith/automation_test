module.exports.SOCK_NORM = "normalModeOn";
module.exports.SOCK_SCHD = "scheduleModeOn";
module.exports.SOCK_NA = "unavailableLocalServer";
module.exports.SOCK_SCHD_MSG = "ICE is connected in Scheduling mode";
module.exports.SOCK_NA_MSG = "ICE is not Available";
module.exports.DO_NOT_PROCESS = "do_not_process_response";
module.exports.X_EXECUTION_MESSAGE = 'X-EXECUTION-MESSAGE'
module.exports.STATUS_CODES = {
    "461": 'ICE not available please connect',
    "462": 'Terminated by user',
    "463": 'Terminated by program',
    "409": 'ICE is occupied with other execution',
    "423": 'ICE is set to "do not disturb"',
    "401": 'Token validation failed',
    "400": 'Invalid request details',
    "200": 'execution passed',
    "202": 'execution failed',
    "261": 'partially failed',
    '500': 'Internal Server Error'
}
module.exports.EMPTYPOOL = process.env.nullpool;
module.exports.EMPTYUSER = process.env.nulluser