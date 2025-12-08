const dotenv = require('dotenv');
dotenv.config();

const PROXY_CONFIG = {
    "/sap": {
        "target": "http://172.17.19.24:8000",
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug",
        "auth": process.env.SAP_AUTH,
        "headers": {
            "sap-client": "100"
        }
    }
};

module.exports = PROXY_CONFIG;
