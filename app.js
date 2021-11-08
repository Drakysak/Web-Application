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

pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err) // your callback here
        process.exit(-1)
})

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
        const client = await pool.connect();
        try{
                const query = await client.query("SELECT * FROM usersdata");
                console.log(query.rows);

        }catch(err){

                console.log(err);

        }finally{

                client.release();

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