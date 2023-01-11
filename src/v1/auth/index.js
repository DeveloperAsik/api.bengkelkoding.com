const express = require('express');
const router = express.Router();

const auth = require('../../../services/libraries/oreno/auth');
const helper = require('../../../services/libraries/oreno/helper');
const encrypter = require('../../../services/libraries/oreno/encrypter');
const base64 = require('../../../services/libraries/oreno/base64');
const jwt = require('../../../services/libraries/oreno/jwt');
const date = require('../../../services/libraries/oreno/date');

const app_model = require('../../../services/models/app_model');


router.get('/', async function (req, res, next) {
    try {
        const messages = 'Welcome to ExpressJS API Services';
        var key = 'Ab1234abcd!@#$';
        var token_jwt = await encrypter.encrypt(key);
        var parsing_jwt = await encrypter.decrypt(token_jwt);
        var now_date_time = await date.now();
        var now_date_time_addition = await date.format(new Date(), 'hour +12');
        var data = {
            encrypter: {
                key: key,
                encode: token_jwt,
                length: token_jwt.length,
                decode: parsing_jwt
            },
            date: {
                now: now_date_time,
                plus_12_hour: now_date_time_addition
            }
        };
        //log
        await helper.__log(req, {type: 'default', msg: 'test'});
        res.json({code: 200, is_valid: true, message: messages, data: data});
    } catch (err) {
        console.error(`Error while getting datas `, err.message);
        res.json({code: 200, is_valid: true, message: "failed fetching data", data: []});
        next(err);
    }
});

router.post('/v1/auth/validate-login', async function (req, res, next) {
    var response = await auth.__validate_login(req, res, next);
    res.json(response);
});

router.post('/v1/auth/validate-token', async function (req, res, next) {
    var response = await auth.__validate_token(req, res, next);
    res.json(response);
});

router.post('/v1/auth/token-access', async function (req, res, next) {
    var response = await auth.__token_access(req, res, next);
    res.json(response);
});

router.get('/v1/auth/get-list/:offset/:limit', async function (req, res, next) {
    //log start here
    await helper.__log(req, {type: 'default', msg: 'test'});
    //log end here
    try {
        const limit = req.params.limit;
        const offset = req.params.offset;
        const paramDataFetch = {
            table_name: 'tbl_a_users',
            select: [
                'a.id', 'a.user_name', 'a.first_name', 'a.last_name', 'a.email',
                'b.address AS user_address', 'b.facebook', 'b.twitter', 'b.instagram'
            ],
            conditions: {
                where: [
                    ['a.is_active', '=', 1]
                ]
            },
            joins: {
                left_join: [
                    'tbl_a_user_profiles AS b ON b.id = a.profile_id'
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
        res.json({
            code: 200,
            is_valid: true,
            message: "Successfully fetching data!",
            response: await app_model.find('all', paramDataFetch, 'core')
        });
    } catch (err) {
        //console.error(`Error while getting datas `, err.message);
        res.json({code: 200, is_valid: true, message: "failed fetching data", data: []});
        next(err);
    }
});
router.get('/v1/auth/get-by-id/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        const paramDataFetch = {
            table_name: 'tbl_a_users',
            select: [
                'a.id', 'a.user_name', 'a.first_name', 'a.last_name', 'a.email',
                'b.address AS user_address', 'b.facebook', 'b.twitter', 'b.instagram'
            ],
            conditions: {
                where: [
                    ['a.id', '=', id]
                ]
            },
            joins: {
                left_join: [
                    'tbl_a_user_profiles AS b ON b.id = a.profile_id'
                ]
            }
        };
        res.json({
            code: 200,
            is_valid: true,
            message: "Successfully fetching data!",
            response: await app_model.find('all', paramDataFetch, 'core')
        });
    } catch (err) {
        console.error(`Error while getting datas `, err.message);
        res.json({code: 200, is_valid: true, message: "failed fetching data", data: []});
        next(err);
    }
});
module.exports = router;
