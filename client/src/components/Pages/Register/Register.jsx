import React, { useState, useRef, useEffect } from "react";
import styles from "./Register.module.scss";
import formLogo from "../../../assets/OpenStackLogo.png";
import { Input } from "../../UI/Input/Input";
import { Button } from "../../UI/Button/Button";
import Axios from "axios";
import { useContext } from "react";
import AuthContext from "../../../Store/AuthProvider/AuthProvider";
import { Link } from "react-router-dom";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = "/api/register";

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(true);
  const [userFocus, setUserFocus] = useState(false);

  const [Email, setEmail] = useState("");
  const [ValidEmail, setValidEmail] = useState(true);
  const [EmailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(true);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [ShowPassword, setShowPassword] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(true);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) {
      userRef.current.focus();
    }
  }, []);

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

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (pwdFocus || matchFocus) {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
        console.log(pwd === matchPwd);
      }
    }, 1000);
    return () => {
      clearTimeout(identifier);
    };
  }, [pwd, matchPwd]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (EmailFocus) {
        setValidEmail(Email.includes("@virtualwindow.co.za"));
      }
    }, 1000);
    return () => {
      clearTimeout(identifier);
    };
  }, [Email]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const [ImageList, setImageList] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const getImageList = async () => {
      try {
        const response = await Axios.request({
          method: "GET",
          url: "http://localhost:5001/get-images",
          headers: { "Content-Type": "application/json" },
        });
        isMounted && setImageList(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    getImageList();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const [OpenProfileSelection, setOpenProfileSelection] = useState(false);

  const openProfileSectionHandler = () => {
    setOpenProfileSelection((prevState) => {
      return !prevState;
    });
  };

  const [SelectedImg, setSelectedImg] = useState(
    "http://localhost:5001/images/profile1.png"
  );

  const selectProfileImageHandler = (img) => {
    console.log(img);
    setSelectedImg(img);
    openProfileSectionHandler();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    const v3 = Email.includes("@virtualwindow.co.za");
    console.log(!USER_REGEX.test(user));
    console.log(!PWD_REGEX.test(pwd));
    if (!v1 || !v2 || !v3) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const response = await Axios.request({
        method: "POST",
        url: "http://localhost:5001/api/register",
        headers: { "Content-Type": "application/json" },
        data: { user, pwd, Email, SelectedImg },
      });
      console.log(response?.data);
      console.log(response?.accessToken);
      console.log(JSON.stringify(response));
      setSuccess(true);
      //clear state and controlled inputs
      //need value attrib on inputs for this
      setUser("");
      setPwd("");
      // setEmail("");
      setMatchPwd("");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else if (err.response?.status === 410) {
        setErrMsg("Email is in use");
      } else if (err.response?.status === 411) {
        setErrMsg("User img is not allowed");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <>
      {success ? (
        <section className={styles.register_background}>
          <div className={styles.register_container}>
            <img src={formLogo} />
            <hr></hr>
            <h2>Success</h2>
            <p className={styles.success_p}>
              Almost there we just need you to validate your email that was sent
              to you at <br /> <br />
              <span>{Email}</span>
            </p>
            <div className={styles.after_links}>
              <a href="https://mail.google.com/">Go to your email</a>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.register_background}>
          <div className={styles.register_container}>
            <img src={formLogo} />
            <hr></hr>
            <h2>Create an Openstack account</h2>
            {errMsg && (
              <p
                ref={errRef}
                className={styles.error_message}
                aria-live="assertive"
              >
                {errMsg}
              </p>
            )}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.profile_selection}>
                {OpenProfileSelection && (
                  <div
                    onClick={openProfileSectionHandler}
                    className={styles.gradient}
                  ></div>
                )}
                <h4>Select your profile image</h4>
                <img onClick={openProfileSectionHandler} src={SelectedImg} />
                {OpenProfileSelection && (
                  <div className={styles.profile_img_list}>
                    {ImageList.map((img) => {
                      return (
                        <img
                          key={img}
                          src={img}
                          onClick={() => {
                            selectProfileImageHandler(img);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
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

              <Input
                label="Email"
                type="text"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={Email}
                required={true}
                aria-invalid={ValidEmail ? "false" : "true"}
                aria-describedby="emailnote"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                valid={ValidEmail}
              />
              {!ValidEmail && (
                <p id="pwdnote" className={styles.helper_text}>
                  email must be a virtualwindow account
                </p>
              )}

              <Input
                label="Password"
                type={ShowPassword ? "text" : "password"}
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required={true}
                aria-invalid={validPwd ? "false" : "true"}
                aria-describedby="pwdnote"
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
                valid={validPwd}
                showHidePasswordHandler={setShowPassword}
                showHidePassword={ShowPassword}
                ShowHide={true}
              />
              {!validPwd && (
                <p id="pwdnote" className={styles.helper_text}>
                  8 to 24 characters.
                  <br />
                  Must include uppercase and lowercase letters, a number and a
                  special character.
                  <br />
                  Allowed special characters:{" "}
                  <span aria-label="exclamation mark">!</span>{" "}
                  <span aria-label="at symbol">@</span>{" "}
                  <span aria-label="hashtag">#</span>{" "}
                  <span aria-label="dollar sign">$</span>{" "}
                  <span aria-label="percent">%</span>
                </p>
              )}

              <Input
                label="Re-enter password"
                type={ShowPassword ? "text" : "password"}
                id="confirm_pwd"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={matchPwd}
                required={true}
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
                valid={validMatch}
              />
              {!validMatch && (
                <p id="confirmnote" className={styles.helper_text}>
                  Must match the first password input field.
                </p>
              )}
              <div className={styles.button_container}>
                <Button
                  disabled={
                    user && ValidEmail && validName && validPwd && validMatch
                      ? false
                      : true
                  }
                >
                  Submit
                </Button>
              </div>
            </form>
            <br />
            <p>
              Already registered?
              <br />
              <span className={styles.line}>
                <Link to="/?action=login">Sign In</Link>
              </span>
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default Register;
