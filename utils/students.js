const {
  reply,
  replies,
  rawReply,
  getUserProfile,
  pushMessage
} = require('./line-utils')
const validator = require('validator')

// Import Mongoose Schema(s)
const Student = require('../models/student')
const Instructor = require('../models/instructor')
const Curriculum = require('../models/curriculum')
const Course = require('../models/course')

exports.register = async (replyToken, lineUID, userInput) => {
  // Get LINE User Profile
  let userProfile = await getUserProfile(lineUID)
  // Save Student's Data to Database
  const student = await Student.findOne({
    sid: userInput.studentID
  }).select('+lineUID').catch((err) => {
    console.log(err.message)
  })
  if (!student) return reply(replyToken, `Student (id: ${userInput.studentID}) not found. Try to check your student id again or contact the administrator.`)
  student.lineUID = lineUID
  if (userInput.email !== '-') student.email = userInput.email.toLowerCase()
  if (userInput.phone !== '-') student.phone = userInput.phone
  if (userInput.nickName !== '-') student.nick_name = capitalize(userInput.nickName)
  if (userProfile.pictureUrl) student.avatar_url = userProfile.pictureUrl
  await student.save().catch((err) => {
    console.log(err.message)
  })
  // Send succesful message back to Student
  // pushMessage(lineUID, "Successfully Registered!") // Paid Message
  return reply(replyToken, "Successfully Registered!")
}

exports.checkRepeatedRegistration = async (replyToken, lineUID) => {
  // Check Whether this LINE UID is registered
  const student = await Student.findOne({
    lineUID: lineUID
  }).catch((err) => {
    console.log(err.message)
  })
  if (student) {
    await replies(replyToken, [`Registration Failed!`, `Your LINE account has already been registered with Welkin.\nContact the administrator for help.`])
    return false
  }
  return true
}

exports.checkStudentIDandFullName = async (replyToken, userInput) => {
  // Check Student in Databbase
  const student = await Student.findOne({
    sid: userInput.studentID
  }).select('+lineUID').catch((err) => {
    console.log(err.message)
  })
  if (!student) {
    reply(replyToken, `Student (id: ${userInput.studentID}) not found. Try to check your student id again or contact the administrator.`)
    return false
  }

  // Check Full Name
  let checkedName = student.given_name.trim() + ' ' + student.family_name.trim()
  if (checkedName.trim().toLowerCase() !== userInput.fullName.toLowerCase()) {
    reply(replyToken, `Incorrect Full Name of Student (id: ${userInput.studentID}). Try to check the spelling again or contact the administrator.`)
    return false
  }

  return true
}

exports.validateEmail = async (userInput) => {
  if (userInput.email.toLowerCase() === 'skip') {
    userInput.email = ""
    return userInput
  } else {
    if (validator.isEmail(userInput.email)) return userInput
    return false
  }
}

exports.validatePhone = async (userInput) => {
  if (userInput.phone.toLowerCase() === 'skip') {
    userInput.phone = ""
    return userInput
  } else {
    if (validator.isMobilePhone(userInput.phone, ["th-TH"])) return userInput
    return false
  }
}

exports.sendConfirmation = async (replyToken, userInput) => {
  console.log(userInput)
  let messages = {
    replyToken,
    messages: [{
      type: "flex",
      contents: {
        type: "bubble",
        size: "giga",
        hero: {
          type: "image",
          size: "full",
          aspectRatio: "2:1",
          aspectMode: "cover",
          url: "https://cdn.welkin.app/static/img/line-registration-flex-cover.png?v2"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [{
            type: "text",
            text: "Registration",
            weight: "bold",
            size: "xl"
          }, {
            type: "text",
            text: "Please make sure that the information is correct and valid",
            wrap: true,
            margin: "none",
            size: "xs",
            color: "#999999"
          }, {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [{
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [{
                type: "text",
                text: "Student ID",
                color: "#aaaaaa",
                size: "sm",
                flex: 2
              }, {
                type: "text",
                text: `${userInput.studentID}`,
                wrap: true,
                color: "#666666",
                size: "sm",
                flex: 4
              }]
            }, {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [{
                type: "text",
                text: "Full Name",
                color: "#aaaaaa",
                size: "sm",
                flex: 2
              }, {
                type: "text",
                text: `${capitalize(userInput.fullName)}`,
                wrap: true,
                color: "#666666",
                size: "sm",
                flex: 4
              }]
            }, {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [{
                type: "text",
                text: "Nick Name",
                color: "#aaaaaa",
                size: "sm",
                flex: 2
              }, {
                type: "text",
                text: `${capitalize(userInput.nickName)}`,
                wrap: true,
                color: "#666666",
                size: "sm",
                flex: 4
              }]
            }, {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [{
                type: "text",
                text: "Email",
                color: "#aaaaaa",
                size: "sm",
                flex: 2
              }, {
                type: "text",
                text: `${userInput.email.toLowerCase() || "-"}`,
                wrap: true,
                color: "#666666",
                size: "sm",
                flex: 4
              }]
            }, {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [{
                type: "text",
                text: "Phone",
                color: "#aaaaaa",
                size: "sm",
                flex: 2
              }, {
                type: "text",
                text: `${userInput.phone || "-"}`,
                wrap: true,
                color: "#666666",
                size: "sm",
                flex: 4
              }]
            }]
          }]
        },
        footer: {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [{
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "Cancel",
              text: "Cancel"
            },
            color: "#00000099"
          }, {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "message",
              label: "Confirm",
              text: "Confirm"
            },
            color: "#007bff"
          }, {
            type: "spacer",
            size: "sm"
          }],
          flex: 0
        }
      },
      altText: "Registration Confirmation"
    }]
  }
  return rawReply(messages)
}

exports.sendFilterOptions = async (replyToken, userType) => {
  let messages = {}
  switch (userType) {
    case "user":
      messages = {
        replyToken,
        messages: [{
          altText: "flex message",
          contents: {
            type: "bubble",
            direction: "ltr",
            body: {
              type: "box",
              layout: "vertical",
              contents: [{
                type: "text",
                text: "LOOKUP",
                weight: "bold",
                size: "sm",
                color: "#000000FF",
                contents: []
              }, {
                type: "text",
                text: "Select the topic that you are looking for.",
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
                  label: "studentID",
                  text: "studentID"
                },
                contents: [{
                  type: "text",
                  text: "Student's ID",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "studentName",
                  text: "studentName"
                },
                contents: [{
                  type: "text",
                  text: "Student's Name",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }, {
                type: "separator",
                margin: "lg"
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "courseCode",
                  text: "courseCode"
                },
                contents: [{
                  type: "text",
                  text: "Course Code",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }, {
                type: "separator",
                margin: "lg"
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "cancel",
                  text: "cancel"
                },
                contents: [{
                  type: "text",
                  text: "Cancel",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }]
            }
          },
          type: "flex"
        }]
      }
      break
    case "student":
      messages = {
        replyToken,
        messages: [{
          altText: "flex message",
          contents: {
            type: "bubble",
            direction: "ltr",
            body: {
              type: "box",
              layout: "vertical",
              contents: [{
                type: "text",
                text: "LOOKUP",
                weight: "bold",
                size: "sm",
                color: "#000000FF",
                contents: []
              }, {
                type: "text",
                text: "Please select the topic that you are looking for.",
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
                  label: "courseCode",
                  text: "courseCode"
                },
                contents: [{
                  type: "text",
                  text: "Course Code",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }, {
                type: "separator",
                margin: "lg"
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "cancel",
                  text: "cancel"
                },
                contents: [{
                  type: "text",
                  text: "Cancel",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }]
            }
          },
          type: "flex"
        }]
      }
      break
    case "unregistered":
      messages = {
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
                text: "LOOKUP",
                weight: "bold",
                size: "sm",
                color: "#000000FF",
                contents: []
              }, {
                type: "text",
                text: "Please select the topic that you looking for.",
                size: "xxs",
                color: "#7C7C7CFF",
                contents: []
              }, {
                type: "separator",
                margin: "lg"
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "courseCode",
                  text: "courseCode"
                },
                contents: [{
                  type: "text",
                  text: "Course Code",
                  size: "lg",
                  color: "#3C84FBFF",
                  align: "center",
                  margin: "lg",
                  contents: []
                }]
              }, {
                type: "separator",
                margin: "lg"
              }, {
                type: "box",
                layout: "vertical",
                action: {
                  type: "message",
                  label: "cancel",
                  text: "cancel"
                },
                contents: [{
                  type: "text",
                  text: "Cancel",
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
      }
      break
  }
  return rawReply(messages)
}

exports.searchStudent = async (searchInput) => {
  const students = await Student.aggregate([{
      $project: {
        name: {
          $concat: ["$given_name", " ", "$family_name"]
        },
        sid: 1,
        program: 1
      }
    },
    {
      $match: {
        name: new RegExp(searchInput.name, 'i'),
        program: "ICCI"
      }
    }
  ])
  if (students.length === 1) return {
    case: 1,
    sid: students[0].sid
  }
  else if (students.length > 1) return {
    case: 2
  }
  else return {
    case: 0
  }
}

exports.getStudentInfo = async (replyToken, searchInput) => {
  const student = await Student.findOne(toString(searchInput))
    .populate({
      path: 'advisor'
    })
  if (!student || student.program != 'ICCI') return reply(replyToken, "Student not found.")
  await getStudentInfo(replyToken, student)
}

exports.getStudentOptions = async (replyToken, searchInput) => {
  const student = await Student.aggregate([{
      $project: {
        name: {
          $concat: ["$given_name", " ", "$family_name"]
        },
        sid: 1,
        program: 1
      }
    },
    {
      $match: {
        name: new RegExp(searchInput.name, 'i'),
        program: "ICCI"
      }
    }
  ])
  if (student === undefined || student.length == 0) return reply(replyToken, "Student not found.")
  if (student.length > 1) {
    var queryString = ""
    student.forEach((eachStudent) => {
      queryString += `
        ,{
          "type": "box",
          "layout": "vertical",
          "action": {
            "type": "message",
            "label": "${eachStudent.name}",
            "text": "${eachStudent.sid}"
          },
          "contents": [{
            "type": "text",
            "text": "${eachStudent.name}",
            "size": "md",
            "margin": "lg",
            "color": "#3C84FBFF",
            "align": "start"
          }]
        }
      `
    })
    let replyMessages = `{
      "replyToken": "${replyToken}",
      "messages": [{
        "type": "flex",
        "altText": "flex message",
        "contents": {
          "type": "bubble",
          "size": "giga",
          "direction": "ltr",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [{
              "type": "box",
              "layout": "vertical",
              "spacing": "lg",
              "contents": [ {
                "type": "text",
                "text": "SELECT ONE STUDENT TO LOOKUP",
                "weight": "bold",
                "size": "sm",
                "color": "#000000FF",
                "align": "start",
                "contents": []
              }, {
                  "type": "separator",
                  "margin": "sm"
                }
                ${queryString}
                , {
                  "type": "separator",
                  "margin": "sm"
                }, {
                  "type": "box",
                  "layout": "vertical",
                  "action": {
                    "type": "message",
                    "label": "cancel",
                    "text": "cancel"
                  },
                  "contents": [{
                    "type": "text",
                    "text": "Cancel",
                    "size": "md",
                    "color": "#3C84FBFF",
                    "align": "center",
                    "margin": "sm",
                    "contents": []
                  }]
                }]
            }]
          }
        }
      }]
    }`
    return rawReply(JSON.parse(replyMessages))
  } else return reply(replyToken, "There is 1 student.")
}

exports.lookupStudentByLineId = async (replyToken, lineUID) => {
  const student = await Student.findOne({
      lineUID: lineUID
    })
    .populate({
      path: 'advisor'
    })
    .catch((err) => {
      console.log(err.message)
    })
  if (!student) return reply(replyToken, "Student not found. Please contact administrators for help.")
  await getStudentInfo(replyToken, student)
}

async function getStudentInfo(replyToken, student) {
  let studentName = student.given_name + " " + student.family_name
  let studentID = student.sid
  let nickName = student.nick_name || "-"
  let advisor = student.advisor.name || "Unknown"
  let entry = "T" + student.entry_trimester + "/" + student.entry_year || "-"
  let email = student.email || "-"
  let phone = student.phone || "-"
  let batch = student.batch

  const curriculum = await Curriculum.findOne({
    batches: batch
  })
  if (!curriculum) return reply(replyToken, "Cannot get correct information, please contact admin.")
  let passing_condition = curriculum.passing_conditions
  let passing_core = {
    text: student.records.core_credits + "/" + passing_condition.core_courses,
    number: Math.round(student.records.core_credits / passing_condition.core_courses * 100).toString()
  }
  let passing_required = {
    text: student.records.required_credits + "/" + passing_condition.required_courses,
    number: Math.round(student.records.required_credits / passing_condition.required_courses * 100).toString()
  }
  let passing_elective = {
    text: student.records.elective_credits + "/" + passing_condition.elective_courses,
    number: Math.round(student.records.elective_credits / passing_condition.elective_courses * 100).toString()
  }
  let totalCredits = {
    text: student.records.total_credits + "/" + (~~passing_condition.core_courses + ~~passing_condition.required_courses + ~~passing_condition.elective_courses),
    number: Math.round(student.records.total_credits / (~~passing_condition.core_courses + ~~passing_condition.required_courses + ~~passing_condition.elective_courses) * 100).toString()
  }

  let gpa = student.records.egci_cumulative_gpa
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
            text: "STUDENT'S INFORMATION",
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
              text: "Name",
              color: "#7C7C7CFF",
              flex: 1,
              align: "start",
              contents: []
            }, {
              type: "text",
              text: studentName,
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
              text: "Student ID",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: studentID,
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
              text: "Nick Name",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: nickName,
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
              text: "Advisor",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: advisor,
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
              text: "Entry Year",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: entry,
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
              text: "Email",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: email,
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
              text: "Phone",
              color: "#7C7C7CFF",
              flex: 1,
              contents: []
            }, {
              type: "text",
              text: phone,
              flex: 2,
              align: "start",
              wrap: true,
              contents: []
            }]
          }]
        }
      }
    }, {
      type: "flex",
      altText: "flex message",
      contents: {
        type: "carousel",
        contents: [{
          type: "bubble",
          size: "nano",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "GPA",
              weight: "regular",
              size: "md",
              align: "center",
              margin: "sm",
              contents: []
            }, {
              type: "text",
              text: gpa,
              weight: "regular",
              size: "xl",
              color: "#3C84FBFF",
              align: "center",
              margin: "sm",
              contents: []
            }]
          }
        }, {
          type: "bubble",
          size: "nano",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "Total",
              weight: "regular",
              size: "md",
              align: "start",
              margin: "sm",
              contents: []
            }, {
              type: "text",
              text: totalCredits.text,
              weight: "regular",
              size: "xxs",
              color: "#AAAAAA",
              align: "end",
              margin: "lg",
              contents: []
            }, {
              type: "box",
              layout: "vertical",
              backgroundColor: "#D5D5D5FF",
              cornerRadius: "3px",
              contents: [{
                type: "box",
                layout: "vertical",
                width: totalCredits.number + "%",
                height: "6px",
                backgroundColor: "#3C84FBFF",
                borderColor: "#FFFFFFFF",
                cornerRadius: "3px",
                contents: [{
                  type: "filler"
                }]
              }]
            }]
          }
        }, {
          type: "bubble",
          size: "nano",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "Core",
              weight: "regular",
              size: "md",
              align: "start",
              margin: "sm",
              contents: []
            }, {
              type: "text",
              text: passing_core.text,
              weight: "regular",
              size: "xxs",
              color: "#AAAAAA",
              align: "end",
              margin: "lg",
              contents: []
            }, {
              type: "box",
              layout: "vertical",
              backgroundColor: "#D5D5D5FF",
              cornerRadius: "3px",
              contents: [{
                type: "box",
                layout: "vertical",
                width: passing_core.number + "%",
                height: "6px",
                backgroundColor: "#3C84FBFF",
                borderColor: "#FFFFFFFF",
                cornerRadius: "3px",
                contents: [{
                  type: "filler"
                }]
              }]
            }]
          }
        }, {
          type: "bubble",
          size: "nano",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "Major",
              weight: "regular",
              size: "md",
              align: "start",
              margin: "sm",
              contents: []
            }, {
              type: "text",
              text: passing_required.text,
              weight: "regular",
              size: "xxs",
              color: "#AAAAAA",
              align: "end",
              margin: "lg",
              contents: []
            }, {
              type: "box",
              layout: "vertical",
              backgroundColor: "#D5D5D5FF",
              cornerRadius: "3px",
              contents: [{
                type: "box",
                layout: "vertical",
                width: passing_required.number + "%",
                height: "6px",
                backgroundColor: "#3C84FBFF",
                borderColor: "#FFFFFFFF",
                cornerRadius: "3px",
                contents: [{
                  type: "filler"
                }]
              }]
            }]
          }
        }, {
          type: "bubble",
          size: "nano",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "Elective",
              weight: "regular",
              size: "md",
              align: "start",
              margin: "sm",
              contents: []
            }, {
              type: "text",
              text: passing_elective.text,
              weight: "regular",
              size: "xxs",
              color: "#AAAAAA",
              align: "end",
              margin: "lg",
              contents: []
            }, {
              type: "box",
              layout: "vertical",
              backgroundColor: "#D5D5D5FF",
              cornerRadius: "3px",
              contents: [{
                type: "box",
                layout: "vertical",
                width: passing_elective.number + "%",
                height: "6px",
                backgroundColor: "#3C84FBFF",
                borderColor: "#FFFFFFFF",
                cornerRadius: "3px",
                contents: [{
                  type: "filler"
                }]
              }]
            }]
          }
        }]
      }
    }, {
      type: "text",
      text: "Type commands to see the list of features."
    }]
  }
  await rawReply(messages)
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