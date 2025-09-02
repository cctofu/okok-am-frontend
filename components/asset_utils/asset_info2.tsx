import { InfoCircleTwoTone } from "@ant-design/icons";
import { Button, Carousel, Descriptions, Modal, Tooltip, message } from "antd";
import React, { useEffect, useState } from "react";
import { request } from "@/pages";
import Cookies from "js-cookie";

interface AssetProp {
    id: number;
    parent: string;
    name: string;
    assetClass: number;
    user: string;
    price: number;
    description: string;
    expire: number;
    count: number;
    assetTree: string;
    department?:string;
    create_time: number;
    deadline: number;
    treeNode?: string | number;
}

export default function AssetInfo2 (props : AssetProp) {
    const [open, setOpen] = useState(false);
    const [imgList, setImgList] = useState<string[]>([]);
    const [richText, setRichText] = useState<string>("");

    useEffect(() => {
    }, [open]);

    const openInfo = () => {
        setOpen(true);
        request(
            `/api/picture/${Cookies.get("sessionID")}/${props.id}`,
            "GET",
        )
            .then((res) => {
                setImgList(res.links);
                setRichText(res.richtxt);
            }
            )
            .catch((err) => {
                message.error("错误:" + err);
            });
    };

    const contentStyle: React.CSSProperties = {
        margin: 0,
        color: "#fff",
        lineHeight: "160px",
        textAlign: "center",
        background: "gray",
        height:"500px",
    };

    return (
        <>
            <Tooltip title={"资产信息"}>
                <Button onClick={openInfo} className="antd-icon-button">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <InfoCircleTwoTone/>
                    </div>
                </Button>
            </Tooltip>
            <Modal
                title={
                    <span>
                        <span style={{color:"rgb(184, 150, 27)"}}> {props.name} </span>
                的资产信息
                    </span>
                }
                width={800}
                open={open}
                style={{top:"40px"}}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                    <Descriptions style={{width:"100%", display:"flex", flexDirection:"row"}} bordered>
                        <Descriptions.Item label="编号" span={1} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="名字" span={2} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="所属用户" span={1} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.user}
                        </Descriptions.Item>
                        <Descriptions.Item label="部门" span={2} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.department}
                        </Descriptions.Item>

                        <Descriptions.Item label="距离过期" span={1} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.deadline}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建日期" span={2} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.create_time}
                        </Descriptions.Item>
                       
                        <Descriptions.Item label="价格" span={3} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.price}
                        </Descriptions.Item>
                        <Descriptions.Item label="所属树节点" span={1} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.treeNode}
                        </Descriptions.Item>
                        <Descriptions.Item label="所属资产" span={2} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.parent === "" ? "无" : props.parent}
                        </Descriptions.Item>

                        <Descriptions.Item label="资产类型" span={1} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.assetClass === 0? "条目型" : "数量型"}
                        </Descriptions.Item>
                        <Descriptions.Item label="品类" span={2} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.assetTree === "" ? "无" : props.assetTree}
                        </Descriptions.Item>

                        <Descriptions.Item label="资产描述" span={3} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.description === "" ? "无" : props.description}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions style={{width:"100%", display:"flex", flexDirection:"row"}} bordered layout="vertical" labelStyle={{fontFamily:"Tommy-bold"}}>
                        <Descriptions.Item label="描述" span={3}>
                            <div dangerouslySetInnerHTML={{ __html: richText }} />
                        </Descriptions.Item>
                        <Descriptions.Item 
                            label={<div>
                                <span>图片</span>
                            </div>} 
                            span={3} 
                            labelStyle={{fontFamily:"Tommy-bold"}} 
                            className="hidden-image">
                            {imgList? "" : "无"}
                        </Descriptions.Item>
                    </Descriptions>
                    <Carousel lazyLoad="ondemand">
                        {imgList? imgList.map((image, index) => (
                            <div key={index}>
                                <div style={contentStyle}>
                                    <div style={{ justifyContent:"center", display:"flex", height:"100%"}}> 
                                        <img
                                            src={image} 
                                            alt={`image${index}`} 
                                            height={"100%"} 
                                            onLoad={() => console.log(`Image ${index} loaded`)}
                                            style={{ objectFit: "cover", width: "100%" }}/>
                                    </div>
                                </div>
                            </div>
                        )) : ""}
                    </Carousel>
                </div>
            </Modal>
        </>
    );
}