/* eslint-disable @next/next/no-img-element */
import { useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import { BsBookmark, BsFillHeartFill } from "react-icons/bs";
import ToggleMode from "../../../context/darkMode";
import { FaComment } from "react-icons/fa";

import { PostsInterface } from "../../../interfaces/posts-interfaces";

const Saved = (props: PostsInterface) => {
    const { posts } = props;

    const modeCtx = useContext(ToggleMode);
    const { mode } = modeCtx;

    const router = useRouter();
    const pathname = router.pathname;

    const showPostHandler = (id: string) => {
        router.push(`${pathname}?postId=${id}`, undefined, {
            scroll: false,
        });
    };

    return (
        <div className="flex justify-center items-center">
            {posts?.length === 0 || posts === null || posts === undefined ? (
                <div className="mt-5 text-center">
                    <span
                        className={`${
                            mode === "dark"
                                ? "text-white/60"
                                : "text-darkGray/50 "
                        } text-[10px sm:text-[16px]]`}
                    >
                        Only you can see what you have saved
                    </span>
                    <div className="flex flex-col justify-center items-center pt-7 xl:pt-20">
                        <div className="font-thin text-xs">
                            <div className="border-[2px] p-3 lg:p-4 rounded-full">
                                <BsBookmark
                                    className={`${
                                        mode === "dark"
                                            ? "text-white/80"
                                            : "text-darkGray/70 "
                                    } h-9 w-9 sm:w-12 sm:h-12 lg:h-14 lg:w-14 xl:w-16 xl:h-16`}
                                />
                            </div>
                        </div>
                        <h1 className="text-xl font-[100] sm:text-2xl sm:font-[300] capitalize mt-4">
                            save
                        </h1>
                        <p className="mt-3 font-[100] sm:font-normal text-center">
                            Save photos and videos that you want to see again.
                            No one is notified, and only you can see what you
                            have saved.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 justify-center items-center gap-0.5 sm:gap-1 gap-y-0.5 sm:gap-y-1 w-full mt-3 sm:mt-5">
                    {posts.map((post, index) => (
                        <div
                            key={index}
                            className="relative w-full h-32 sm:h-52 md:h-56 lg:h-64 xl:h-72 2xl:h-80 cursor-pointer group"
                        >
                            <Image
                                src={post.img}
                                alt={post.userName}
                                layout="fill"
                                className="object-cover"
                                priority
                            />
                            <div
                                className={`${
                                    mode === "dark"
                                        ? "bg-smothDark/30"
                                        : "bg-smothDark/50"
                                } absolute top-0 left-0 h-full w-full opacity-0 group-hover:opacity-100 duration-300`}
                                onClick={showPostHandler.bind(null, post.id)}
                            >
                                <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full space-y-1 sm:space-y-0 sm:space-x-5 text-white">
                                    <div className="flex justify-start items-center space-x-2">
                                        <BsFillHeartFill
                                            className={`w-4 sm:w-6 h-4 sm:h-6`}
                                        />
                                        <span className="text-sm sm:text-lg font-bold">
                                            {post.likes.length >= 1000
                                                ? `${(
                                                      post.likes.length / 1000
                                                  ).toFixed(1)} K`
                                                : post.likes.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-start items-center space-x-2">
                                        <FaComment
                                            className={`w-4 sm:w-6 h-4 sm:h-6`}
                                        />
                                        <span className="text-sm sm:text-lg font-bold">
                                            {post.comments.length >= 1000
                                                ? `${(
                                                      post.comments.length /
                                                      1000
                                                  ).toFixed(1)} K`
                                                : post.comments.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Saved;
