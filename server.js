const express = require('express');
const gcal = require('./Utility/gcal.js');
const bodyParser = require("body-parser");
const days = require('./ReqHandlers/GET-Handlers/days.js');
const timeslots = require('./ReqHandlers/GET-Handlers/timeslots.js');
const book = require('./ReqHandlers/POST-Handlers/book.js');
const event = require('./ReqHandlers/GET-Handlers/event.js');
const helmet = require('helmet'); // Import the Helmet middleware
const path = require("path")



function htmlWrapper(data) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <title>Book Appointment</title>
    <link rel="stylesheet" href="./css/style.css" media="all">
      </head>
      <body>
      ${data}

      </body>
    </html>
`
}


const app = express();
const auth = {};

// Get the OAuth2 client for making Google Calendar API requests.
gcal.initAuthorize(setAuth);

function setAuth(auth) {
    this.auth = auth;
    console.log('\nServer is now running... Ctrl+C to end');
}

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(express.static(path.join(__dirname, "public")));



/**
 * Handles 'days' GET requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleGetDays(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    days.getBookableDays(this.auth, year, month)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

/**
 * Handles 'timeslots' GET requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleGetTimeslots(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;

    timeslots.getAvailTimeslots(this.auth, year, month, day)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}

function handleGetEvents(req, res) {
    const year = req.query.year;
    const month = req.query.month;
    const day = req.query.day;

    event.getCalendarEvents(this.auth, year, month, day)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(data) {
            res.send(data);
        });
}


/**
 * Handles 'book' POST requests.
 * @param {object} req  The requests object provided by Express. See Express doc.
 * @param {object} res  The results object provided by Express. See Express doc.
 */
function handleBookAppointment(req, res) {
    const data = req.body
    if (data.date && data.time && typeof data.date == 'string' && typeof data.time == 'string') {

        const date = req.body.date.split("-");
        console.log(req.body.date)
        const year = parseInt(date[0]);
        const month = parseInt(date[1]);
        const day = parseInt(date[2]);

        // const year = req.query.year;
        // const month = req.query.month;
        // const day = req.query.day;
        // const hour = req.query.hour;
        // const minute = req.query.minute;
        //
        const time = req.body.time.split(":");
        const hour = time[0];
        const minute = time[1];

        const name = req.body.name;
        const service = req.body.service;
        const email = req.body.email || "empty@err.me";
        const phone = req.body.phone
        const desc = `nom: ${name}. \n email: ${email} \n phone: ${phone} \n service: ${service} \n a ${req.body.date} T ${req.body.time}`




        book.bookAppointment(this.auth, year, month, day, hour, minute, name, desc, email)
            .then(function(data) {
                if (data.success === true) {
                    res.send(htmlWrapper(`
      <br />
      <br />
      <br />

        <center>
        <div class="container">


<div class="card p-3">

        <h1 class="txt-success">Success</h1>
        <br />

        you have Appointment att   ${data.message.startTime}
</div>
        </div>
        </center>
  `));

                } else {
                    res.send(htmlWrapper(`
      <br />
      <br />
      <br />

        <center>
        <div class="container">


<div class="card p-3">

        <h1 class="txt-danger">Error</h1>
        <br />

          ${data.message}
</div>
        </div>
        </center>
  `));


                }

                // res.send(data);
            })
            .catch(function(data) {
                res.send(htmlWrapper(`
      <br />
      <br />
      <br />
        <div class="container">
      <center>
<div class="card p-3">

        <h1 class="txt-danger">Error</h1>
          ${data.message}
</div>
      </center>
        </div>
  `));
            });
    }
}

// Routes.
app.get('/days', handleGetDays);
app.get('/timeslots', handleGetTimeslots);
app.get('/events', handleGetEvents);
app.post('/book', handleBookAppointment);
app.get("/", (req, res) => {
    return res.sendFile("/index.html", { root: __dirname })
})


// Listen on port 8080 for incoming requests to the server.
const server = app.listen(8080, function() { });
