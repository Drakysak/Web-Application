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

/*pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err) 
        process.exit(-1)
})*/

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
                console.log(req.body)
                res.redirect(req.url);
        }
});

app.get("/database", async (req,res) => {
        const client = await pool.connect();
        try{

                var usersDataQuery = await client.query("SELECT * FROM usersdata");
                var usersQuestionsQuery = await client.query("SELECT * FROM userquestions") 

                var wb = xlsx.readFile("./Public/data/Data.xlsx");
               
                var wsListOne = wb.Sheets["List1"];
                var wsListTwo = wb.Sheets["List2"];

                var dataOne = xlsx.utils.sheet_to_json(wsListOne);
                dataOne = [];

                var dataTwo = xlsx.utils.sheet_to_json(wsListTwo);
                dataTwo = []; 

                const emailQuery = await client.query("SELECT email FROM usersdata");

                for(var i = 0; i < usersDataQuery.rows.length; i++){
                        dataOne.push(usersDataQuery.rows[i]);
                        dataTwo.push(usersQuestionsQuery.rows[i]);
                }

                console.log(data)
                xlsx.utils.sheet_add_json(wsListOne, dataOne);
                xlsx.utils.sheet_add_json(wsListTwo, dataTwo)
                xlsx.writeFile(wb, "./Public/data/Data.xlsx");

                const tableOne = xlsx.utils.sheet_to_html(wsListOne);
                const tableTwo = xlsx.utils.sheet_to_html(wsListTwo);
                res.render("data", {
                        dataTableOne : tableOne,
                        dataTableTwo : tableTwo 
                });

        }catch(err){

                console.log(err);

        }finally{

                client.release();
                console.log("conection end");

        }
});

app.get("/questions/:id", (req, res) =>{
        res.render(req.params.id);
});

app.post("/questions/:id", async(req, res) =>{
        const client = pool.connect();
        try{
                if(req.body.email == "" ){
                        console.log("zdej email")
                }
        }catch(err){
                console.log(err);
        }finally{
                await client.release();
                console.log("connection end");
        }
});

app.listen(port);