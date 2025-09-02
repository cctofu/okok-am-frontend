import React, { useEffect, useState } from "react";
import { Button, Input, Table, Tag, message } from "antd";
import { useRouter } from "next/router";
import { request } from "../index";
import Cookies from "js-cookie";
import type { ColumnsType } from "antd/es/table";
import { DatePicker } from "antd";

interface DataType {
    time: string;
    user: string;
    operation_type: number;
    object_type: number;
    object_name: string;
    message: string;
}

export default function OpeartionJournal() {
    const [character, setCharacter] = useState<string>();
    const [opItems, setOpItems] = useState<DataType[]>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const router = useRouter();

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);
    const [msg, setMsg] = useState("");
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [change, setChange] = useState("");
    const [searching, setSearching] = useState<boolean>(false);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(Cookies.get("sessionID") == null){
            router.push("/");
            message.error("请先登录");
        }
        getInfo();
        getUserLog(1);
    }, [router]);

    const ReloadPage = () => {
        setOpItems([]);
        getUserLog(1);
        setCurrentPage(1);
    };

    const handleBackBtn = () =>{
        if(character == null){
            message.error("用户登录过期");
            router.push("/");
        }
        else {  
            router.push(`/dashboard/home?userType=${character}`);
        }
    };

    const getInfo = () => {
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
    };

    const getUserLog = (page: number) => {
        request(
            `/api/operationjournal/${Cookies.get("sessionID")}/${router.query.entity}/${page}`,
            "GET",
        )
            .then((res) => { 
                setOpItems(res.data.map((val:any) => ({
                    ...val,
                    time: val.time,
                    user: val.user,
                    operation_type: val.operation_type,
                    object_type: val.object_type,
                    modObj: val.object_name,
                    message: val.message,
                })));
                setTotalPages(res.pages);
            })
            .catch((err) => {
                console.log("错误: " + err);
            });
    };

    const getUserSearchLog = (page: number) => {
        request(
            `/api/get_operationjournal/${Cookies.get("sessionID")}/${router.query.entity}`, 
            "POST",
            {
                date: date? date : "",
                info: msg,
                name: name,
                change: change,
                page: page,
            })
            .then((res) => { 
                setOpItems(res.data.map((val:any) => ({
                    ...val,
                    time: val.time,
                    user: val.user,
                    operation_type: val.operation_type,
                    object_type: val.object_type,
                    modObj: val.object_name,
                    message: val.message,
                })));
                setTotalSearchPages(res.pages);
            })
            .catch((err) => {
                console.log("错误: " + err);
            });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "日期",
            dataIndex: "time",
            key: "time",
            width:"15%",
        },
        {
            title: "信息",
            dataIndex: "message",
            key: "message",
        },
        {
            title: "类型",
            key: "type",
            dataIndex: "type",
            render: (_, record) => {
                let operationTypeTagColor = "green";
                let operationTypeTagLabel = "UNKNOWN";
                let objectTypeTagColor = "green";
                let objectTypeTagLabel = "UNKNOWN";
          
                if (record.operation_type === 2) {
                    operationTypeTagColor = "green";
                    operationTypeTagLabel = "修改";
                } else if (record.operation_type === 3) {
                    operationTypeTagColor = "blue";
                    operationTypeTagLabel = "创建";
                }else{
                    operationTypeTagColor = "red";
                    operationTypeTagLabel = "删除";
                }
          
                if (record.object_type === 1) {
                    objectTypeTagColor = "purple";
                    objectTypeTagLabel = "用户";
                } else if (record.object_type === 2) {
                    objectTypeTagColor = "blue";
                    objectTypeTagLabel = "部门";
                } else if (record.object_type == 3){
                    objectTypeTagColor = "green";
                    objectTypeTagLabel = "资产";
                } else {
                    objectTypeTagColor = "purple";
                    objectTypeTagLabel = "请求";
                }
          
                return (
                    <>
                        <Tag color={operationTypeTagColor} key={operationTypeTagLabel}>
                            {operationTypeTagLabel}
                        </Tag>
                        <Tag color={objectTypeTagColor} key={objectTypeTagLabel}>
                            {objectTypeTagLabel}
                        </Tag>
                    </>
                );
            },
            width:"10%"
        },
        {
            title: "修改对象",
            dataIndex: "modObj",
            key: "modObj",
            width:"15%",
        },
        {
            title: "用户名称",
            dataIndex: "user",
            key: "user",
            width:"15%",
        },
    ];

    const pagination = {
        current: currentPage,
        pageSize: 8,
        total: 8 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            getUserLog(page);
        },
    };

    const search_pagination = {
        current: currentSearchPage,
        pageSize: 8,
        total: 8 * totalSearchPages,
        onChange: (page: number) => {
            setCurrentSearchPage(page);
            getUserSearchLog(page);
        },
    };

    const startSearch = () => {
        if(searching){
            setSearching(false);
            getUserLog(1);
            setCurrentPage(1);
        }
        else {
            setSearching(true);
        }
    };

    const handleDateChange = (val : any) => {
        const formattedDate = val?.format("YYYY-MM-DD");
        setDate(formattedDate);
        console.log("Selected Date:", formattedDate);
    };

    const handleSearch = () => {
        setCurrentSearchPage(1);
        getUserSearchLog(1);
    };

    return (
        <div className="indexLayout">
            <div className="logHeader">
                <h2 className="indexName">启源</h2>
                <button className="indexLogin" onClick={handleBackBtn}>首页</button>
            </div>

            <div className="logTitleDiv">
                <h3 className="logTitle">系统修改日志</h3>
                <div style={{display:"flex", flexDirection:"row", marginRight:"5.5%"}}>
                    <Button className="logRefreshBtn" onClick={startSearch}>
                        搜索
                    </Button>
                    <Button className="logRefreshBtn" onClick={ReloadPage}>
                        刷新
                    </Button>
                </div>
            </div>
            <div className="logTimeline">
                <div hidden={!searching} className="user-list-search">
                    <DatePicker 
                        onChange={handleDateChange}
                        style={{width:"15%"}}/>
                    <Input 
                        placeholder="信息" 
                        className="user-search-input" 
                        style={{width:"38%", borderRadius:"0px", marginLeft:"0.5%"}}
                        onChange={(e) => setMsg(e.target.value)}
                        allowClear/>
                    <Input 
                        placeholder="对象" 
                        style={{ marginLeft:"0.5%", width:"15%",borderRadius:"0px"}}
                        onChange={(e) => setChange(e.target.value)}
                        allowClear/>
                    <Input 
                        placeholder="用户" 
                        style={{ marginLeft:"0.5%", width:"15%",borderRadius:"0px"}}
                        onChange={(e) => setName(e.target.value)}
                        allowClear/>
                    <Button 
                        style={{marginLeft:"0.5%", width:"15%",borderRadius:"0px"}} 
                        className="site-btn"
                        onClick={handleSearch}>搜索</Button>
                </div>
                <Table 
                    columns={columns} 
                    dataSource={opItems} 
                    pagination={searching? {
                        ...search_pagination,
                        showSizeChanger: false,
                    } :{
                        ...pagination,
                        showSizeChanger: false,
                    }}/>
            </div>
        </div>
    );
    
}
