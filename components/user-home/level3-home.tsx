import { Layout, Button, Image } from "antd";
import { request } from "@/pages";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import LinkFeishu from "../user-utils/feishu_change";
import DisconnetFeishu from "./disconnet-feishu";
import React from "react";
import ChangePassword from "../user-utils/password_change";
import ChangeEmail from "../user-utils/email_change";


export default function DashboardHome3() {
    const [name, setName] = useState<string>("Username");
    const [entity, setEntity] = useState<string>("Entity");
    const [department, setDepartment] = useState<string>("Department");
    const [email, setEmail] = useState<string>("Email");
    const [feishu_name, setFeishuName] = useState<string>("FeishuName");
    const [feishu_phone, setFeishuPhone] = useState<string>("FeishuPhone");
    const [islocked, setIsLocked] = useState<boolean>(false);
    const router = useRouter();

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
                setEntity(res.data.entityName);
                setDepartment(res.data.departmentName);
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

    useEffect(() => {
        const fetchData = () => {
            request(
                `/api/cur_entity/${Cookies.get("sessionID")}`,
                "GET",
            )
                .then((res) => { 
                    if(res.data.locked === "locked"){
                        setIsLocked(true);
                    }
                    else {
                        setIsLocked(false);
                        getInfo();
                    }
                })
                .catch(() => {
                    setIsLocked(true);
                });
        };
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleRefresh = () => {
        getInfo();
    };

    const checkLog = () => {
        router.push(`/dashboard/logjournal?entity=${entity}`);
    };

    const checkOperation = () => {
        router.push(`/dashboard/operationjournal?entity=${entity}`);
    };

    return (
        <Layout style={{flexDirection: "row", display: "flex", backgroundColor:"#fbf7f4"}}>
            <div className="home-left">
                <div className="home-left-content">
                    <text className="home-left-title">欢迎回来 {name} !</text>
                    <text className="home-left-date">{today}</text>
                    <text className="home-left-text">启源系统系统管理员</text>
                    <text className="home-left-title2">所属企业：
                        <span style={{color:"rgb(184, 150, 27)"}}>{entity}</span>
                    </text>
                    <text className="home-left-title2">所属部门：
                        <span style={{color:"rgb(184, 150, 27)"}}>{department === "" ? "无" : department}</span>
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
                            <span className="home-left-span" style={{fontFamily:"Tommy-medium"}}>
                                邮箱
                            </span>
                            <span>
                                <ChangeEmail toggleNeedNewFetch={toggleRefresh}/>
                            </span>
                        </text>
                        <text className="home-left-text2">
                            <span className="home-left-span">
                                {email}
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
                    <div className="home-left-footer"/>
                </div>
            </div>
            <div className="home-right">
                <div className="home-right-content">
                    <div className="home-right-header">
                        <text className="home-left-title">检查日志</text>
                    </div>
                    <div className="home-logs-box">
                        <div className="home-log">
                            <div className="home-logs-content">
                                <text className="home-log-title">用户登录日志</text>
                                <text className="home-logs-text">检查用户登录和登出记录</text>
                                <Button onClick={checkLog} className="checklogsBtn">查看详细</Button>
                            </div>
                        </div>
                        <div className="home-operation">
                            <div className="home-logs-content">
                                <text className="home-operation-title">系统操作日志</text>
                                <text className="home-logs-text">检查企业内所有的操作记录</text>
                                <Button onClick={checkOperation} className="checklogsBtn">查看详细</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-layout">
                <div className="profile-container">
                    <div className="profile-status">
                        <div className="profile-status-inner" style={{backgroundColor: islocked? "red" : "rgb(14, 206, 14)"}}/>
                    </div>
                    <Image src="/profile.png" alt="profile" width="65px" height="65px" preview={false}/>
                </div>
                <text className="profile-name">{name}</text>
                <text className="profile-level">系统管理员</text>
            </div>
        </Layout>
    );
}