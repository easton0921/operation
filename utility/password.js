const bcrypt = require('bcrypt');
// Generate bcrypt 
async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hashed password:", hash);
    return hash;
};

//compare bcrypt password
async function checkPassword(password, hash) {
    const match = await bcrypt.compare(password, hash);
    console.log(match ? "Password is correct!" : "Invalid password!");
    return match;
};

module.exports = {
    hashPassword,
    checkPassword,
}


