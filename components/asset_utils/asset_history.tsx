import { BookTwoTone } from "@ant-design/icons";
import { Button, Modal, Select, Table, Tag, Tooltip, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";

interface HistoryProp {
    name: string;
    id: number;
}

interface HistoryInfo {
    time: number,
    type: string,
    message: string,
}

export default function AssetHistory (props : HistoryProp) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<HistoryInfo[]>([]);

    useEffect(() => {
        if(open){
            getData(5);
        }
    }, [open]);

    useEffect(() => {
    }, [data]);

    const getData = (type : number) => {
        request(
            `/api/asset_query/${Cookies.get("sessionID")}/${props.id}/${type}`,
            "GET",
        )
            .then((res) => { 
                setData(res.data.map((val: any) => ({
                    ...val, 
                    time: val.time,
                    type: val.type,
                    message: val.message,
                })));
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };  

    const columns: ColumnsType<HistoryInfo> = [
        {
            title: "时间",
            dataIndex: "time",
            key: "time",
            width: "25%",
        },
        {
            title: "类型",
            key: "type",
            dataIndex: "type",
            render: (_, { type }) => {
                let tagColor = "";
                if (type === "转移"){
                    tagColor = "green";
                }
                else if (type === "维保") {
                    tagColor = "gray";
                }
                else if (type === "领用") {
                    tagColor = "blue";
                }
                else if (type === "退库") {
                    tagColor = "green";
                }
                return (
                    <Tag color={tagColor} key={type}>
                        {type}
                    </Tag>
                );
            },
            width: "15%",
        },
        {
            title: "信息",
            dataIndex: "message",
            key: "message",
            width: "60%",
        },
    ];

    const handleChange = (value: string) => {
        if (value == "1") {
            getData(1);
        }
        else if (value == "2") {
            getData(2);
        }
        else if (value == "3") {
            getData(3);
        }
        else if (value == "4") {
            getData(4);
        }
        else {
            getData(5);
        }
    };

    return (
        <>
            <Tooltip title={"资产历史"}>
                <Button icon={<BookTwoTone/>} onClick={() => setOpen(true)}></Button>
            </Tooltip>
            <Modal
                title={
                    <span>
                        <span style={{color:"rgb(184, 150, 27)"}}> {props.name} </span>
                资产历史
                    </span>
                }
                width={800}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <div style={{display:"flex", flexDirection:"column"}}>
                    <div style={{display:"flex", justifyContent:"center", paddingBottom:"10px"}}>
                        <span style={{alignContent:"center", display:"flex", flexWrap:"wrap", fontFamily:"Tommy-medium"}}>显示历史类型：</span>
                        <Select
                            defaultValue="5"
                            style={{ width: 100}}
                            onChange={handleChange}
                            options={[
                                { value: "1", label: "转移历史" },
                                { value: "2", label: "维保历史" },
                                { value: "3", label: "领用历史" },
                                { value: "4", label: "退库历史" },
                                { value: "5", label: "全部历史" },
                            ]}
                        />
                    </div>
                    <div style={{width:"700px", overflowY: "auto"}}>
                        <Table 
                            columns={columns} 
                            dataSource={data} 
                            pagination={false}
                            style={{height:"450px"}}/>
                    </div>
                </div>
            </Modal>
        </>
    );
}