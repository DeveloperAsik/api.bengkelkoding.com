const app_model = require('../../../services/models/app_model');

async function get(type = 'single', params = [], conn = 'core') {
    if (!params || params == '') {
        return {
            code: 400,
            is_valid: false,
            message: 'Failed fetching data, params is required!!!'
        };
    }
    return {
        code: 200,
        is_valid: true,
        message: "Successfully fetching data!",
        response: await app_model.find(type, params, conn)
    };
}
async function get_list(type = 'all', params = [], conn = 'core') {
    if (!params || params == '') {
        return {
            code: 400,
            is_valid: false,
            message: 'Failed fetching data, params is required!!!'
        };
    }
    return {
        code: 200,
        is_valid: true,
        message: "Successfully fetching data!",
        response: await app_model.find(type, params, conn)
    };
}

module.exports = {
    get, get_list
}