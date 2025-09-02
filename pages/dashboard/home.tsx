import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import OneUser from "@/components/user-sidebar/level1-user";
import TwoUser from "@/components/user-sidebar/level2-user";
import ThreeUser from "@/components/user-sidebar/level3-user";
import FourUser from "@/components/user-sidebar/level4-user";
import Cookies from "js-cookie";
import { request } from "../index";
import { message } from "antd";

export default function DashHome() {    
    const router = useRouter();
    const sessID = Cookies.get("sessionID");
    const [user, setUser] = useState<string | any>("");
    const [character, setCharacter] = useState<string | any>("");

    const getCharacter = () => {
        request(
            `/api/character/${sessID}`,
            "GET",
        )
            .then((res) => { 
                const userType = res.data.character;
                setCharacter(userType);

                if (userType == null){
                    router.push("/");
                }
                if (router.query.userType != userType.toString()){
                    router.push(`/dashboard/home?userType=${userType}`);
                }
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    //receive query from router
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(sessID == null){
            router.push("/");
            message.error("请先登录");
        }
        setUser(router.query.userType);
    }, [router, sessID, router.query]);

    //Load user based on query
    const UserType = () => {
        getCharacter();
        if(character == null){
            router.push("/");
        }
        switch(user){
        case "1":
            return <OneUser/>;
        case "2":
            return <TwoUser/>;
        case "3":
            return <ThreeUser/>;
        case "4":
            return <FourUser/>;
        }
    };
    
    //return based on Authentication
    return (
        <main className="d-flex justify-content-center align-items-center">
            {UserType()}
        </main>
    );
}
