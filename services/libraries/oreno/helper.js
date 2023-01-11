const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const machine_id = require('node-machine-id');
const app_model = require('../../../services/models/app_model');
const date = require('../../../services/libraries/oreno/date');

async function __browser(req, res) {
    var geo = geoip.lookup(req.ip);
    var response = {
        browser: req.headers["user-agent"],
        language: req.headers["accept-language"],
        country: (geo ? geo.country : "Unknown"),
        region: (geo ? geo.region : "Unknown"),
        geo: geo
    };
    return response;
}

async function __log(req, dataStr) {
    var data = [];
    var tbl_name = '';
    const device_id = await machine_id.machineId();
    const ip_address = requestIp.getClientIp(req).replace('::ffff:', '');
    const now_date_time = await date.now();
    const browser = await __browser(req).then(function (response) {
        return JSON.stringify(response);
    });
    const method = req.method;
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var class_name = method_name = '';
    var url = req.originalUrl;
    if (url == '/') {
        class_name = 'home';
        method_name = 'index';
    } else {
        var r = url.split('/');
        var api_version = r[1];
        var modul = r[2];
        var controller = r[3];
        var func = r[4];
        if (r.length < 4) {
            api_version = 'v.1.0';
            modul = r[1];
            controller = r[2];
            func = r[3]
        }
        class_name = controller;
        method_name = func;
    }
    switch (dataStr.type) {
        case "login-attempt":
            tbl_name = 'tbl_d_login_attempts';
            data = [
                {
                    email:req.body.userid,
                    password_attempt:req.body.password,
                    device_id: req.body.deviceid, //'98duhwja',
                    ip: ip_address,
                    browser: browser,
                    is_active: 1,
                    created_by: 1,
                    created_date: now_date_time,
                    updated_by: 1,
                    updated_date: now_date_time
                }
            ];
            break;
        default:
            tbl_name = 'tbl_d_logs';
            data = [
                {
                    fraud_scan: 'user access' + fullUrl + ' using browser ' + browser, //'test@mail.com',
                    ip_address: ip_address, //'passw0rd',
                    browser: browser, //'98duhwja',
                    class: class_name,
                    method: method_name,
                    event: method,
                    is_active: 1,
                    created_by: 1,
                    created_date: now_date_time,
                    updated_by: 1,
                    updated_date: now_date_time
                }
            ];  
            break;
    }
    var params = {
        table_name: tbl_name,
        return_last_id:true
    };
    return await app_model.insert(data, params, 'core');
}

module.exports = {
    __browser,
    __log
}