// Variable initialization
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');

// DB Connection
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'g1234',
    database : 'node_box',
});

const app = express();
const PORT = process.env.PORT || 5000;

// Enabling express-session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true,
    cookie: {
        maxAge: 3600000, 
        // 60 mins(cuz, value of maxAge is defined in milliseconds)
        httpOnly: true,
        secure: false// only work if you have https enabled!
    }
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'));

app.set('view engine', 'ejs');


// Main Routes:
app.get('/', (request, response) => {
    const locals = {
        title : "Login page"
    }
    response.render('login', {locals});
})

app.get('/signup', (request, response) => {
    const locals = {
        title : "Signup page"
    }
    response.render('signup', {locals});
})

// Authentication route named "verify"
app.post('/verify', (request, response) => {
    let username = request.body.username
    let password = request.body.password

    // Verifying if input fields are not empty
    if(username && password) {
        const sql = 'SELECT * FROM accounts WHERE username = ? AND password = ?'
        connection.query(sql, [username, password], (err, results, fields)=> {
            if(err) throw err;
            if(results.length > 0) {
                console.log("Login Successful!")
                // Authenticate
                request.session.loggedin = true;
                request.session.username = username; // Dave
                // Redirect the user!
                response.redirect('/dashboard')
            } else {
                console.log("Wrong credentials!")
            }
            response.end()
        });
    } else {
        response.send('Please fill all the fields!')
        response.end();
    }
})

// Dashboard route:
app.get('/dashboard', (request, response) => {
    if(request.session.loggedin) {
        const locals = {
            title : 'Admin Dashboard'
        }
        //response.send(`Hi, ${request.session.username}!`);
        response.render('dashboard', {locals, username: request.session.username})
    } else {
        // response.send("Please login to access this page");
        // Send him back to login
        response.redirect('/')
    }
    response.end();
})


// Logout route
app.get('/logout', (request, response) => {
    if(request.session.loggedin) {
        // Commented works also fine
        // request.session.loggedin = null;
        // request.session.destroy()
        // delete request.session.sess_name
        // req.session.cookie.expires = new Date().getTime()
        request.session.username = false 
        response.redirect('/')
    }
})

// Logout V2
app.get('/logout2', (request, response) => {
    request.session.destroy((err) => {
        console.log("Session destroyed!")
        response.redirect('/'); 
        // or put it below.
    })
    // response.redirect('/');
})

// Route for Array page
app.get('/arrays', (request, response)=> {
    const data = {
        title: "Arrays Page",
        definition: "This page shows how to embed dynamic content to the page and normal JavaScript with ejs.",
        sports : [
            "Football",
            "Parkour",
            "Basketball"
        ]
    }
    response.render('arrays', {data: data})
});


app.listen(PORT, ()=> {
    console.log(`Server runs on port ${PORT}`)
})