const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// bring routes
const routeBlog = require("./routes/routeBlog");
const routeAuth = require("./routes/routeAuth");
const routeUser = require("./routes/routeUser");
const routeCat = require("./routes/routeCat");
const routeTag = require("./routes/routeTag");
const routeContact = require("./routes/routeContact");



//**********************APP******************************
const app = express();


//*********************DATABASE***************************
mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false})
.then( ()=> console.log("DB connected!"));


//*******************MIDDLEWARES**************************
app.use(morgan('dev'));
app.use(cookieParser());
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));


//support parsing of application/x-www-form-urlencoded post data
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


// cors {Cross-Origin Resource Sharing}
if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// routes middleware
app.use("/api", routeAuth);
app.use("/api", routeBlog);
app.use("/api", routeUser);
app.use("/api", routeCat);
app.use("/api", routeTag);
app.use("/api", routeContact);



//*******************START SERVER***************************
const port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log(`Server started on port ${port}`);
})