require('dotenv').config();

const email = process.env.EMAIL
const pass = process.env.EMAIL_PASSWORD

module.exports = {
    email: email,
    name: 'Github Daily Report',
    pass: pass
}