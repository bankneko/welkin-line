const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const dotenv = require('dotenv')
dotenv.config({path: './config/.env'})

const axios = require('axios')

// Connect to MongoDB
require('./config/database')()

// HTTPS
const fs = require('fs')
const https = require('https')
const privateKey  = fs.readFileSync(process.env.SSL_KEY, 'utf8')
const certificate = fs.readFileSync(process.env.SSL_CERT, 'utf8')
const credentials = {key: privateKey, cert: certificate}

// Utils
const stdUtils = require('./utils/students')
const usrUtils = require('./utils/users')
const courseUtils = require('./utils/course')
const faqUtils = require('./utils/faq')

// Push Message
const line = require('@line/bot-sdk');
const { reply , replies , getUserProfile } = require('./utils/line-utils')
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_TOKEN
});

// Start listening to PORT
const PORT = process.env.PORT
const httpsServer = https.createServer(credentials, app)
const server = httpsServer.listen(PORT, () => {
    console.log(`🚀 LINE Webhook Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

// Webhook for LINE + Dialogflow
app.post('/webhook', async (req,res) => {
  try {
    console.log("=================================================");
    // Parse data from Dialogflow
    const originalMsg = req.body.originalDetectIntentRequest.payload.data
    const intentId = req.body.queryResult.intent.name.split("/").pop()
    let parameters = req.body.queryResult.parameters
    let roomId = originalMsg.source.roomId || originalMsg.source.groupId
    let roomType = originalMsg.source.type
    let userId = originalMsg.source.userId
    let message = originalMsg.message.text
    let userProfile = await getUserProfile(userId)
  
    console.log("INTENTID   : " + intentId)
    console.log("USERID     : " + userId)
    console.log("NAME       : " + userProfile.displayName)
    console.log("USERTYPE   : " + await usrUtils.checkUserType(userId))
    console.log("ROOMID     : " + roomId)
    console.log("TEXT       : " + message)
    console.log("PARAMETERS : ")
    console.log(parameters)

    console.log(roomType)
    if(roomType === 'group') return
    // Check Intent ID
    switch(intentId) {
      // New Register instuctor Intent
      case "f173d46b-113d-4859-9729-55f96cff90b1":
        if(await usrUtils.checkUserType(userId) !== "unregistered") return await replies(originalMsg.replyToken, [`Registration Failed!`, `Your LINE account has already been registered with Welkin.\nContact the administrator for help.`])
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "new-user-registration-first-and-last",
            "languageCode": "en-US",
          }
        }))
        break
      case "d3ba2242-27f3-49af-b847-b77e3bd75c05":
        await usrUtils.registerForUser(originalMsg.replyToken, parameters, userId)
        // Assign Rich Menu
        await axios.post("https://api.line.me/v2/bot/richmenu/bulk/link", {
          richMenuId: "richmenu-f80a9397e361c04d85fe20781803a6a5",
          userIds: [userId]
        }, {
          headers: {
            "Authorization": `Bearer ${process.env.CHANNEL_TOKEN}`,
            "Content-Type": "application/json"
          }
        })
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // New Register Intent
      case "69c6b1d6-3ad3-4cac-9105-d8377d6b41fc":
        // Check Whether this LINE Account has been registered
        if (await usrUtils.checkUserType(userId) === 'unregistered') {
          return res.send(JSON.stringify({
            // Also added nickname
            "followupEventInput": {
              "name": "register-get-studentIDandFullName",
              "languageCode": "en-US",
            }
          }))
        }
        await replies(originalMsg.replyToken, [`Registration Failed!`, `Your LINE account has already been registered with Welkin.\nContact the administrator for help.`])
        // Cancel Registration if this LINE Account has been registered with Welkin
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-cancel",
            "languageCode": "en-US",
          }
        }))
        break
      // Check Full Name and Student ID
      case "e2d13920-6eb2-4cac-9d9e-f1f9ff5ec536":
        if (await stdUtils.checkStudentIDandFullName(originalMsg.replyToken, parameters)) {
          return res.send(JSON.stringify({
            "followupEventInput": {
              "name": "register-get-nickname",
              "parameters": {
                ...parameters
              },
              "languageCode": "en-US"
            }
          }))
        }
        // Cancel Registration if student not found or not matched with Full Name
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-cancel",
            "languageCode": "en-US",
          }
        }))
        break
      // Get nickname
      case "35baff48-107a-4ceb-af66-701fbb279826":
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-get-email",
            "parameters": {
              ...parameters
            },
            "languageCode": "en-US"
          }
        }))
        break
      // Validate Email
      case "23f549b6-e694-41b8-a64a-3d31a4ccd3e8":
        parameters = await stdUtils.validateEmail(parameters)
        if (parameters) {
          return res.send(JSON.stringify({
            "followupEventInput": {
              "name": "register-get-phone",
              "parameters": {
                ...parameters
              },
              "languageCode": "en-US",
            }
          }))
        }
        delete parameters.email
        // Reprompt
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-get-email",
            "parameters": {
              ...parameters
            },
            "languageCode": "en-US",
          }
        }))
        break
      // Validate Phone Number
      case "c94a9052-fb83-40e4-879c-16ada0e17b7c":
        parameters = await stdUtils.validatePhone(parameters)
        if (parameters) {
          await stdUtils.sendConfirmation(originalMsg.replyToken, parameters)
          res.send(JSON.stringify({
            "followupEventInput": {
              "name": "register-get-confirmation",
              "parameters": {
                ...parameters
              },
              "languageCode": "en-US",
            }
          }))

          return
        }
        delete parameters.phone
        // Reprompt
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-get-phone",
            "parameters": {
              ...parameters
            },
            "languageCode": "en-US",
          }
        }))
        break
      // Student Register Intent
      case "029dbe1b-1c3b-485f-8e5b-dae136666217": // latest
        if(parameters.confirmation.toLowerCase() === "confirm") {
          await stdUtils.register(originalMsg.replyToken, userId, parameters)
          // Assign Rich Menu
          await axios.post("https://api.line.me/v2/bot/richmenu/bulk/link", {
            richMenuId: "richmenu-d42d32034f6d9c34ee937b0d01d9787b",
            userIds: [userId]
          }, {
            headers: {
              "Authorization": `Bearer ${process.env.CHANNEL_TOKEN}`,
              "Content-Type": "application/json"
            }
          })
        }
        else res.send(JSON.stringify({
          "followupEventInput": {
            "name": "register-get-confirmation",
            "parameters": {
              ...parameters
            },
            "languageCode": "en-US",
          }
        }))
        break

      // =========================================================================================
      // =========================================================================================
      // Look up
      case "0ba5f5cb-2c6f-4569-ac68-fde2f239196b":
        // This function only allow instructors
        await stdUtils.sendFilterOptions(originalMsg.replyToken, await usrUtils.checkUserType(userId))
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "lookup-get-filter",
            "languageCode": "en-US",
          }
        }))
        break
      // Get filter
      case "39ff94d9-4c5a-4794-966b-e945f4da47c4":
        switch(parameters.filter){
          case "studentID":
            if(await usrUtils.checkUserType(userId) !== "user") return await reply(originalMsg.replyToken,'Unauthorized! You are not allowed to use this function.')
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "lookup-by-studentID",
                "languageCode": "en-US",
              }
            }))
            break
          case "studentName":
            if(await usrUtils.checkUserType(userId) !== "user") return await reply(originalMsg.replyToken,'Unauthorized! You are not allowed to use this function.')
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "lookup-by-name",
                "languageCode": "en-US",
              }
            })) 
            break
          case "courseCode":
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "lookup-by-coursecode",
                "languageCode": "en-US",
              }
            })) 
            break
          default:
            await reply(originalMsg.replyToken, 'Wrong input, cancelling.')
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "end-intent",
                "languageCode": "en-US",
              }
            }))
            break
        }
        break
      // Lookup by studentID
      case "9203a24c-9b63-4ef6-a88b-aef08aab94b4":
        await stdUtils.getStudentInfo(originalMsg.replyToken, parameters)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // Lookup by student name
      case "58fdea74-2799-4f86-ad5e-f284073d2d65":
        // console.log('test') // เข้า 2 รอบ
        const searchStudent = await stdUtils.searchStudent(parameters)
        switch(searchStudent.case){
          case 0: await reply(originalMsg.replyToken, "Student not found.")
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "end-intent",
                "languageCode": "en-US",
              }
            }))
            break
          case 1: await stdUtils.getStudentInfo(originalMsg.replyToken, { sid: searchStudent.sid } )
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "end-intent",
                "languageCode": "en-US",
              }
            }))
            break
          case 2: await stdUtils.getStudentOptions(originalMsg.replyToken, parameters)
            return res.send(JSON.stringify({
              "followupEventInput": {
                "name": "lookup-get-student-options",
                "languageCode": "en-US",
              }
            }))
            break
        }
        break
      // Lookup select student
      case "ed385f25-a910-41e1-9e2d-84b2b8e727d1":
        await stdUtils.getStudentInfo(originalMsg.replyToken, parameters)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // Lookup by course code
      case "3af5fa94-8da0-4e32-8437-abb3f13836e7":
        await courseUtils.getCourseInfo(originalMsg.replyToken, parameters)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // Lookup student's grade by typing (my grade)
      case "88922083-d33e-4d09-8bb7-3cd7c6e158a1":
        if(await usrUtils.checkUserType(userId) !== "student") return await reply(originalMsg.replyToken,'Unauthorized! You did not register as student.\nContact the administrator for help')
        await stdUtils.lookupStudentByLineId(originalMsg.replyToken, userId)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // Return user type
      case "3cae7e00-921b-41aa-9615-b750bf9b39b4":
        await reply(originalMsg.replyToken, await usrUtils.checkUserType(userId))
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
      // Show list of commands
      case "b058bcfd-8115-42f9-8d3f-254a691d0cd9":
        switch(await usrUtils.checkUserType(userId)){
          case "user": await usrUtils.listOfCommands(originalMsg.replyToken,0)
          return res.send(JSON.stringify({
            "followupEventInput": {
              "name": "end-intent",
              "languageCode": "en-US",
            }
          }))
            break
          case "student": await usrUtils.listOfCommands(originalMsg.replyToken,1)
          return res.send(JSON.stringify({
            "followupEventInput": {
              "name": "end-intent",
              "languageCode": "en-US",
            }
          }))
            break
          case "unregistered": await usrUtils.listOfCommands(originalMsg.replyToken,2)
          return res.send(JSON.stringify({
            "followupEventInput": {
              "name": "end-intent",
              "languageCode": "en-US",
            }
          }))
            break
        }
        break
      // new-faq
      case "9627140d-6c83-4bed-8c6d-26450bc20dda":
        await faqUtils.getFilter(originalMsg.replyToken)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "new-faq-filter",
            "languageCode": "en-US",
          }
        }))
        break
      // new-faq-filter
      case "efdd7310-c6fa-4718-a54d-9bb73e76e258":
        await faqUtils.faqResponse(originalMsg.replyToken, parameters)
        return res.send(JSON.stringify({
          "followupEventInput": {
            "name": "end-intent",
            "languageCode": "en-US",
          }
        }))
        break
    }
  } catch(err) {
    console.log(err)
  }
})

// Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
  console.log(`🔥 Error: ${err.message}`)
  console.log(`🔥 Shutting down the server due to handled promise rejection.`)
  server.close( () => {
      process.exit(1)
  })
})