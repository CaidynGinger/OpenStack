const nodemailer = require("nodemailer");

async function emailService(data) {
  const emailHtml = `<div style="width: 100vw;">
  <div
    style="
      border-radius: 5px;
      padding-bottom: 5vh;
      background-color: #fbfbfb;
      box-shadow: 0 3px 10px rgb(0 0 0 / 0.25);
    "
  >
    <img
      style="padding: 30px; text-align: center; margin: 0;"
      src="https://drive.google.com/uc?id=1ZV1qtT5fJiYlqZEWCk2DL7nlCoqpY4KW"
      width="200px"
      alt="Hello"
    />
    <div style="padding: 30px; max-height: 70vh; background-color: #84d5de;">
      <h1 style="text-align: center;">
        Hello World...I mean hello ${data.username}!
      </h1>
      <div
        style="
          height: 100vh;
          width: 50vw;
          margin: 0 auto;
          background-size: contain;
          background-repeat: no-repeat;
          background-image: url(https://drive.google.com/uc?id=11GgFUghBQ4d5A-mSMzipDAir84sCKdwV);
        "
      ></div>
    </div>
    <div>
      <h2 style="text-align: center;">Hey you're almost done!</h2>
      <br />
      <p style="text-align: center;">
        You're almost finished signing up, ${data.username}! <br />
        Just press the huge sign up button to finish the process <br />
        and confirm your email address.
      </p>
      <br />
      <a href="#" style="text-decoration: none; color: white;"
        ><div
          style="
            width: 80vw;
            padding: 1vh;
            border-radius: 5px;
            text-align: center;
            margin: 0 auto;
            background-color: #fca62b;
            box-shadow: 0 3px 10px rgb(0 0 0 / 0.25);
          "
        >
          Verify email address
        </div></a
      >
    </div>
  </div>
  <br />
  <div style="height: 200px;">
    <h3 style="text-align: center;">Stay in touch</h3>
    <div style="margin-left: 40vw;">
      <a href="https://www.facebook.com/theopenwindow/"
        ><div
          style="
            height: 40px;
            width: 40px;
            float: left;
            background-image: url(https://drive.google.com/uc?id=1afDSpPjl8V68R3L9kLEgRWpozjyjEplc);
            background-size: contain;
            border-radius: 100%;
            margin: 0.25vw;
          "
        ></div
      ></a>
      <a href="https://mobile.facebook.com/openwindow"
        ><div
          style="
            height: 40px;
            width: 40px;
            float: left;
            background-image: url(https://drive.google.com/uc?id=1yVEkhDw1DdcaaNyKiU2CblFsM3kSEzpM);
            background-size: contain;
            border-radius: 100%;
            margin: 0.25vw;
          "
        ></div
      ></a>
      <a href="https://www.instagram.com/openwindowinstitute/"
        ><div
          style="
            height: 40px;
            width: 40px;
            float: left;
            background-image: url(https://drive.google.com/uc?id=1kcR42EhCoDtu4UsBFRpKMTQbs9pW61I2);
            background-size: contain;
            border-radius: 100%;
            margin: 0.25vw;
          "
        ></div
      ></a>
    </div>
  </div>
</div>`;
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
    from: '"Open Stack Team"',
    to: data.email,
    subject: "New User Registration",
    html: emailHtml,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return console.log(err);

    console.log("Message Sent:", info.messageId);
  });
}

module.exports = emailService;