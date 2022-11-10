import React, { useEffect, useState } from "react";
import styles from "./IndividualQuestion.module.scss";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Answer } from "./UI/Answer/Answer";

import userProfileImage from "../../../../assets/profilePicture.jpg";
import { CommentList } from "./UI/ComentList/CommentList";
import { AnswerPortal } from "./UI/AnswerPortal/AnswerPortal";
import axios from "../../../../api/axios";
import moment from "moment";
import { useAuth } from "../../../../Hooks/useAuth";
import { LoadingScreen } from "../../../UI/LoadingScreen/LoadingScreen";
import { Button } from "../../../UI/Button/Button";
import { Textarea } from "../../../UI/Textarea/Textarea";

const convertTimeCreated = (timeCreated) => {
  // https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/07-difference/#:~:text=To%20get%20the%20difference%20in,you%20would%20use%20moment%23from%20.&text=To%20get%20the%20difference%20in%20another%20unit%20of%20measurement%2C%20pass,measurement%20as%20the%20second%20argument.&text=To%20get%20the%20duration%20of,an%20argument%20into%20moment%23duration%20.

  let displayTime = moment()
    .subtract(2, "h")
    .diff(moment(timeCreated), "seconds");
  let displayTimeMessage = "Asked " + displayTime + " seconds ago";
  if (displayTime > 604800) {
    displayTimeMessage = moment(timeCreated).format("lll");
  } else if (displayTime / (3600 * 24) > 2) {
    displayTimeMessage =
      "Asked " + Math.floor(displayTime / (3600 * 24)) + " days ago";
  } else if (displayTime / (3600 * 24) > 1) {
    displayTimeMessage =
      "Asked " + Math.floor(displayTime / (3600 * 24)) + " day ago";
  } else if (displayTime / 3600 > 2) {
    displayTimeMessage =
      "Asked " + Math.round(displayTime / 3600) + " hours ago";
  } else if (displayTime / 3600 > 1) {
    displayTimeMessage =
      "Asked " + Math.round(displayTime / 3600) + " hour ago";
  } else if (displayTime / 60 > 2) {
    displayTimeMessage =
      "Asked " + Math.round(displayTime / 60) + " minuets ago";
  } else if (displayTime / 60 > 1) {
    displayTimeMessage =
      "Asked " + Math.round(displayTime / 60) + " minuet ago";
  }
  return displayTimeMessage;
};

export default function IndividualQuestion() {
  let params = useParams();
  const { Auth } = useAuth();
  const navigate = useNavigate();

  const [QuestionData, setQuestionData] = useState(null);
  const [GetQuestionData, setGetQuestionData] = useState(true);
  const [userHasVoted, setUserHasVoted] = useState({});

  const [ModalOptions, setModalOptions] = useState({
    show: false,
    message: "",
    modal_box_css: styles.modal_box,
  });

  const closeModalHandler = () => {
    setModalOptions({
      show: false,
      message: "",
      modal_box_css: styles.modal_box,
    });
  };

  const getQuestion = async (questionId) => {
    setGetQuestionData(true);
    const response = await axios.get("/question", {
      params: { questionId: questionId },
    });
    setQuestionData(response.data);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getQuestion(params.questionId);
      setGetQuestionData(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [GetQuestionData]);

  const voteHandler = async (action) => {
    try {
      const response = await axios.patch("/question-vote", {
        userId: Auth?.userData?.UserInfo?.userId,
        action: action,
        questionId: params.questionId,
      });
      if (response.status === 209) {
        setModalOptions({
          title: "Error",
          show: true,
          message: response.data,
          modal_box_css: `${styles.modal_box} ${styles.modal_box_show}`,
        });
        return;
      } else if (response.status === 200) {
        setGetQuestionData(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeAnswerHandler = async (answerId) => {
    try {
      const response = await axios.delete("/answer", {
        params: { answerId: answerId, questionId: params.questionId },
      });
      setGetQuestionData(true);
    } catch (error) {
      console.log(error);
    }
    return;
  };

  const removeQuestionHandler = async () => {
    const deleteQuestion = async () => {
      try {
        const response = await axios.delete("/question", {
          params: { questionId: params.questionId },
        });
        console.log("removed question");
        navigate("/questions");
      } catch (error) {
        console.log(error);
      }
    };
    setModalOptions({
      title: "Are You Sure",
      show: true,
      message: "Are you sure you want to remove this question",
      modal_box_css: `${styles.modal_box} ${styles.modal_box_show}`,
      extra: true,
      extraHtml: (
        <div className={styles.modal_buttons}>
          <Button onClick={deleteQuestion}>Yes</Button>
          <Button onClick={closeModalHandler}>No</Button>
        </div>
      ),
    });

    return;
  };

  useEffect(() => {
    if (QuestionData?.Question?.questionInteraction?.votes.length === 0) {
      setUserHasVoted({});
    }
    QuestionData?.Question?.questionInteraction?.votes.map((vote) => {
      if (vote.userId === Auth?.userData?.UserInfo?.userId) {
        setUserHasVoted({
          action: vote.action,
          voted: true,
        });
        return;
      } else {
        setUserHasVoted({});
        return;
      }
    });
  }, [QuestionData, GetQuestionData]);

  const answerVoteHandler = async (action, answerId) => {
    try {
      const response = await axios.patch("/answer-vote", {
        userId: Auth?.userData?.UserInfo?.userId,
        action: action,
        answerId: answerId,
      });
      if (response.status === 209) {
        setModalOptions({
          title: "Error",
          show: true,
          message: response.data,
          modal_box_css: `${styles.modal_box} ${styles.modal_box_show}`,
        });
        return;
      } else if (response.status === 200) {
        setGetQuestionData(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const correctAnswerHandler = async (answerId) => {
    try {
      const response = await axios.patch("/answer-set-correct", {
        answerId: answerId,
        questionId: params.questionId,
      });
      if (response.status === 209) {
        setModalOptions({
          show: true,
          message: response.data,
          modal_box_css: `${styles.modal_box} ${styles.modal_box_show}`,
        });
        return;
      } else if (response.status === 200) {
        setGetQuestionData(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isOwnedByUser =
    Auth?.userData?.UserInfo?.userId === QuestionData?.Question?.userId;

  // reporting

  const [ReportModalOptions, setReportModalOptions] = useState({
    show: false,
    modal_box_css: `${styles.report_form}`,
  });

  const closeReportModalHandler = () => {
    setReportModalOptions({
      show: false,
      modal_box_css: `${styles.report_form}`,
      error: false,
    });
  };

  const [ReportBody, setReportBody] = useState("");

  const reportServiceHandler = () => {
    setReportModalOptions({
      show: true,
      modal_box_css: `${styles.report_form} ${styles.modal_box_show}`,
      error: false,
    });
  };

  const submitReportHandler = async (event) => {
    event.preventDefault();
    if (ReportBody.length === 0) {
      setReportModalOptions((prevState) => {
        return {
          ...prevState,
          error: true,
        };
      });
      return;
    }
    try {
      const response = await axios.post("/report", {
        questionId: params.questionId,
        ReportBody: ReportBody,
        userId: Auth?.userData?.UserInfo?.userId,
      });
      console.log(response);
      if (response.status === 200) {
        closeReportModalHandler();
        setReportBody("");
        setModalOptions({
          title: "Report Submitted",
          show: true,
          message: response.data,
          modal_box_css: `${styles.modal_box} ${styles.modal_box_show}`,
          extra: true,
          extraHtml: (
            <div className={styles.modal_buttons}>
              <Button onClick={closeModalHandler}>Okay</Button>
            </div>
          ),
        });
        return;
      } else {
        setGetQuestionData(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(QuestionData);

  return (
    <div className={styles.container}>
      {GetQuestionData ? (
        <div className={styles.loader_container}>
          <LoadingScreen />
          <h3>Loading Question...</h3>
        </div>
      ) : (
        <>
          {ModalOptions.show && (
            <div onClick={closeModalHandler} className={styles.modal}></div>
          )}
          {ReportModalOptions.show && (
            <div
              onClick={closeReportModalHandler}
              className={styles.modal}
            ></div>
          )}

          <form
            className={ReportModalOptions.modal_box_css}
            onSubmit={submitReportHandler}
          >
            <div className={styles.close_btn} onClick={closeReportModalHandler}>
              <ion-icon name="close-outline"></ion-icon>
            </div>
            <h3>Your Report</h3>
            <h5>tell us why you are reporting this question</h5>
            {ReportModalOptions.error && (
              <h5 className={styles.error_message}>
                Your report needs to have a body
              </h5>
            )}
            <Textarea
              id="reportBody"
              value={ReportBody}
              placeHolder={"your report body goes here"}
              rows="12"
              onChange={(event) => {
                setReportBody(event.target.value);
              }}
            />
            <div className={styles.modal_buttons}>
              <Button>Report Question</Button>
            </div>
          </form>

          <div className={ModalOptions.modal_box_css}>
            <div className={styles.close_btn} onClick={closeModalHandler}>
              <ion-icon name="close-outline"></ion-icon>
            </div>
            <h3>{ModalOptions.title}</h3>
            <br />
            <h4>{ModalOptions.message}</h4>
            {ModalOptions.extra && ModalOptions.extraHtml}
          </div>
          <header>
            <div className={styles.header_main}>
              <h2>{QuestionData?.Question?.title}</h2>
              <Link to="/questions-portal">Ask Question</Link>
            </div>
            <div className={styles.question_activity_header}>
              <p>
                {convertTimeCreated(QuestionData?.Question?.questionCreated)}
              </p>
            </div>
          </header>
          <div className={styles.question_container}>
            <div className={styles.voting}>
              <div
                className={
                  userHasVoted?.action && userHasVoted?.voted
                    ? styles.voted
                    : undefined
                }
              >
                <ion-icon
                  onClick={() => {
                    voteHandler(true);
                  }}
                  name="chevron-up-outline"
                ></ion-icon>
              </div>
              <h3>{QuestionData?.Question?.questionInteraction.voteScore}</h3>
              <div
                className={
                  !userHasVoted?.action && userHasVoted?.voted
                    ? styles.voted
                    : undefined
                }
              >
                <ion-icon
                  onClick={() => {
                    voteHandler(false);
                  }}
                  name="chevron-down-outline"
                ></ion-icon>
              </div>
            </div>
            <div className={styles.question_content}>
              <h5>{QuestionData?.Question?.body}</h5>
              <SyntaxHighlighter
                language={QuestionData?.Question?.code?.codeLanguage}
                children={true}
                wrapLines={true}
                showLineNumbers={true}
              >
                {QuestionData?.Question?.code?.codeBody}
              </SyntaxHighlighter>

              {QuestionData?.Question?.image && (
                <>
                  <h5>Screenshot</h5>
                  <br />
                  <img
                    className={styles.question_screenshot}
                    src={QuestionData?.Question?.image}
                  />
                </>
              )}

              <div className={styles.tag_list}>
                {QuestionData?.Question?.tags.map((tag) => {
                  if (!tag.tombstone) {
                    return <Link key={tag._id}>{tag?.tagName}</Link>;
                  }
                  return (
                    <p key={tag._id} className={styles.tag_tombstone}>
                      {tag.tagName}
                    </p>
                  );
                })}
              </div>
              <div className={styles.question_user_details_container}>
                {Auth?.userData?.UserInfo?.userId ? (
                  <>
                    {!isOwnedByUser && (
                      <p
                        onClick={reportServiceHandler}
                        className={styles.report_question}
                      >
                        Report Question
                      </p>
                    )}
                    {isOwnedByUser && (
                      <p
                        onClick={removeQuestionHandler}
                        className={styles.report_question}
                      >
                        Remove Question
                      </p>
                    )}
                  </>
                ) : (
                  <p></p>
                )}
                <div className={styles.user_details}>
                  <h6>
                    Asked{" "}
                    {moment(QuestionData?.Question?.questionCreated).format(
                      "lll"
                    )}
                  </h6>
                  <div className={styles.user_card}>
                    <img
                      src={
                        QuestionData?.userData?.profilePictureLink
                      }
                    />
                    <div>
                      <p
                        onClick={() => {
                          navigate(
                            `/questions/UserSettings/${QuestionData?.Question?.userId}`
                          );
                        }}
                      >
                        {QuestionData?.userData?.username}
                      </p>
                      <h6>user score {QuestionData?.userData?.userScore} </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br></br>
          <div>
            <h3>
              {QuestionData?.Question?.answers.length}{" "}
              {QuestionData?.Question?.answers.length === 1 ? (
                <>Answer</>
              ) : (
                <>Answers</>
              )}{" "}
            </h3>
            {/* <p>Sorted by:</p> */}
          </div>
          {QuestionData?.Question?.answers.length > 0 &&
            QuestionData?.Question?.answers.map((answer) => {
              return (
                <Answer
                  removeAnswerHandler={removeAnswerHandler}
                  key={answer._id}
                  language={QuestionData?.Question?.code?.codeLanguage}
                  answer={answer}
                  answerVoteHandler={answerVoteHandler}
                  correctAnswerHandler={correctAnswerHandler}
                  correctAnswer={
                    QuestionData?.Question?.questionInteraction?.correctAnswer
                  }
                  questionUser={QuestionData?.Question?.userId}
                  profilePictureLink={answer.user.profilePictureLink}
                />
              );
            })}

          <AnswerPortal
            tag={QuestionData?.Question?.code?.codeLanguage}
            questionId={params.questionId}
            getQuestion={getQuestion}
          />
          <br></br>
          <br></br>
          <br></br>
          <br></br>
        </>
      )}
    </div>
  );
}
