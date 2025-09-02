import { FundTwoTone } from "@ant-design/icons";
import { Button, Modal, Select, message, Tooltip as AntTooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface CurveProp {
    name: string;
    id: number;
}

interface CurveInfo {
    price: number,
    count: number,
    time: string,
}

export default function AssetCurve (props : CurveProp) {
    const [open, setOpen] = useState(false);

    const [labels, setLabels] = useState<string[]>([]);
    const [apiResponse, setApiResponse] = useState<CurveInfo[]>([]);

    useEffect(() => {
        if(open){
            getData(1);
        }
    }, [open]);

    const options = {
        responsive: true,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        stacked: false,
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
                label: "数量",
                data: apiResponse.map((item : any) => item.count),
                borderColor: "#ac747c",
                backgroundColor: "#ac747c",
                yAxisID: "y",
            },
            {
                label: "价格",
                data: apiResponse.map((item : any) => item.price),
                borderColor: "#233e4d",
                backgroundColor: "#233e4d",
                yAxisID: "y1",
            },
        ],
    };

    const getData = (type : number) => {
        request(
            `/api/info_curve/${Cookies.get("sessionID")}/${props.id}/${type}`,
            "GET",
        )
            .then((res) => { 
                setLabels(res.data.map((item : any) => item.time));
                setApiResponse(res.data.reverse().map((val: any) => ({
                    ...val, 
                    price: val.cur_price,
                    count: val.cur_count,
                })));
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };  

    const handleChange = (value: string) => {
        if (value == "week") {
            getData(1);
        }
        if (value == "month") {
            getData(2);
        }
        if (value == "all") {
            getData(3);
        }
    };

    return (
        <>
            <AntTooltip title={"资产曲线"}>
                <Button icon={<FundTwoTone/>} onClick={() => setOpen(true)}></Button>
            </AntTooltip>
            <Modal
                title={
                    <span>
                        <span style={{color:"rgb(184, 150, 27)"}}> {props.name} </span>
                的资产变化曲线
                    </span>
                }
                width={800}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <div style={{flexDirection:"column", display:"flex", justifyContent:"center"}}>
                    <Line options={options} data={data} style={{height:"300px"}}/>
                    <div style={{display:"flex", justifyContent:"center"}}>
                        <span style={{alignContent:"center", display:"flex", flexWrap:"wrap", fontFamily:"Tommy-medium"}}>
                            选择显示曲线时间：
                        </span>
                        <Select
                            defaultValue="week"
                            style={{ width: 100}}
                            onChange={handleChange}
                            options={[
                                { value: "week", label: "一周" },
                                { value: "month", label: "一个月" },
                                { value: "all", label: "所有" },
                            ]}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}