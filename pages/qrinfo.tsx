import React, { useEffect, useState } from "react";
import { request } from "../utils/network";
import { useRouter } from "next/router";
import { Descriptions } from "antd";
export { request };

export default function QrInfo() {
    const router = useRouter();
    const [showInfo, setShowInfo] = useState<boolean>(false);

    useEffect(() => {
        if(router.query.session !== undefined){
            setShowInfo(true);
        }
    }, [router.query]);

    return showInfo ? (
        <div className="indexLayout" style={{display:"flex", flexDirection:"column"}}>
            <span style={{fontFamily:"Tommy-medium", fontSize: "25px"}}>
                <span style={{color:"rgb(184, 150, 27)"}}> {router.query.name} </span>
                的资产信息
            </span>
            <Descriptions style={{width:"100%"}} bordered>
                <Descriptions.Item label="名字">{router.query.name}</Descriptions.Item>
                <Descriptions.Item label="编号">{router.query.id}</Descriptions.Item>
                <Descriptions.Item label="所属用户">{router.query.user}</Descriptions.Item>
                <Descriptions.Item label="部门">{router.query.department}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{router.query.create_time}</Descriptions.Item>
                <Descriptions.Item label="距离过期">{router.query.deadline}</Descriptions.Item>
                <Descriptions.Item label="价格">{router.query.price}</Descriptions.Item>
                <Descriptions.Item label="所属树节点">{router.query.treeNode}</Descriptions.Item>
                <Descriptions.Item label="所属资产">{router.query.parent === "" ? "无" : router.query.parent}</Descriptions.Item>
                <Descriptions.Item label="描述" span={3}>{router.query.description === "" ? "无" : router.query.description}</Descriptions.Item>
            </Descriptions>
        </div>
    ) : (
        <div className="indexLayout" style={{display:"flex", justifyContent:"center", alignContent:"center", flexWrap:"wrap"}}>
            <span style={{fontFamily:"Tommy-medium", fontSize: "25px"}}>
                请通过扫码访问页面
            </span>
        </div>
    );
    
}
