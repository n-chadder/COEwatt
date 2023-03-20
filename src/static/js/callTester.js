let testAppModal = document.getElementById("testAppModal");
let testPageModal = document.getElementById("testPageModal");
let progress = document.getElementById("progress");
let progressBar = document.getElementById("progress-bar");
let pageProgress = document.getElementById("page-progress");
let pageProgressBar = document.getElementById("page-progress-bar");
let testAppCancel = document.getElementById("testAppCancel");
let testPageCancel = document.getElementById("testPageCancel");
let TestInProgress = false;
let regex = /\d+/g;

testAppCancel.addEventListener('click', cancelAppTest);
testPageCancel.addEventListener('click', cancelPageTest);

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

async function testApplication(appID){
  progress.style.display = 'none';
  let testingAppName = document.getElementById("testingAppName");
  let currAppURL = document.getElementById("currAppURL");
  let id = appID.match(regex);

  let response = await fetch(`/applications/${id}`);
  let data = await response.json();
  let pages = data.Pages;
  testingAppName.innerHTML = `Testing: ${data.Name}`;

  testAppModal._showModal();

  // this should not happen but just in case
  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
  }
  TestInProgress = true;
  for (let i = 0; i < pages.length; i++) {
    if (!TestInProgress) {   
      currAppURL.innerHTML = 'Test cancelled';
      return;   
    }
    currAppURL.innerHTML = `Currently testing URL: ${pages[i].URL}`;
    // call tester
    await delay(1000);
    let percentDone = Math.round(((i+1) / pages.length) * 100); 
    // testingAppName.innerHTML = `Testing: ${data.Name} - ${percentDone.toString()}% Done`;
    progressBar.ariaValueNow = percentDone;
    progressBar.style.width = `${percentDone.toString()}%`;
    progressBar.innerHTML = ` ${percentDone.toString()}%`;
    progress.style.display = 'block';
  }
  TestInProgress = false;
  if (pages.length == 0) {
    currAppURL.innerHTML = 'No Pages To Test';
    return;  
  }

  currAppURL.innerHTML = 'Test Complete';
  return;
}

// this gets a bit weird when a test is cancelled and
// another is started right away.
async function testPage(pageID) {
  pageProgress.style.display = 'none';
  let id = pageID.match(regex);
  let currPageURL = document.getElementById("currPageURL");
  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
  }
  // move modal to the front of the elements
  testPageModal.style.zIndex = 9999;
  testPageModal.style.position = 'relative';

  let response = await fetch(`/pages/${id}`);
  let data = await response.json();
  currPageURL.innerHTML = `Testing URL: ${data.URL}`;
  testPageModal._showModal();
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