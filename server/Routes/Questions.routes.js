const express = require("express");

const questionSchema = require("../models/Questions");
const userSchema = require("../models/Users");
const questionsRouter = express();
const multer = require("multer");
const path = require("path");
const tagSchema = require("../models/Tags");
const AWS = require('aws-sdk');


//Setting up AWS S3 Buckets
AWS.config.update({region: 'us-east-1'})

s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
})
const answersSchema = require("../models/Answers");

// Multer Middleware

const questionImageStore = multer.diskStorage({
  destination: (req, res, callback) => {
    callback(null, "./questionImages");
  },

  filename: (req, file, callback) => {
    console.log(file);
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadQuestionImage = multer({ storage: questionImageStore });

questionsRouter.post(
  "/api/add-question",
  // uploadQuestionImage.single("image"),
  async (req, res) => {
    // let data = JSON.parse(req.body.information);

    // console.log(req.file.filename);
    const { title, body, codeBody, codeLanguage, user_id, tags } = req.body;
    const newQuestion = new questionSchema({
      title: title,
      body: body,
      code: {
        codeBody: codeBody,
        codeLanguage: codeLanguage,
      },
      // image: req.file.filename,
      tags: tags,
      userId: user_id,
    });

    try {
      const response = await newQuestion.save();
      res.status(201).json({ success: `new question: ${title} created!` });
      // res.json(newQuestion);
    } catch (err) {
      console.log(err);
    }
  }
);

questionsRouter.get("/api/all-questions", async (req, res) => {
  const findQuestions = await questionSchema.find();
  res.json(findQuestions);
});

questionsRouter.get("/question", async (req, res) => {
  const { questionId } = req.query;

  const Question = await questionSchema.findOne({ _id: questionId });
  const userData = await userSchema.findOne({ _id: Question.userId });

  const answers = await answersSchema.find({ questionId: questionId });

  // https://stackoverflow.com/questions/42964102/syntax-for-an-async-arrow-function

  const answersList = await Promise.all(
    answers.map(async (answer) => {
      const answerUser = await userSchema.findOne({ _id: answer.user });
      return {
        ...answer._doc,
        user: {
          userScore: answerUser.userScore,
          username: answerUser.username,
          id: answerUser._id,
        },
      };
    })
  );
  const { userScore, username } = userData;
  let voteScore = 0;

  Question.questionInteraction.votes.map((vote) => {
    // vote action true add one
    if (vote.action) {
      voteScore = voteScore + 1;
    }
    // else vote action false subtract one
    else {
      voteScore = voteScore - 1;
    }

    // get answers
  });
  res.json({
    Question: {
      ...Question._doc,
      questionInteraction: {
        ...Question._doc.questionInteraction,
        voteScore: voteScore,
      },
      answers: answersList,
    },
    userData: {
      userScore: userScore,
      username: username,
    },
  });
});

questionsRouter.get("/api/all-tags", async (req, res) => {
  try {
    const findTags = await tagSchema.find();
    const availableTags = findTags.filter((tag) => {
      return tag.tombstone === false;
    });
    res.json(availableTags);
  } catch (err) {
    res.json(500).json({ msg: err.message });
  }
});

questionsRouter.post("/unique-tags", async (req, res) => {
  const { UniqueTagsList } = req.body;
  try {
    const findTags = await tagSchema.find({ _id: UniqueTagsList });
    res.json(findTags);
  } catch (err) {
    res.json(500).json({ msg: err.message });
  }
});

questionsRouter.post("/api/add-tag", async (req, res) => {
  const { tagName } = req.body;

  const tagDuplicate = await tagSchema.findOne({ tagName: tagName }).exec();

  if (tagDuplicate) {
    console.log("dup detacted");
    return res.sendStatus(409);
  }
  const newTag = new tagSchema({
    tagName: tagName,
  });
  try {
    const response = await newTag.save();
    res.status(201).json({ success: `new tag: ${tagName} created!` });
  } catch (err) {
    res.json(500).json({ msg: err.message });
  }
});

questionsRouter.patch("/delete-tag", async (req, res) => {
  const { tagId } = req.body;

  //   const tag = await tagSchema.findOne({ _id: req.body.id }).exec();
  //   if (!tag) {
  //     res.status(204).json({ message: "No Tag Exists!" });
  //   }
  //   res.json(tagId);
  const update = await tagSchema
    .findByIdAndUpdate(tagId, { tombstone: true })
    .exec();
  res.json("tag has been removed");
});

questionsRouter.patch("/question-vote", async (req, res) => {
  const { userId, action, questionId } = req.body;

  // find if user id and user exists
  const userFound = await userSchema.findOne({ _id: userId }).exec();
  const update = await questionSchema.findById(questionId).exec();
  const voteDuplicate = update.questionInteraction.votes.filter((vote) => {
    return vote.userId === userId;
  });
  if (!userFound) {
    res.status(209).json("You need to be logged in to vote on a question");
    return;
  }
  if (voteDuplicate.length > 0) {
    if (voteDuplicate[0].action === action) {
      res.status(209).json("You cant vote twice on a question");
    } else {
      const index = update.questionInteraction.votes.findIndex((vote) => {
        return vote === voteDuplicate[0];
      });
      update.questionInteraction.votes.splice(index, 1);
      update.questionInteraction.votes.push({
        userId: userId,
        action: action,
      });
      update.save();
      res.status(200).json("Vote updated");
    } 
    return;
  } else{
    update.questionInteraction.votes.push({
      userId: userId,
      action: action,
    })
    update.save();
  }

  res.json("vote complete");
  return;
});

module.exports = questionsRouter;
