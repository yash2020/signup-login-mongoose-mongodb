var express = require('express');
var cluster = require('cluster');
//var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var UserLogin = require('./lib/mongoose_user');

var app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',(req,res)=>{
    // console.log('Request for home page');
    res.render('index');
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.post('/login',(req,res)=>{
    
    var email = req.body.email;
    var password = req.body.pwd;

    UserLogin.findOne({email:email},function(err,data){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        
        if(!data){
            console.log("User Don't Exist...")
            return res.status(404).send();
        }
    
        // this is use to compare the password..
        bcrypt.compare(password,data.password,function(err,data){
            if(err){
                console.log(err);
                return res.status(500).send();
            }
            
            // checking for the password match...
            if(data){
                return res.render('success');
            }

            // error if password do not match...
            return res.status(500).send();
        });
        
        
    });

});

app.post('/signup',(req,res)=>{
    var email = req.body.email;
    var password = req.body.pwd;

    // First creating salt.
    bcrypt.genSalt(10,function(err,salt){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        // creating hash...of password
        bcrypt.hash(password,salt,function(err,data){
            if(err){
                console.log(err)
                return res.status(500).send();
            }
            console.log(data); // This is hash of the password...
            //Creating model to save the user data in Database..
            var newuser = new UserLogin();
            newuser.email = email;
            newuser.password = data;

            // Inserting data to database...
            newuser.save(function(err,saveuser){
                if(err) {
                    console.log(err);
                    if(err.code = 11000){
                        console.log('User Already Exist');
                        return res.status(500).send()
                    }
                    return res.status(500).send();
                }
                console.log('new user have benn save');
                return res.status(200).send();
            });

        });

    });

});


app.listen(9090,function(){
    console.log('Server is Running at port 9090....');
});
