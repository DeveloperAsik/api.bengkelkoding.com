async function encode(string) {
    return btoa(unescape(encodeURIComponent(string)));
}
async function decode(string) {
    var b = Buffer.from(string, 'base64')
    return b.toString();
}

module.exports = {
    encode,
    decode
}