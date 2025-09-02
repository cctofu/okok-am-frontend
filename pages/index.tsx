import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { request } from "../utils/network";
import { message } from "antd";
export { request };

export default function Home() {
    const [isMounted, setIsMounted] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [buttonText, setButtonText] = useState("登录");
    
    const router = useRouter();
    const sessID = Cookies.get("sessionID");

    useEffect(() => {
        if(sessID){
            setButtonText("首页");
        }
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    function handleClick() {
        if(sessID){
            request(
                `/api/character/${sessID}`,
                "GET",
            )
                .then((res) => { 
                    const userType = res.data.character;
                    router.push(`/dashboard/home?userType=${userType}`);
                })
                .catch((err) => {
                    message.error("错误:" + err);
                    Cookies.remove("sessionID");
                    Cookies.remove("cur_menuItem");
                    Cookies.remove("title");
                    Cookies.remove("tags");
                    Cookies.remove("items");
                    router.push("/login");
                    setButtonText("登录");
                });
        }
        //if user is not
        else{
            setClicked(true);
            router.push("/login");
        }
    }

    const style = {
        filter: isMounted ? "blur(45px)" : "none"
    };

    return (
        <div className="indexLayout">
            <div className="indexHeader">
                <h2 className="indexName">启源</h2>
                <button className="indexLogin" disabled={clicked} onClick={handleClick}>{buttonText}</button>
            </div>
            <div className="indexContainer">
                <span className={clicked? "clicked" : "indexColorBlur"}>
                    <div className="circle circle1" style={style}/>
                    <div className="circle circle2" style={style}/>
                    <div className="circle circle3" style={style}/>
                    <h1 className="indexText">资产管理</h1>
                </span>
            </div>
        </div>
    );
    
}
