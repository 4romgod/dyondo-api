const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");
const bootstrap = require("./bootstrapData/bootstrapData");
require("dotenv").config();

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
    app.use(cors({
        origin: `${process.env.CLIENT_URL}`,
        credentials: true
    }));
}

app.use("/api", routes.routeAuth);
app.use("/api", routes.routeBlog);
app.use("/api", routes.routeUser);
app.use("/api", routes.routeCat);
app.use("/api", routes.routeTag);
app.use("/api", routes.routeTopic);
app.use("/api", routes.routeContact);
app.use("/api", routes.routeSitemap);
app.use("/api", routes.routeApiSpec);

const port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});