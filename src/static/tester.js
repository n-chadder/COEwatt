const express = require('express');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

const PORT = 8080;
const HOST = '127.0.0.1';

const userAgentString = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.34";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

app.get('/', async (req, res) => { 
  res.send("Hello World");
});

app.post('/', async function(req, res){
  try{
    let results = await runPa11y(req);
    res.status(200).send(results);
  }
  catch (error){
    console.log(error);
    res.status(500).send(error.stack);
  }  
});

async function runPa11y(req) {
  try {
    let validatedActions = validateActions(req.body.action);
    let AuthActions = getAuthActions(req.body.authenticationData);
    const loginUrl = req.body.authenticationData['loginUrl'];
    let submitElement = req.body.authenticationData['submitNameID'];
    let username = req.body.authenticationData['uName'];
    let password = req.body.authenticationData['uPword'];
    if (loginUrl != "" && submitElement != "") {
      console.log("if \n\n");
      let browser = await runLoginTest(loginUrl, AuthActions);
      let result = testUrl(browser, req, validatedActions);
      return result;
    }
    else if (submitElement == "" && username != ""){
      let browser = await runAuthLoginTest(loginUrl, AuthActions, username, password);
      console.log("else if \n\n");
      let result = testUrl(browser, req, validatedActions);
      return result;
    }
    else {
      const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: true,
      });
      console.log("else statement \n\n");
      let result = await testUrl(browser, req, validatedActions);
      return result;
    }
  }
  catch (error){
    throw error;
  }
}

function validateActions(action) {
  let actions = [];
  
  if (action.length == 0) {   return actions;   }
  
  for (let index = 0; index < action.length; index++) {
    if (pa11y.isValidAction(action[index])) {
      actions.push(action[index]);
    }
    else{
      console.log(`invalid action: ${action[index]}`);
    }
  } 
  return actions;
}

function getAuthActions(authenticationData) {
  if (authenticationData['uName'] == "") {   return [];   }
  if (authenticationData['submitNameID'] == "" && authenticationData['uName']!= "") {
    let additionalActionString = authenticationData['additionalActions']; //?
    let authenticationAction = ["screen capture loginScreenShot.png"];
    let AuthActions = [];

    if (additionalActionString != "") {
      authenticationAction.push(additionalActionString);
    }

    for (let i = 0; i < authenticationAction.length; i++) {
      if (pa11y.isValidAction(authenticationAction[i])) {
        AuthActions.push(authenticationAction[i]);
      }
      else {
        console.log(`invalid Auth action: ${authenticationAction[i]}`);
      }
    }
    return AuthActions;
  }
  
  let username = authenticationData['uName'];
  let usernameElement = authenticationData['uNameElement'];
  let password = authenticationData['uPword'];
  let passwordElement = authenticationData['uPwordElement'];
  let submitElement = authenticationData['submitNameID'];
  let additionalActionString = authenticationData['additionalActions'];

  let authenticationAction = [];
  let submitString = "click element " + submitElement;
  let usernameString = "set field " + usernameElement + " to " + username;
  let passwordString = "set field " + passwordElement + " to " + password;
  let screenShot = "screen capture loginScreenShot.png";
  let AuthActions = [];
  
  if (additionalActionString != ""){
    authenticationAction.push(additionalActionString);
    console.log(additionalActionString);
  }

  authenticationAction.push(usernameString);
  authenticationAction.push(passwordString);
  authenticationAction.push(screenShot);
  authenticationAction.push(submitString);

  for (let i = 0; i < authenticationAction.length; i++) {
    if (pa11y.isValidAction(authenticationAction[i])) {
      AuthActions.push(authenticationAction[i]);
    }
    else {
      console.log(`invalid Auth action: ${authenticationAction[i]}`);
    }
  }
  return AuthActions;
}

async function runLoginTest(loginUrl, AuthActions) {
  try {
    console.log(AuthActions);
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: true,
      args: ["--ignore-certificate-errors"],
   });
   page = await browser.newPage();
   console.log("RUNNING LOGIN SCRIPT")
   const testPage = loginUrl;
   await pa11y(testPage, {
      actions: AuthActions,
      browser,
      page: page,
      timeout: 80000,
      userAgent: userAgentString,
   });

   return browser;
  }
  catch (error) {
    throw error;
  }
}

async function runAuthLoginTest(loginUrl, AuthActions, username, password) {
  try {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: true,
      args: ['--disable-http2']
    });
    page = await browser.newPage();
    console.log("RUNNING AUTHENTICATION SCRIPT");
    console.log("AUTH URL: " ,loginUrl);
    console.log('Login Username: ',username, 'Login Password: ',password);

    const testPage = loginUrl;
    await page.setUserAgent(userAgentString);
    await page.authenticate({'username':username, 'password':password})
    await page.goto (testPage)
    await pa11y(testPage, {
       actions: AuthActions,
       browser,
       page: page,
       timeout: 80000,
       userAgent: userAgentString,
    });
    return browser;
  
  } catch (error) {
    throw error;
  }
}

async function testUrl(inBrowser, req, validatedActions) {
  console.log(`Testing url: ${req.body.url}`);
  try {
    let page = await inBrowser.newPage();
    const results = await pa11y(req.body.url, {
      browser: inBrowser,
      page: page,
      timeout: 120000,
      actions: validatedActions,
      userAgent: req.body.userAgentString
    });
    inBrowser.close();
    return results;

  } catch (error) {
    throw error;
  }

}