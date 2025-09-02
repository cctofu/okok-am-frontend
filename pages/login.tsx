import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { request } from "../utils/network";
import { Button, Divider, Form, Input, message } from "antd";
import { MD5 } from "crypto-js";

interface User {
    identity: string;
    password: string;
}

export default function Login() {
    const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
    const [isFeishuLoading, setIsFeishuLoading] = useState<boolean>(false);
    const router = useRouter();
    const sessID = Cookies.get("sessionID");

    //check if user is authenticated
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(sessID){
            request(
                `/api/character/${sessID}`,
                "GET",
            )
                .then((res) => { 
                    const userType = res.data.character;
                    router.push(`/dashboard/home?userType=${userType}`);
                    message.success("登录成功");
                })
                .catch((err) => {
                    console.log("Error: " + err);
                });
        }
    }, [router, sessID]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const authCode = queryParams.get("code");
        if (authCode) {
            setIsFeishuLoading(true);
            handleAuthCode(authCode);
        }
    }, []);

    async function handleAuthCode(authCode: string) {
        request(
            "/api/qrLogin",
            "POST",
            {
                redirect_uri: `${window.location.origin}/login`,
                code: authCode,
            }
        )
            .then((res) => { 
            // const qrUserInfo = res.qrUserInfo;
            // console.log(qrUserInfo)
                const sessionID = res.data.session;
                const userCharacter = res.data.character;
                Cookies.set("sessionID", sessionID);
                Cookies.set("title", "资产标签卡");
                Cookies.set("tags", JSON.stringify(["资产名称", "资产编号", "资产所有人"]));
                Cookies.set("items", JSON.stringify(["名称", "编号", "所有人"]));
                message.success("登录成功");
                router.push({
                    pathname: "/dashboard/home",
                    query: { userType: userCharacter }
                });
            })
            .catch((err) => {
                message.error("错误: " + err.message);
                setIsFeishuLoading(false);
            });
    }
      
    async function sendUserInfoToApi(user: User): Promise<void> {
        request(
            "/api/login",
            "POST",
            {
                identity: user.identity,
                password: MD5(user.password).toString(),
            }
        )
            .then((res) => { 
                const sessionID = res.data.session;
                const userCharacter = res.data.character;
                Cookies.set("sessionID", sessionID);
                Cookies.set("title", "资产标签卡");
                Cookies.set("tags", JSON.stringify(["资产名称", "资产编号", "资产所有人"]));
                Cookies.set("items", JSON.stringify(["名称", "编号", "所有人"]));
                message.success("登录成功");
                router.push({
                    pathname: "/dashboard/home",
                    query: { userType: userCharacter }
                });
            })
            .catch((err) => {
                message.error("错误: " + err.message);
                setIsLoginLoading(false);
            });
    }
    const onLogin = (user: User) => {
        setIsLoginLoading(true);
        sendUserInfoToApi(user);
    };

    const onFeishu = () => {
        setIsFeishuLoading(true);
        const appId = "cli_a4d9606872f91013";
        console.log(appId);
        const redirect_uri = `${window.location.origin}/login`;
        var gotoUrl = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURI(redirect_uri)}&response_type=code&state=success_login`;
        window.location.href = gotoUrl;
    };

    return (
        <div className="loginLayout">
            <div className="loginLoaderBox" hidden={!isLoginLoading && !isFeishuLoading}>
                <div className="loginloader"/>
            </div>
            <div className="loginLeft">
                <div className="indexHeader">
                    <h2 className="indexName" style={{color:"black"}}>启源</h2>
                </div>
                <div className="loginLeft-content">
                    <h1 className="loginText">举一纲而万目张</h1>
                </div>
            </div>
            <div className="loginRight">
                <div className='loginBox'>
                    <h2 className="loginBoxTitle">登录启源</h2>
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        onFinish={onLogin}
                        autoComplete="off"
                        className="loginForm"
                    >
                        <text className="loginInputText">用户名</text>
                        <Form.Item
                            name="identity"
                            rules={[{ required: true, message: "用户名不能为空" }]}
                        >
                            <Input className="loginInput"/>
                        </Form.Item>

                        <text className="loginInputText">密码</text>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "密码不能为空" }]}
                        >
                            <Input className="loginInput" type="password"/>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                className="loginBtn"
                                disabled={isLoginLoading || isFeishuLoading}
                                loading={isLoginLoading}>
                            登录
                            </Button>
                        </Form.Item>
                        
                        <Divider className="login-divider" style={{fontSize:"12px", color:"gray"}}>其他登录方式</Divider>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                className="feishuBtn"
                                disabled={isLoginLoading || isFeishuLoading}
                                loading={isFeishuLoading}
                                onClick={onFeishu}>
                            飞书登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

