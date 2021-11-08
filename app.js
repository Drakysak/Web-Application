const { render } = require("ejs");
const { Pool } = require("pg");
const express = require("express");
const xlsx = require("xlsx");

const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
                rejectUnauthorized: false
        }
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended: false}))

app.use(express.static("Public"));
app.use("/css", express.static(__dirname + "Public/css"));
app.use("/js", express.static(__dirname + "Public/js"));
app.use("/img", express.static(__dirname + "Public/img"));
app.use("/data", express.static(__dirname + "Public/data"));

app.set("views", "./src/views");
app.set("view engine", "ejs");

var wb = xlsx.readFile("./Public/data/Data.xlsx");
var ws = wb.Sheets["List1"];
var data = xlsx.utils.sheet_to_json(ws);


app.get("/", (req, res) => {
        res.render("index");
});

app.post("/", async (req, res) => {
        const query = 'SELECT * FROM usersdata';
        try {
                const client = await pool.connect();
                const res = await client.query(query);
        
                for (let row of res.rows) {
                    console.log(row);
                }
            } catch (err) {
                console.error(err);
            }

        /*const emailStore = data.map((item) => {
                return item.Email
        });

        console.log(emailStore);

        const condition = emailStore.includes(req.body.Email);
        console.log(condition);

        if(condition || req.body.Jmeno == "" || req.body.Prijemni == "" || req.body.Emial == ""){
                console.log("něco je zle");
                res.redirect(req.url);
        }else{
                data.push(req.body);

                xlsx.utils.sheet_add_json(ws, data);
                xlsx.writeFile(wb, "./Public/data/Data.xlsx");
        
                res.redirect(req.url);
        }*/
});

app.get("/database", (req,res) => {
        const tables = xlsx.utils.sheet_to_html(ws);
        res.render("data", {
                dataTables : tables
        });
});

app.listen(port);