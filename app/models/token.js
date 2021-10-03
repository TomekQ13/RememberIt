const utils = require('./utils')

class Token {
    generateToken(len) {
        this.tokenValue = utils.randomString(len)
    }


}

function consumeRememberMeToken(token, fn) {
    var uid = tokens[token];
    // invalidate the single-use token
    delete tokens[token];
    return fn(null, uid);
}
  
function saveRememberMeToken(token, uid, fn) {
    tokens[token] = uid;
    return fn();
}