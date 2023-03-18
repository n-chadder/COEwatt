let testAppModal = document.getElementById("testAppModal");
let testPageModal = document.getElementById("testPageModal");
let TestInProgress = false;
let regex = /\d+/g;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function testApplication(appID){
  let testingAppName = document.getElementById("testingAppName");
  let currAppURL = document.getElementById("currAppURL");
  let id = appID.match(regex);

  let response = await fetch(`/applications/${id}`);
  let data = await response.json();
  let pages = data.Pages;
  testingAppName.innerHTML = `Testing: ${data.Name}`;

  testAppModal._showModal();

  if (TestInProgress) {
    alert('There is already a test in progress. Please wait it is done.');
  }
  TestInProgress = true;
  for (let i = 0; i < pages.length; i++) {
    if (!TestInProgress) {   
      currAppURL.innerHTML = 'Test cancelled';
      return;   
    }
    console.log(`page: ${pages[i].Title}, TestInProgress: ${TestInProgress}`);
    currAppURL.innerHTML = `Currently testing URL: ${pages[i].URL}`;
    // call tester
    await delay(1000);
    let percentDone = Math.round(((i+1) / pages.length) * 100); 
    testingAppName.innerHTML = `Testing: ${data.Name} - ${percentDone.toString()}% Done`;
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
  // call tester
  await delay(5000);

  currPageURL.innerHTML = 'Test Completed';
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