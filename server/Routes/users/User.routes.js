const express = require("express");

const nodemailer = require("nodemailer");

const userSchema = require("../../models/Users");
const questionSchema = require("../../models/Questions");
const answerSchema = require("../../models/Answers");
const userRouter = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("./userAuthenticationEmail.service");

const imageNames = [
  "profile1.png",
  "profile2.png",
  "profile3.png",
  "profile4.png",
  "profile5.png",
  "profile6.png",
  "profile7.png",
];

userRouter.get("/all-users", async (req, res) => {
  const findUsers = await userSchema.find();
  res.json(findUsers);
});

userRouter.patch("/update-user-roles", async (req, res) => {
  // res.json("update")

  const { UserRoles, userId } = req.body;
  // console.log(req);
  const update = await userSchema
    .findByIdAndUpdate(userId, { roles: UserRoles })
    .exec();
  res.json("roles have been update");
});

userRouter.post("/api/register", async (req, res) => {
  const { user, pwd, Email, SelectedImg } = req.body;

  console.log(!user || !pwd || !Email);

  if (!user || !pwd || !Email) {
    return res
      .status(400)
      .json({ message: "Username, Email and password are required." });
  }

  const usernameDuplicate = await userSchema.findOne({ username: user }).exec();
  const emailDuplicate = await userSchema.findOne({ email: Email }).exec();
  if (usernameDuplicate) {
    return res.sendStatus(409); //Conflict
  }
  if (emailDuplicate) {
    return res.sendStatus(410); //Conflict
  }

  if (
    imageNames.filter((img) => {
      return img === SelectedImg;
    }).length > 0
  ) {
    return res.sendStatus(411); //Conflict
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    const emailData = jwt.sign(
      { user, hashedPwd, Email, SelectedImg },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    emailLink = "http://localhost:3000/verify-account/" + emailData;

    console.log(emailData);
    emailService({
      username: user,
      email: Email,
      emailLink: emailLink,
    });

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

userRouter.post("/api/create-user", async (req, res) => {
  const { accountData } = req.body;

  try {
    function parseJwt(token) {
      return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    }
    const userDetails = parseJwt(accountData);
    // if user exists force exit
    const foundUser = await userSchema.find({ email: userDetails.Email });

    if (foundUser.length > 0) {
      res.sendStatus(401);
    } else {
      console.log("create user");
      const result = await userSchema.create({
        username: userDetails.user,
        password: userDetails.hashedPwd,
        email: userDetails.Email,
        profilePictureLink: userDetails.SelectedImg,
      });
      res.status(200).json("account verified");
    }
  } catch (error) {
    console.log("error");
    res.sendStatus(402);
  }
});

// dont use ever
// userRouter.post("/api/del-all-users", async (req, res) => {
//   const findUsers = await userSchema.find().remove();
//   res.json("all users are gone!");
// });

userRouter.post("/unique-users", async (req, res) => {
  const { UniqueUsersList } = req.body;

  try {
    const findUsers = await userSchema.find({ _id: UniqueUsersList }).exec();
    const response = findUsers.map((user) => {
      return {
        userId: user._id,
        username: user.username,
        userScore: user.userScore,
      };
    });
    res.json(response);
  } catch (err) {
    res.json(500).json({ msg: err.message });
  }
});

userRouter.get("/reset-password", async (req, res) => {
  const { Email } = req.query;

  const user = await userSchema.findOne({ email: Email }).exec();
  if (user) {
    const refreshToken = jwt.sign(
      { username: user.username, passwordReset: true },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken
    user.refreshToken = refreshToken;
    await user.save();
    resetLink =
      "http://localhost:3000/reset-response/" + user._id + "/" + refreshToken;
    const mailerOutput = `
    <html>
      <body style="width: calc(100% - 200px); padding: 100px; margin: 0">
        <img
          style="text-align: center; margin: 0"
          src="https://drive.google.com/uc?id=1ZV1qtT5fJiYlqZEWCk2DL7nlCoqpY4KW"
          width="200px"
          height="auto"
          alt="Hello"
        />
        <h1 style="font-weight: 300">Hello ${user.username}</h1>
        <h2 style="font-weight: 300">
          Reset Your Password
        </h2>
        <p style="margin: 0; font-size: 18px">Let's reset your password so you can get back to answering and asking questions.</p>
        <br/>
        <a href=${resetLink}
          style="
            padding: 10px;
            background-color: #fca62b;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 3px 1px -2px #0003, 0 2px 2px #00000024,
              0 1px 5px #0000001f;
            color: white;
            font-size: 18px;
            text-decoration: none;
          "
          >Change my password</a
        >
        <br />
        <br/>
        <p style="margin: 0; font-size: 16px">If you did not ask to reset your password please ignore this email.</p>
        <br/>
        <p style="margin: 0; font-size: 16px">
          Have any questions need help please email us at support@open-stack.co.za
        </p>
        <br/>
        <p style="margin: 0; font-size: 16px">Happy coding Openstack</p>
      </body>
    </html>
  `;

    const transporter = nodemailer.createTransport({
      host: "luther.aserv.co.za",
      port: 465,
      secure: true,
      auth: {
        user: "noreply@open-stack.co.za",
        pass: "eUmmR3cnk3kNe32",
      },
    });

    const mailOptions = {
      from: '"Open Stack Team <noreply@open-stack.co.za>"',
      to: Email,
      subject: "Password Reset",
      html: mailerOutput,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return console.log(err);

      console.log("Message Sent:", info.messageId);
    });

    res.status(200).json("email sent to " + Email);
    return;
  }
  return res.sendStatus(409);
});

userRouter.post("/reset-password", async (req, res) => {
  const { userId, token, pwd } = req.body;
  const user = await userSchema.findOne({ _id: userId }).exec();

  if (user) {
    var tokenValid = false;
    var clientIdValid = token === user.refreshToken;

    const jwtDecode = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    console.log(jwtDecode.passwordReset);
    if (!jwtDecode.passwordReset) {
      res.sendStatus(410);
      return;
    }

    var currentTimestamp = new Date().getTime() / 1000;
    var jwtDate = new Date(jwtDecode.exp * 1000);
    var tokenIsNotExpired = jwtDate > currentTimestamp;
    console.log(tokenIsNotExpired);

    tokenValid = clientIdValid && tokenIsNotExpired;
    if (!tokenValid) {
      res.sendStatus(409);
      return;
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(pwd, salt, function (err, hash) {
        user.password = hash;
        user.save();
      });
    });
    res.status(200).json("password reset");
    return;
  }
  res.sendStatus(409);
  return;
});

userRouter.patch("/user-username", async (req, res) => {
  const { userId, newUsername } = req.body;
  const usernameDuplicate = await userSchema
    .findOne({ username: newUsername })
    .exec();
  if (usernameDuplicate) {
    res.status(409).json("username is taken");
    return;
  }
  const user = await userSchema.findOne({ _id: userId }).exec();
  user.username = newUsername;
  user.save();
  res.status(200).json("user name updated");
});

userRouter.get("/user", async (req, res) => {
  const { userId } = req.query;

  const user = await userSchema.findOne({ _id: userId }).exec();

  if (user === null) {
    res.status(404).json("no user");
    return;
  }

  const userQuestions = (await questionSchema.find({ userId: userId })).filter(
    (question) => {
      return !question.private;
    }
  );
  const userAnswers = await answerSchema.find({ user: userId }).exec();

  // questionTitle

  const userAnswersRefined = await Promise.all(
    userAnswers.map(async (answer) => {
      const question = (
        await questionSchema.find({
          _id: answer.questionId[0],
        })
      ).filter((question) => {
        return !question.private;
      });
      if (question[0]?.title) {
        return {
          ...answer._doc,
          questionTitle: question[0]?.title,
          correctAnswer: question[0]?.questionInteraction.correctAnswer,
        };
      }
      return;
    })
  );

  let xxx = userAnswersRefined.filter((i) => {
    return i != null;
  });

  // correctly answer
  // console.clear()
  const usersCorrectAnswers = xxx
    .map((x) => {
      return x.correctAnswer;
    })
    .filter((i) => {
      return i != null;
    }).length;

  const findQuestions = (
    await questionSchema.find().sort({ questionCreated: "desc" })
  ).filter((question) => {
    return !question.private;
  });

  const questionVotes = findQuestions.map((question) => {
    return question.questionInteraction.votes;
  });
  let userQuestionVotes = [];
  // console.log(questionVotes);
  questionVotes.forEach((votes) => {
    votes.filter((vote) => {
      console.log(vote.userId);
      console.log(userId);
      if (vote.userId === userId) {
        userQuestionVotes.push(vote);
      }
    });
    // return votes
  });
  console.log(userQuestionVotes.length);

  let achievements = [
    {
      title: "Admin",
      id: 0,
      location: "http://localhost:5001/images/badges/AdminBadge.png",
      decs: "Be given the privilege of admin",
      achieved:
        user?.roles?.filter((role) => {
          return role === 5150;
        }) > 0,
    },
    {
      title: "Score",
      id: 1,
      location: "http://localhost:5001/images/badges/Score1.png",
      decs: "Get a score of 20",
      achieved: user?.userScore >= 20,
    },
    {
      title: "Score",
      id: 2,
      location: "http://localhost:5001/images/badges/Score2.png",
      decs: "Get a score of 50",
      achieved: user?.userScore >= 50,
    },
    {
      title: "Score",
      id: 3,
      location: "http://localhost:5001/images/badges/Score3.png",
      decs: "Get a score of 100",
      achieved: user?.userScore >= 100,
    },
    {
      title: "Score",
      id: 4,
      location: "http://localhost:5001/images/badges/Score4.png",
      decs: "Get a score of 500",
      achieved: user?.userScore >= 500,
    },
    {
      title: "Ask",
      id: 5,
      location: "http://localhost:5001/images/badges/Ask 1.png",
      decs: "Ask your first question",
      achieved: userQuestions?.length >= 1,
    },
    {
      title: "Ask",
      id: 6,
      location: "http://localhost:5001/images/badges/Ask 3.png",
      decs: "Ask 3 questions",
      achieved: userQuestions?.length >= 3,
    },
    {
      title: "Ask",
      id: 7,
      location: "http://localhost:5001/images/badges/Ask 10.png",
      decs: "Ask 10 questions",
      achieved: userQuestions?.length >= 10,
    },
    {
      title: "Ask",
      id: 8,
      location: "http://localhost:5001/images/badges/Ask 20.png",
      decs: "Ask 20 questions",
      achieved: userQuestions?.length >= 20,
    },
    {
      title: "Ask",
      id: 8,
      location: "http://localhost:5001/images/badges/Ask 50.png",
      decs: "Ask 50 questions",
      achieved: userQuestions?.length >= 50,
    },
    {
      title: "Answers",
      id: 9,
      location: "http://localhost:5001/images/badges/1 corect answer.png",
      decs: "Have one correct answer",
      achieved: usersCorrectAnswers >= 1,
    },
    {
      title: "Answers",
      id: 10,
      location: "http://localhost:5001/images/badges/3 corect answer.png",
      decs: "Have 3 correct answers",
      achieved: usersCorrectAnswers >= 3,
    },
    {
      title: "Answers",
      id: 11,
      location: "http://localhost:5001/images/badges/5 corect answer.png",
      decs: "Have 5 correct answers",
      achieved: usersCorrectAnswers >= 5,
    },
    {
      title: "Question votes",
      id: 12,
      location: "http://localhost:5001/images/badges/Votes1.png",
      decs: "Vote on 5 questions",
      achieved: userQuestionVotes.length >= 5,
    },
    {
      title: "Question votes",
      id: 13,
      location: "http://localhost:5001/images/badges/Votes2.png",
      decs: "Vote on 25 questions",
      achieved: userQuestionVotes.length >= 25,
    },
    {
      title: "Question votes",
      id: 14,
      location: "http://localhost:5001/images/badges/Votes3.png",
      decs: "Vote on 50 questions",
      achieved: userQuestionVotes.length >= 50,
    },
    {
      title: "Question votes",
      id: 15,
      location: "http://localhost:5001/images/badges/Votes4.png",
      decs: "Vote on 100 questions",
      achieved: userQuestionVotes.length >= 100,
    },
  ];

  try {
    res
      .status(200)
      .json({ user, achievements, userQuestions, userAnswers: xxx });
    return;
  } catch (error) {
    res.status(404).json(error);
    return;
  }
});

userRouter.get("/get-images", async (req, res) => {
  const response = imageNames.map((image) => {
    return "http://localhost:5001/images/" + image;
  });
  res.status(200).json(response);
});

userRouter.patch("/user-profile", async (req, res) => {
  const { userId, newUserImg } = req.body;

  const user = await userSchema.findOne({ _id: userId }).exec();
  user.profilePictureLink = newUserImg;
  user.save();

  res.status(200).json("userprofile changed");
});

module.exports = userRouter;
