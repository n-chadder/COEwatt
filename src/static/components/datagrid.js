class DataGrid extends HTMLElement {
    constructor() {
        super();
        this._modalVisible = false;
        this._modal;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            .shaded {
                background-color: #eee;
            }
            .unshaded {
                background-color: white;
            }
            table {
                font-family: Helvetica, Arial, Sans-Serif;
                border-collapse:separate;
                border:solid #999 3px;
                padding: 7px;
                border-radius:6px;
                margin-left: auto;
                margin-right: auto;
                min-width: 100%;
                box-shadow: 5px 10px #ccc;
                background-color: #29527d;
            }

            tbody td{
                padding: 10px;
                border: solid black 1px;
                border-radius:6px;
            }

            thead {
                background-color: black;
                color: white;
                border: solid black 1px;
                height: 2em;
                text-align: center;
            }
            .button-12 {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 6px 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
                border-radius: 6px;
                border: none;

                background: #6E6D70;
                box-shadow: 0px 0.5px 1px rgba(0, 0, 0, 0.1), inset 0px 0.5px 0.5px rgba(255, 255, 255, 0.5), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.12);
                color: #DFDEDF;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
            }

            .button-12:focus {
              box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1px rgba(0, 0, 0, 0.1), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
                outline: 0;
            }

            .center {
                text-align: center;
            }
        </style>
        <div id='gridlocation'></div>
        `
    }
    connectedCallback() {
        this._createTable(this["tableName"], eval(this["dataheaders"]));
    }
    disconnectedCallback() {

    }

    static get observedAttributes() {
        return ['dataurl', 'dataheaders', 'data'];
    }

    attributeChangedCallback(attrName, oldVaule, newValue) {
        if (oldVaule !== newValue) {
            this[attrName] = newValue;
        }
    }

    get tableName() {
        return this.getAttribute("tableName");
    }

    get dataurl() {
        return this.getAttribute("dataurl");
    }

    set dataurl(value) {

        if (value) {
            this.setAttribute('dataurl', value);
        } else {
            this.removeAttribute('dataurl');
        }
    }

    get dataheaders() {
        return this.getAttribute("dataheaders");
    }

    set dataheaders(value) {

        if (value) {
            this.setAttribute('dataheaders', value);
        } else {
            this.removeAttribute('dataheaders');
        }
    }

    async _createTable(tableTitle, columnHeaders) {
        const response = await fetch(this["dataurl"]);
        const data = await response.json();
        this._data = data;
        this._render(data, tableTitle, columnHeaders);
    }

    async _filterTable(fieldName, value, tableTitle, columnHeaders) {
        let filterObj = null;
        if (this.getAttribute("dataurl") == "/applications"){
          filterObj= this._data.filter((item)=>item.Name.toUpperCase().includes(value.toUpperCase()));
        }
        else if (this.getAttribute("dataurl").includes("/pages")){
          filterObj= this._data.filter((item)=>item.Title.toUpperCase().includes(value.toUpperCase()));
        }
        
        this._render(filterObj, tableTitle, columnHeaders)

        this.shadowRoot.getElementById("searchBox").value=value;
        this.shadowRoot.getElementById("searchBox").focus()
    }

    async _render(data, tableTitle, columnHeaders) {
        let table = document.createElement('table');
        let caption = table.createCaption();
        caption.innerHTML = `<strong>${tableTitle}</strong>`;
        let header = table.createTHead();
        let headerRow = header.insertRow(0);
        let tableBody = table.createTBody();

        for (let columnHeaderIndex in columnHeaders) {
            let cell = headerRow.insertCell(columnHeaderIndex);
            cell.innerHTML = `<strong>${columnHeaders[columnHeaderIndex]}</string>`;
        }

        for (let row in data) {
            let newRow = tableBody.insertRow(row);
            for (let col in data[row]) {
                let condition =  (col == "id") || (col == "Name") || (col == "Desc") || (col == "Owner") || (col == "envID");
                if ((this.dataurl == '/applications') && !condition) {
                  continue;
                }
                let cell = newRow.insertCell(newRow.length);
                if (this.dataurl.includes('/pages') && (col == "ComplianceID")) {
                  if (data[row][col] == 1) {
                    cell.innerHTML = 'Compliant';
                  }
                  else if (data[row][col] == 2) {
                    cell.innerHTML = 'Non-Compliant';
                  }
                  else {
                    cell.innerHTML = "Unknown";
                  }
                  continue;
                }
                if (this.getAttribute("dataurl") == "/applications" && (col == "envID")) {
                  if (data[row][col] == 1) {
                    cell.innerHTML = "Prod";
                  }
                  else if (data[row][col] == 2) {
                    cell.innerHTML = "QA";
                  }
                  else {
                    cell.innerHTML = "Dev";
                  }
                  continue;
                }
                cell.innerHTML = data[row][col];
            }
            if (this.getAttribute("dataurl") == "/applications") {
                let cell = newRow.insertCell(columnHeaders.length - 3);
                let deleteButton = document.getElementById("deleteApp");
                let currentID = data[row]['id'];
    
                cell.innerHTML = `${deleteButton.innerHTML}`.replace('dataurl="/applications"', `dataurl="/applications/${currentID}"`).replace('action="#"', `action="/applications/${currentID}?_method=DELETE"`);
                cell.innerHTML = cell.innerHTML.replace('<h2>Are you sure you want to delete this application?</h2>', `<h2>Are you sure you want to delete this application? ${data[row]['Name']}</h2>`);
                cell.classList.add("center");
    
                let editButton = document.getElementById("editApp");
                cell = newRow.insertCell(columnHeaders.length - 2);
                cell.innerHTML = `${editButton.innerHTML}`.replace('dataurl="/applications"', `dataurl="/applications/${currentID}"`).replace('action="#"', `action="/applications/${currentID}?_method=PATCH"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="Name"', `<input class="form-control" type="text" id="Name" value="${data[row]['Name']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="desc"', `<input class="form-control" type="text" id="desc" value="${data[row]['Desc']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="owner"', `<input class="form-control" type="text" id="owner" value="${data[row]['Owner']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="LogInURL"', `<input class="form-control" type="text" id="LogInURL" value="${data[row]['LogInURL']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="Username"', `<input class="form-control" type="text" id="Username" value="${data[row]['Username']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="UsernameElement"', `<input class="form-control" type="text" id="UsernameElement" value="${data[row]['UsernameElement']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="Password"', `<input class="form-control" type="text" id="Password" value="${data[row]['Password']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="PasswordElement"', `<input class="form-control" type="text" id="PasswordElement" value="${data[row]['PasswordElement']}"`);
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="SubmitButtonElement"', `<input class="form-control" type="text" id="SubmitButtonElement" value="${data[row]['SubmitButtonElement']}"`);
                if (data[row]['envID']) {
                  cell.innerHTML = cell.innerHTML.replace('<option selected value="1">Prod</option>', '<option value="1">Prod</option>')
                  
                  if (data[row]['envID'] == 1) {
                    cell.innerHTML = cell.innerHTML.replace('<option value="1">Prod</option>', '<option selected value="1">Prod</option>');
                  }
                  else if (data[row]['envID'] == 2) {
                    cell.innerHTML = cell.innerHTML.replace('<option value="2">QA</option>', '<option selected value="2">QA</option>');
                  }
                  else if (data[row]['envID'] == 3) {
                    cell.innerHTML = cell.innerHTML.replace('<option value="3">Dev</option>', '<option selected value="3">Dev</option>');
                  }
                }
                
                cell.classList.add("center");

                cell = newRow.insertCell(columnHeaders.length - 1);
                cell.innerHTML = `<button id="button${currentID}" onclick="showAppModal(this.id)">Test</button>`;
                cell.classList.add("center");
            }
            else if (this.getAttribute("dataurl").includes("/pages")) {
              let cell = newRow.insertCell(columnHeaders.length - 3);
              let deleteButton = document.getElementById("deletePage");
              let currentID = data[row]['id'];
  
              cell.innerHTML = `${deleteButton.innerHTML}`.replace('dataurl="/pages"', `dataurl="/pages/${currentID}"`).replace('action="#"', `action="/pages/${currentID}?_method=DELETE"`);
              cell.innerHTML = cell.innerHTML.replace('<h2>Are you sure you want to delete this page?</h2>', `<h2>Are you sure you want to delete this page? ${data[row]['Title']}</h2>`);
              cell.classList.add("center");

              let editButton = document.getElementById("editPage");
              cell = newRow.insertCell(columnHeaders.length - 2);
              cell.innerHTML = `${editButton.innerHTML}`.replace('dataurl="/pages"', `dataurl="/pages/${currentID}"`).replace('action="#"', `action="/pages/${currentID}?_method=PATCH"`);
              cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="title"', `<input class="form-control" type="text" id="title" value="${data[row]['Title']}"`);
              cell.innerHTML = cell.innerHTML.replace('<input type="hidden" id="app" name="App">', `<input type="hidden" id="APP" name="App" value="${data[row]['AppID']}">`);
              cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="url"', `<input class="form-control" type="text" id="url" value="${data[row]['URL']}"`);
              cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="text" id="action"', `<input class="form-control" type="text" id="action" value="${data[row]['Action']}"`);
              if (data[row]['NeedAuth']) {
                cell.innerHTML = cell.innerHTML.replace('<input class="form-control" type="checkbox" id="NeedAuth" name="NeedAuth">', `<input class="form-control" type="checkbox" id="NeedAuth" name="NeedAuth" checked>`);
              }
              cell.classList.add("center");

              cell = newRow.insertCell(columnHeaders.length - 1);
              cell.innerHTML = `<button id="button${currentID}" onclick="showPageModal(this.id)">Test</button>`;
              cell.classList.add("center");
            }


            if (this._numberIsEven(row)) {
                newRow.classList.add("shaded");
            } else {
                newRow.classList.add("unshaded");
            }
        }
        let lastRow = tableBody.insertRow(data.length);
        let cell = lastRow.insertCell(0);
        cell.outerHTML = `<td colspan=${this.dataheaders.length}>
        <div style="float: left;">
            <button><ion-icon name="play-back"></ion-icon> Beginning</button>
            <button><ion-icon name="play-skip-back"></ion-icon> Previous</button>
        </div>

        <div style="float: right;">
            <button><ion-icon name="play-skip-forward"></ion-icon> Next</button>
            <button><ion-icon name="play-forward"></ion-icon> End</button>
        </div>
        </td>`;
        let label = document.createElement("label");
        if (this.getAttribute("dataurl") == "/applications") {
          label.innerHTML = "Filter By App Name&nbsp; "
        }
        else if (this.getAttribute("dataurl").includes("/pages")) {
          label.innerHTML = "Filter By Page Title&nbsp; "
        }
        label.style = "float: right"
        let filter = document.createElement("input");
        filter.style = "float: right; padding-left: 10px; margin-right:5px"
        filter.id = "searchBox";
        filter.type="text";
        filter.onkeyup = () => {

           this._filterTable("Name", filter.value, tableTitle, columnHeaders);
        }

        let gridlocation = this.shadowRoot.getElementById("gridlocation");
        gridlocation.innerHTML="";
        gridlocation.appendChild(filter);
        gridlocation.appendChild(label);
        gridlocation.appendChild(table);
    }


    _numberIsEven(number) {
        if (number % 2 == 0) {
            return true;
        }

        return false;
    }
}

customElements.define('data-grid', DataGrid);

