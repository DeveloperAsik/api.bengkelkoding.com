const app_model = require('../../../services/models/app_model');

async function get_by_token(token) {
    const paramDataFetch = {
        table_name: 'tbl_a_user_tokens',
        conditions: {
            where_like: [
                ['a.token', 'like', token, 'b']
            ]
        }
    };
    return await app_model.find('single', paramDataFetch, 'core');
}
module.exports = {
    get_by_token
}