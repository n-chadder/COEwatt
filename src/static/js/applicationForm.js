const addPageButton = document.querySelector(".addPageButton");
const addApplicationForm = document.querySelector("#addApplicationForm");
const updateApplicationForm = document.querySelector("#UpdateApplicationForm");
addPageButton.addEventListener("click", cloneAddPageForm);
if (addApplicationForm) {
    // addApplicationForm will be undefined if we're in the update app form page.
    // Vice versa. In either case running both of these lines will cause a TypeError.
    // So, the conditional helps to aviod that. 
    addApplicationForm.addEventListener("click", removePage);
}
else{
    updateApplicationForm.addEventListener("click", removePage); // maybe I can make a call to api instead in this case?
}

function removePage(e) {
    if (e.target.matches(".removePage")) {
        e.target.parentNode.parentNode.remove();
    }
    return;
}

function cloneAddPageForm() {
    let numPages  = document.querySelectorAll(".addPage").length;
    let newFormID = numPages += 1;
    let newForm   = buildForm(newFormID);
    document.querySelector(".AddPageButtonDiv").insertAdjacentHTML("beforebegin", newForm);
}

function buildForm(id) {
    let form =  `<div class="content-section addPage" style="width: 90%" id="page${id}">
                    <div class="form-group">
                        <label>Name</label>
                        <input class="form-control" type="text" id="page${id}-name" placeholder="Page name" style="width: 100%" name="page-name">
                    </div>
                    <div class="form-group">
                        <label>URL</label>
                        <input class="form-control" type="text" id="page${id}-URL" placeholder="Page URL" style="width: 100%" name="page-url">
                    </div>
                    <div class="form-group">
                        <label>Actions</label>
                        <input class="form-control" type="text" id="page${id}-action" placeholder="Page action" style="width: 100%" name="page-actions">
                    </div>
                    <div class="form-group">
                        <label>Authentication </label>
                        <input class="form-control" type="text" id="page${id}-auth" placeholder="Page authentication" style="width: 100%" name="page-auth">
                    </div>
                    <div class="form-group"> 
                        <button class="btn btn-danger removePage" type="button">Remove Page</button>
                    </div>
                </div>`;
    return form;
}
