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
let TestInProgress = false;
let regex = /\d+/g;
let currAppPages = null;
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
  let pages = data.Pages;
  testingAppName.innerHTML = `Testing: ${data.Name}`;
  currAppPages = pages;
  if (pages.length == 0) {
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
  }
  TestInProgress = true;
  for (let i = 0; i < currAppPages.length; i++) {
    if (!TestInProgress) {   
      currAppURL.innerHTML = 'Test cancelled';
      return;   
    }
    currAppURL.innerHTML = `Currently testing URL: ${currAppPages[i].URL}`;
    // call tester
    await delay(1000);
    let percentDone = Math.round(((i+1) / currAppPages.length) * 100); 
    progressBar.ariaValueNow = percentDone;
    progressBar.style.width = `${percentDone.toString()}%`;
    progressBar.innerHTML = ` ${percentDone.toString()}%`;
    progress.style.display = 'block';
  }
  TestInProgress = false;

  currAppURL.innerHTML = 'Test Complete';
  
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
  }

  WCAGSelectDivPage.style.display = 'none';
  testPageHelpText.style.display = 'none';
  let WCAG_version = WCAGPageSelect.value;

  TestInProgress = true;
  pageProgressBar.ariaValueNow = '0';
  pageProgressBar.style.width  = '0%';
  pageProgressBar.innerHTML = '0%'
  pageProgress.style.display = 'block';
  // call tester
  await delay(5000);

  currPageURL.innerHTML = 'Test Completed';
  pageProgressBar.ariaValueNow = '100';
  pageProgressBar.style.width = '100%';
  pageProgressBar.innerHTML = '100%'
  TestInProgress = false;
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
  WCAGSelectDivApp.style.display = '';
  progress.style.display = 'none';
  testAppStart.disabled = false;
  currAppURL.innerHTML = '';
  currAppURL.style.color = '';
  currAppPages = null;
  testAppHelpText.style.display = '';
}

function resetPageModal() {
  pageProgress.style.display = 'none';
  currPageData = null;
  WCAGSelectDivPage.style.display = '';
  testPageHelpText.style.display = '';
}