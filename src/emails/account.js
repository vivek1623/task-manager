const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'vivek@oriserve.com',
    subject: 'Thanks for joining us',
    text: `Welcome to Task Manager app ${name}, Let me know how you get along withthe app`
  })
}

const sendCancelationMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'vivek@oriserve.com',
    subject: 'Sorry to see you go',
    text: `Good bye ${name}, I hope see you back sometimes soon.`
  })
}

module.exports = {
  sendWelcomeMail,
  sendCancelationMail
}