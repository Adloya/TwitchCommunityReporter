//  _______       _ _       _           _____                                      _ _              _____                       _            
// |__   __|     (_) |     | |         / ____|                                    (_) |            |  __ \                     | |                    TM
//    | |_      ___| |_ ___| |__      | |     ___  _ __ ___  _ __ ___  _   _ _ __  _| |_ _   _     | |__) |___ _ __   ___  _ __| |_ ___ _ __   Badcode
//    | \ \ /\ / / | __/ __| '_ \     | |    / _ \| '_ ` _ \| '_ ` _ \| | | | '_ \| | __| | | |    |  _  // _ \ '_ \ / _ \| '__| __/ _ \ '__|
//    | |\ V  V /| | || (__| | | |    | |___| (_) | | | | | | | | | | | |_| | | | | | |_| |_| |    | | \ \  __/ |_) | (_) | |  | ||  __/ |   
//    |_| \_/\_/ |_|\__\___|_| |_|     \_____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|_|\__|\__, |    |_|  \_\___| .__/ \___/|_|   \__\___|_|   
//                                                                                        __/ |               | |                            
//                                                                                       |___/                |_|                            
// 2021 - Adloya -- MIT License
// Hello open-source world !


// Librairies
const fs = require('fs')
const express = require('express');
const webapp = express()
const bodyParser = require("body-parser")
const favicon = require("serve-favicon")
const path = require('path')

// Variables
const config = require("./json/config.json")
var replog_file = fs.createWriteStream(__dirname + '/logs/latest_reports.log', {
    flags: 'w'
});
const list = require("./json/list.json")

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();


// Log Functions
function CF(msg) {
    replog_file.write(msg + '\n');
    console.log(msg + '\n');
}

function F(msg) {
    replog_file.write(msg + '\n');
}

function C(msg) {
    console.log(msg + '\n');
}

function ERRLOG(error) {
    C(`[!] (err) An error occured : ` + error);
    F(`[!] Stopping the program beacause of an error. More informations in the console.`);
}


// Saving lists
function SaveLists() {
    fs.writeFile("./json/list.json", JSON.stringify(list, null, 4), (err) => {
        if (err) ERRLOG(err);
    });
}


// Configuration EJS
webapp.set('views', './views')
webapp.set('view engine', 'ejs')


// Formulaire
const urlencodedParser = bodyParser.urlencoded({
    extended: false
})


// EJS Init
setInterval(function () {
    webapp.get('/', (req, res) => {
        res.render('index')
    })
    webapp.get('/about', (req, res) => {
        res.render('about')
    })
    webapp.get('/report', (req, res) => {
        res.render('report')
    })
    webapp.get('/list', (req, res) => {
        res.render('list')
    })
}, 500);

webapp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


// Get report data
webapp.post('/report', urlencodedParser, [], (req, res) => {
    // Variables
    let who = "Who is reporting?";
    let username = "Who is reported?";
    let problem = "What is the probelem ?";
    let where = "Where is the problem?";
    let accounts = "Multiple Accounts ?";
    let more = "One more thing ?";
    let repetitive = "Is it repetitive ?";

    // Get data and put them into variables
    if (req.body.who) who = req.body.who
    if (req.body.username) username = req.body.username
    if (req.body.problem) problem = req.body.problem
    if (req.body.where) where = req.body.where
    if (req.body.accounts) accounts = req.body.accounts
    if (req.body.more) more = req.body.more
    if (req.body.repetitive) repetitive = req.body.repetitive
    if (more = "One more thing ?") more = "No more information"

    // Save data into the list (New report or repeting report)
    if (list[username]) {
        list[username]["reports"] += 1
        SaveLists();

        CF("[+] " + username + " was reported " + list[username]["reports"] + " times (" + username + "," + problem + "," + where + "," + more + "," + who + "," + repetitive + "," + accounts + ")")
    } else if (!list[username]) {
        list[username] = {}
        list[username]["username"] = username
        list[username]["reason"] = problem
        list[username]["where"] = where
        list[username]["description"] = more
        list[username]["reporter"] = who
        list[username]["repetitive"] = repetitive
        list[username]["accounts"] = accounts
        list[username]["firstdatetime"] = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
        list[username]["reports"] = 1
        SaveLists();

        CF("[+] " + username + " was reported for the first time (" + username + "," + problem + "," + where + "," + more + "," + who + "," + repetitive + "," + accounts + ")")
    }
})


// Save Lists and start the webapp
SaveLists();
webapp.listen(config.port, () => {
    CF(`[i] Webapp[LISTENING] on port ${config.port} `)
    if (config.debug) {
        C(`http://localhost:${config.port}`)
    }
});