import { InfoCircleTwoTone, InfoCircleOutlined } from "@ant-design/icons";
import { Button, Carousel, Descriptions, Modal, Tooltip, message } from "antd";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Cookies from "js-cookie";
import RichTextImport from "./richtext_import";
import { request } from "@/pages";

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

export default function AssetInfo (props : AssetProp) {
    const [open, setOpen] = useState(false);
    const [imgList, setImgList] = useState<string[]>([]);
    const [richText, setRichText] = useState<string>("");

    useEffect(() => {
    }, [open]);

    function toggleNeedNewFetch() {
        openInfo();
    }

    const onDownload = () => {
        const canvas = document.createElement("canvas");
        const url = `${window.location.origin}/qrinfo?name=${props.name}&id=${props.id}&user=${props.user}&department=${props.department}&create_time=${props.create_time}&deadline=${props.deadline}&price=${props.price}&treeNode=${props.treeNode}&parent=${props.parent === "" ? "无" : props.parent}&description=${props.description === "" ? "无" : props.description}&session=${Cookies.get("sessionID")}`;
        
        QRCode.toCanvas(canvas, url, (error:any) => {
            if (error) {
                console.error(error);
                return;
            }
            const link = document.createElement("a");
            link.download = `${props.name}_QRCode.png`;
            link.href = canvas.toDataURL();
            link.click();
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

    const onChange = (currentSlide: number) => {
        console.log(currentSlide);
    };

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

    return (
        <>
            <Tooltip title={"资产信息"}>
                <Button icon={<InfoCircleTwoTone/>} onClick={openInfo}></Button>
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
                    <Button className="asset-btn" onClick={onDownload} style={{marginBottom:"15px"}}>下载资产二维码</Button>
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

                        <Descriptions.Item label="资产描述" span={3} labelStyle={{fontFamily:"Tommy-bold"}}>
                            {props.description === "" ? "无" : props.description}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions style={{width:"100%", display:"flex", flexDirection:"row"}} bordered layout="vertical" labelStyle={{fontFamily:"Tommy-bold"}}>
                        <Descriptions.Item label="描述" span={3}>
                            <RichTextImport 
                                richtext={richText}
                                imgList={imgList}
                                id={props.id}
                                toggleNeedNewFetch={toggleNeedNewFetch}
                            />
                            <div dangerouslySetInnerHTML={{ __html: richText }} />
                        </Descriptions.Item>
                        <Descriptions.Item 
                            label={<div>
                                <span>图片</span>
                                <Tooltip title="请在富文本描述中添加图片链接">
                                    <InfoCircleOutlined style={{ marginLeft: "5px", fontSize:"12px"}} />
                                </Tooltip>
                            </div>} 
                            span={3} 
                            labelStyle={{fontFamily:"Tommy-bold"}} 
                            className="hidden-image">
                            {imgList? "" : "无"}
                        </Descriptions.Item>
                    </Descriptions>
                    <Carousel afterChange={onChange} lazyLoad="ondemand">
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