import React, { useState, useRef, useEffect } from "react";
import styles from "./UserSettings.module.scss";
import formLogo from "../../../assets/OpenStackLogo.png";
import profileIcon from "../../../assets/profilePicture.jpg";
import { Input } from "../../UI/Input/Input";
import { Button } from "../../UI/Button/Button";

import StockCards from "../Achievements/Achievements";
// import Button from "../../Button/Button"
import Axios from "axios";

const UserSettings = () => {
  return (
    <div className={styles.user_settings_container}>
      <header>
        <img src={profileIcon}/>
        <h1>username</h1>
        <ion-icon name="pencil-outline"></ion-icon>
        <div className={styles.user_questions_container}>
          
        </div>
      </header>
    </div>
  );

  //  // Read all the DB Items
  //  const [readProducts, setReadProducts] = useState();
  //  const [renderProducts, setRenderProducts] = useState(false);

  //  useEffect(()=>{
  //      Axios.get('http://localhost:5001/api/userSetting')
  //      .then(res =>{

  //          let data = res.data;
  //          console.log(data);
  //          const productItem = data.map((item)=> <StockCards key={item._id} productId={item._id}

  //          username={item.username}  achievement1={item.achievement1} achievement2={item.achievement2}  achievement3={item.achievement3}

  //          editRender={setRenderProducts}/>);
  //          setReadProducts(productItem);
  //          setRenderProducts(false);
  //      });
  //  }, [renderProducts]);

  // return (
  //     //Add a margin top of 70px to accommodate for nav bar

  //   <div className={styles.settings_background}>
  //     <div className={styles.settings_form_container}>

  //       <form
  //       className={`${styles.settings_box} ${styles.inputs_container}`}>

  //           <img className={styles.form_logo} src={formLogo} />
  //           {/* <br />
  //           <br/> */}
  //             <center><h2>User Settings</h2></center>
  //           <hr/>
  //           <br/>
  //           <center><h5>Hi user please edit your profile info here</h5></center>
  //           <img className={styles.profile_icon} src={profileIcon} />
  //           <div className={styles.labels_container}>
  //           <h3 className={styles.username_label}>Your Current UserName:</h3>
  //           <div className={styles.input_container}>
  //           <Input label="Trevor100" name="new_username" type="username" />
  //           <br/>
  //           <h3 className={styles.email_label}>Your Current Email:</h3>
  //           <Input label="200100@virtualwindow.co.za" name="new_email" type="email" />
  //           </div>
  //           </div>
  //           <div className={styles.achieve_container}>
  //             {/* <p>Hi user here are your achievements</p> */}
  //             {readProducts}
  //             <div className={styles.achievement}></div>
  //             {/* <Button>Save Changes</Button> */}
  //           </div>
  //         <Button>Save Changes</Button>
  //         </form>
  //     </div>

  //   </div>
  // );
};
export default UserSettings;
