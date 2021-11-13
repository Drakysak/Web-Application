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
                console.log(req.body)
                res.redirect(req.url);
        }
});

app.get("/database", async (req,res) => {
        const client = await pool.connect();
        try{
                var dataQuery = await client.query("SELECT * FROM usersdata");

                var wb = xlsx.readFile("./Public/data/Data.xlsx");
                var ws = wb.Sheets["List1"];
                ws = {
                        '!ref': 'A1:J2',
                        A1: {
                                t: 's',
                                v: 'jmeno',
                                r: '<t xml:space="preserve">jmeno</t>',
                                h: 'jmeno',
                                w: 'jmeno'
                        },
                        B1: {
                                t: 's',
                                v: 'prijmeni',
                                r: '<t xml:space="preserve">prijmeni</t>',
                                h: 'prijmeni',
                                w: 'prijmeni'
                        },
                        C1: {
                                t: 's',
                                v: 'email',
                                r: '<t xml:space="preserve">email</t>',
                                h: 'email',
                                w: 'email'
                        },
                        D1: {
                                t: 's',
                                v: 'mechnaik_emektrotechnik',
                                r: '<t xml:space="preserve">mechnaik_emektrotechnik</t>',
                                h: 'mechnaik_emektrotechnik',
                                w: 'mechnaik_emektrotechnik'
                        },
                        E1: {
                                t: 's',
                                v: 'elektrikář',
                                r: '<t xml:space="preserve">elektrikář</t>',
                                h: 'elektrikář',
                                w: 'elektrikář'
                        },
                        F1: {
                                t: 's',
                                v: 'elektrikář_silnoproud',
                                r: '<t xml:space="preserve">elektrikář_silnoproud</t>',
                                h: 'elektrikář_silnoproud',
                                w: 'elektrikář_silnoproud'
                        },
                        G1: {
                                t: 's',
                                v: 'mechanik_seřizovač',
                                r: '<t xml:space="preserve">mechanik_seřizovač</t>',
                                h: 'mechanik_seřizovač',
                                w: 'mechanik_seřizovač'
                        },
                        H1: {
                                t: 's',
                                v: 'nastrojař',
                                r: '<t xml:space="preserve">nastrojař</t>',
                                h: 'nastrojař',
                                w: 'nastrojař'
                        },
                        I1:{
                                t: 's',
                                v: 'obraběč_kovů',
                                r: '<t xml:space="preserve">obraběč_kovů</t>',
                                h: 'obraběč_kovů',
                                w: 'obraběč_kovů'
                                                          
                        },
                        J1: {
                                t: 's',
                                v: 'strojní_mechanik',
                                r:'<t xml:space="preserve">strojní_mechanik</t>',
                                h: 'strojní_mechanik',
                                w: 'strojní_mechanik'
                        },
                        '!margins': {
                                left: 0.7,
                                right: 0.7,
                                top: 0.75,
                                bottom: 0.75,
                                header: 0.511811023622047,
                                footer: 0.511811023622047
                        }
                }
                var data = xlsx.utils.sheet_to_json(ws);

                var email = data.map((item) =>{

                        return item.email;
                });

                const emailQuery = await client.query("SELECT email FROM usersdata");

                console.log(emailQuery.rows);
                console.log(email);

                for(var i = 0; i < dataQuery.rows.length; i++){
                        data.push(dataQuery.rows[i]);     
                }

                console.log(data)
                console.log(xlsx.utils.sheet_add_json(ws, data));
                xlsx.writeFile(wb, "./Public/data/Data.xlsx");
                console.log(ws);

                const table = xlsx.utils.sheet_to_html(ws);
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