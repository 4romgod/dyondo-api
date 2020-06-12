const User = require("../models/user");
const Blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");
const shortId = require("shortid");     // creates amazingly short non-sequential url-friendly unique ids
const jwt = require('jsonwebtoken');
const expressJwt = require("express-jwt");
const _ = require("lodash");

const { OAuth2Client } = require("google-auth-library");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);




exports.controllerPreSignup = (req, res) => {
    const { name, email, password } = req.body;

    // 1. Check database for the user
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        // 2. If user already exists, 400 status code
        if (user) {
            return res.status(400).json({
                error: "Email is taken"
            });
        }
        // 3. generate a token
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account Activation Link`,
            html: `
                <h4>Please use the following link to activate your account:</h4>
                <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>https://seoblog.com</p>
            `
        };

        sgMail.send(emailData)
            .then((sent) => {
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instructions to Activate your Account.`
                });
            })
            .catch((err) => {
                res.json({
                    error: "Email could not be sent"
                });
            })

    });

};


exports.controllerSignup = (req, res) => {
    const token = req.body.token;
    console.log("token: " + token);

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: "Link is Expired. Please Signup again"
                });
            }

            const { name, email, password } = jwt.decode(token);

            let username = shortId.generate();

            let profile = `${process.env.CLIENT_URL}/profile/${username}`

            let newUser = new User({ name, email, password, profile, username });

            newUser.save((err, success) => {
                if (err) {
                    return res.status(400).json({
                        error: "That Email is already registered"
                    });
                }

                res.json({
                    message: "Signup success! Please signin."
                });

            });

        });

    }
    else {
        res.json({
            message: "Something went wrong. Try again."
        });
    }

}


// Log an existing user
exports.controllerSignin = (req, res) => {
    const { email, password } = req.body;

    // 1. Check database if user exists
    User.findOne({ email }).exec((err, user) => {

        // 1.1. If user does not exist, return 400 status code
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please signup."
            });
        }

        // 1.2. User exist, Authenticate password
        if (!user.passwordMatch(password)) {       //if not true
            return res.status(400).json({
                error: "Email and Password do not match."
            });
        }

        // 2. User Exist, password authentic. 
        /*  Generate a token with the username in the payload
            and which expires1 day after issue
            and send to client*/
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 2.1. set the cookie as the token string, with a similar max age as the token
        /*  Once a cookie is set on a client, it is sent along with every request henceforth
            Cookies are simple, small files/data that are sent to client with a server request 
            and stored on the client side. Every time the user loads the website back, 
            this cookie is sent with the request. This helps us keep track of the user’s actions.*/
        res.cookie('token', token, { expiresIn: '1d' });

        const { _id, username, name, email, role } = user;

        return res.json({
            token,
            user: { _id, username, name, email, role }
        });
    });

};



// Signout a signed in user
exports.controllerSignout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: 'Signout success'
    });

};


// check secret of incoming token, with secret in env file
// lets us know whether you are signed in or not
// every request for signed in user contains this jwt
// makes user available in the request
exports.controllerRequireSignin = expressJwt({
    secret: process.env.JWT_SECRET
});


exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;        // made available by controllerRequireSignin

    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        req.profile = user;
        next();

    });
}


exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;

    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        // admin has role of 1, hence not admin
        if (user.role != 1) {
            return res.status(400).json({
                error: "Admin resource. Access denied"
            });
        }

        req.profile = user;
        next();

    });
}


exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = (data.author._id.toString() === req.profile._id.toString());

        if (!authorizedUser) {
            return res.status(400).json({
                error: "You are not authorized"
            });
        }
        next();

    });
}


exports.controllerForgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: "User with that email does not exist"
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        // email data
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset Link`,
            html: `
                    <p>Plase use the following link to reset your password:</p>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>https://seoblog.com</p>
        
                `
        };

        // populate db with user reset password link
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ error: errorHandler(err) });
            }
            else {
                sgMail.send(emailData)
                    .then((sent) => {
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min`
                        })
                    })
                    .catch((err) => {
                        res.json({
                            error: "Email could not be sent"
                        });
                    })
            }

        })




    });
}

exports.controllerResetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decided) {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Try again'
                });
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Something went wrong. Try later'
                    });
                }

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Greate! Now you can login with your new password`
                    });
                });

            });
        });
    }

}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        .then(response => {
            //console.log(response);

            const { email_verified, name, email, jti } = response.payload;

            if (email_verified) {
                User.findOne({ email }).exec((err, user) => {
                    // user is registered
                    if (user) {
                        console.log(user);
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.cookie('token', token, { expiresIn: '1d' });
                        const { _id, email, name, role, username } = user;
                        return res.json({ token, user: { _id, email, name, role, username } });
                    }
                    else {
                        let username = shortId.generate();
                        let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                        let password = jti;
                        let newUser = new User({ name, email, password, profile, username });

                        newUser.save((err, data) => {
                            if (err) {
                                return res.status(400).json({
                                    error: errorHandler(err)
                                });
                            }

                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                            res.cookie('token', token, { expiresIn: '1d' });
                            const { _id, email, name, role, username } = data;
                            return res.json({ token, user: { _id, email, name, role, username } });

                        });
                    }


                });
            }
            else {
                return res.status(400).json({
                    error: "Google login failed. Try again"
                });
            }

        });
}


// Register a new user
/*exports.controllerSignup = (req, res) => {

    // 1. Check database for the user
    User.findOne({ email: req.body.email }).exec((err, user) => {

        // 2. If user already exists, 400 status code
        if (user) {
            return res.status(400).json({
                error: "Email is taken"
            });
        }

        // 3. If user does not exist, create the user
        const { name, email, password } = req.body;

        // 3.1. Use shortId to generate a username
        let username = shortId.generate();

        // 3.2. Use Client Url and username to create profile url
        let profile = `${process.env.CLIENT_URL}/profile/${username}`

        // 3.3. Create user model
        let newUser = new User({ name, email, password, profile, username });


        // 4. Save user to the database
        newUser.save((err, success) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            res.json({
                message: "Signup success! Please signin."
            });

            // res.json({user: success});

        });

    });

};

*/