import { Layout, Image } from "antd";
import { request } from "@/pages";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ChangePassword from "../user-utils/password_change";
import ChangeEmail from "../user-utils/email_change";
import React from "react";
import DisconnetFeishu from "./disconnet-feishu";
import LinkFeishu from "../user-utils/feishu_change";

export default function DashboardHome4() {
    const [name, setName] = useState<string>("Username");
    const [email, setEmail] = useState<string>("Email");
    const [feishu_name, setFeishuName] = useState<string>("FeishuName");
    const [feishu_phone, setFeishuPhone] = useState<string>("FeishuPhone");

    const timeformat: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    };
    const today = new Date().toLocaleTimeString("en-US", timeformat);

    const getInfo = () => {
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setName(res.data.name);
                setEmail(res.data.email);
                setFeishuName(res.data.feishu_name);
                setFeishuPhone(res.data.feishu_phone);
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    useEffect(() => {
        getInfo();
    }, []);

    const toggleRefresh = () => {
        getInfo();
    };

    return (
        <Layout style={{flexDirection: "row", display: "flex", backgroundColor:"#fbf7f4"}}>
            <div className="home-left">
                <div className="home-left-content">
                    <text className="home-left-title">欢迎回来 {name} !</text>
                    <text className="home-left-date">{today}</text>
                    <text className="home-left-text">启源系统超级管理员</text>

                    <text className="home-left-title2">所属企业：
                        <span style={{color:"rgb(184, 150, 27)"}}>无</span>
                    </text>
                    <text className="home-left-title2">所属部门：
                        <span style={{color:"rgb(184, 150, 27)"}}>无</span>
                    </text>

                    <div className="home-left-box" style={{paddingTop:"1%", paddingBottom:"3%"}}>
                        <text className="home-left-text2">
                            <span className="home-left-span" style={{fontFamily:"Tommy-medium"}}>
                                账户密码
                            </span>
                            <span>
                                <ChangePassword toggleNeedNewFetch={toggleRefresh}/>
                            </span>
                        </text>
                    </div>
                    <div className="home-left-box">
                        <text className="home-left-title3">
                            邮箱：
                        </text>
                        <text className="home-left-text2">
                            <span className="home-left-span">
                                {email === "" ? "未绑定" : email}
                            </span>
                            <span>
                                <ChangeEmail toggleNeedNewFetch={toggleRefresh}/>
                            </span>
                        </text>
                    </div>
                    <div className="home-left-box">
                        <text className="home-left-title3">
                            <span className="home-left-span" style={{fontFamily:"Tommy-medium"}}>
                                飞书信息
                            </span>
                            <span>
                                <DisconnetFeishu feishu_name={feishu_name} user_name={name} toggleNeedNewFetch={toggleRefresh}/>
                                <LinkFeishu name={feishu_name} phone={feishu_phone} toggleNeedNewFetch={toggleRefresh}/>
                            </span>
                        </text>
                        <text className="home-left-text2">
                            <span className="home-left-span">
                                用户名：
                                <span>{feishu_name === "" ? "未绑定" : feishu_name}</span>
                            </span>
                        </text>
                        <text className="home-left-text2">
                            <span className="home-left-span">
                                电话号：
                                <span>{feishu_phone === "" ? "未绑定" : feishu_phone}</span>
                            </span>
                        </text>
                    </div>
                </div>
            </div>
            <div className="home-right">
                <div className="home-right-content">
                    <Image src="/pattern.jpg" alt="pattern" width="100%" height="97%" preview={false}/>
                </div>
            </div>
            <div className="profile-layout">
                <div className="profile-container">
                    <Image src="/c7w.JPG" alt="profile" width="65px" height="65px" preview={false}/>
                </div>
                <text className="profile-name">{name}</text>
                <text className="profile-level">超级管理员</text>
            </div>
        </Layout>
    );
}