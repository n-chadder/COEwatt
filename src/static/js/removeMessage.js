// code to remove any messages in the page after items are added/deleted/edited


let message = document.getElementById("id_message");

if (message) {
  removeMessage();
}

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function removeMessage() {
  await delay(7);
  message.style.display = 'none';
  console.log("here");
} 