const base64 = require('../../../services/libraries/oreno/base64');

async function generate(params) {
    const HMACSHA256 = (stringToSign, secret) => "not_implemented";
    const header = {
        "alg": "HS256",
        "typ": "JWT",
        "kid": "vpaas-magic-cookie-1fc542a3e4414a44b2611668195e2bfe/4f4910"
    }
    const encodedHeaders = btoa(JSON.stringify(header));
    const encodedPlayload = btoa(JSON.stringify(params));
    const signature = HMACSHA256(`${encodedHeaders}.${encodedPlayload}`, "mysecret");
    const encodedSignature = btoa(signature);
    return `${encodedHeaders}.${encodedPlayload}.${encodedSignature}`;
}
async function parse(token) {
    var responses= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
	if(responses.value){
		return await base64.decode(responses.value);
	}
    //var base64Url = token.split('.')[1];
    //var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    //    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //}).join(''));
    //console.log(jsonPayload);return false;
    //return JSON.parse(jsonPayload);
}
module.exports = {
    generate,
    parse
}