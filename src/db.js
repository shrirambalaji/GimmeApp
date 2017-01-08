var userTokens = {};

exports.saveUserToken = function (userId, token) {
    userTokens[userId] = token;
}

exports.removeUserToken = function (userId) {
    return userTokens[userId];
}
