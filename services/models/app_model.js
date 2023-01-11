const mysql = require('mysql2/promise');
const db = require('../../config/database');
const config = require('../../config/config');
const base64 = require('../../services/libraries/oreno/base64');

async function query(sql, conn) {
    return __run_query(sql, conn).then(function (sql, conn) {
        return sql;
    });
}

async function find(type, params, conn) {
    let limit = 100;
    if (params.limit) {
        limit = params.limit;
    }
    let offset = 0;
    if (params.offset) {
        offset = params.offset;
    }
    let from = '';
    if ((params.table_name) && params.table_name != '') {
        from = params.table_name + ' AS a';
    }
    if (from == '') {
        return {code: 200, message: 'table name is required !!!', is_valid: false, data: []};
    }
    var fields = '* FROM';
    if (params.select) {
        var field = '';
        for (let i = 0; i < params.select.length; i++) {
            if (field)
                field = field + ', ';
            field = field + params.select[i];
        }
        field = field + ' FROM';
        fields = field;
    }
    var joins = '';
    if (params.joins) {
        var keys = Object.keys(params.joins);
        for (var j = 0; j < keys.length; j++) {
            switch (keys[j]) {
                case 'left_join':
                    joins = joins + 'LEFT JOIN ' + params.joins[keys[j]];
                    break;
                case 'right_join':
                    joins = joins + 'RIGHT JOIN ' + params.joins[keys[j]];
                    break;
                case 'cross_join':
                    joins = joins + 'CROSS JOIN ' + params.joins[keys[j]];
                    break;
                default:
                    joins = joins + 'INNER JOIN ' + params.joins[keys[j]];
                    break;
            }
        }
    }
    var conditions = '';
    if (params.conditions) {
        var key_conds = Object.keys(params.conditions);
        for (var k = 0; k < key_conds.length; k++) {
            var where = '';
            switch (key_conds[k]) {
                case 'where':
                    var arrCondWhere = '';
                    for (let l in params.conditions[key_conds[k]]) {
                        if (arrCondWhere != '') {
                            arrCondWhere = arrCondWhere + ' AND ';
                        } else {
                            arrCondWhere = arrCondWhere + 'WHERE ';
                        }
                        arrCondWhere = arrCondWhere + params.conditions[key_conds[k]][l][0] + ' ' + params.conditions[key_conds[k]][l][1] + ' "' + params.conditions[key_conds[k]][l][2] + '"';
                    }
                    conditions = conditions + arrCondWhere;
                    break;
                case 'where_not_in':
                    where = 'NOT IN';
                case 'where_in':
                    where = 'IN';
                    if (conditions != '') {
                        conditions = conditions + ' AND ';
                    } else {
                        conditions = conditions + 'WHERE ';
                    }
                    conditions = conditions + params.conditions[key_conds[k]][0] + ' ' + where + ' (' + params.conditions[key_conds[k]][1] + ')';
                    break;
                case 'where_like':
                    var arrCondWhereLike = '';
                    for (let m in params.conditions[key_conds[k]]) {
                        if (arrCondWhereLike != '') {
                            arrCondWhereLike = arrCondWhereLike + ' AND ';
                        } else {
                            arrCondWhereLike = arrCondWhereLike + 'WHERE ';
                        }
                        var operatorLike = '';
                        var newStr = params.conditions[key_conds[k]][m][2];
                        var newStr2 = newStr.replace(/%/g, '');
                        if (params.conditions[key_conds[k]][m][3] == 'f') {
                            //f = first
                            operatorLike = operatorLike + '%' + newStr2;
                        } else if (params.conditions[key_conds[k]][m][3] == 'b') {
                            //b = both
                            operatorLike = operatorLike + '%' + newStr2 + '%';
                        } else if (params.conditions[key_conds[k]][m][3] == 'l') {
                            //l = last
                            operatorLike = operatorLike + newStr2 + '%';
                        } else {
                            //c = custom
                            operatorLike = operatorLike + params.conditions[key_conds[k]][m][2];
                        }
                        arrCondWhereLike = arrCondWhereLike + params.conditions[key_conds[k]][m][0] + ' ' + params.conditions[key_conds[k]][m][1] + " '" + operatorLike + "'";
                    }
                    conditions = conditions + arrCondWhereLike;
                    break;
                case 'where_between':
                    conditions = conditions + 'column_name BETWEEN value1 AND value2;';
                    break;
            }
        }
    }
    if (limit) {
        var limit_str = ' LIMIT ' + limit + ' OFFSET ' + offset;
        if (type && type == 'single') {
            limit_str = ' LIMIT 1';
        }
    }
    var query = 'SELECT ' + fields + ' ' + from + ' ' + joins + ' ' + conditions + limit_str;
    //var new_conn = await db.connect(conn);
    //const connection = await mysql.createConnection(new_conn);
    //const [results, ] = await connection.execute(query);
    const results = await __run_query(query, conn).then(function (response) {
        return response;
    });
    switch (type) {
        case "all":
            response = results;
            break;
        case "first":
            response = results[0];
            break;
        case "last":
            var max = results.length;
            response = results[max];
            break;
        case  "count":
            response = results.length;
            break;
        case  "single":
            response = results[0];
            break;
    }
    var response_all = {
        meta: {
            limit: parseInt(params.limit),
            offset: parseInt(params.offset),
            total: parseInt(results.length)
        },
        data: response
    };
    if (type && type == 'single') {
        response_all = {
            query: {
                type: type,
                params: conditions
            },
            data: response
        };
    }
    return response_all;
}

async function insert(query, params, conn) {
    var table_name = params.table_name;
    var query_str = "INSERT INTO `" + table_name + "`";
    var tbl_field = Object.keys(query[0]);
    var fields = '';
    for (var i in tbl_field) {
        if (fields != '')
            fields = fields + ', ';
        fields = fields + "`" + tbl_field[i] + "`";
    }
    var arr_first = arr_str = '';
    var x = '';
    for (var j = 0; j < query.length; j++) {
        var l = 1;
        if (arr_first != '')
            arr_first = arr_first + ',';
        x = j;
        for (var k = 0; k < tbl_field.length; k++) {
            if (x == j) {
                if (arr_str != '' && arr_str != '(') {
                    arr_str = arr_str + ",";
                }
                if (k == 0 && arr_str != ',') {
                    arr_str = arr_str + '(';
                }
                arr_str = arr_str + "'" + query[j][tbl_field[k]] + "'";
                l++;
                if (k == (tbl_field.length - 1) && arr_str != '(') {
                    arr_str = arr_str + ')';
                }
            }
        }
        arr_first = arr_str + ';';
    }
    var sql_query = query_str + ' (' + fields + ') VALUES ' + arr_first;
    return await __run_query(sql_query, conn).then(function (response) {
        if (params.return_last_id && params.return_last_id == true) {
            return response;
        } else {
            return true;
        }
    });
}

async function update(params, conn) {
    //var paramsLogAttemptEdit = {
    //    table_name: 'tbl_d_login_attempts',
    //    where: ['id', '=', 2],
    //    data: {
    //        email: 'testa2@mail.com',
    //        password_attempt: 'passaw0rd2',
    //        device_id: '98duhaerd',
    //        ip: '192.182.213.121',
    //        browser: 'firefoxa',
    //        is_active: '2',
    //        created_by: '2',
    //        created_date: '2022-12-19 11:46:02',
    //        updated_by: '2',
    //        updated_date: '2022-12-19 11:46:02'
    //    }
    //};
    //var res_edit = await app_model.update(paramsLogAttemptEdit, 'core');
    var table_name = params.table_name;
    var query_str = "UPDATE `" + table_name + "` SET ";
    var tbl_field = Object.keys(params.data);
    var fields = '';
    for (var i in tbl_field) {
        if (fields != '')
            fields = fields + ', ';
        fields = fields + "`" + tbl_field[i] + "` = '" + params.data[tbl_field[i]] + "'";
    }
    var where = ' WHERE ';
    if (params.where) {
        where = where + "`" + table_name + "`." + "`" + params.where[0] + "`" + params.where[1] + params.where[2];
    }
    var sql_query = query_str + fields + where;
    return await __run_query(sql_query, conn).then(function (response) {
        return true;
    });
}

async function __delete(params, conn) {
    //var paramsLogAttemptDelete = {
    //    table_name: 'tbl_d_login_attempts',
    //    where: ['id', '=', 2],
    //};
    //var res_delete = await app_model.__delete(paramsLogAttemptDelete, 'core');
    var table_name = params.table_name;
    var sql_query = "DELETE FROM `" + table_name + "` WHERE " + "`" + table_name + "` . " + "`" + params.where[0] + "` " + params.where[1] + " " + params.where[2];
    return await __run_query(sql_query, conn).then(function (response) {
        return true;
    });
}

async function __run_query(sql, conn) {
    var new_conn = await db.connect(conn);
    const connection = await mysql.createConnection(new_conn);
    const [results, ] = await connection.execute(sql);
    return results;
}
module.exports = {
    query,
    find,
    insert,
    update,
    __delete
}