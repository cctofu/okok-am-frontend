import React from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { request } from "../index";
import { message } from "antd";

export default function Dashboard() {
    const router = useRouter();
    const sessID = Cookies.get("sessionID");

    //push page depending on user Authentication
    React.useEffect(() => {
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
                })
                .catch((err) => {
                    console.log("error: " + err);
                });
        }
        router.push("/");
        message.error("请先登录");
    }, [router, sessID]);

    return (
        <div className="SessionExpiredBox">
            <h2 style={{fontFamily:"Tommy-regular"}}>加载中...</h2>
        </div>
    );
}
