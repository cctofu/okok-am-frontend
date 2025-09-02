import React, { ReactNode, useEffect, useState } from "react";
import { Tabs } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import AssetListShift from "./asset_list_shift";

interface Manager {
    label: string;
    key: string;
    name: string;
    children: ReactNode;
}

interface AssetShiftProps {
    department?: string;
    entity?: string;
    user?: string;
}

const AssetShift = (props: AssetShiftProps) => {
    const [managerList, setManagerList] = useState<Manager[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect(() => {
        fetchList();
    },[]);

    const fetchList = () => {
        setRefreshing(true);
        request(`/api/asset_manager_entity/${Cookies.get("sessionID")}/${props.entity}`, "GET")
            .then((res) => {
                setManagerList(res.data.map((val: any) => ({
                    ...val, key: val.id, label: "调拨至" + val.name,
                    children:
                    <>
                        <AssetListShift name={val.name} user={props.user}></AssetListShift>
                    </>
                })));
                setManagerList((managerList) => managerList.filter((manager) => 
                    manager.name != props.user
                ));
                setRefreshing(false);
            })
            .catch((err) => {
                console.log("error: " + err);
                setRefreshing(false);
            });
    };

    if(refreshing){
        return(
            <div className="loading-div">
                <div className="loader"/>
                加载中...
            </div>
        );
    }
    else {
        if(managerList.length === 0){
            return(
                <div className="SessionExpiredBox">
                    <h5 style={{fontFamily:"Tommy-medium", backgroundColor:"var(--background-end-rgb)"}}>没有可以转移到的资产管理员</h5>
                </div>
            );
        }
        else{
            return(
                <div style={{ marginRight:"5%", marginTop:"2%" }}> 
                    <Tabs
                        type="card"
                        centered
                        items={managerList}
                    />
                </div>
            );
        }
    }
};

export default AssetShift;