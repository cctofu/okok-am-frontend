import React, { useState } from "react";
import { FileExcelOutlined } from "@ant-design/icons";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, message, Modal, Space, Upload } from "antd";
import * as XLSX from "xlsx";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

type AssetType = {
    id: React.Key;
    name: string;
    parent: number;
    assetClass: number;
    price: number;
    count: number;
    deadline: number;
    assetTree: string;
    description: string;
    position: string;
  };

interface CreateAssetProps{
    user?: string,
    department?: string,
    asset_tree_node?: string | number,
}

const ExcelImport = (props: CreateAssetProps) => {
    const [assetImport, setAssetImport] = useState<AssetType[]>([]);

    const download =  () =>{
        const data =[
            ["资产名", "资产类型", "资产价值", "资产数量", "使用期限", "所属品类", "描述信息", "位置信息"],
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        XLSX.writeFile(wb, "template.xlsx");
    };

    const uploadprops = {
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        name: "file",
        headers: {
            authorization: "authorization-text",
        },
        showUploadList: true,
        beforeUpload: (file: any, fileList: any) => {
            console.log(file);
            const f = fileList[0];
            let reader = new FileReader();
            reader.onload = function (e : any) {
                console.log(e.target);
                let data = e.target.result;
                let workbook = XLSX.read(data, { type: "binary" });
                let first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                let jsonArr: string[][] = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                console.log(jsonArr[1]);
                if (jsonArr[0][0] != "资产名" || 
                    jsonArr[0][1] != "资产类型" ||
                    jsonArr[0][2] != "资产价值" ||
                    jsonArr[0][3] != "资产数量" ||
                    jsonArr[0][4] != "使用期限" ||
                    jsonArr[0][5] != "所属品类" ||
                    jsonArr[0][6] != "描述信息" ||
                    jsonArr[0][7] != "位置信息") {
                    message.error("导入表格与模板信息不符！");
                    return false;
                }
                setAssetImport(jsonArr.filter((_, index) => index != 0).map((value: string[]) => ({
                    id: Date.now() * Math.random(),
                    name: value[0],
                    parent: 0,
                    assetClass: value[1] == "条目型" ? 0 : 1,
                    price: Number(value[2]),
                    count: Number(value[3]),
                    deadline: Number(value[4]),
                    assetTree: value[5],
                    description: value[6] ? value[6] : "",
                    position: value[7] ? value[7] : "",
                }
                )));
            };
            reader.readAsBinaryString(f);
            return false;
        },
        progress: {
            strokeColor: {
                "0%": "#108ee9",
                "100%": "#87d068",
            },
            strokeWidth: 3,
            showInfo: true,
            format: (percent: any) => percent && `${parseFloat(percent.toFixed(2))}%`,
        },
        onRemove() {
            setAssetImport([]);
            return true;
        }
       
    };

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    
    const handleOk  = () => {
        setOpen(false);
        message.success("任务创建成功！");
        if (assetImport.length > 0) {
            request(
                `/api/asset/${Cookies.get("sessionID")}`,
                "POST",
                assetImport.map((asset: any) => ({
                    name: asset.name,
                    parent: asset.parent,
                    assetClass: asset.assetClass,
                    user: props.user,
                    price: asset.price,
                    description: asset.description,
                    position: asset.position,
                    expire: 0,
                    deadline: asset.deadline,
                    count: asset.count,
                    assetTree: asset.assetTree,
                    department: props.department,
                    richtext: ""
                }))
            )
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        setLoading(false);  
    }; 

    const handleCancel = () => {
        setOpen(false);
    };
  
    return (
        <>
            <Button type="primary" className="asset-btn" onClick={showModal}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <FileExcelOutlined style={{marginRight:"5px"}}/>
                Excel导入资产
                </div>
            </Button>
            <Modal
                open={open}
                title="资产批量导入"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="返回" className="modalCancelBtn" onClick={handleCancel}>
                    取消
                    </Button>,
                    <Button key="上传" className="modalConfirmBtn" loading={loading} onClick={handleOk}>
                    导入
                    </Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: "100%" }}>

                    <Button onClick={download} icon={<DownloadOutlined />} className="asset-btn">点击下载文件模板</Button>
                    <Upload
                        {...uploadprops}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />} className="asset-btn">上传批量导入文件</Button>
                    </Upload>
                </Space>
            </Modal>
            
        </>);
};

export default ExcelImport;