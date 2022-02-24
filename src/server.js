const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const routeBlog = require("./routes/routeBlog");
const routeAuth = require("./routes/routeAuth");
const routeUser = require("./routes/routeUser");
const routeCat = require("./routes/routeCat");
const routeTopic = require("./routes/routeTopic");
const routeTag = require("./routes/routeTag");
const routeContact = require("./routes/routeContact");
const routeSitemap = require("./routes/routeSitemap");
const routeApiSpec = require("./routes/routeApiSpec");
const bootstrap = require("./bootstrapData/bootstrapData");

const app = express();

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("DB connected!")).then(async () => {
    await bootstrap.bootstrapTopic();
});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));

if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use("/api", routeAuth);
app.use("/api", routeBlog);
app.use("/api", routeUser);
app.use("/api", routeCat);
app.use("/api", routeTag);
app.use("/api", routeTopic);
app.use("/api", routeContact);
app.use("/api", routeSitemap);
app.use("/api", routeApiSpec);

const port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});