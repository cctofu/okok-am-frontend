import React, { useEffect, useState } from "react";
import { Select, message } from "antd";
import { useRouter } from "next/router";
import { request } from "../index";
import Cookies from "js-cookie";
import { Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface CurveInfo {
    price: number,
    count: number,
}

export default function Statistics() {
    const [data_amount, setDataAmount] = useState<CurveInfo[]>([]);
    const [data_item, setDataItem] = useState<CurveInfo[]>([]);
    const [data_total, setDataTotal] = useState<CurveInfo[]>([]);
    const [labels, setLabels] = useState<string[]>([]);

    const [quantData, setQuantData] = useState<number[]>([]);
    const [qualData, setQualData] = useState<number[]>([]);

    const [character, setCharacter] = useState<string>();
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(Cookies.get("sessionID") == null){
            router.push("/");
            message.error("请先登录");
        }
        getData(1);
    }, [router]);

    const handleBackBtn = () =>{
        if(character == null){
            message.error("用户登录过期");
            router.push("/");
        }
        else {  
            router.push(`/dashboard/home?userType=${character}`);
        }
    };

    const getData = (type : number) => {
        request(
            `/api/character/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setCharacter(res.data.character);
            })
            .catch((err) => {
                console.log("错误: " + err);
            });
        request(
            `/api/count_price_curve/${Cookies.get("sessionID")}/${type}`,
            "GET",
        )
            .then((res) => { 
                setLabels(res.data_item.reverse().map((item : any) => item.cur_time.substring(0, 16)));
                setDataAmount(res.data_item.reverse().map((val: any) => ({
                    ...val, 
                    price: val.price,
                    count: val.count,
                })));
                setDataItem(res.data_amount.reverse().map((val: any) => ({
                    ...val, 
                    price: val.price,
                    count: val.count,
                })));
                setDataTotal(res.data_total.reverse().map((val: any) => ({
                    ...val, 
                    price: val.price,
                    count: val.count,
                })));
            })
            .catch((err) => {
                console.log("错误: " + err);
            });
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                request(
                    `/api/count_status_asset/${Cookies.get("sessionID")}/${res.data.departmentName}`,
                    "GET",
                )
                    .then((res) => { 
                        console.log(res.data.slice(0, 4));
                        console.log(res.data.slice(4, 8));
                        setQualData(res.data.slice(0, 4).map((val: any) => val.count));
                        setQuantData(res.data.slice(4, 8).map((val: any) => val.count));
                    })
                    .catch((err) => {
                        console.log("错误: " + err);
                    });
            })
            .catch((err) => {
                console.log("错误: " + err);
            });
    };

    const handleChange = (val : any) => {
        if (val == "week") {
            getData(1);
        }
        if (val == "month") {
            getData(2);
        }
        if (val == "all") {
            getData(3);
        }
    };

    const Line_options = {
        responsive: true,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: "资产总数量和价格变动",
            },
        },
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

    const Qual_options = {
        plugins: {
            title: {
                display: true,
                text: "条目型资产状态分布",
            },
        },
    };

    const Quant_options = {
        plugins: {
            title: {
                display: true,
                text: "数量型资产状态分布",
            },
        },
    };

    const Line_data = {
        labels,
        datasets: [
            {
                label: "数量型资产数量",
                data: data_amount.map((item : any) => item.cur_count),
                borderColor: "#a9ac74",
                backgroundColor: "#a9ac74",
                yAxisID: "y",
            },
            {
                label: "数量型资产价格",
                data: data_amount.map((item : any) => item.cur_price),
                borderColor: "#675877",
                backgroundColor: "#675877",
                yAxisID: "y1",
            },
            {
                label: "条目型资产数量",
                data: data_item.map((item : any) => item.cur_count),
                borderColor: "#92a1a5",
                backgroundColor: "#92a1a5",
                yAxisID: "y",
            },
            {
                label: "条目型资产价格",
                data: data_item.map((item : any) => item.cur_price),
                borderColor: "#eedaca",
                backgroundColor: "#eedaca",
                yAxisID: "y1",
            },
            {
                label: "总数量",
                data: data_total.map((item : any) => item.cur_count),
                borderColor: "#3e6074",
                backgroundColor: "#3e6074",
                yAxisID: "y",
            },
            {
                label: "总价格",
                data: data_total.map((item : any) => item.cur_price),
                borderColor: "#ac747c",
                backgroundColor: "#ac747c",
                yAxisID: "y1",
            },
        ],
    };

    const Quant_data = {
        labels: ["已清退", "闲置中", "使用中", "维保中"],
        datasets: [
            {
                label: "",
                data: quantData,
                backgroundColor: [
                    "#ac747c",
                    "#3e6074",
                    "#eedaca",
                    "#92a1a5",
                ],
                borderColor: [
                    "#ac747c",
                    "#3e6074",
                    "#eedaca",
                    "#92a1a5",
                ],
                borderWidth: 1,
            },
        ],
    };

    const Qual_data = {
        labels: ["已清退", "闲置中", "使用中", "维保中"],
        datasets: [
            {
                label: "",
                data: qualData,
                backgroundColor: [
                    "#ac747c",
                    "#3e6074",
                    "#eedaca",
                    "#92a1a5",
                ],
                borderColor: [
                    "#ac747c",
                    "#3e6074",
                    "#eedaca",
                    "#92a1a5",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="indexLayout">
            <div className="logHeader">
                <h2 className="indexName">启源</h2>
                <button className="indexLogin" onClick={handleBackBtn}>首页</button>
            </div>

            <div className="logTitleDiv">
                <h3 className="logTitle">资产统计</h3>
                <div style={{display:"flex", flexDirection:"row", marginRight:"5.5%"}}>
                    <Select
                        defaultValue="week"
                        style={{ width: 150}}
                        onChange={handleChange}
                        options={[
                            { value: "week", label: "一周" },
                            { value: "month", label: "一个月" },
                            { value: "all", label: "所有" },
                        ]}/>
                </div>
            </div>
            <div className="logTimeline">
                <Line options={Line_options} data={Line_data} />
                <div style={{display:"flex", flexDirection:"row", marginTop:"50px"}}>
                    <div style={{width:"50%", height:"500px"}}>
                        <Pie data={Qual_data} options={Qual_options}/>
                    </div>
                    <div style={{width:"50%", height:"500px",marginLeft:"20%"}}>
                        <Pie data={Quant_data} options={Quant_options}/>
                    </div>
                </div>
            </div>
        </div>
    );
    
}
