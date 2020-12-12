const express = require("express");
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

app.set('view engine', 'ejs');

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
}));

//parse POST parameters
app.use(express.urlencoded({extended: true}));

//routes
app.get("/", function(req, res){
    res.render("index");
});

app.post("/", async function(req, res){
    let username = req.body.username;
    let password = req.body.password;
    
    let result = await checkUsername(username);
    console.dir(result);
    let hashedPwd = "";
    
    if (result.length > 0){
        hashedPwd = result[0].password;
    }
    
    let passwordMatch = await checkPassword(password, hashedPwd);
    console.log("passwordMatch: " + passwordMatch);
    
    if (passwordMatch){
        req.session.authenticated = true;
        res.render("welcome");
    } else{
        res.render("index", {"loginError":true});
    }
});

app.get("/myAccount", isAuthenticated, function(req, res){
    res.render("account");
});

app.get("/logout", function(req, res){
    req.session.destroy();
    res.redirect("/");
});

function createDBConnection(){
    var conn = mysql.createPool({
        connectionLimit: 10,
        host: "ixnzh1cxch6rtdrx.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "gj572ofpi2j0wtwv",
        password: "xhwj9t0oc83y953d",
        database: "z6v85vcvb5bkcdal"
    });
    return conn;
}

function isAuthenticated(req, res, next){
    if (!req.session.authenticated){
        res.redirect('/');
    } else{
        next();
    }
}

function checkUsername(username){
    let sql = "SELECT * FROM users WHERE username = ?";
    return new Promise(function(resolve, reject){
        let conn = createDBConnection();
        conn.query(sql, [username], function (err, rows, fields){
            if (err) throw err;
            console.log("Rows found: " + rows.length);
            resolve(rows);
        });//query
    });//promise
}

function checkPassword(password, hashedValue){
    return new Promise( function(resolve, reject){
        bcrypt.compare(password, hashedValue, function(err, result){
            console.log("Result: " + result);
            resolve(result);
        });
    });
}

//listener
app.listen(8080, "0.0.0.0", function(){
    console.log("Running Express Server...");
});

