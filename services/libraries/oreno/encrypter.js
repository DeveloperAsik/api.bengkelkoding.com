const jwt = require('../../../services/libraries/oreno/jwt');
const base64 = require('../../../services/libraries/oreno/base64');

async function encrypt(params) {
    if (params) {
        var separator = 2;
        var delimeter = ' ';
        var chunk_str = await chunk_split(params, separator, delimeter).then(function (response) {
            return response;
        });
        var array_str = chunk_str.trim().split(" ");
        var total = parseInt(array_str.length) - 1;
        var new_array_raw = [];
        var new_array_encrypted = [];
        if (array_str) {
            for (var i in array_str) {
                if (array_str[total]) {
                    new_array_encrypted.push(await base64.encode(array_str[total]));
                }
                total--;
            }
        }
        var implode_str = await __btoa(new_array_encrypted.join('&amp;')).then(function(response){
            return response;
        });
        return jwt.generate({value: implode_str});
    }
}
async function decrypt(params) {
    if (params) {
        var explode_str = await jwt.parse(params);
        var array_str = explode_str.split('&amp;');
        var total = parseInt(array_str.length) - 1;
        var new_array_decrypted = [];
        if (array_str) {
            for (var i in array_str) {
                if (array_str[total]) {
                    new_array_decrypted.push(await base64.decode(array_str[total]));
                }
                total--;
            }
        }
        var implode_str = new_array_decrypted.join('');
        return implode_str;
    }
}

async function chunk_split(body, chunklen, end) {
    chunklen = parseInt(chunklen, 10) || 76;
    end = end || '\r\n';
    if (chunklen < 1) {
        return false;
    }
    return body.match(new RegExp('.{0,' + chunklen + '}', 'g')).join(end);
}

async function __btoa(string){
    return Buffer.from(string, 'binary').toString('base64');
}

async function __atob(string){
    return Buffer.from(string, 'base64').toString('binary');
}

async function __encode_uri(string){
    return encodeURI(string);
}

async function __decode_uri(string){
    return decodeURI(string);
}
module.exports = {
    encrypt,
    decrypt,
    chunk_split
}