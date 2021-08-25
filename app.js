//jshint esversion:6

const { log } = require("console");
const express = require("express");
const https = require("https");
const app = express();
require("dotenv").config();

app.use(express.static("public"));
app.use(express.urlencoded({extended : true}));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
    const email = req.body.email;
    const fname = email.split("@")[0];

    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: fname
            }
        }]
    };


    const jsonData = JSON.stringify(data);
    const apikey = process.env.API_KEY;
    const listid = process.env.LIST_ID;
    const url = "https://us5.api.mailchimp.com/3.0/lists/" + listid + "?skip_merge_validation=true&skip_duplicate_check=false";
    const options = {
        method: "POST",
        auth: "proximity220:" + apikey
    };

    const request = https.request(url, options, function(response) {

        response.on("data", function(data){
            const recievedData = JSON.parse(data);
            
            if(recievedData.error_count == 0){
                res.redirect("/?error=none");
            }
            else if (recievedData.errors[0].error_code === "ERROR_CONTACT_EXISTS"){
                res.redirect("/?error=exists");
            }
            else if (recievedData.errors[0].error_code === "ERROR_GENERIC"){
                res.redirect("/?error=fake");
            }
            else {
                res.redirect("/?error=none");
            }

        });
    });

    request.write(jsonData);
    request.end();
});

app.post("/failure", function(req,res){
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on Port 3000");
});
