import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import axios from "../../../../../../api/axios";
import userProfileImage from "../../../../../../assets/profilePicture.jpg";
import { useAuth } from "../../../../../../Hooks/useAuth";
import styles from "./Answer.module.scss";

export const Answer = (props) => {
  const answer = props.answer;

  const { Auth } = useAuth();
  const [userHasVoted, setUserHasVoted] = useState({});
  const isOwnedByUser = Auth?.userData?.UserInfo?.userId === answer.user.id;

  const removeAnswerHandlerChild = async () => {
    props.removeAnswerHandler(answer._id);
  };

  const navigate = useNavigate()

  useEffect(() => {
    if (answer.votes.length === 0) {
      setUserHasVoted({});
    }
    answer.votes.map((vote) => {
      if (vote.userId === Auth?.userData?.UserInfo?.userId) {
        setUserHasVoted({
          action: vote.action,
          voted: true,
        });
      }
      return null;
    });
  }, [props.answer]);

  return (
    <div className={styles.container}>
      <div className={styles.question_container}>
        <div className={styles.voting}>
          {Auth?.userData?.UserInfo?.userId === props.questionUser ? (
            <div
              className={`${styles.correct_button} ${
                answer._id === props.correctAnswer ? styles.correct : undefined
              }`}
            >
              <ion-icon
                onClick={() => {
                  props.correctAnswerHandler(answer._id);
                }}
                name="checkmark-outline"
              ></ion-icon>
            </div>
          ) : answer._id === props.correctAnswer ? (
            <div className={`${styles.correct_button_correct}`}>
              <ion-icon name="checkmark-outline"></ion-icon>
            </div>
          ) : (
            <></>
          )}
          <div
            className={
              userHasVoted?.action && userHasVoted?.voted
                ? styles.voted
                : undefined
            }
          >
            <ion-icon
              onClick={() => {
                props.answerVoteHandler(true, answer._id);
              }}
              name="chevron-up-outline"
            ></ion-icon>
          </div>
          <h3>{answer.score}</h3>
          <div
            className={
              !userHasVoted?.action && userHasVoted?.voted
                ? styles.voted
                : undefined
            }
          >
            <ion-icon
              onClick={() => {
                props.answerVoteHandler(false, answer._id);
              }}
              name="chevron-down-outline"
            ></ion-icon>
          </div>
        </div>
        <div className={styles.question_content}>
          <h5>{answer.body}</h5>
          <SyntaxHighlighter
            language={props.language}
            children={true}
            wrapLines={true}
            showLineNumbers={true}
          >
            {answer.code}
          </SyntaxHighlighter>
          <br />
          <div className={styles.question_user_details_container}>
            {Auth?.userData?.UserInfo?.userId ? (
              <>
                {!isOwnedByUser && (
                  <p className={styles.report_question}>Report Answer</p>
                )}
                {isOwnedByUser && (
                  <p
                    onClick={removeAnswerHandlerChild}
                    className={styles.report_question}
                  >
                    Remove Answer
                  </p>
                )}
              </>
            ) : (
              <p></p>
            )}

            <div className={styles.user_details}>
              <h6>Answered {moment(answer.created).format("lll")}</h6>
              <div className={styles.user_card}>
              <img src={
                    props.profilePictureLink
                  } />
                <div>
                  <p onClick={() => {navigate(`/questions/UserSettings/${answer.user.id}`)}}>{answer.user.username}</p>
                  <h6>user score {answer.user.userScore}</h6>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
