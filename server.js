const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//4qOR3EYlGGioqxKW
const registration = mongoose.createConnection("mongodb+srv://tliu84:4qOR3EYlGGioqxKW@cluster0.fhmfm06.mongodb.net/registration?retryWrites=true&w=majority");
const blog = mongoose.createConnection("mongodb+srv://tliu84:4qOR3EYlGGioqxKW@cluster0.fhmfm06.mongodb.net/registration?retryWrites=true&w=majority");
const read = mongoose.createConnection("mongodb+srv://tliu84:4qOR3EYlGGioqxKW@cluster0.fhmfm06.mongodb.net/registration?retryWrites=true&w=majority");

const registration_schema = new Schema({
    "fname": String,
    "lname": String,
    "email": String,
    "username": {
        "type": String,
        "unique": true
    },
    "Address1": String,
    "Address2": String,
    "city": String,
    "postal": String,
    "country": String,
    "password": {
        "type": String,
        "unique": true
    }
});

const blog_schema = new Schema({
    "title": String,
    "content": String
});

const read_schema = new Schema({
    "read": String
});

const customer = registration.model("registration", registration_schema);
const blogcon = blog.model("blog_db", blog_schema);
const readcon = read.model("read_db", read_schema);

app.engine(".hbs", handlebars.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    blogcon.findOne().exec().then((data) => {
        console.log(data);
        res.render("blog", { title: data.title, content: data.content, layout: false });
    });
});

app.get("/article", function (req, res) {
    readcon.findOne().exec().then((data) => {
        res.render("read_more", { read: data.read, layout: false });
    });
});

app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname, "/login/login.html"));
});
app.post("/login", (req, res) => {
    var userdata = {
        user: req.body.username,
        pass: req.body.password,
        expression: /[~`!#@$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(req.body.username)
    }

    if (userdata.user == "" || userdata.pass == "") {
        res.render("login", { data: userdata, layout: false });
        return;
    }

    if (userdata.expression) {
        res.render("login", { data: userdata, layout: false });
        return;
    }

    customer.findOne({ username: userdata.user, password: userdata.pass }, ["fname", "lname", "username"]).exec().then((data) => {
        if (data) {
            if (data.id == "6366c66a9afb45a8af4a82c4") {
                res.render("login_Dashboard", { fname: data.fname, lname: data.lname, username: data.username, layout: false });
                return;
            }
            else {
                res.render("loginuser_Dashboard", { fname: data.fname, lname: data.lname, username: data.username, layout: false });
                return;
            }
        } else {
            res.render("login", { error: "Sorry, you entered the wrong username and/or password", layout: false });
            return;
        }
    });

});

app.get("/registration", function (req, res) {
    res.sendFile(path.join(__dirname, "/registration/registration.html"));
});
app.post("/registration", (req, res) => {

    var userdata = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        city: req.body.city,
        phonetest: /^\d{10}$/.test(req.body.phonenumber),
        Address1: req.body.Address1,
        Address2: req.body.Address2,
        postalcode: req.body.postalcode,
        postaltest: /^[AaBbCcEeGgHiJjKkLlMmNnPpRrSsTtVvXxYy]\d[A-Za-z] \d[A-Za-z]\d$/.test(req.body.postalcode),
        country: req.body.country,
        password: req.body.password,
        passwordtest: /^[0-9a-zA-Z]{6,12}$/.test(req.body.password),
        confirmpassword: req.body.confirmpassword,
    }

    var checkpass = () => {
        if (userdata.password == userdata.confirmpassword) {
            return true;
        }
        return false;
    }

    userdata.checkpassword = checkpass;

    if (userdata.fname == "" ||
        userdata.lname == "" ||
        userdata.email == "" ||
        userdata.phonenumber == "" ||
        userdata.Address1 == "" ||
        userdata.city == "" ||
        userdata.postalcode == "" ||
        userdata.country == "" ||
        userdata.password == "" ||
        userdata.confirmpassword == "") {

        res.render("registration", { data: userdata, layout: false });
        return;
    }

    if (!userdata.phonetest) {
        res.render("registration", { data: userdata, layout: false });
        return;
    }
    if (!userdata.postaltest) {
        res.render("registration", { data: userdata, layout: false });
        return;
    }
    if (!userdata.passwordtest) {
        res.render("registration", { data: userdata, layout: false });
        return;
    }
    if (!userdata.checkpassword) {
        res.render("registration", { data: userdata, layout: false });
        return;
    }

    var username = "";
    for (let index = 0; index < userdata.email.length; index++) {
        const element = userdata.email[index];
        if (element != '@') {
            username += element
        }
        if (element == '@') {
            break;
        }
    }
    let useaccount = new customer({
        fname: userdata.fname,
        lname: userdata.lname,
        email: userdata.email,
        username: username,
        Address1: userdata.Address1,
        Address2: userdata.Address2,
        city: userdata.city,
        postal: userdata.postalcode,
        country: userdata.country,
        password: userdata.password
    }).save((e, data) => {
        if (e) {
            console.log(e);
        } else {
            console.log(data);
        }
    });
    res.render("dashboard", { layout: false });

});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);