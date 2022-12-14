import React from "react";
import styles from "./QuestionPortal.module.scss";
import { Header } from "../../../Header/Header";
import questionImg from "../../../../assets/question_img.png";
import Input from "../../../Input/Input";
import Button from "../../../Button/Button";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import axios from "axios";
import SuccessModal from "../../../SuccessModal/SuccessModal";
import { useAuth } from "../../../../Hooks/useAuth";
import TagsSelected from "./TagsSelected/TagsSelected";

function QuestionPortal() {
  const [tagList, setTagList] = useState([]);

  const getTags = async () => {
    const options = {
      method: "GET",
      url: "http://localhost:5001/api/all-tags",
    };

    await axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        setTagList(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  useEffect(() => {
    getTags();
  }, []);

  // useState's and Ref's
  const defValues = [
    "title",
    "body",
    "codeBlock",
    "image",
    "tag",
  ];

  const { Auth } = useAuth();

  console.log(Auth);

  const navigate = useNavigate();

  const [questionImage, setQuestionImage] = useState();

  const [modal, setModal] = useState(false);

  const [values, setValues] = useState(defValues);
  const title = useRef();
  const body = useRef();
  const codeBlock = useRef();
  const tag = useRef();
  const img = useRef();

  const [previewQuestion, setPreviewQuestion] = useState({
    qTitle: "",
    qBody: "",
    qLanguage: "",
    qCode: "",
    qImg: "",
  });

  const [titleError, setTitleError] = useState();
  const [bodyError, setBodyError] = useState();
  const [codeError, setCodeError] = useState();
  const [tagError, setTagError] = useState();

  const [searchTag, setSearchTag] = useState("");
  const [tagsSelected, setTagsSelected] = useState([]);
  const [tagId, setTagId] = useState([]);

  const titlePreview = (e) => {
    const value = e.target.value;

    // setPreviewQuestion([...previewQuestion]);
    setPreviewQuestion({ ...previewQuestion, qTitle: value });
  };

  const bodyPreview = (e) => {
    const value = e.target.value;

    // setPreviewQuestion([...previewQuestion]);
    setPreviewQuestion({ ...previewQuestion, qBody: value });
  };

  const codePreview = (e) => {
    const value = e.target.value;

    // setPreviewQuestion([...previewQuestion]);
    setPreviewQuestion({ ...previewQuestion, qCode: value });
  };

  // const yearPreview = (e) => {
  //   const value = e.target.value;

  //   // setPreviewQuestion([...previewQuestion]);
  //   setPreviewQuestion({ ...previewQuestion, qSelectedYear: value });
  // };

  const imageVal = (e) => {
    let file = e.target.files[0];
    setQuestionImage(file);
    let reader = new FileReader();

    reader.onloadend = function () {
      // console.log(reader.result);
      let imgFile = reader.result;

      setPreviewQuestion({ ...previewQuestion, qImg: imgFile });

      let image = new Image();
      image.src = reader.result;
      image.setAttribute("style", "width: 100%; border-radius: 15px;");
      document.getElementById("screenshot").appendChild(image);
    };
    reader.readAsDataURL(file);
  };

  const languageVal = (e) => {
    const value = e.target.value;

    // setPreviewQuestion([...previewQuestion]);
    setPreviewQuestion({ ...previewQuestion, qLanguage: value });

    console.log(value);
  };

  let languages = [
    "-- Please Select --",
    "cpp",
    "csharp",
    "css",
    "html",
    "javascript",
    "json",
    "kotlin",
    "markdown",
    "php",
    "python",
    "sass",
    "scss",
    "swift",
    "typescript",
  ];
  // let levels = [
  //   "-- Please Select --",
  //   "First Year",
  //   "Second Year",
  //   "Third Year",
  //   "Honours",
  //   "Creative Computing",
  //   "Lecturer",
  // ];

  const closeModal = () => {
    // navigate("/");
    setModal(false);
  };

  const addTagHandler = (e, key) => {
    console.log(e);
    console.log(key);
    const arr = tagsSelected;
    const idArr = tagId;
    const tags = e.target.innerText;

    if (!arr.includes(tags)) {
      arr.push(tags);
      idArr.push(key);
      setTagsSelected(arr);
      setTagId(idArr);
      console.log(tagId);
      setRerender(true);
    }
  };

  const [rerender, setRerender] = useState(false);
  useEffect(() => {
    setRerender(false);
  }, [rerender]);

  const handleTagRemove = (index) => {
    console.log("something in there");

    const list = [...tagsSelected];
    const listId = [...tagId];
    listId.splice(index, 1);
    list.splice(index, 1);
    setTagsSelected(list);
    setTagId(listId);
  };
  console.log(tagsSelected);
  console.log(tagId);

  const formHandle = (e) => {
    e.preventDefault();

    const payloadData = new FormData();

    let titleString = title.current.value;
    let bodyString = body.current.value;
    let code = codeBlock.current.value;
    let imgName = img.current.value;
    let tags = tag.current.value;

    const imgSubStr = imgName.substr(12);

    if (titleString === "") {
      setTitleError("Enter a title");
    } else {
      setTitleError();
    }

    if (bodyString === "") {
      setBodyError("Enter your question!");
    } else {
      setBodyError();
    }

    if (code === "") {
      setCodeError("Include some code!");
    } else {
      setCodeError();
    }

    if (tags === "") {
      setTagError("Enter at least 1 tag");
    } else {
      setTagError();
    }

    const payload = {
      title: titleString,
      body: bodyString,
      codeBody: code,
      codeLanguage: previewQuestion.qLanguage,
      tags: tagId,
      user_id: Auth.userData.UserInfo.userId,
      imgName: imgSubStr,
    };

    payloadData.append("information", JSON.stringify(payload));
    payloadData.append("image", questionImage);

    // console.log(payloadData);
    console.log(payload);
    if (payloadData.image) {
      axios
        .post("http://localhost:5001/api/add-question/", payloadData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log("Question Added!");
          setModal(true);
        })
        .catch((err) => {
          console.log(err);
          setModal(false);
        });
      return;
    } else {
      console.log("no image");
      axios
        .post("http://localhost:5001/api/add-question-no-img", payloadData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => {
          console.log("Question Added!");
          setModal(true);
        })
        .catch((err) => {
          console.log(err);
          setModal(false);
        });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageContent}>
        <h1>Ask a question</h1>

        <div className={styles.pageContent__flexCenter}>
          <img src={questionImg} width={200} alt="question_img" />
          <p>
            <i>
              Please enter the fields below and be as specific as possible for
              the best feedback
            </i>
          </p>
          <br />
        </div>

        <label htmlFor="title">Question Title</label>
        {titleError ? (
          <Input
            name="title"
            type="questionError"
            inputType="text"
            ref={title}
            value={values["title"]}
            onChange={titlePreview}
          />
        ) : (
          <Input
            name="title"
            type="questionInput"
            inputType="text"
            ref={title}
            value={values["title"]}
            onChange={titlePreview}
          />
        )}
        {titleError ? (
          <p className={styles.error}>
            <ion-icon name="warning-outline"></ion-icon> {titleError}
          </p>
        ) : (
          ""
        )}
        <br />
        <br />
        <label htmlFor="body">Body</label>
        {bodyError ? (
          <textarea
            className={styles.questionError}
            name="body"
            ref={body}
            onChange={bodyPreview}
          ></textarea>
        ) : (
          <textarea
            className={styles.questionText}
            name="body"
            ref={body}
            onChange={bodyPreview}
          ></textarea>
        )}
        {bodyError ? (
          <p className={styles.error}>
            <ion-icon name="warning-outline"></ion-icon> {bodyError}
          </p>
        ) : (
          ""
        )}
        <label htmlFor="language">Coding Language</label>
        <select onChange={languageVal}>
          {languages.map((i) => (
            <option>{i}</option>
          ))}
        </select>
        <br />
        <label htmlFor="codeBlock">Code Block</label>
        {codeError ? (
          <textarea
            className={styles.questionError}
            name="codeBlock"
            ref={codeBlock}
            onChange={codePreview}
          ></textarea>
        ) : (
          <textarea
            className={styles.questionText}
            name="codeBlock"
            ref={codeBlock}
            onChange={codePreview}
          ></textarea>
        )}
        {codeError ? (
          <p className={styles.error}>
            <ion-icon name="warning-outline"></ion-icon> {codeError}
          </p>
        ) : (
          ""
        )}
        {/* <label htmlFor="dropdown">Select Your Year</label>
        <select ref={yearSelection} onChange={yearPreview}>
          {levels.map((i) => (
            <option>{i}</option>
          ))}
        </select> */}
        <label className={styles.upload} for="upload">
          Upload Screenshot(s)
          <Input
            name="upload"
            type="imgUpload"
            inputType="file"
            ref={img}
            onChange={imageVal}
          />
        </label>
        <label htmlFor="enteredTags">Search Tags</label>
        {tagError ? (
          <Input
            name="enteredTags"
            type="questionError"
            inputType="text"
            ref={tag}
            value={values["tag"]}
            onChange={(e) => {
              setSearchTag(e.target.value);
            }}
          />
        ) : (
          <Input
            type="questionInput"
            name="enteredTags"
            inputType="text"
            ref={tag}
            value={values["tag"]}
            onChange={(e) => {
              setSearchTag(e.target.value.toUpperCase());
            }}
          />
        )}
        {/* <SuggestedTags searchTag={searchTag} test={value => setTestState(value)} onClick={addTagHandler}/> */}
        <div className={styles.tagCon}>
          {tagList
            .filter((i) => {
              if (searchTag == "") {
                return i.tagName;
              } else if (i.tagName.includes(searchTag.toUpperCase())) {
                return i.tagName;
              }
            })
            .map((i, index) => (
              <p
                className={styles.tagName}
                key={i._id}
                onClick={(e, key) => addTagHandler(e, i._id)}
              >
                {i.tagName}
              </p>
            ))}
        </div>
        <TagsSelected tag={tagsSelected} onClick={handleTagRemove} />
        {previewQuestion.qTitle == "" ? "" : <hr />}
        {previewQuestion.qTitle == "" ? "" : <h2>Review your question</h2>}
        {previewQuestion.qTitle == "" ? "" : <hr />}
        <br />
        <br />
        <h2>{previewQuestion.qTitle}</h2>
        {/* <h4>{previewQuestion.qSelectedYear}</h4> */}

        {previewQuestion.qBody == "" ? "" : <p className={styles.questionBody}>{previewQuestion.qBody}</p>}
        {previewQuestion.qCode == "" ? "" : <SyntaxHighlighter
          className={styles.code}
          language={previewQuestion.qLanguage}
          children={true}
          wrapLines={true}
          showLineNumbers={true}
        >
          {previewQuestion.qCode}
        </SyntaxHighlighter>}
        <div id="screenshot" className={styles.screenshot}></div>
        <Button text="Submit" type="questionSubmit" onClick={formHandle} />
        {modal ? <SuccessModal onClick={closeModal} /> : ""}
      </div>
    </div>
  );
}

export default QuestionPortal;
