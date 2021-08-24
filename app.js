//jshint esversion:6

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
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    
    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: fname,
                LNAME: lname
            }
        }]
    }


    const jsonData = JSON.stringify(data);
    const url = "https://us5.api.mailchimp.com/3.0/lists/b135f2c601?skip_merge_validation=true&skip_duplicate_check=false";
    const apikey = process.env.API_KEY;
    const options = {
        method: "POST",
        auth: "proximity220:" + apikey
    }

    const request = https.request(url, options, function(response) {

        response.on("data", function(data){
            const recievedData = JSON.parse(data);
            
            if(recievedData.error_count == 0){
                res.sendFile(__dirname + "/success.html");
            }
            else {
                res.sendFile(__dirname + "/failure.html");
            }

        })
    });

    request.write(jsonData);
    request.end();

});

app.post("/failure", function(req,res){
    res.redirect("/");
})

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on Port 3000");
})
