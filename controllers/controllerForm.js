const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = require("../config");

// contact me
exports.contactForm = (req, res) => {
    const { email, name, message } = req.body;
    console.log(req.body);

    const emailData = {
        to: process.env.EMAIL_TO,
        from: email,
        subject: `Contact Form - ${process.env.APP_NAME}`,
        text: `Email received from contact form \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Email received from contact form: </h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
        `
    };

    sgMail.send(emailData)
        .then((sent) => {
            return res.json({
                success: true
            })
        })
        .catch((err) => {
            res.json({
                error: "Message could not be sent"
            });
        })
}


exports.contactNodemailer = (req, res) => {
    const { email, name, message } = req.body;
    console.log("email body: ");
    
    console.log(req.body);
    

    try {
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_BUSINESS,
            subject: `Contact Form - ${process.env.APP_NAME}`,
            text: `Email received from contact form \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
            html: `
            <h4>Email received from contact form: </h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
        `
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Something went wrong. Try again later 1"
                });
            }
            else {
                res.send({
                    success: true,
                    message: "Thanks for contacting us. We will get back to you shortly"
                });
            }
        });

    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: "Something went wrong. Try again later 2"
        });
    }

}


// contact a blog author
exports.contactBlogAuthorForm = (req, res) => {
    const { authorEmail, email, name, message } = req.body;
    //console.log(req.body);

    let mailList = [authorEmail, process.env.EMAIL_TO];

    const emailData = {
        to: mailList,
        from: email,
        subject: `Someone messaged you from ${process.env.APP_NAME}`,
        text: `Email received from contact form \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Message received from:</h4>
            <p>name: ${name}</p>
            <p>email: ${email}</p>
            <p>message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>

        `
    };

    sgMail.send(emailData)
        .then((sent) => {
            return res.json({
                success: true
            })
        })
        .catch((err) => {
            res.json({
                error: "Message could not be sent: Server side"
            });
        });
}