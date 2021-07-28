const {
  reply,
  pushMessage,
  rawReply
} = require('./line-utils')

// Import Mongoose Schema(s)
const User = require('../models/user')
const Student = require('../models/student')

// import crypto
const crypto = require('crypto')

// check user's type [user, student, unregistered]
exports.checkUserType = async (lineUID) => {
  const user = await User.findOne({
    lineUID: lineUID
  }).catch((err) => {
    console.log(err.message)
  })
  if (user) return 'user'

  const student = await Student.findOne({
    lineUID: lineUID
  }).catch((err) => {
    console.log(err.message)
  })
  if (student) return 'student'

  return 'unregistered'
}

exports.registerForUser = async (replyToken, parameters, userId) => {
  const user = await User.findOne({
      username: parameters.username
    }).select('+lineSecretCode +lineUID')
    .catch((err) => {
      console.log(err.message)
    })
  if (!user) return await reply(replyToken, 'User not found please try again or contact the administrator.')
  if (user._doc.lineSecretCode.toLowerCase() !== parameters.lineSecretCode.toLowerCase()) return await reply(replyToken, 'Please enter (Line Secret Code) that you see on Welkin website or contact the administrator.')

  user.lineUID = userId
  user.lineSecretCode = crypto.randomBytes(4).toString('hex')
  await user.save().catch((err) => {
    console.log(err.message)
  })
  return await reply(replyToken, 'Successfully Registered!')
}

exports.listOfCommands = async (replyToken, userType) => {
  // const commands = [
  //   `- lookup (student's info/course)\n- getUserType\n- faq\n- commands`,
  //   `- lookup (mygrade/course)\n- grade/mygrade/info/myinfo/me\n- getUserType\n- faq\n- commands`,
  //   `- register user (for Welkin users)\n- register (for students)\n- lookup (course)\n- getUserType\n- faq\n- commands\n\nAfter you finished register, please get the list of commands again to get the commands that you can use.`
  // ]
  let messages = [{
    replyToken,
    messages: [{
      type: "flex",
      altText: "flex message",
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "COMMANDS",
            weight: "bold",
            size: "sm",
            color: "#000000FF",
            contents: []
          }, {
            type: "text",
            text: "Please select the command that you want to use.",
            size: "xxs",
            color: "#7C7C7CFF",
            contents: []
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "lookup",
              text: "lookup"
            },
            contents: [{
              type: "text",
              text: "Look Up",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          },{
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "faq",
              text: "faq"
            },
            contents: [{
              type: "text",
              text: "FAQ",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "Commands",
              text: "Commands"
            },
            contents: [{
              type: "text",
              text: "Commands",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }]
        }
      }
    }]
  },{
    replyToken,
    messages: [{
      type: "flex",
      altText: "flex message",
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "COMMANDS",
            weight: "bold",
            size: "sm",
            color: "#000000FF",
            contents: []
          }, {
            type: "text",
            text: "Please select the command that you want to use.",
            size: "xxs",
            color: "#7C7C7CFF",
            contents: []
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "lookup",
              text: "lookup"
            },
            contents: [{
              type: "text",
              text: "Look Up",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "MyGrade",
              text: "MyGrade"
            },
            contents: [{
              type: "text",
              text: "My Grade",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "faq",
              text: "faq"
            },
            contents: [{
              type: "text",
              text: "FAQ",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "Commands",
              text: "Commands"
            },
            contents: [{
              type: "text",
              text: "Commands",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }]
        }
      }
    }]
  },{
    replyToken,
    messages: [{
      type: "flex",
      altText: "flex message",
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "COMMANDS",
            weight: "bold",
            size: "sm",
            color: "#000000FF",
            contents: []
          }, {
            type: "text",
            text: "Please select the command that you want to use.",
            size: "xxs",
            color: "#7C7C7CFF",
            contents: []
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "Register User",
              text: "Register User"
            },
            contents: [{
              type: "text",
              text: "Register for Welkin user",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "Register",
              text: "Register"
            },
            contents: [{
              type: "text",
              text: "Register for Student",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "lookup",
              text: "lookup"
            },
            contents: [{
              type: "text",
              text: "Look Up",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "faq",
              text: "faq"
            },
            contents: [{
              type: "text",
              text: "FAQ",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }, {
            type: "separator",
            margin: "md"
          }, {
            type: "box",
            layout: "vertical",
            action: {
              type: "message",
              label: "Commands",
              text: "Commands"
            },
            contents: [{
              type: "text",
              text: "Commands",
              size: "lg",
              color: "#3C84FBFF",
              align: "center",
              margin: "lg",
              contents: []
            }]
          }]
        }
      }
    },{
      type: "text",
      text: "After you finished register, please get the list of commands again to get the commands that you can use."
    }]
  }]
  // return await reply(replyToken, `Here are the list of commands\n${commands[userType]}`)
  return await rawReply(messages[userType])
}