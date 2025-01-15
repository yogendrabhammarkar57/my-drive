const jwt = require('jsonwebtoken');

function auth(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).send('Access denied');
    }
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        return next();
        }catch(err){
            return res.status(401).send('Unauthorized');
        }
}

module.exports = auth;