import React, { useEffect, useState } from "react";
import { RedoOutlined } from "@ant-design/icons";
import { UploadOutlined, DownloadOutlined, SmileOutlined } from "@ant-design/icons";
import { Button, message, Modal, Result, Space, Steps, Tooltip, Upload } from "antd";
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

interface FailedTaskRetryProps {
    id?: number;
    status?: number;
    port_type?: number;
}

interface FailedTaskType {
    name: string;
    parent : number;
    assetClass: number;
    user: string;
    price: number;
    description: string;
    position: string;
    expire: boolean;
    deadline: number;
    count: number;
    assetTree: string;
    department: string;
    message: string;
  }

const FailedTaskRetry = (props: FailedTaskRetryProps) => {
    const [assetImport, setAssetImport] = useState<AssetType[]>([]);
    const [failedAssetImport, setFailedAssetImport] = useState<AssetType[]>([]);
    const [target, setTarget] = useState<FailedTaskType[]>([]);
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const fetchList = (props: FailedTaskRetryProps) => {
        if (props.port_type === 1) {
            request(`/api/failed_task/${Cookies.get("sessionID")}/${props.id}`, "GET")
                .then((res) => {
                    setTarget((res.data.map((val: any) => ({
                        ...val, 
                    }))));
                    setAssetImport((res.data.map((val: any) => ({
                        ...val, id: Date.now() * Math.random(),
                    }))));
                    setFailedAssetImport((res.data.map((val: any) => ({
                        ...val, id: Date.now() * Math.random(),
                    }))));
                })
                .catch((err) => {
                    message.error("获取错误信息失败！请稍后再试！" + err + props.id);
                    console.log("拉取错误信息失败: " + err);
                });
        }
    };

    useEffect(() => {
        fetchList(props);
    }, [open]);

    const download = () =>{
        console.log(target.map((info) => [info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price, info.count, info.deadline, info.assetTree, info.description, info.position, info.message]));
        let data =[
            ["资产名", "资产类型", "资产价值", "资产数量", "使用期限", "所属品类", "描述信息", "位置信息", "错误信息"],
        ];
        for (let info of target) {
            data.push([info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price.toString(), info.count.toString(), info.deadline.toString(), info.assetTree, info.description, info.position, info.message]);
        }
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        XLSX.writeFile(wb, `异步任务${props.id}失败记录.xlsx`);
        setDownloaded(true);
    };

    const uploadprops = {
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        name: "file",
        headers: {
            authorization: "authorization-text",
        },
        beforeUpload: (file: any, fileList: any) => {
            console.log(file);
            setLoaded(true);
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
            setAssetImport(failedAssetImport);
            setLoaded(false);
            console.log(loaded);
            return true;
        }
    };


    const showModal = () => {
        setOpen(true);
    };

    const steps = [
        {
            title: "查看失败记录",
            description: "失败文件下载",
            content:
            <>
                <Space>
                    <Button onClick={download} icon={<DownloadOutlined />} style={{marginLeft: 250}} className="asset-btn">点击下载失败记录</Button>
                </Space>
            </>
        },
        {
            title: "重新执行任务",
            description: "导入文件重新执行",
            content:
            <>
                <Upload
                    {...uploadprops}
                    maxCount={1}
                >
                    <Button icon={<UploadOutlined />} className="asset-btn" style={{marginLeft: 250}}>上传重新导入文件</Button>
                </Upload>
            </>
        },
        {
            title: "结果",
            description: "等待结果",
            content:
            <>
                <Result
                    icon={<SmileOutlined/>}
                    title={"保存成功！请返回查看结果"}
                    extra={<Button className="modalConfirmBtn"
                        onClick={() => {
                            setOpen(false);
                        }}>返回</Button>}
                >
                </Result>
            </>
        }
    ];

    const [current, setCurrent] = useState<number>(0);
    const items = steps.map((item) => ({ key: item.title, title: item.title, description: item.description }));
    
    const upload  = () => {
        console.log(target);
        message.success("任务重新执行开始！请耐心等待结果！");
        if (assetImport.length > 0) {
            request(
                `/api/failed_task/${Cookies.get("sessionID")}/${props.id}`,
                "PUT",
                assetImport.map((asset: any) => ({
                    name: asset.name,
                    parent: asset.parent,
                    assetClass: asset.assetClass,
                    user: target[0].user,
                    price: asset.price,
                    description: asset.description,
                    position: asset.position,
                    expire: 0,
                    deadline: asset.deadline,
                    count: asset.count,
                    assetTree: asset.assetTree,
                    department: target[0].department,
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
    }; 

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Tooltip title={props.port_type === 2 ? "导出任务无法重新执行！" :(props.status === 2 ? "查看失败信息及重新执行" : (props.status === 0 ? "任务进行中，请勿操之过急！" : "任务成功，不需要重新执行！"))}>
                <Button onClick={showModal} icon={<RedoOutlined /> } disabled={props.status != 2 || props.port_type === 2}> 
                </Button>
            </Tooltip>
            <Modal
                open={open}
                width={700}
                title="失败任务重新执行"
                onCancel={handleCancel}
                footer={[]}
                className="createIDcard-modal"
            >

                <Steps current={current} items={items} direction="horizontal"/>
                <div style={{ marginTop: 24 }}>{steps[current].content}</div>
                <div style={{ marginTop: 24 }}>
                    {current === 0 && (
                        <Space style={{marginLeft: 200}}>
                            <Button className="modalConfirmBtn" onClick={() => {
                                setCurrent((cur) => cur + 1);
                            }}>
                                {downloaded ? "查看完毕，准备上传": "毋需查看，直接提交"}
                            </Button>
                            <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                            </Button>
                        </Space>
                    )}
                    {current === 1 && (
                        <Space style={{marginLeft: 100}}>
                            <Button className="modalConfirmBtn" onClick={() => {
                                setCurrent((cur) => cur + 1);
                                upload();
                            }}>
                                {loaded ? "重新评测文件": "提交错误文件"}
                            </Button>
                            <Button className="modalCancelBtn" onClick={() => {
                                setCurrent((cur) => cur - 1);
                            }}>
                                {"返回下载页面"}
                            </Button>
                            <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                            </Button>
                        </Space>
                    )}
                </div>

            </Modal>
            
        </>);
};

export default FailedTaskRetry;