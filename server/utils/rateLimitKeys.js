const { ipKeyGenerator } = require("express-rate-limit");

function userOrIpKey(req) {
  if (req.user?._id) return `user:${req.user._id}`;
  return `ip:${ipKeyGenerator(req.ip)}`;
}

module.exports = { userOrIpKey };
