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
let TestInProgress = false;
let regex = /\d+/g;
let currAppData = null;
let currPageData = null;

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

const delay = ms => new Promise(res => setTimeout(res, ms));

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
  let TestRunID = null;
  for (let i = 0; i < currAppData.Pages.length; i++) {
    console.log(`i=${i}, TestRunID=${TestRunID}`);
    if (!TestInProgress) {   
      currAppURL.innerHTML = 'Test cancelled';
      return;   
    }
    currAppURL.innerHTML = `Currently testing URL: ${currAppData.Pages[i].URL}`;

    let data = {
      "PageID": currAppData.Pages[i].id,
      "pageURL": currAppData.Pages[i].URL,
      "WCAGVersion": WCAG_version,
      "NeedAuth": currAppData.Pages[i].NeedAuth,
      "Action": currAppData.Pages[i].Action,
      "TestRunID": TestRunID,
      "AppID": currAppData.id
    }

    try {
      let response = await fetch('/testrun', {
        method: "POST", 
        mode: "cors", // not sure
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

// this gets a bit weird when a test is cancelled and
// another is started right away.
async function testPage(pageID) {

  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
    return;
  }

  WCAGSelectDivPage.style.display = 'none';
  testPageHelpText.style.display = 'none';
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
    "AppID": currPageData.AppID
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
}

function resetPageModal() {
  testPageReport.setAttribute('href', 'javascript: return null;');
  testPageReport.style.display = 'none';
  testPageReport.innerHTML = 'empty link';
  pageProgress.style.display = 'none';
  currPageData = null;
  WCAGSelectDivPage.style.display = '';
  testPageHelpText.style.display = '';
}