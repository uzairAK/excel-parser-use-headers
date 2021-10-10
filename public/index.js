'use strict';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

function xlsToJson(oEvent, cb) {
	
    // Get The File From The Input
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    // Create A File Reader HTML5
    var reader = new FileReader();
    
    // Ready The Event For When A File Gets Selected
    reader.onload = function(e) {
        var data = e.target.result;
        var cfb = XLS.CFB.read(data, {type: 'binary'});
        var wb = XLS.parse_xlscfb(cfb);
        var sheetName = wb.SheetNames[0];
        var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);   
        var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);   
        cb(oJS);
        // Loop Over Each Sheet
        // wb.SheetNames.forEach(function(sheetName) {
        //     // Obtain The Current Row As CSV
        //     var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);   
        //     var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);   						

        //     //$("#my_file_output").html(sCSV);
        //     call(oJS);
        // });
    };
    
    // Tell JS To Start Reading The File.. You could delay this if desired
    reader.readAsBinaryString(oFile);
}

var excelToJSON = function (oEvent, display, cb) {
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    // Create A File Reader HTML5
    var reader = new FileReader();
    
    // Ready The Event For When A File Gets Selected
    reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
            type: 'binary'
        });
        let columnHeaders = [];
        var sheetName = workbook.SheetNames[0];
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (display) {
            var XL_html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
            $("#test").html(XL_html);
            $("#test > table").addClass("table")
        }
        // Header
        var worksheet = workbook.Sheets[sheetName];
        for (let key in worksheet) {
            let regEx = new RegExp("^\(\\w\)\(1\){1}$");
            if (regEx.test(key) == true) {
                columnHeaders.push(worksheet[key].v);
            }
        }
        // var json_object = JSON.stringify(XL_row_object);
        cb(columnHeaders, XL_row_object);
        
        // workbook.SheetNames.forEach(function (sheetName) {
        //     // Here is your object
        //     var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        //     var json_object = JSON.stringify(XL_row_object);
        //     console.log(json_object);

        // })

    };

    reader.onerror = function (ex) {
        console.log(ex);
    };

    reader.readAsBinaryString(oFile);
};

var filterObj = function( obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

function App() {
    const [state, setState] = React.useState(0);
    const [status, setStatus] = React.useState("");
    const [tableName, setTableName] = React.useState("");
    const [columns, setColumns] = React.useState([]);
    const [headers, setHeader] = React.useState([]);
    const [json, setJson] = React.useState([]);
    function fileReader (e) {
        // xlsToJson(e, k => console.log(k));
        excelToJSON(e, false, (columns, json) => {
            setColumns(columns);
            setJson(json);
        });
    }
    function log(val) {
        console.log(val);
    }
    function submit() {
        if (tableName == "") {
            setStatus("Table name is empty");
            return;
        }
        if (json == []) {
            setStatus("No data found");
            return;
        }
        if (columns == []) {
            setStatus("No columns found");
            return;
        }
        setStatus("Uploading")
        upload();
    }
    function upload() {
        (async () => {
            try {
                const rawResponse = await fetch('/upload', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({tableName, columns, headers, json})
                });
                const content = await rawResponse.json();
                setStatus(content);
                // console.log(content);
            }
            catch(err) {
                setStatus(err);
            }
          })();
    }
    function updateHeader(e, i) {
        // setHeader([...headers,{[i]: e["target"]["value"]}])
        setHeader({...headers, [i]: e["target"]["value"]})
        // let filtered = Object.values(headers)
        //   .filter(key => key != "")
        // //   .reduce((obj, key) => {
        // //     obj[key] = `headers[key]`;
        // //     return obj;
        // //   }, {});
        // console.log(filtered);
    }
    return (
        <div className="d-flex justify-content-center m-3">
            <div className="card p-3" style={{width: "40rem"}}>
                <h1 className="text-center">Excel Parser</h1>
                <label htmlFor="tableName">Table name:</label>
                <input className="form-control mb-2" type="text" name="tableName" onChange={(e) => setTableName(e.target.value)} />
                <label htmlFor="excelFile">Excel file:</label>
                <input className="form-control mb-2" type="file" name="excelFile" onChange={(e) => fileReader(e)} />
                <h5>Columns</h5>
                <div className="columns">
                    {
                        columns && columns.map((column, i) => {
                            return (
                                <div key={column} className="row">
                                    <div className="col">
                                        <span>{i}: </span>
                                        <select name={`${i}`} onChange={ (e) => updateHeader(e, i)}>
                                            <option value=""></option>
                                            {
                                                columns.map((column, j) => (
                                                    <option key={`${column}-${i}`} value={column}>{column}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <button className="btn" onClick={submit}>Upload data</button>
                <p>{typeof status == "string" ? status : JSON.stringify(status)}</p>
            </div>

        </div>
    );
}



