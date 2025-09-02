import React, { useEffect, useState } from "react";
import { FileTextOutlined } from "@ant-design/icons";
import { Button, Modal, Space, message } from "antd";
import {useQuill} from "react-quilljs";
import "quill/dist/quill.snow.css";
import { request } from "@/pages";
import Cookies from "js-cookie";

interface RichTextProps{
    id: number;
    imgList:string[];
    richtext: string;
    toggleNeedNewFetch: () => void;
}

const RichTextImport = (props: RichTextProps) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { quill , quillRef } = useQuill();
    
    
    const handleValues = (desc : string, imglist : string[]) : string => {
        const textTitle = imglist.length === 0? "<br><h3>图片链接</h3><text>在这行下输入你想要的资产照片链接，可以多行输入，每个url用换行分割</text>" : "<br><h3>图片链接</h3>";
        const imgListString = imglist? imglist.map((imgSrc) => `<br><text>${imgSrc}</text>`) : [""];
        const combinedlist= imgListString.join("");
        return (desc + textTitle + combinedlist);
    };

    useEffect(() => {
        console.log(props);
        if (quill) {
            quill.clipboard.dangerouslyPasteHTML(handleValues(props.richtext, props.imgList));
        }
    }, [quill]);

    const showModal = () => {
        setOpen(true);
    };
    
    const handleOk = async () => {
        setLoading(true);
        if(quill){
            const quillHTML = quill.root.innerHTML;
            const regex = /(.+)<h3>图片链接<\/h3>/s;
            const match = quillHTML.match(regex);
            const extractedString = match ? match[1].trim() : "";

            let urlList : string[] = [];
            const textContent = quill?.getText();
            const allLines = textContent.split("\n");
            const targetIndex = allLines.findIndex(line => line.includes("图片链接"));

            if (targetIndex !== -1) {
                urlList = allLines
                    .slice(targetIndex + 2)
                    .filter((line) => line.trim() !== "")
                    .map((line) => line.trim());
            }

            request(
                `/api/picture/${Cookies.get("sessionID")}/${props.id}`,
                "PUT",
                {
                    richtxt: extractedString,
                    links: urlList,
                }
            )
                .then(() => {
                    message.success("修改成功!");
                    props.toggleNeedNewFetch();
                }
                )
                .catch((err) => {
                    message.error("错误:" + err);
                });
        }
        setLoading(false);
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Button type="primary" className="asset-btn" onClick={showModal} style={{marginBottom:"20px"}} disabled={loading}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <FileTextOutlined style={{marginRight:"5px"}}/>
                    修改资产富文本描述
                </div>
            </Button>
            <Modal
                open={open}
                title="富文本导入资产"
                onOk={handleOk}
                onCancel={handleCancel}
                closable={false}
                style={{top: 40}}
                width={800}
                footer={[
                    <Button key="返回" className="modalCancelBtn" onClick={handleCancel}>
                    取消
                    </Button>,
                    <Button key="上传" className="modalConfirmBtn" loading={loading} onClick={handleOk}>
                    保存
                    </Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: "100%", height: "100%" }}>
                    <div style={{ width: "100%", height: "500px"}}>
                        <div ref={quillRef} style={{height:"430px"}}/>
                    </div>
                </Space>
            </Modal>
            
        </>);
};

export default RichTextImport;