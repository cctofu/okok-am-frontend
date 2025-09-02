import {request} from "./network";
import Cookies from "js-cookie";
import { message } from "antd";
import { NextRouter } from "next/router";

//log user out
export const getLogout = (router : NextRouter) => {
    const sessionID = Cookies.get("sessionID");
    Cookies.remove("sessionID");
    Cookies.remove("cur_menuItem");
    Cookies.remove("title");
    Cookies.remove("tags");
    Cookies.remove("items");
    Cookies.remove("cur_depart");
    router.push("/");
    request(
        "/api/logout",
        "PUT",
        {
            session: sessionID
        }
    )
        .then(() => { 
            message.success("退出登录");
        })
        .catch((err) => {
            message.error("错误:" + err);
        });
};