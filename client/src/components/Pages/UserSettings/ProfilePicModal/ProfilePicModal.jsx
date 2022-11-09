
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "../../../UI/Button/Button";
import styles from "./ProfilePicModal.module.scss";

export const ProfilePicModal = (props) => {
  const [ImageList, setImageList] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const getImageList = async () => {
      try {
        const response = await axios.request({
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

  return (
    <div className={styles.profile_selection}>
      <div className={styles.profile_img_list}>
        {ImageList.map((img) => {
          return (
            <img
            className={props.selectedUserImage === img ? styles.selected : undefined}
              key={img}
              src={img}
              onClick={() => {
                props.selectProfileImage(img);
              }}
            />
          );
        })}
      </div>
      <Button onClick={props.changeUserImage}>Set User Profile</Button>
    </div>
  );
};
