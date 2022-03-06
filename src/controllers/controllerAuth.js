const User = require("../models/user");
const Blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");
const shortId = require("shortid");
const { sign, verify, decode } = require('jsonwebtoken');
const jwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { SUCCESS, CONFLICT, GONE, SERVER_ERROR, UNAUTHENTICATED, UNAUTHORIZED, NOT_FOUND, BAD_REQUEST } = require("../constants").STATUS_CODES;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();

exports.controllerPreSignup = (req, res) => {
    const { name, surname, email, password } = req.body;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(CONFLICT).json({ error: "Email is already taken!" });
        }

        const token = sign({ name, surname, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const activationEmailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Dyondo Account Activation Link`,
            text: 'and easy to do anywhere, even with Node.js',
            html: `
                <h4>Please use the following link to activate your account:</h4>
                <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>https://www.dyondo.com</p>
            `
        };
        sgMail.send(activationEmailData)
            .then((sent) => {
                return res.status(SUCCESS).json({ message: `Email has been sent to ${email}. Follow the instructions to Activate your Account.` });
            }).catch((err) => {
                console.log(err);
                return res.status(SERVER_ERROR).json({ error: "Email could not be sent." });
            });
    });
};

exports.controllerSignup = (req, res) => {
    const token = req.body.token;
    if (token) {
        verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                return res.status(GONE).json({ error: "Your Verification Link has Expired!" });
            }

            const { name, surname, email, password } = decode(token);
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`
            let newUser = new User({ name, surname, email, password, profile, username });
            newUser.save((err, success) => {
                if (err) {
                    console.log(err);
                    return res.status(CONFLICT).json({ error: "Email is already taken!" });
                }

                return res.status(SUCCESS).json({ message: "Signup Successfull! Please Signin." });
            });
        });
    } else {
        return res.status(UNAUTHENTICATED).json({ message: "Authentication Token Has Not Been Provided." });
    }
}

exports.controllerSignin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(NOT_FOUND).json({ error: "Sorry, we didn't recognize that email. Please Signup." });
        }

        if (!user.passwordMatch(password)) {
            return res.status(UNAUTHENTICATED).json({ error: "Email and Password do not match." });
        }

        const token = sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { expiresIn: '1d' });

        const { _id, username, name, surname, email, role } = user;
        return res.status(SUCCESS).json({ token, user: { _id, username, name, surname, email, role }});
    });
};

exports.controllerSignout = (req, res) => {
    res.clearCookie("token");
    res.status(SUCCESS).json({ message: 'Signout Successfull!' });
};

// check secret of incoming token, with secret in env file
// lets us know whether you are signed in or not
// every request for signed in user contains this jwt
// makes user available in the request
exports.controllerRequireSignin = jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] });

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(NOT_FOUND).json({ error: "User not found." });
        }

        req.profile = user;
        next();
    });
}

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(NOT_FOUND).json({ error: "User not found." });
        }

        if (user.role != 1) {
            return res.status(UNAUTHORIZED).json({ error: "Access denied." });
        }

        req.profile = user;
        next();
    });
}

exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        let authorizedUser = (data.author._id.toString() === req.profile._id.toString());
        if (!authorizedUser) {
            return res.status(UNAUTHORIZED).json({ error: "You Are Not Authorized" });
        }

        next();
    });
}

exports.controllerForgotPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(NOT_FOUND).json({ error: "User With That Email Does Not Exist" });
        }

        const token = sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset Link`,
            html: `
                    <p>Plase use the following link to reset your password:</p>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>https://www.dyondo.com</p>
                `
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            } else {
                sgMail.send(emailData)
                    .then((sent) => {
                        return res.status(SUCCESS).json({ message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10 minutes` });
                    }).catch((err) => {
                        return res.status(SERVER_ERROR).json({ error: "Email could not be sent." });
                    });
            }
        });
    });
}

exports.controllerResetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, data) {
            if (err) {
                return res.status(UNAUTHORIZED).json({ error: "Expired link. Try again!" });
            }

            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(BAD_REQUEST).json({ error: "Cannot re-use the link. Try again" });
                }

                const updatedFields = { password: newPassword, resetPasswordLink: '' }
                user = _.extend(user, updatedFields);
                user.save((err, result) => {
                    if (err) {
                        return res.status(UNAUTHORIZED).json({ error: errorHandler(err) });
                    }

                    return res.status(SUCCESS).json({ message: `Great! Now you can login with your new password` });
                });
            });
        });
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        const { email_verified, name, surname, email, jti } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    const token = sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.cookie('token', token, { expiresIn: '1d' });

                    const { _id, email, name, surname, role, username } = user;
                    return res.status(SUCCESS).json({ token, user: { _id, email, name, surname, role, username } });
                } else {
                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti;
                    let newUser = new User({ name, surname, email, password, profile, username });

                    newUser.save((err, data) => {
                        if (err) {
                            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                        }

                        const token = sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.cookie('token', token, { expiresIn: '1d' });
                        const { _id, email, name, surname, role, username } = data;
                        return res.status(SUCCESS).json({ token, user: { _id, email, name, surname, role, username } });
                    });
                }
            });
        } else {
            return res.status(UNAUTHENTICATED).json({ error: "Google login failed. Try again!" });
        }
    });
}