import { Layout, Image, Button, Tooltip, message } from "antd";
import { QuestionCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { request } from "@/pages";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import LinkFeishu from "../user-utils/feishu_change";
import StepCustomize from "../asset_utils/step_pdf";
import React from "react";
import DisconnetFeishu from "./disconnet-feishu";
import ChangeEmail from "../user-utils/email_change";
import ChangePassword from "../user-utils/password_change";

interface Warning {
    date: number;
    amount: number;
    name: string;
    asset: string;
    id: number;
}

export default function DashboardHome2() {
    const [name, setName] = useState<string>("Username");
    const [entity, setEntity] = useState<string>("Entity");
    const [department, setDepartment] = useState<string>("Department");
    const [email, setEmail] = useState<string>("Email");
    const [feishu_name, setFeishuName] = useState<string>("FeishuName");
    const [feishu_phone, setFeishuPhone] = useState<string>("FeishuPhone");
    const [warningItems, setWarningItems] = useState<Warning[]>([]);
    const [islocked, setIsLocked] = useState<boolean>(false);
    const router = useRouter();

    const timeformat: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    };
    const today = new Date().toLocaleTimeString("en-US", timeformat);

    useEffect(() => {
        getInfo();
        getWarnings();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
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
                        getWarnings();
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

    const getWarnings = () => {
        request(
            `/api/warning_list/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setWarningItems(res.data.map((val:any) => ({
                    ...val,
                    date: val.date,
                    amount: val.amount,
                    name: val.user,
                    asset: val.name,
                    id: val.id,
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const viewWarnings = () => {
        router.push("/dashboard/warnings");
    };

    const viewStats = () => {
        router.push("/dashboard/statistics");
    };

    const clickedCopy = (event : any) => {
        const { id } = event.currentTarget;
        navigator.clipboard.writeText(id);
        message.success("编号复制成功");
    };

    return (
        <Layout style={{flexDirection: "row", display: "flex", backgroundColor:"#fbf7f4"}}>
            <div className="home-left">
                <div className="home-left-content">
                    <text className="home-left-title"> 欢迎回来 {name} !</text>
                    <text className="home-left-date">{today}</text>
                    <text className="home-left-text">启源系统资产管理员</text>
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
                </div>
            </div>
            <div className="home-right">
                <div className="home-right-content" style={{marginTop:"5%"}}>
                    <div>
                        <div className="home-right-header" style={{ backgroundColor:"rgb(243, 240, 240)", paddingTop:"15px", paddingLeft:"15px", paddingRight:"15px"}}>
                            <div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                                <text className="home-left-title" style={{marginRight:"5px"}}>资产告警列表</text>
                                <Tooltip title="滑动查看告警列表">
                                    <QuestionCircleOutlined style={{ color: "black" }} />
                                </Tooltip>
                            </div>
                            <Button onClick={viewWarnings} className="viewWarningBtn">设置告警策略</Button>
                        </div>   
                        <div className="home-right-cards">
                            {warningItems.map((warning, index) => {
                                if (warning.amount === -1) {
                                    return (
                                        <div className="home-right-card" key={`warning-${index}`}>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <h6 className="home-right-card-user">{warning.name} 的资产</h6>
                                                <h6 className="home-right-card-user">编号：{warning.id}</h6>
                                                <CopyOutlined onClick={clickedCopy} style={{marginTop:"8px",color:"gray", marginLeft:"5px"}} id={warning.id.toString()}/>
                                            </div>
                                            <h6 className="home-right-card-message">
                                                资产
                                                <span className="home-right-user-info"> {warning.asset} </span>
                                                距离过期还有
                                                <span className="home-right-user-info"> {warning.date} </span>
                                                天。
                                            </h6>
                                        </div>
                                    );
                                }
                                if (warning.date === -1){
                                    return(
                                        <div className="home-right-card" key={`warning-${index}`}>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <h6 className="home-right-card-user">{warning.name} 的资产</h6>
                                                <h6 className="home-right-card-user">编号：{warning.id}</h6>
                                                <CopyOutlined onClick={clickedCopy} style={{marginTop:"8px",color:"gray", marginLeft:"5px"}} id={warning.id.toString()}/>
                                            </div>
                                            <h6 className="home-right-card-message">
                                                缺少
                                                <span className="home-right-user-info"> {warning.amount} </span> 
                                                个
                                                <span className="home-right-user-info"> {warning.asset} </span>
                                                资产。
                                            </h6>
                                        </div>
                                    );
                                }
                                else {
                                    return(
                                        <div className="home-right-card" key={`warning-${index}`}>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <h6 className="home-right-card-user">{warning.name} 的资产</h6>
                                                <h6 className="home-right-card-user">编号：{warning.id}</h6>
                                                <CopyOutlined onClick={clickedCopy} style={{marginTop:"8px",color:"gray", marginLeft:"5px"}} id={warning.id.toString()}/>
                                            </div>
                                            <h6 className="home-right-card-message">
                                                资产
                                                <span className="home-right-user-info"> {warning.asset} </span>
                                                距离过期还有
                                                <span className="home-right-user-info"> {warning.date} </span>
                                                天，并缺少
                                                <span className="home-right-user-info"> {warning.amount} </span> 
                                                个
                                                <span className="home-right-user-info"> {warning.asset} </span>
                                                资产。
                                            </h6>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                        <div className="home-right-header" style={{marginTop:"50px", backgroundColor:"rgb(243, 240, 240)", padding:"15px"}}>
                            <text className="home-left-title">资产统计</text>
                            <Button onClick={viewStats} className="viewWarningBtn">查看详细内容</Button>
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
                <text className="profile-level">资产管理员</text>
                <div style={{marginTop:"20px"}}>
                    <StepCustomize/>
                </div>
                
            </div>
        </Layout>
    );
}