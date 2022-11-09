import React, { useState, useRef, useEffect } from "react";
import styles from "./UserSettings.module.scss";
import formLogo from "../../../assets/OpenStackLogo.png";
import profileIcon from "../../../assets/profilePicture.jpg";
import { Input } from "../../UI/Input/Input";
import { Button } from "../../UI/Button/Button";

import StockCards from "../Achievements/Achievements";
// import Button from "../../Button/Button"
import Axios from "axios";
import { Link, useParams } from "react-router-dom";
import axios from "../../../api/axios";
import moment from "moment";
import { useAuth } from "../../../Hooks/useAuth";
import { ProfilePicModal } from "./ProfilePicModal/ProfilePicModal";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;

const UserSettings = () => {
  const { userId } = useParams();

  const { Auth } = useAuth();

  const [userData, setUserData] = useState();

  const [SelectedProfile, setSelectedProfile] = useState();

  const formattedSentence = (sentence) => {
    let newSentence = sentence
      .split(" ")
      .map((word) => {
        return word[0].toUpperCase() + word.toLowerCase().substring(1);
      })
      .join(" ");
    return newSentence;
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const getUserData = async () => {
      try {
        const response = await axios.get("/user", {
          signal: controller.signal,
          params: { userId: userId },
        });
        isMounted && setUserData(response.data);
        setSelectedProfile(response.data.user.profilePictureLink);
      } catch (err) {
        console.log(err);
      }
    };

    getUserData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  const [ProfilePictureModal, setProfilePictureModal] = useState(
    `${styles.profile_picture_modal}`
  );

  const closeModalHandler = () => {
    setUser("");
    setModalSettings({
      open: false,
      scss: `${styles.modal_container}`,
    });
    setProfilePictureModal(`${styles.profile_picture_modal}`);
  };

  const [ModalSettings, setModalSettings] = useState({
    open: false,
    scss: `${styles.modal_container}`,
  });

  const changeUserNameHandler = () => {
    setModalSettings({
      open: true,
      scss: `${styles.modal_container} ${styles.open}`,
    });
  };

  const changeUserImageHandler = () => {
    setModalSettings({
      open: true,
      scss: `${styles.modal_container}`,
    });
    setProfilePictureModal(`${styles.modal_container} ${styles.open}`);
  };

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("CaidynGinger");
  const [validName, setValidName] = useState(true);
  const [userFocus, setUserFocus] = useState(false);

  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (userFocus) {
        setValidName(USER_REGEX.test(user));
      }
    }, 1000);
    return () => {
      clearTimeout(identifier);
    };
  }, [user]);

  const changeUserNameSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.patch("/user-username", {
        userId: Auth?.userData?.UserInfo?.userId,
        newUsername: user,
      });
      if (response.status === 209) {
        setErrMsg("error name must be valid");
        return;
      } else if (response.status === 200) {
        setUserData((prevState) => {
          return { ...prevState, user: { ...prevState.user, username: user } };
        });
        setUser("");
        setModalSettings({
          open: false,
          scss: `${styles.modal_container}`,
        });
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else if (err.response?.status === 410) {
        setErrMsg("Email is in use");
      } else {
        setErrMsg("Registration Failed");
      }
    }
  };

  const selectProfileImageHandler = (img) => {
    console.log(img);
    setSelectedProfile(img);
  };

  const changeUserImage = () => {
    const ChangeUserProfile = async () => {
      try {
        const response = await axios.patch("/user-profile", {
          newUserImg: SelectedProfile,
          userId: Auth?.userData?.UserInfo?.userId
        });
      } catch (err) {
        console.log(err);
      }
    };
    ChangeUserProfile()
    closeModalHandler()
    setUserData((prevState) => {
      console.log(prevState);
      return {
        ...prevState,
        user: { ...prevState.user, profilePictureLink: SelectedProfile },
      };
    });
  };
  return (
    <section className={styles.user_page}>
      {userData ? (
        <>
          {ModalSettings.open && (
            <div
              onClick={closeModalHandler}
              className={styles.modal_background}
            ></div>
          )}
          <div className={ProfilePictureModal}>
            <div onClick={closeModalHandler} className={styles.close_btn}>
              <ion-icon name="close-outline"></ion-icon>
            </div>
            <ProfilePicModal
              changeUserImage={changeUserImage}
              selectedUserImage={SelectedProfile}
              selectProfileImage={selectProfileImageHandler}
            />
          </div>
          <div className={ModalSettings.scss}>
            <div onClick={closeModalHandler} className={styles.close_btn}>
              <ion-icon name="close-outline"></ion-icon>
            </div>
            <form onSubmit={changeUserNameSubmitHandler}>
              <h3>Change Username</h3>
              {errMsg && (
                <p
                  ref={errRef}
                  className={styles.error_message}
                  aria-live="assertive"
                >
                  {errMsg}
                </p>
              )}
              <Input
                label="Username"
                type="text"
                id="username"
                ref={userRef}
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required={true}
                aria-invalid={validName ? "false" : "true"}
                aria-describedby="uidnote"
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                valid={validName}
              />
              {!validName && (
                <p id="uidnote" className={styles.helper_text}>
                  4 to 24 characters.
                  <br />
                  No Spaces are allowed
                  <br />
                  Must begin with a letter.
                  <br />
                  Letters, numbers, underscores, hyphens allowed.
                </p>
              )}
              <br></br>
              <Button disabled={!validName}>Change My Name</Button>
            </form>
          </div>
          <header>
            <h2>
              {userData?.user?.username} | Score {userData?.user?.userScore}
            </h2>
            <Link to="/questions-portal">Ask Question</Link>
          </header>
          <br />
          <hr />
          <br />
          <div className={styles.user_header}>
            <img
              className={styles.user_img}
              src={
                "http://localhost:5001/images/" +
                userData?.user?.profilePictureLink
              }
            />
            <div className={styles.achievement_list_container}>
              <h4>Achievements List</h4>
              <div className={styles.achievement_list}>
                {userData?.achievements.map((achievement) => {
                  return (
                    <div className={styles.achievement_container}>
                      <img
                        className={
                          !achievement.achieved ? styles.achieved : undefined
                        }
                        src={achievement.location}
                      />
                      <div className={styles.achievement_desc}>
                        <h5>{achievement.title}</h5>
                        <p>{achievement.decs}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <br />
          <br />
          <div className={styles.divide}>
            <div>
              <h3>Answers</h3>
              <div className={styles.container}>
                {userData.userAnswers.map((answer) => {
                  // console.log(answer);
                  return (
                    <div className={styles.question_card}>
                      <span
                        className={
                          answer.correctAnswer === answer._id
                            ? styles.correct
                            : undefined
                        }
                      >
                        {answer.votes.length}
                      </span>
                      <Link
                        to={`/questions/individual/${answer.questionId[0]}`}
                      >
                        <h5>{formattedSentence(answer.questionTitle)}</h5>
                      </Link>
                      <p>{moment(answer.date).format("MMM Do")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.spacer}></div>
            <div>
              <h3>Questions asked</h3>
              <div className={styles.container}>
                {userData.userQuestions.map((question) => {
                  return (
                    <div className={styles.question_card}>
                      <span
                        className={
                          question.questionInteraction.correctAnswer
                            ? styles.correct
                            : undefined
                        }
                      >
                        {question.questionInteraction.votes.length}
                      </span>
                      <Link to={`/questions/individual/${question._id}`}>
                        <h5>{formattedSentence(question.title)}</h5>
                      </Link>
                      <p>{moment(question.questionCreated).format("MMM Do")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <br />
          <br />
          <hr />
          <br />
          {Auth?.userData?.UserInfo?.userId === userId && (
            <>
              <h3>Danger Zone</h3>
              <a
                onClick={changeUserNameHandler}
                className={styles.danger_zone_a}
              >
                Change Username
              </a>
              <a
                onClick={changeUserImageHandler}
                className={styles.danger_zone_a}
              >
                Change Profile picture
              </a>
            </>
          )}
        </>
      ) : (
        <>
          <header>
            <h2>User</h2>
            <Link to="/questions-portal">Ask Question</Link>
          </header>
          <br />
          <hr />
          <br />
          <h3>Ohh no there was no user found</h3>
        </>
      )}
    </section>
  );
};
export default UserSettings;
