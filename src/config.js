require('dotenv').config()
module.exports={
    PORT:process.env.PORT || 3002,
    SF_LOGIN_URL:process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    BACKEND_URL:process.env.BACKEND_URL || 'http://localhost:3002',
    SF_USERNAME:process.env.SF_USERNAME ||'username',
    SF_PASSWORD:process.env.SF_PASSWORD || 'password',
    SF_CLIENT_ID:process.env.SF_CLIENT_ID || '',
    SF_CLIENT_SECRET:process.env.SF_CLIENT_SECRET || '',
    SF_CALLBACK_URL:process.env.SF_CALLBACK_URL || 'http://localhost:3002/oauth2/callback',
    APP_URL:process.env.APP_URL || 'http://localhost:3000'
}