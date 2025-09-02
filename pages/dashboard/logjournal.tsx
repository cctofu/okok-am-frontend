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
    message: string;
}

export default function LogJournal() {
    const [character, setCharacter] = useState<string>();
    const [logItems, setLogItems] = useState<DataType[]>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const router = useRouter();

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);
    const [msg, setMsg] = useState("");
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
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
    }, [router, router.query]);

    useEffect(() => {
    }, [totalPages, currentPage]);

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
            `/api/logjournal/${Cookies.get("sessionID")}/${router.query.entity}/${page}`,
            "GET",
        )
            .then((res) => { 
                setLogItems(res.data.map((val:any) => ({
                    ...val,
                    time: val.time,
                    user: val.user,
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
            `/api/get_logjournal/${Cookies.get("sessionID")}/${router.query.entity}`, 
            "POST",
            {
                date: date? date : "",
                info: msg,
                name: name,
                page: page,
            })
            .then((res) => { 
                setLogItems(res.data.map((val:any) => ({
                    ...val,
                    time: val.time,
                    user: val.user,
                    message: val.message,
                })));
                setTotalSearchPages(res.pages);
            })
            .catch((err) => {
                message.error("错误：" + err);
            });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "日期",
            dataIndex: "time",
            key: "time",
            width:"15%"
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
            render: (_, { message }) => (
                <>
                    {message.includes("登录") ? (
                        <Tag color="green" key="login">
                  登录
                        </Tag>
                    ) : (
                        <Tag color="red" key="logout">
                  登出
                        </Tag>
                    )}
                </>
            ),
            width:"10%"
        },
        {
            title: "用户",
            dataIndex: "user",
            key: "user",
            width:"20%"
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

    const ReloadPage = () => {
        setLogItems([]);
        setSearching(false);
        getUserLog(1);
        setCurrentPage(1);
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
                <h3 className="logTitle">用户登录登出日志</h3>
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
                        style={{width:"50%", borderRadius:"0px", marginLeft:"0.5%"}}
                        onChange={(e) => setMsg(e.target.value)}
                        allowClear/>
                    <Input 
                        placeholder="用户" 
                        style={{ marginLeft:"0.5%", width:"20%",borderRadius:"0px"}}
                        onChange={(e) => setName(e.target.value)}
                        allowClear/>
                    <Button 
                        style={{marginLeft:"0.5%", width:"15%",borderRadius:"0px"}} 
                        className="site-btn"
                        onClick={handleSearch}>搜索</Button>
                </div>
                <Table 
                    columns={columns} 
                    dataSource={logItems} 
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
