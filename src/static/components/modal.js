class Modal extends HTMLElement {
  constructor() {
      super();
      this._modalVisible = false;
      this._modal;
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
      <style>
          /* The Modal (background) */
          .modal {
              display: none; 
              position: fixed; 
              z-index: 1; 
              padding-top: 100px; 
              left: 0;
              top: 0;
              width: 100%; 
              height: 100%; 
              overflow: auto; 
              background-color: rgba(0,0,0,0.4); 
              font-family: Arial, Helvetica, sans-serif;
          }

          /* Modal Content */
          .modal-content {
              position: relative;
              background-color: #fefefe;
              margin: auto;
              padding: 0;
              border: 1px solid #888;
              width: 40%;
              box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
              -webkit-animation-name: animatetop;
              -webkit-animation-duration: 0.4s;
              animation-name: animatetop;
              animation-duration: 0.4s
          }

          /* Add Animation */
          @-webkit-keyframes animatetop {
              from {top:-300px; opacity:0} 
              to {top:0; opacity:1}
          }

          @keyframes animatetop {
              from {top:-300px; opacity:0}
              to {top:0; opacity:1}
          }

          /* The Close Button */
          .close {
              color: white;
              float: right;
              font-size: 28px;
              font-weight: bold;
          }

          .close:hover,
          .close:focus {
          color: #ccc;
          text-decoration: none;
          cursor: pointer;
          }

          .modal-header {
          padding: 2px 16px;
          background-color: #000066;
          color: white;
          }

          .modal-body {padding: 2px 16px; margin: 20px 2px}
          
          .add-page {
            text-align: left;
            padding-left: 30px;
            padding-top: 30px;
          }

      </style>
      <button><slot name="buttonText">Button Text</button>
      <div class="modal" id="id_modal">
          <div class="modal-content">
              <div class="modal-header">
                  <span class="close">&times;</span>
                  <slot name="header"><h1>Default text</h1></slot>
              </div>
              <div class="modal-body">
                  <slot name="formContent"><slot>
              </div>
          </div>
          <div class="modal-content" id="pages">
            <div id="addPageButton" class="add-page"></div>
            <div id="data-grid" class="modal-body"></div>
          </div>
      </div>
      `
  }

  // static get observedAttributes() {
  //     return ['itemId'];
  // }
  connectedCallback() {
      if (this.getAttribute("buttonDisplay") == "none") {
        this.shadowRoot.querySelector("button").style.display = "none";
      }
      this._modal = this.shadowRoot.querySelector(".modal");
      this.shadowRoot.querySelector("button").addEventListener('click', this._showModal.bind(this));
      this.shadowRoot.querySelector(".close").addEventListener('click', this._hideModal.bind(this));
      // console.log(this.getAttribute("dataurl"));
  }
  disconnectedCallback() {
      this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
      this.shadowRoot.querySelector(".close").removeEventListener('click', this._hideModal);
  }
  _showModal() {
      if (this.getAttribute("id") == "addButtonModal" || this.getAttribute("id") == "editAppModal") {
        let modal_div = this.shadowRoot.getElementById("id_modal");
        modal_div.style.position = 'absolute';
      }
      if (this.getAttribute("dataurl").includes('/applications/')) {
        // regex to isolate the number from dataurl - this is the app id
        var regex = /\d+/g;
        let appID = this.getAttribute("dataurl").match(regex);
        let gridDiv = this.shadowRoot.getElementById("data-grid");
        let dataGridTemplate = document.getElementById("dataGrid");
        // use query params to get the pages for the current app
        gridDiv.innerHTML = dataGridTemplate.innerHTML.replace(`dataurl="/pages"`, `dataurl="/pages/?appID=${appID}"`);


        // add a button allowing adding pages to current app
        let buttonDiv = this.shadowRoot.getElementById("addPageButton");
        let addPageTemplate = document.getElementById("editPage");
        // addPageTemplate = addPageTemplate.innerHTML.replace('<form id="UpdatePageForm" action="#" method="post">', `<form id="AddPageForm" action="pages" method="post">`);
        buttonDiv.innerHTML = addPageTemplate.innerHTML.replace('<form id="UpdatePageForm" action="#" method="post">', `<form id="AddPageForm" style="text-align: center" action="pages" method="post">`);
        buttonDiv.innerHTML = buttonDiv.innerHTML.replace('<span slot="buttonText">Edit </span>', '<span slot="buttonText">Add Page</span>');
        buttonDiv.innerHTML = buttonDiv.innerHTML.replace('<p slot="header">Edit Page</p>', '<p slot="header">Add Page</p>');
        buttonDiv.innerHTML = buttonDiv.innerHTML.replace('<input type="hidden" id="app" name="App">', `<input type="hidden" id="APP" name="App" value="${appID}">`)
      }
      else{
        let pagesDiv = this.shadowRoot.getElementById("pages");
        pagesDiv.style.display = "none";
      }
      this._modalVisible = true;
      this._modal.style.display = 'block';
  }
  _hideModal() {
      if (this.id == "testAppModal" || this.id == "testPageModal") {
        let close = window.confirmExit(this.id);
        if (!close) {   return;   }
      }
      // console.log(this.shadowRoot.innerHTML);
      this._modalVisible = false;
      this._modal.style.display = 'none';
  }
}

customElements.define('pp-modal', Modal);
