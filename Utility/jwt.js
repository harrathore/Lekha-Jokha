const jwt = require('jsonwebtoken');

async function generateToken(userEmail){

    //let jwtSecretKey = "This is Secret Key";
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        email : userEmail
    }
    const token = jwt.sign(data, jwtSecretKey, { expiresIn: '50000s' });
    return token;
}

async function verifyJwt(jwtToken){
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const Verified = jwt.verify(jwtToken, jwtSecretKey);
    return Verified;
}

module.exports = {generateToken, verifyJwt};