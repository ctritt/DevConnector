const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: 'Could not find auth token in x-auth-token request header' });
  }

  try {

    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    
    next();

  } catch(err) {
    res.send(401).json({ msg: "Invalid Auth Token" });
  }
}