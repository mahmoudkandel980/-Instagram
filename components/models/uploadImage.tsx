/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import { auth, db } from "../../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { uuidv4 } from "@firebase/util";

import DocumentetedUsers from "../ui/documentetedUsers";
import Spinner from "../ui/spinner";

import ShowHideModels from "../../context/showHideModels-context";
import UserContext from "../../context/user-context";
import UpdateTarget from "../../context/updateTarget-context";

import { getPhotoSrcFun } from "../../helpers/getPhotoSrcFun";

import { TbPhoto } from "react-icons/tb";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { FiSmile } from "react-icons/fi";

import { ModeInterFace } from "../../interfaces/interfaces";

import dynamic from "next/dynamic";
import { IEmojiPickerProps } from "emoji-picker-react";
const EmojiPickerNoSSRWrapper = dynamic<IEmojiPickerProps>(
    () => import("emoji-picker-react"),
    {
        ssr: false,
        loading: () => <p>Emoji...</p>,
    }
);

const ALLOWABLE_CHARACTER_COUNT = 2000;

const UploadImage = (props: ModeInterFace) => {
    const { mode } = props;

    const [shareBtnClicked, setShareBtnClicked] = useState(false);
    const [images, setImages] = useState<any>();
    const [showDiscard, setShowDiscard] = useState<boolean>(false);
    const [textareaValue, setTextareaValue] = useState("");
    const [showEmojiList, setShowEmojiList] = useState(false);

    const router = useRouter();

    const showHideModels = useContext(ShowHideModels);
    const userCtx = useContext(UserContext);
    const updateTargetCtx = useContext(UpdateTarget);

    const { showPostModelHandler } = showHideModels;
    const { userData } = userCtx;
    const { updatePostsHandler, setAllpostsState } = updateTargetCtx;

    const hideModelHandler = () => {
        showPostModelHandler(false, "");
    };

    const showDiscardHandler = () => {
        setShowDiscard(true);
    };

    const discardHandler = () => {
        setShowDiscard(false);
        setImages("");
    };

    const uploadImagesHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setImages(e.target.files);
    };

    useEffect(() => {
        if (textareaValue.length >= ALLOWABLE_CHARACTER_COUNT) {
            setTextareaValue((prevTextareaValue) =>
                prevTextareaValue.slice(0, ALLOWABLE_CHARACTER_COUNT)
            );
        }
    }, [textareaValue]);

    const onEmojiClick = (event: any, emojiObject: any) => {
        if (textareaValue.length <= ALLOWABLE_CHARACTER_COUNT) {
            setTextareaValue((prevState) =>
                prevState.concat(emojiObject.emoji)
            );
        }
    };

    const textareaChangeHandler = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setTextareaValue(e.target.value);

        setShowEmojiList(false);
    };

    const toggleEmojiList = () => {
        setShowEmojiList((prevState) => !prevState);
    };

    const hideEmojiList = () => {
        if (showEmojiList) {
            setShowEmojiList(false);
        }
    };

    const submitHandler = async () => {
        setShareBtnClicked(true);
        //store image in firebase
        const storeImage = async (image: any) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${auth.currentUser?.uid}-${
                    image.name
                }-${uuidv4()}`;

                const storageRef = ref(storage, "images/" + fileName);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100;
                        console.log("Upload is " + progress + "% done");
                        switch (snapshot.state) {
                            case "paused":
                                console.log("Upload is paused");
                                break;
                            case "running":
                                console.log("Upload is running");
                                break;
                            default:
                                break;
                        }
                    },
                    (error) => {
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURL) => {
                                resolve(downloadURL);
                            }
                        );
                    }
                );
            });
        };

        const img = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch((error) => {
            console.log(error);
            return;
        });

        const post = {
            fullName: userData.fullName,
            userName: userData.userName,
            userImg: userData.userImg,
            // @ts-ignore
            img: img[0],
            caption: textareaValue.trim(),
            timestamp: serverTimestamp(),
            likes: [],
            saves: [],
            comments: [],
        };

        const docRef = await addDoc(collection(db, "posts"), {
            ...post,
        });

        setTimeout(() => {
            setAllpostsState(true);
            setShareBtnClicked(false);
            hideModelHandler();
        }, 1000);
    };

    return (
        <div className="fixed left-0 top-0 w-full h-full z-[100]">
            <div className="fixed z-[100] top-0 left-0 w-screen h-full ">
                <div
                    className={`${
                        mode === "dark" ? "bg-dark/30" : "bg-dark/70"
                    } w-full h-full`}
                    onClick={images ? showDiscardHandler : hideModelHandler}
                ></div>

                <div
                    onClick={images ? showDiscardHandler : hideModelHandler}
                    className="close-btn hidden sm:block fixed top-20 right-5"
                >
                    <IoMdClose className="w-7 h-7 cursor-pointer text-white" />
                </div>

                <div
                    className={`${
                        mode === "dark"
                            ? "bg-smothDark text-white"
                            : "bg-gray-100 text-smothDark"
                    } ${
                        images
                            ? " lg:w-[1000px] lg:-translate-x-[500px]"
                            : " lg:w-[700px] lg:-translate-x-[350px]"
                    } fixed z-[110] -top-1.5 left-0 sm:rounded-lg overflow-hidden w-full h-full sm:h-[60%] lg:h-[70%] sm:top-[20%] lg:top-[15%] sm:left-[2.5%] sm:w-[95%] lg:left-[50%]`}
                >
                    <div className="pt-2 flex flex-col items-start justify-center h-full w-full">
                        <div
                            className={`${
                                mode === "dark"
                                    ? "border-gray-600/40"
                                    : "border-gray-600/10"
                            } pb-1 w-full flex justify-start items-center border-b-[1px] relative h-9`}
                        >
                            <div
                                onClick={
                                    images
                                        ? showDiscardHandler
                                        : hideModelHandler
                                }
                                className="z-10 pl-2 sm:pl-5"
                            >
                                <IoIosArrowBack className="w-7 h-7 cursor-pointer" />
                            </div>
                            <div className="absolute -z-10 flex justify-center font-[700] w-full">
                                Create new post
                            </div>
                            {images ? (
                                <div
                                    onClick={submitHandler}
                                    className="cursor-pointer absolute right-2 sm:right-5 text-lightBlue"
                                >
                                    {shareBtnClicked ? (
                                        <div className="flex justify-center items-center">
                                            <Spinner className="scale-[0.2] mb-1 w-8 h-5" />
                                        </div>
                                    ) : (
                                        `Share`
                                    )}
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div
                            className={`${
                                !images && "px-2 pt-1"
                            } flex flex-col justify-center items-center w-full h-full overflow-hidden`}
                        >
                            <div
                                className={`${
                                    images && "hidden"
                                } flex flex-col justify-center items-center px-2 pt-1 w-full h-full`}
                            >
                                <TbPhoto className="h-16 w-16 sm:w-20 sm:h-20 lg:h-24 lg:w-24 xl:w-28 xl:h-28" />
                                <p className="text-xl font-thin text-center">
                                    Drag profile photos and videos here
                                </p>
                                <label
                                    className={`${
                                        mode === "dark"
                                            ? "text-smothDark"
                                            : "text-white"
                                    } cursor-pointer mt-2 p-3 py-1 bg-lightBlue rounded-md`}
                                    htmlFor="images-input"
                                >
                                    <span className="sm:hidden">
                                        Select from mobile
                                    </span>
                                    <span className="hidden sm:block lg:hidden">
                                        Select from Tap
                                    </span>
                                    <span className="hidden lg:block">
                                        Select from Computer
                                    </span>
                                </label>
                                <input
                                    className="formInputFile hidden"
                                    type="file"
                                    id="images-input"
                                    onChange={uploadImagesHandler}
                                    max="1"
                                    accept=".jpg,.png,.jpeg"
                                    multiple
                                    required
                                    checked
                                />
                            </div>

                            <div
                                className={`${
                                    (images === undefined || images === "") &&
                                    "hidden"
                                } h-full w-full flex flex-col sm:flex-row justify-start items-center`}
                            >
                                {/* left side model */}
                                <div className="h-[50%] sm:h-full">
                                    <img
                                        src={
                                            images === undefined ||
                                            images === ""
                                                ? ""
                                                : window.URL.createObjectURL(
                                                      images[0]
                                                  )
                                        }
                                        alt="uploaded-image"
                                        className="h-full w-full  object-contain"
                                    />
                                </div>
                                {/* right side model */}
                                <div className="sm:flex-2 md:flex-1 w-full h-full pt-10 sm:pt-3 sm:pl-2">
                                    {showEmojiList && (
                                        <div
                                            onClick={hideEmojiList}
                                            className=" absolute top-0 left-0 w-full h-full bg-transparent z-1"
                                        ></div>
                                    )}
                                    <div className="flex justify-start items-center space-x-3 w-full mr-5 pl-2 sm:pl-0">
                                        <div className="rounded-full w-8 h-8 relative cursor-pointer">
                                            <Image
                                                src={
                                                    userData.userImg ||
                                                    getPhotoSrcFun(
                                                        userData.userName
                                                    )
                                                }
                                                layout="fill"
                                                className="rounded-full  hover:scale-105 duration-200"
                                                alt={"instagram_logo"}
                                                priority
                                            />
                                        </div>
                                        <div
                                            className={`${
                                                userData.userName.length > 20
                                                    ? "w-32"
                                                    : "min-w-max"
                                            } flex flex-col items-start justify-center -space-y-0.5 flex-wrap`}
                                        >
                                            <div className="flex justify-start space-x-1.5 items-center w-full">
                                                <span className="font-semibold cursor-pointer w-full truncate">
                                                    {userData.userName}
                                                </span>

                                                <DocumentetedUsers
                                                    className="w-3 h-3"
                                                    userName={userData.userName}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-5 relative w-full">
                                        {/* textarea */}
                                        <div
                                            className={`${
                                                mode === "dark"
                                                    ? "border-gray-600/50"
                                                    : "border-gray-300/60"
                                            } flex items-center self-center border-b-[1px] pb-1 pl-2 sm:pl-0`}
                                        >
                                            <textarea
                                                className={`${
                                                    mode === "dark"
                                                        ? "text-white bg-smothDark placeholder:text-gray-300/70"
                                                        : "text-smothDark bg-white placeholder:text-gray-700/70"
                                                } ${
                                                    textareaValue.length > 0
                                                        ? "h-32 overflow-y-scroll"
                                                        : "h-7"
                                                } hideScrollBar w-full outline-none px-1 pr-2 rounded-md`}
                                                spellCheck={false}
                                                autoFocus
                                                value={textareaValue}
                                                onChange={textareaChangeHandler}
                                                onFocus={hideEmojiList}
                                                placeholder="Write a caption..."
                                            ></textarea>
                                        </div>
                                        <div
                                            className={`${
                                                textareaValue.length > 0
                                                    ? "pt-[10px]"
                                                    : "pt-[110px]"
                                            } relative w-full`}
                                        >
                                            {showEmojiList && (
                                                <div
                                                    className={`${
                                                        mode === "dark"
                                                            ? "bg-darkBody/95"
                                                            : "bg-gray-300/95"
                                                    } ${
                                                        textareaValue.length > 0
                                                            ? "bottom-6 sm:top-8 "
                                                            : "bottom-6 sm:top-[131px]"
                                                    } rotate-180 sm:rotate-0 absolute left-7 sm:left-2 w-3 h-3`}
                                                    style={{
                                                        clipPath:
                                                            "polygon(51% 49%, 0% 100%, 100% 100%)",
                                                    }}
                                                ></div>
                                            )}
                                            {showEmojiList && (
                                                <div
                                                    className={`${
                                                        mode === "dark"
                                                            ? "bg-darkBody/95"
                                                            : "bg-gray-300/95"
                                                    } ${
                                                        textareaValue.length > 0
                                                            ? "-top-[318px] sm:top-11"
                                                            : "-top-[218px] sm:top-[142px]"
                                                    } absolute sm:left-0 md:-left-32 lg:left-0 overflow-hidden rounded-md`}
                                                >
                                                    {/* emoji */}
                                                    <EmojiPickerNoSSRWrapper
                                                        onEmojiClick={
                                                            onEmojiClick
                                                        }
                                                    />
                                                </div>
                                            )}
                                            <div className="w-fill flex justify-between items-center relative px-5 sm:px-0">
                                                <span onClick={toggleEmojiList}>
                                                    <FiSmile
                                                        className={`${
                                                            mode === "dark"
                                                                ? "text-white"
                                                                : "text-smothDark"
                                                        } w-7 h-7 cursor-pointer`}
                                                    />
                                                </span>
                                                {/* carater counter */}
                                                <div className="pr-2 text-[12px] font-thin opacity-50 hover:opacity-100 cursor-pointer">
                                                    <span>
                                                        {textareaValue.length >=
                                                        ALLOWABLE_CHARACTER_COUNT
                                                            ? ALLOWABLE_CHARACTER_COUNT.toString().replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ","
                                                              )
                                                            : textareaValue.length
                                                                  .toString()
                                                                  .replace(
                                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                                      ","
                                                                  )}
                                                    </span>
                                                    <span>/</span>
                                                    <span>
                                                        {ALLOWABLE_CHARACTER_COUNT.toString().replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ","
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`${
                    !showDiscard && "hidden"
                } absolute top-0 left-0 w-full h-full z-[100]`}
            >
                <div
                    className={`${
                        mode === "dark" ? "bg-dark/30" : "bg-dark/50"
                    } absolute top-0 left-0 w-full h-full`}
                    onClick={() => setShowDiscard(false)}
                ></div>
                <div
                    className={`${
                        mode === "dark"
                            ? "bg-smothDark text-white"
                            : "bg-gray-100 text-smothDark"
                    } fixed z-[110] top-[50%] left-0 sm:left-[50%] w-[90%] sm:w-96 h-44 rounded-md translate-x-[5%] sm:-translate-x-48 -translate-y-24`}
                >
                    <div className="flex flex-col justify-center items-center">
                        <h3 className="text-xl font-bold pt-4">
                            Discard post?
                        </h3>
                        <span
                            className={`${
                                mode === "dark"
                                    ? "text-white/50"
                                    : "text-darkGray/70"
                            } py-2 pb-5 text-[14px] font-thin block w-full text-center `}
                        >
                            If you leave, your edits won&#39;t be saved.
                        </span>
                        <div
                            className={`${
                                mode === "dark"
                                    ? "border-darkGray border-t-[1px]"
                                    : "border-t-[2px]"
                            } w-full h-10 text-darkRed text-center py-2`}
                        >
                            <div
                                className="cursor-pointer text-[14px]"
                                onClick={discardHandler}
                            >
                                Discard
                            </div>
                        </div>
                        <div
                            className={`${
                                mode === "dark"
                                    ? "border-darkGray border-t-[1px]"
                                    : "border-t-[2px]"
                            } w-full h-10 text-center py-2`}
                        >
                            <div
                                className="cursor-pointer text-[14px]"
                                onClick={() => setShowDiscard(false)}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;
