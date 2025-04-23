const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL, APP_URL} = require('../config')
//Initialize OAuth2 Config
const oauth2 = new jsforce.OAuth2({
    loginUrl:SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : SF_CALLBACK_URL
})

//Function to perform Salesforce login
const login = (req, res)=>{
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'full' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res)=>{
    const {code} = req.query
    if(!code){
        console.error("Failed to get authorization code from server callback")
        return res.status(500).send("Failed to get authorization code from server callback")
    }
    const conn = new jsforce.Connection({oauth2:oauth2})
    conn.authorize(code, function(err){
        if(err){
            console.error(err);
            return res.status(500).send(err)
        }
        lcStorage.setItem('accessToken', conn.accessToken || '')
        lcStorage.setItem('instanceUrl', conn.instanceUrl || '')
        res.redirect(APP_URL)
    })
}

// Function to Create Connection
const createConnection = () =>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    return new jsforce.Connection({
        accessToken,
        instanceUrl
    })
}

//function to get logged-in user details
const whoAmI = async (req, res) => {
    try {
      const accessToken = lcStorage.getItem('accessToken');
      const instanceUrl = lcStorage.getItem('instanceUrl');

      if (!accessToken) {
        return res.status(200).json({});
      }

      const conn = new jsforce.Connection({
        accessToken,
        instanceUrl,
      });

      // Use async/await for conn.identity
      const data = await conn.identity();
      res.json(data);
    } catch (error) {
      handleSalesforceError(error, res);
    }
};

//Function to perform Salesforce logout and clear localstorage
const logout = (req, res)=>{
    lcStorage.clear()
    res.redirect(`${APP_URL}/login`)
}


// Function to get Expenses from Salesforce using async/await
const getExpenses = async (req, res) => {
    try {
        const conn = createConnection(res);

        const query = `
            SELECT Id, Amount__c, Category__c, Date__c, Name,
                   Expense_Name__c, Notes__c
            FROM Expense__c
            ORDER BY Date__c DESC
        `;

        const result = await conn.query(query);

        res.json(result);
    } catch (error) {
        handleSalesforceError(error, res);
    }
};



// Function to create an Expense record in Salesforce using async/await
const createExpense = async (req, res) => {
    const conn = createConnection(res);
    const expenseData = {
        Expense_Name__c: req.body.Expense_Name__c,
        Amount__c: req.body.Amount__c,
        Date__c: req.body.Date__c,
        Category__c: req.body.Category__c,
        Notes__c: req.body.Notes__c,
    };

    try {
        const result = await new Promise((resolve, reject) => {
            conn.sobject("Expense__c").create(expenseData, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        res.json(result);
    } catch (error) {
        handleSalesforceError(error, res);
    }
};

// Function to update an Expense record in Salesforce using async/await
const updateExpense = async (req, res) => {
    const conn = createConnection(res);
    const {id} = req.params;
    const expenseData = {
        Id:id,
        Expense_Name__c: req.body.Expense_Name__c,
        Amount__c: req.body.Amount__c,
        Date__c: req.body.Date__c,
        Category__c: req.body.Category__c,
        Notes__c: req.body.Notes__c,
    };

    try {
        const result = await new Promise((resolve, reject) => {
            conn.sobject("Expense__c").update(expenseData, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        res.json(result);
    } catch (error) {
        handleSalesforceError(error, res);
    }
};

// Function to delete an Expense record in Salesforce using async/await
const deleteExpense = async (req, res) => {
    const conn = createConnection(res);
    const {id} = req.params;

    try {
        const result = await new Promise((resolve, reject) => {
            conn.sobject("Expense__c").destroy(id, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        res.json(result);
    } catch (error) {
        handleSalesforceError(error, res);
    }
};
//Centralized error handler function
const handleSalesforceError = (error, res)=>{
    // console.log("error statusCode", JSON.stringify(error))
    if(error.errorCode === 'INVALID_SESSION_ID'){
        lcStorage.clear()
        res.status(200).send({})
    } else{
        console.error("Error", error)
        res.status(500).send(error)
    }
}

module.exports={
    login,
    callback,
    whoAmI,
    logout,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
}
/**
SF_CLIENT_ID =3MVG9pRzvMkjMb6lukWnp7XXD.MgwgMqaBbseqvIv.phCszCWtBiiY6e6O40w5HqdNAZ_MFnrzHgp9MOg16ul
SF_CLIENT_SECRET =A5B4496A8D40F4AAECADCE1BA3924404B022F2E8B64AE033E1ABA8E3520C139E
BACKEND_URL =http://localhost:3002
PORT =3002
SF_LOGIN_URL =https://login.salesforce.com
SF_CALLBACK_URL =http://localhost:3002/oauth2/callback
APP_URL =http://localhost:3000
 */