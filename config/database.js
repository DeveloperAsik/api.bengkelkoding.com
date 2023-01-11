const base64 = require('../services/libraries/oreno/base64');
const config = require('../config/config');
async function connect(conn) {
    var params = await config.dsa8udasjdhas[conn];
    var result = {
        [ await base64.decode('aG9zdA==')]: await base64.decode(params.aG9zdA),
        [ await base64.decode('dXNlcg==')]: await base64.decode(params.dXNlcg),
        [ await base64.decode('cGFzc3dvcmQ=')]: await base64.decode(params.cGFzc3dvcmQ),
        [ await base64.decode('ZGF0YWJhc2U=')]: await base64.decode(params.ZGF0YWJhc2U)
    };
    return result;
}
module.exports = {
    connect
}