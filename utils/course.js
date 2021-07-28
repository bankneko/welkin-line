const {
  reply,
  replies,
  rawReply,
  getUserProfile,
  pushMessage
} = require('./line-utils')
const validator = require('validator')

// Import Mongoose Schema(s)
const Course = require('../models/course')

exports.getCourseInfo = async (replyToken, searchInput) => {
  const course = await Course.findOne(searchInput)
  if (!course) return reply(replyToken, "Course not found.")
  // console.log(course)
  let code = course.code
  let name = course.name
  // let category = course.category
  let description = unescapeHtml(course.description)
  let credit = course.credit + "(" + course.credit_description.lecture + "-" + course.credit_description.lab + "-" + course.credit_description.self_study + ")"

  let messages = {
    replyToken,
    messages: [{
      type: "flex",
      altText: "flex message",
      contents: {
        type: "bubble",
        size: "giga",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "COURSE INFORMATION",
            weight: "bold",
            size: "sm",
            color: "#000000FF",
            align: "start",
            contents: []
          }, {
            type: "separator",
            margin: "sm"
          }, {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [{
              type: "text",
              text: "Code",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: code,
              flex: 2,
              align: "start",
              wrap: true,
              contents: []
            }]
          }, {
            type: "box",
            layout: "baseline",
            margin: "sm",
            contents: [{
              type: "text",
              text: "Name",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: name,
              flex: 2,
              align: "start",
              wrap: true,
              contents: []
            }]
          }, {
            type: "box",
            layout: "baseline",
            margin: "sm",
            contents: [{
              type: "text",
              text: "Description",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: description,
              flex: 2,
              align: "start",
              wrap: true,
              contents: []
            }]
          }, {
            type: "box",
            layout: "baseline",
            margin: "sm",
            contents: [{
              type: "text",
              text: "Credit",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: credit,
              flex: 2,
              wrap: true,
              contents: []
            }]
          }]
        }
      }
    },{
      type: "text",
      text: "Type commands to see the list of features."
    }]
  }

  return rawReply(messages)
}

function capitalize(name) {
  let words = []
  name.split(' ').forEach((word) => {
    words.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  })
  // console.log(words.join(' '))
  return words.join(' ')
}

function toString(object) {
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'object') {
      return toString(object[key]);
    }
    object[key] = capitalize('' + object[key]);
  });
  return object;
}

function unescapeHtml(safe) {
  return safe.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}