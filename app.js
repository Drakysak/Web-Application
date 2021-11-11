const { render } = require("ejs");
const { Pool } = require("pg");
const express = require("express");
const xlsx = require("xlsx");
const { json } = require("body-parser");

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
                const emailQuery = await client.query("SELECT email FROM usersdata");

                const condition = JSON.stringify(emailQuery.rows).includes(req.body.Email);

                if( condition || req.body.Jmeno == "" || req.body.Prijmeni == "" || req.body.Email == ""){
                        console.log("něco je špatně")
                }else{
                        await client.query("INSERT INTO usersdata VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [
                                req.body.Jmeno,
                                req.body.Prijmeni,
                                req.body.Email,
                                req.body.Mechanik_elektrtechnik,
                                req.body.Elektrikar,
                                req.body.Elektrikar_silnoproud,
                                req.body.Mechanik_serizovac,
                                req.body.Nastrojar,
                                req.body.Obrabec_kovu,
                                req.body.Strojni_mechanik
                        ]);

                        await client.query("INSERT INTO userquestions(email) VALUES($1)", [req.body.Email]);

                        const query = await client.query("SELECT * FROM usersdata");

                        console.log(query.rows);
                }
                
        }catch(err){
                console.log(err);
        }finally{
                client.release();
                res.redirect(req.url);
        }
});

app.get("/database", async (req,res) => {
        const client = await pool.connect();
        try{
                const dataQuery = await client.query("SELECT * FROM usersdata");

                const table = xlsx.utils.sheet_to_html(dataQuery.rows);

                res.render("data", {
                        dataTable : table
                });

        }catch(err){

                console.log(err);

        }finally{
                client.release();
                console.log("conection end");
        }
        /*const tables = xlsx.utils.sheet_to_html(ws);
        res.render("data", {
                dataTables : tables
        });*/
});

app.listen(port);