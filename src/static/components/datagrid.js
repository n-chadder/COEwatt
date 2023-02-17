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
                min-width: 60%;
                box-shadow: 5px 10px #ccc;
                background-color: #ccf;
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

        `
    }
    connectedCallback() {
        let data = [
            ['r1d1', 'r1d2', 'r1d3', 'r1d4'],
            ['r2d1', 'r2d2', 'r2d3', 'r2d4'],
            ['r3d1', 'r3d2', 'r3d3', 'r3d4'],
            ['<p>r4d1</p>', 'r4d2', 'r4d3', 'r4d4'],
            ['r5d1', 'r5d2', 'r5d3', 'r5d4 nnnnnnnnnnn'],
        ]
        this._createTable("Applications", ["Application Name", "Desc", "URL", "Owner", "gg", "gg"], data);
        // this._createButton("jim")
    }
    disconnectedCallback() {

    }

    _createTable(tableTitle, columnHeaders, tableRows) {
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

        for (let row in tableRows) {
            let newRow = tableBody.insertRow(row);
            for (let col in tableRows[row]) {
                let cell = newRow.insertCell(col);
                cell.innerHTML = tableRows[row][col];
            }

            console.log(columnHeaders.length);
            let cell = newRow.insertCell(columnHeaders.length - 2);
            cell.innerHTML = `<button><ion-icon name="trash"></ion-icon> Delete</button>`;
            cell.classList.add("center");

            cell = newRow.insertCell(columnHeaders.length - 1);
            cell.innerHTML = `<button><ion-icon name="pencil"></ion-icon> Edit</button>`;
            cell.classList.add("center");

            if (this._numberIsEven(row)) {
                newRow.classList.add("shaded");
            } else {
                newRow.classList.add("unshaded");
            }
        }
        let lastRow = tableBody.insertRow(tableRows.length);
        let cell = lastRow.insertCell(0);
        cell.outerHTML = `<td colspan=${tableRows.length + 1}>
        <div style="float: left;">
            <button><ion-icon name="play-back"></ion-icon> Beginning</button>
            <button><ion-icon name="play-skip-back"></ion-icon> Previous</button>
        </div>

        <div style="float: right;">
            <button><ion-icon name="play-skip-forward"></ion-icon> Next</button>
            <button><ion-icon name="play-forward"></ion-icon> End</button>
        </div>
    
        </td>`;


        console.log(table.outerHTML);
        this.shadowRoot.appendChild(table);
    }

    _createButton(commandText) {
        const button = document.createElement("button");
        button.innerHTML = `<button class="button-12" role="button">Button 12</button>`;
        this.shadowRoot.appendChild(button);

    }

    _numberIsEven(number) {
        if (number % 2 == 0) {
            return true;
        }

        return false;
    }
}

customElements.define('data-grid', DataGrid);

