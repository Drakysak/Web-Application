const xlsx = require("xlsx");

var wb = xlsx.readFile("./data/Data.xlsx");

var ws = wb.Sheets["List1"];

var data = xlsx.utils.sheet_to_json(ws);

let click = function(){
    let jmenoStore = document.getElementById("jmeno").value;
    let prijmeniStore = document.getElementById("prijmeni").value;
    let emailStore = document.getElementById("emial").value;

    console.log(jmenoStore);
    console.log(prijmeniStore);
    console.log(emailStore);

    data.push({
        "Emial" : emailStore,
        "Jmeno" : jmenoStore,
        "Prijmeni" : prijmeniStore
    });

    xlsx.utils.sheet_add_json(ws, data);
    xlsx.writeFile(wb, "./data/Data.xlsx");
}

