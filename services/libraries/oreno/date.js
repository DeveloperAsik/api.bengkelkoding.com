const encrypter = require('../../../services/libraries/oreno/encrypter');
async function now() {
    var date = new Date();
    var params = [];
    return format(date, params).then(function (date, params) {
        return date;
    });
}

async function format(inputDate, params) {
    let date, month, year, hour, minute, second;
    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();
    date = date.toString().padStart(2, '0');
    month = month.toString().padStart(2, '0');
    hour = inputDate.getHours();
    minute = addZero(inputDate.getMinutes());
    second = addZero(inputDate.getSeconds());
    var new_date = `${year}-${month}-${date} ${hour}:${minute}:${second}`;
    if (params && params != '') {
        var array_str = params.split(" ");
        var key = array_str[0];
        var tm = array_str[1];
        var chunk_str = await encrypter.chunk_split(tm, 1, ' ');
        var total = chunk_str.length;
        var new_hour = new_chk = '';
        for (var i = 0; i < total; i++) {
            if (i != 0) {
                new_chk = new_chk + chunk_str[i];
            }
        }
        new_hour = new_chk.replace(/ /g, '');
        var new_hour2 = 0;
        switch (chunk_str[0]) {
            case "+":
                new_hour2 = inputDate.setTime(inputDate.getTime() + new_hour * 60 * 60 * 1000);
                break;
            default:
                new_hour2 = inputDate.setTime(inputDate.getTime() - new_hour * 60 * 60 * 1000);
                break;
        }
        var s = new Date(new_hour2).toLocaleString();
        var new_date2 = s.replace(/[//\\]/g, '-');
        var new_date3 = new_date2.replace(/,/g, '');
        var array_str_date = new_date3.split(" ");
        var array_str_date2 = array_str_date[0].split("-");
        var new_date4 = array_str_date2[2] + '-' + array_str_date2[0] + '-' + array_str_date2[1] + ' ' + array_str_date[1];
        return new_date4;
    }
    return new_date;
}

async function addition(ndate, params) {
    if (params == '') {
        params = ['plus', 'h', 12];
    }
    var now_date_time_addition = format(ndate, conn).then(function (ndate, conn) {
        return ndate;
    });
}

async function range(start, end) {

}

function addZero(i) {
    if (i < 10) {
        i = "0" + i
    }
    return i;
}
module.exports = {
    now,
    format
}