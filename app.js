const express = require("express");
const port = 5011;
var app = express();
var mysql      = require('mysql');

var connection = mysql.createConnection({
  // host     : '172.18.0.24',
  host     : '172.18.0.63',
  user     : 'data_upload_user',
  password : 'uzair@0034',
  database : 'dev_playground'
});

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log('connected as id ' + connection.threadId);
// });


app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
    res.sendFile('views/index.html', {root: __dirname })
});
app.post("/upload", (req, res) => {
    var body = req.body;
    // console.log(body);
    var json = body.json;
    var tableName = body.tableName;
    var headers = Object.values(body.headers);
    // console.log(headers);
    var filtered = json.map(el => {
      var k ={};
      headers.forEach((header) => {
        k[header] = el[header]
      })
      return k
    })
    var values = filtered.map(el => Object.values(el));
    // console.log (values);
    let sql = "INSERT INTO ?? (??) VALUES ?";
    var inserts = [tableName, headers, [values]];
    sql = mysql.format(sql, inserts);
    console.log(sql);
    connection.query(sql, (error, results, fields) => {
        if (!error) {
          res.json("Uploaded");
        }
        else {
          console.log(error)
          res.json(error)
        }
      }
    );
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);