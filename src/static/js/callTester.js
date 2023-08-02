let testAppModal = document.getElementById("testAppModal");
let testPageModal = document.getElementById("testPageModal");
let progress = document.getElementById("progress");
let progressBar = document.getElementById("progress-bar");
let pageProgress = document.getElementById("page-progress");
let pageProgressBar = document.getElementById("page-progress-bar");
let testAppCancel = document.getElementById("testAppCancel");
let testPageCancel = document.getElementById("testPageCancel");
let WCAGSelectDivApp = document.getElementById("WCAGSelectDivApp");
let WCAGAppSelect = document.getElementById("WCAGAppSelect");
let testAppStart = document.getElementById("testAppStart");
let currAppURL = document.getElementById("currAppURL");
let testAppHelpText = document.getElementById("testAppHelpText");
let currPageURL = document.getElementById("currPageURL");
let WCAGSelectDivPage = document.getElementById("WCAGSelectDivPage");
let WCAGPageSelect = document.getElementById("WCAGPageSelect");
let testPageStart = document.getElementById("testPageStart");
let testPageHelpText = document.getElementById("testPageHelpText");
let testPageReport = document.getElementById("testPageReport");
let testAppReport = document.getElementById("testAppReport");
let id_app_auth_data = document.getElementById("id_app_auth_data");
let id_submit_app_auth_data = document.getElementById("id_submit_app_auth_data");
let id_app_test_loginurl = document.getElementById("id_app_test_loginurl");
let id_app_test_Username = document.getElementById("id_app_test_Username");
let id_app_test_usernameElement = document.getElementById("id_app_test_usernameElement");
let id_app_test_Password = document.getElementById("id_app_test_Password");
let id_app_test_PasswordElement = document.getElementById("id_app_test_PasswordElement");
let id_app_test_SubmitButtonElement = document.getElementById("id_app_test_SubmitButtonElement");
let id_app_test_additionalActions = document.getElementById("id_app_test_additionalActions");
let id_page_auth_data = document.getElementById("id_page_auth_data");
let id_submit_page_auth_data = document.getElementById("id_submit_page_auth_data");
let id_page_test_loginurl = document.getElementById("id_page_test_loginurl");
let id_page_test_Username = document.getElementById("id_page_test_Username");
let id_page_test_usernameElement = document.getElementById("id_page_test_usernameElement");
let id_page_test_Password = document.getElementById("id_page_test_Password");
let id_page_test_PasswordElement = document.getElementById("id_page_test_PasswordElement");
let id_page_test_SubmitButtonElement = document.getElementById("id_page_test_SubmitButtonElement");
let id_page_test_additionalActions = document.getElementById("id_page_test_additionalActions");
let id_app_test_saveAuth = document.getElementById("id_app_test_saveAuth");
let TestInProgress = false;
let regex = /\d+/g;
let currAppData = null;
let currPageData = null;
let appAuthData = null;

testAppCancel.addEventListener('click', cancelAppTest);
testPageCancel.addEventListener('click', cancelPageTest);
testAppStart.addEventListener('click', testApplication);
testPageStart.addEventListener('click', testPage);

function cancelAppTest(e) {
  if (confirmExit()) {
    testAppModal._hideModal();
  }
}

function cancelPageTest(e) {
  if (confirmExit()) {
    testPageModal._hideModal();
  }
}

async function showAppModal(appID) {
  resetAppModal();
  let testingAppName = document.getElementById("testingAppName");

  let id = appID.match(regex);

  let response = await fetch(`/applications/${id}`);
  let data = await response.json();
  testingAppName.innerHTML = `Testing: ${data.Name}`;
  currAppData = data;
  if (data.Pages.length == 0) {
    currAppURL.innerHTML = 'No Pages To Test';
    currAppURL.style.color = 'red';
    WCAGSelectDivApp.style.display = 'none';
    testAppStart.disabled = true;
  }

  testAppModal._showModal();

}

async function testApplication(appID){

  WCAGSelectDivApp.style.display = 'none';
  testAppHelpText.style.display = 'none';
  let WCAG_version = WCAGAppSelect.value; // selected WCAG version
  console.log(WCAG_version);

  // this should not happen but just in case
  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
    return;
  }
  TestInProgress = true;
  testAppStart.disabled = true;
  let TestRunID = null;
  for (let i = 0; i < currAppData.Pages.length; i++) {
    let authenticationData = {
      "uName": "",
      "uNameElement": "",
      "uPword": "",
      "uPwordElement": "",
      "submitNameID": "",
      "loginUrl": "",
      "additionalActions": "" 
    };   
    if (!TestInProgress) {   
      currAppURL.innerHTML = 'Test cancelled';
      return;   
    }
    else if (currAppData.Pages[i].NeedAuth) {
      if (appAuthData == null) {
        await new Promise(resolve => {
          id_submit_app_auth_data.addEventListener('click', resolve);
          id_app_auth_data.style.display = '';
        });
        authenticationData.uName = id_app_test_Username.value;
        authenticationData.uNameElement = id_app_test_usernameElement.value;
        authenticationData.uPword = id_app_test_Password.value;
        authenticationData.uPwordElement = id_app_test_PasswordElement.value;
        authenticationData.submitNameID = id_app_test_SubmitButtonElement.value;
        authenticationData.loginUrl = id_app_test_loginurl.value;
        authenticationData.additionalActions = id_app_test_additionalActions.value;
        if (id_app_test_saveAuth.checked) {
          appAuthData = JSON.parse(JSON.stringify(authenticationData));
        }
        id_app_auth_data.style.display = 'none';
      }
      else {
        authenticationData = JSON.parse(JSON.stringify(appAuthData));
      }
    }
    currAppURL.innerHTML = `Currently testing URL: ${currAppData.Pages[i].URL}`;

    let data = {
      "PageID": currAppData.Pages[i].id,
      "pageURL": currAppData.Pages[i].URL,
      "WCAGVersion": WCAG_version,
      "NeedAuth": currAppData.Pages[i].NeedAuth,
      "Action": currAppData.Pages[i].Action,
      "TestRunID": TestRunID,
      "AppID": currAppData.id,
      "authenticationData": authenticationData
    }

    try {
      let response = await fetch('/testrun', {
        method: "POST", 
        mode: "cors",
        cache: "no-store", // esponse should not be cached by the browser, a new request should be made to the server every time the request is made
        credentials: "same-origin", // browser should include cookies, authentication credentials or client-side SSL certificates with the request only if the
                                    // request is being made to the same origin as the requesting page.
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "manual", // do not automatically follow HTTP redirects
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      if (!response.ok) {
        currAppURL.innerHTML = 'Something Went wrong while Testing URL: ' + currAppData.Pages[i].URL + '\n Please refresh this page and try again';
        currAppURL.style.color = 'red';
        TestInProgress = false;
        currAppData = null;
        return;
      }
      else if (response.ok) {
        let jsonResponse = await response.json();
        TestRunID = jsonResponse.TestRunID;
      }
    }
    catch {
      currAppURL.innerHTML = 'Something Went wrong while Testing URL: ' + currAppData.Pages[i].URL + '\n Please refresh this page and try again';
      currAppURL.style.color = 'red';
      TestInProgress = false;
      currAppData = null;
      return;
    }

    let percentDone = Math.round(((i+1) / currAppData.Pages.length) * 100); 
    progressBar.ariaValueNow = percentDone;
    progressBar.style.width = `${percentDone.toString()}%`;
    progressBar.innerHTML = ` ${percentDone.toString()}%`;
    progress.style.display = 'block';
  }
  TestInProgress = false;

  currAppURL.innerHTML = 'Test Complete';
  testAppReport.setAttribute('href', `/testrun/${TestRunID}`);
  testAppReport.innerHTML = 'View Results';
  testAppReport.style.display = 'block';
  appAuthData = null;
  currAppData = null;
  return;
}

async function showPageModal(pageID) {
  resetPageModal();
  let id = pageID.match(regex);

  // move modal to the front of the elements
  testPageModal.style.zIndex = 9999;
  testPageModal.style.position = 'relative';

  let response = await fetch(`/pages/${id}`);
  let data = await response.json();
  currPageURL.innerHTML = `Testing URL: ${data.URL}`;
  currPageData = data;
  testPageModal._showModal();

}

async function testPage(pageID) {

  let authenticationData = {
    "uName": "",
    "uNameElement": "",
    "uPword": "",
    "uPwordElement": "",
    "submitNameID": "",
    "loginUrl": "",
    "additionalActions": "" 
  };   

  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
    return;
  }
  WCAGSelectDivPage.style.display = 'none';
  testPageHelpText.style.display = 'none';
  testPageStart.disabled =  true;
  if (currPageData.NeedAuth) {
    await new Promise(resolve => {
      id_submit_page_auth_data.addEventListener('click', resolve);
      id_page_auth_data.style.display = '';
    });
    authenticationData.uName = id_page_test_Username.value;
    authenticationData.uNameElement = id_page_test_usernameElement.value;
    authenticationData.uPword = id_page_test_Password.value;
    authenticationData.uPwordElement = id_page_test_PasswordElement.value;
    authenticationData.submitNameID = id_page_test_SubmitButtonElement.value;
    authenticationData.loginUrl = id_page_test_loginurl.value;
    authenticationData.additionalActions = id_page_test_additionalActions.value;
    id_page_auth_data.style.display = 'none';
  }
  let WCAG_version = WCAGPageSelect.value;

  TestInProgress = true;
  pageProgressBar.ariaValueNow = '0';
  pageProgressBar.style.width  = '0%';
  pageProgressBar.innerHTML = '0%'
  pageProgress.style.display = 'block';

  // build json post data for calling tester
  let data = {
    "PageID": currPageData.id,
    "pageURL": currPageData.URL,
    "WCAGVersion": WCAG_version,
    "NeedAuth": currPageData.NeedAuth,
    "Action": currPageData.Action,
    "TestRunID": null,
    "AppID": currPageData.AppID,
    "authenticationData": authenticationData
  }
  try {
    let response = await fetch('/testrun', {
      method: "POST", 
      mode: "cors", 
      cache: "no-store", 
      credentials: "same-origin",
                                 
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "manual", 
      referrerPolicy: "no-referrer", 
      body: JSON.stringify(data), 
    });
    if (!response.ok) {
      currPageURL.innerHTML = 'Something Went wrong while Testing URL: ' + currPageData.URL + '\n Please refresh this page and try again';
      currPageURL.style.color = 'red';
      TestInProgress = false;
    }
    else {
      let jsonResponse = await response.json();
      currPageURL.innerHTML = 'Test Completed'; 
      testPageReport.setAttribute('href', `/testrun/${jsonResponse.TestRunID}`);
      testPageReport.innerHTML = 'View Results';
      testPageReport.style.display = 'block';
      pageProgressBar.ariaValueNow = '100';
      pageProgressBar.style.width = '100%';
      pageProgressBar.innerHTML = '100%'
      TestInProgress = false;
    }
  }
  catch {
    currPageURL.innerHTML = 'Something Went wrong while Testing URL: ' + currPageData.URL + '\n Please refresh this page and try again';
    currPageURL.style.color = 'red';
    TestInProgress = false;
  }
  currPageData = null;
  return;
}

function confirmExit(id){
  if (!TestInProgress) {
    return true;
  }
  let choice = confirm("Closing this modal will stop the tesing in progress. \nAre you sure you want to continue?");
  if (choice == true) {
    TestInProgress = false;
    return true;
  }
  return false;
}

window.addEventListener('beforeunload', function (e) {
  if (!TestInProgress)   {   return;   }
  e.preventDefault();
  e.returnValue = '';
});

function resetAppModal(){
  testAppReport.setAttribute('href', 'javascript: return null;');
  testAppReport.style.display = 'none';
  testAppReport.innerHTML = 'empty link';
  WCAGSelectDivApp.style.display = '';
  progress.style.display = 'none';
  testAppStart.disabled = false;
  currAppURL.innerHTML = '';
  currAppURL.style.color = '';
  currAppData = null;
  testAppHelpText.style.display = '';
  testAppStart.disabled = false;
  id_app_auth_data.style.display = 'none';
  appAuthData = null;
}

function resetPageModal() {
  testPageReport.setAttribute('href', 'javascript: return null;');
  testPageReport.style.display = 'none';
  testPageReport.innerHTML = 'empty link';
  pageProgress.style.display = 'none';
  currPageData = null;
  WCAGSelectDivPage.style.display = '';
  testPageHelpText.style.display = '';
  testPageStart.disabled = false;
  id_page_auth_data.style.display = 'none';
}