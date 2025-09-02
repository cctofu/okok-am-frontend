import React, { ReactNode, useEffect, useState } from "react";
import { Tabs } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import AssetListReceive from "./asset_list_receive";

interface Manager {
    label: string;
    key: string;
    children: ReactNode;
}

interface AssetReceiveProps {
    department?: string;
    user?: string;
}

const AssetReceive = (props: AssetReceiveProps) => {
    const [managerList, setManagerList] = useState<Manager[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchList = (props: AssetReceiveProps) => {
        setRefreshing(true);
        if (props.department) {
            request(`/api/asset_manager/${Cookies.get("sessionID")}/${props.department}`, "GET")
                .then((res) => {
                    setManagerList(res.data.map((val: any) => ({
                        ...val, key: val.id, label: val.name,
                        children:
                    <>
                        <AssetListReceive name={val.name} user={props.user}></AssetListReceive>
                    </>
                    })));
                    setRefreshing(false);
                })
                .catch((err) => {
                    console.log("error: " + err);
                    setRefreshing(false);
                });
        }
    };
    useEffect(() => {
        fetchList(props);
    },[props]);

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="asset-content">
            <Tabs
                type="card"
                size="large"
                centered
                items={managerList}
            />
        </div>
    );
};

export default AssetReceive;