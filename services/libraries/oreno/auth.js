const helper = require('../../../services/libraries/oreno/helper');
const encrypter = require('../../../services/libraries/oreno/encrypter');
const base64 = require('../../../services/libraries/oreno/base64');
const jwt = require('../../../services/libraries/oreno/jwt');
const date = require('../../../services/libraries/oreno/date');

const app_model = require('../../../services/models/app_model');
const tbl_a_user_tokens = require('../../../services/models/core/tbl_a_user_tokens');

async function __validate_login(req, res, next) {
    const messages = 'Welcome to ExpressJS API Services';
    var params = {
        userid: req.body.userid,
        password: await base64.decode(req.body.password),
        deviceid: req.body.deviceid
    };
    const paramDataFetch = {
        table_name: 'tbl_a_users',
        conditions: {
            where_like: [
                ['a.email', 'like', params.userid, 'b']
            ]
        }
    };
    var response = [];
    var data_user = await app_model.find('single', paramDataFetch, 'core');
    if (data_user.data == '' || data_user.data == null || data_user.data == undefined) {
        //log start here
        await helper.__log(req, {type: 'login-attempt', msg: 'test'});
        //log end here
        response = ({
            code: 500,
            is_valid: false,
            message: "Failed auth user login! userid or password not matched!!!",
            response: null
        });
    }
    if (data_user.data || data_user.data.password) {
        var decrypted_password = await encrypter.decrypt(data_user.data.password);
        if (decrypted_password == params.password) {
            //generate token user
            //tbl_b_user_groups
            const paramDataUserGroups = {
                table_name: 'tbl_b_user_groups',
                select: [
                    'a.user_id', 'a.group_id',
                    'b.name AS group_name', 'b.parent_id'
                ],
                joins: {
                    left_join: [
                        'tbl_a_groups AS b ON b.id = a.group_id'
                    ]
                },
                conditions: {
                    where: [
                        ['a.user_id', '=', data_user.data.id]
                    ]
                }
            };
            const data_user_group = await app_model.find('single', paramDataUserGroups, 'core');
            if (data_user_group == '' || data_user_group == null) {
                response = ({
                    code: 500,
                    is_valid: false,
                    message: "Failed auth user login! userid or password not matched!!!",
                    response: null
                });
            }
            var now_date_time = await date.now();
            var now_date_time_addition = await date.format(new Date(), 'hour +12');
            var payload = {
                'user_id': data_user.id,
                'group_id': data_user_group.data.group_id,
                'group_parent_id': data_user_group.data.parent_group_id,
                'user_name': data_user.data.user_name,
                'user_email': data_user.data.email,
                'create_date': now_date_time,
                'expired_date': now_date_time_addition
            };
            var token_jwt = await jwt.generate(payload);
            var data_user__token = await tbl_a_user_tokens.get_by_token(token_jwt);
            if (data_user__token.data == '' || data_user__token.data == undefined) {
                var paramsInsertUserToken = [
                    {
                        token: token_jwt,
                        expiry: now_date_time_addition,
                        group_id: data_user_group.data.group_id,
                        is_logged_in: 1,
                        is_expiry: 0,
                        is_active: 1,
                        created_by: data_user.id,
                        created_date: now_date_time,
                        updated_by: data_user.id,
                        updated_date: now_date_time
                    }
                ];
                await app_model.insert(paramsInsertUserToken, {table_name: 'tbl_a_user_tokens'}, 'core');
                //log start here
                await helper.__log(req, {type: 'default', msg: 'validate-login'});
                //log end here
                response = ({
                    code: 200,
                    is_valid: true,
                    message: "Successfully auth user login!",
                    response: {
                        token: token_jwt
                    }
                });
            }
        } else {
            //log start here
            await helper.__log(req, {type: 'login-attempt', msg: 'test'});
            //log end here
            response = ({code: 200, is_valid: false, message: "Failed auth user login! userid or password not matched!!!", response: []});
        }
    }
    return response;
}

async function __validate_token(req, res, next) {
    var payload = req.headers['authorization'];
    if (payload == '' || payload == undefined) {
        return ({
            code: 500,
            is_valid: false,
            message: "Failed verify token user!",
            response: {
                token_valid: resp
            }
        });
    }
    var data_user = await __parse_token(payload).then(function (response) {
        return response;
    });
    var resp = false;
    var expiry_date = Date.parse(await date.format(data_user.data.expiry));
    var date_now = Date.parse(await date.now());
    var r = false;
    if (date_now <= expiry_date) {
        r = true;
    }
    if (data_user && data_user.data && data_user.data.is_logged_in == 1 && r == true) {
        resp = true;
    }
    await helper.__log(req, {type: 'default', msg: 'validate-token-user'});
    //log end here
    return ({
        code: 200,
        is_valid: true,
        message: "Successfully verify token user!",
        response: {
            token_valid: resp
        }
    });
}

async function __token_access(req, res, next) {
    var deviceid = req.body.deviceid;
    if (!deviceid || deviceid == undefined || deviceid == '') {
        return ({
            code: 500,
            is_valid: false,
            message: "Failed generate token user!",
            response: {
                token_access: null
            }
        });
    }
    var now_date_time = await date.now();
    var now_date_time_addition = await date.format(new Date(), 'hour +12');

    //insert deviceid client request token access
    const paramtoken_access_exist = {
        table_name: 'tbl_a_access_tokens',
        conditions: {
            where: [
                ['deviceid', '=', deviceid]
            ]
        }
    };
    const token_access_exist = await app_model.find('single', paramtoken_access_exist, 'core');
    var token_jwt = '';
    var payload = {
        'deviceid': deviceid,
        'browser': helper.__browser,
        'ip': req.ip,
        'create_date': now_date_time,
        'expired_date': now_date_time_addition
    };

    token_jwt = await jwt.generate(payload);
    if (token_access_exist && token_access_exist.data.is_expiry == 0 && token_access_exist.data.is_logged_in == 1) {
        token_jwt = token_access_exist.data.token;
    } else if (token_access_exist && token_access_exist.data.is_expiry == 1) {
        var paramsEdit = {
            table_name: 'tbl_a_access_tokens',
            where: ['deviceid', '=', deviceid],
            data: {
                token: token_jwt,
                expiry: now_date_time_addition,
                is_logged_in: 1,
                is_expiry: 0,
                is_active: 1,
                created_by: 1,
                created_date: now_date_time,
                updated_by: 1,
                updated_date: now_date_time
            }
        };
        await app_model.update(paramsEdit, 'core');
    } else {
        var params = [
            {
                token: token_jwt,
                expiry: now_date_time_addition,
                deviceid: deviceid,
                is_logged_in: 1,
                is_expiry: 0,
                is_active: 1,
                created_by: 1,
                created_date: now_date_time,
                updated_by: 1,
                updated_date: now_date_time
            }
        ];
        await app_model.insert(params, {table_name: 'tbl_a_access_tokens'}, 'core');
    }

    return ({
        code: 200,
        is_valid: true,
        message: "Successfully generate token access!",
        response: {
            token_access: token_jwt
        }
    });
}

async function __parse_token(payload) {
    var payload = payload;
    return await tbl_a_user_tokens.get_by_token(payload);
}
module.exports = {
    __validate_login,
    __validate_token,
    __token_access,
    __parse_token
}