import React, { useEffect, useState } from "react";

import styles from "./UserHeaderIcon.module.scss";

import userIcon from "../../../../assets/profilePicture.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../Hooks/useAuth";

export const UserHeaderIcon = (props) => {
  const { Auth } = useAuth();

  const navigate = useNavigate();

  const navigateUserSettingsHandler = () => {
    console.log(Auth);
    navigate("/questions/UserSettings/" + Auth.userData.UserInfo.userId);
  };

  const [userImg, setUserImg] = useState("");

  useEffect(() => {
    setUserImg(localStorage.getItem("img"));
  }, []);

  return (
    <div className={styles.user_buttons}>
      {Auth?.roles?.find((role) => role === 5150) && (
        <Link className={styles.admin_button} to="/admin">
          Admin
        </Link>
      )}

      <img onClick={navigateUserSettingsHandler}
        className={styles.user_img}
        src={userImg}
      />
      <a onClick={props.onClick}>Logout</a>
    </div>
  );
};
