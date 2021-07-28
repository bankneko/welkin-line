const {
  reply,
  replies,
  rawReply,
  getUserProfile,
  pushMessage
} = require('./line-utils')

exports.getFilter = async (replyToken) => {
  let messages = {
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
            text: "FAQ",
            weight: "bold",
            size: "sm",
            color: "#000000FF",
            contents: []
          }, {
            type: "text",
            text: "Please select your interested topic.",
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
              label: "Registration",
              text: "Registration"
            },
            contents: [{
              type: "text",
              text: "Registration",
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
              label: "Introduction to EGCI",
              text: "Introduction to EGCI"
            },
            contents: [{
              type: "text",
              text: "Introduction to EGCI",
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
              label: "Prerequisite",
              text: "Prerequisite"
            },
            contents: [{
              type: "text",
              text: "Prerequisite",
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
              label: "Internship",
              text: "Internship"
            },
            contents: [{
              type: "text",
              text: "Internship",
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
              label: "Senior project",
              text: "Senior project"
            },
            contents: [{
              type: "text",
              text: "Senior project",
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
              label: "Graduation",
              text: "Graduation"
            },
            contents: [{
              type: "text",
              text: "Graduation",
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
              label: "Post Graduation",
              text: "Post Graduation"
            },
            contents: [{
              type: "text",
              text: "Post Graduation",
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
    }]
  }
  return rawReply(messages)
}

exports.faqResponse = async (replyToken, parameters) => {
  let message
  let message2 = 'Type FAQ to get another info'
  switch (parameters.filter) {
    case "Registration":
      message = `In each trimester, student must take at least 12 credits or maximum of 22 credits. Unless student has an excuses such as "last trimester" or any problems. Student must contact OAA and ask for the form to fill in.`
      break
    case "Introduction to EGCI":
      message = `Please take EGCI100 and EGCI111 as early as possible. They will tell you whether you fit this major.`
      break
    case "Prerequisite":
      message = `Always check hard and soft prerequisite of each subject.\n- Hard prerequisite can be checked from Sky, you will not be registered if you haven’t passed the prerequisites.\n- Soft prerequisite, you can register but more likely not to get approved by your advisor.`
      break
    case "Internship":
      message = `1. When should I start?
      Internship opens every summer. Start searching for a place in Trimester 1, the latest is in trimester 2.
      Make your CV ready, the big names require more time for internship recruitment.\n\n2. How to find the internship place?
      1. Consult P’toey or your seniors for internship places from previous years.
      2. Check EGCO facebook for updates and company coming for recruitment.
      3. Search from the internet 
      4. Internship abroad is\n\n3. What type of work should I do?
      1. Ask yourself, not your friends or advisor.`
      break
    case "Senior project":
      message = `1. Register for EGCI491(project seminar.) at least 2 trimesters before you plan to graduate.\n2. Take EGCI492(Projects) on your last trimester with fewer subjects left.\n3. Senior projects takes more time than you expected.  The whole year is required to do your entire project.`
      break
    case "Graduation":
      message = `1. Check your registration with OAA, 1 or 2 trimester before you think* you are going to graduate. They will confirms whether what you think is correct.
      Don’t crying over spilt milk!!!! 
      What had happened, some of your seniors talked to OAA exactly at the last trimester, they found out that the last requirement is not opened in that trimester or it is fulled. Nothing your advisor nor PD can do anything for you.\n\n2. Register fewer than 12 credits? 
      Only allowed for your last trimester of study. 
      Take the form from OAA  —> Fill in all the form —> submit to your advisor.`
      break
    case "Post Graduation":
      message = `CV is very important after graduation, do not wait until you graduate. You need your cv to apply for a job/jobs or continue to your postgrad study.`
      break
    default:
      message = `Wrong topic, cancelling`
      break
  }
  await replies(replyToken, [message, message2])
}