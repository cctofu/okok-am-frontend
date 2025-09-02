import React, { useEffect, useState } from "react";
import { Button, Input, Space, Table, message } from "antd";
import { useRouter } from "next/router";
import { request } from "../index";
import Cookies from "js-cookie";
import type { ColumnsType } from "antd/es/table";
import CreateWarning from "@/components/warning_utils/create_warning";

interface DataType {
    date: string | number;
    amount: string | number;
    name: string;
    description: string;
}

export default function Warnings() {
    const [character, setCharacter] = useState<string>();
    const [logItems, setLogItems] = useState<DataType[]>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searching, setSearching] = useState<boolean>(false);
    const [id, setId] = useState<string>("");
    const [assetName, setAssetName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const router = useRouter();
    const [isUseId, setIsUseId] = useState<boolean>(false);

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(Cookies.get("sessionID") == null){
            router.push("/");
            message.error("请先登录");
        }
        getInfo();
        getWarning(1);
    }, [router, router.query]);

    const handleBackBtn = () =>{
        if(character == null){
            message.error("用户的session ID未找到");
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
                console.log("Error: " + err);
            });
    };
    
    const fetchList = () => {
        getWarning(currentPage);
    };

    const getWarning = (page : number) => {
        request(
            `/api/warning_get/${Cookies.get("sessionID")}/${page}`,
            "GET",
        )
            .then((res) => { 
                setLogItems(res.data.reverse().map((val:any) => ({
                    ...val,
                    name: val.name,
                    description: val.description,
                    assetclass: val.assetClass === 1? "数量型" : "条目型",
                    date_war: val.warning_date === -1 ?  "" : val.warning_date,
                    amount_war: val.warning_amount === -1 ? "" : val.warning_amount,
                    manage:
                    <Space>
                        <CreateWarning
                            toggleNeedNewFetch={fetchList}
                            asset={val.name}
                            cur_amount={val.warning_amount}
                            cur_date={val.warning_date}
                            count={val.count}
                            id={val.id}
                        />
                    </Space>
                })));
                setTotalPages(res.pages);
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };

    const getWarningSearch = (page : number) => {
        request(`/api/search_assets/${Cookies.get("sessionID")}`, 
            "POST",
            {
                asset_tree_node: "",
                id: id,
                name: assetName,
                price_inf: "",
                price_sup: "",
                description: description,
                page: page,
            })
            .then((res) => { 
                setLogItems(res.data.reverse().map((val:any) => ({
                    ...val,
                    name: val.name,
                    assetclass: val.assetClass === 1? "数量型" : "条目型",
                    date_war: val.warning_date === -1 ?  "" : val.warning_date,
                    amount_war: val.warning_amount === -1 ? "" : val.warning_amount,
                    manage:
                    <Space>
                        <CreateWarning
                            toggleNeedNewFetch={fetchList}
                            asset={val.name}
                            cur_amount={val.warning_amount}
                            cur_date={val.warning_date}
                            count={val.count}
                            id={val.id}
                        />
                    </Space>
                })));
                setTotalSearchPages(res.pages);
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "资产编号",
            dataIndex: "id",
            key: "id",
            width: "12%",
            ellipsis: true,
        },
        {
            title: "资产名称",
            dataIndex: "name",
            key: "name",
            width: "13%",
            ellipsis: true,
        },
        {
            title: "描述",
            dataIndex: "description",
            key: "description",
            width: "30%",
            ellipsis: true,
        },
        {
            title: "类型",
            dataIndex: "assetclass",
            key: "assetclass",
            width: "10%",
        },
        {
            title: "日期告警",
            key: "date_war",
            dataIndex: "date_war",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "数量告警",
            dataIndex: "amount_war",
            key: "amount_war",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "管理",
            dataIndex: "manage",
            key: "manage",
            width: "5%",
        },
    ];

    const pagination = {
        current: currentPage,
        pageSize: 6,
        total: 6 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            getWarning(page);
        },
    };

    const search_pagination = {
        current: currentSearchPage,
        pageSize: 6,
        total: 6 * totalSearchPages,
        onChange: (page: number) => {
            setCurrentSearchPage(page);
            getWarningSearch(page);
        },
    };

    const handleAssetSearch = () => {
        setCurrentSearchPage(1);
        getWarningSearch(1);
    };

    const handleIdChange = (e : any) => {
        setId(e.target.value);
        if(e.target.value !== ""){
            setIsUseId(true);
            setAssetName("");
            setDescription("");
        }
        else{
            setIsUseId(false);
        }
    };

    const startSearch = () => {
        setSearching(!searching);
    };

    return (
        <div className="indexLayout">
            <div className="logHeader">
                <h2 className="indexName">启源</h2>
                <button className="indexLogin" onClick={handleBackBtn}>返回</button>
            </div>

            <div className="logTitleDiv">
                <h3 className="logTitle">目前的告警策略</h3>
                <Button className="logRefreshBtn" onClick={startSearch} style={{fontFamily:"Tommy-medium", marginRight:"5%"}}>
                    搜索
                </Button>
            </div>

            <div className="logTimeline">
                <div hidden={!searching} className="user-list-search">
                    <Input 
                        placeholder="编号" 
                        value={id}
                        className="user-search-input" 
                        style={{width:"12%", borderRadius:"0px"}}
                        onChange={handleIdChange}
                    />
                    <Input 
                        disabled={isUseId}
                        placeholder="资产名称" 
                        value={assetName}
                        style={{ marginLeft:"0.5%", width:"13%",borderRadius:"0px"}}
                        onChange={(e) => setAssetName(e.target.value)}
                    />
                    <Input 
                        disabled={isUseId}
                        placeholder="资产描述" 
                        value={description}
                        style={{ marginLeft:"0.5%", width:"50%",borderRadius:"0px"}}
                        onChange={(e) => setAssetName(e.target.value)}
                    />
                    <Button 
                        style={{marginLeft:"0.5%", width:"25%",borderRadius:"0px"}} 
                        className="site-btn"
                        onClick={handleAssetSearch}
                    >搜索</Button>
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
