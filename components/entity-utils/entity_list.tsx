import React, { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { request } from "@/utils/network";
import CreateEntity from "./create_entity";
import Cookies from "js-cookie";
import RenameEntity from "./rename_entity";


interface EntityType {
  key: number;
  id: number;
  name: string;
  operation: any;
}

const EntityList = () => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [entityList, setEntityList] = useState<EntityType[]>([]);
    const [searching, setSearching] = useState<boolean>(false);

    const [searchList, setSearchList] = useState<EntityType[]>([]);
    const [id, setId] = useState("");
    const [entity, setEntity] = useState("");

    useEffect(() => {
        setRefreshing(true);
        fetchList();
        setRefreshing(false);
    }, []);

    function toggleNeedNewFetch() {
        fetchList();
    }

    const fetchList = () => {
        request(`/api/entity/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setEntityList(res.data.map((val: any) => ({ 
                    ...val, 
                    key: val.id,
                    operation:
                <Space>
                    <RenameEntity id={val.id} name={val.name} toggleNeedNewFetch={toggleNeedNewFetch}/>
                </Space>
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const columns: ColumnsType<EntityType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "15%",
        },
        {
            title: "企业名称",
            dataIndex: "name",
            key: "name",
            width: "60%",
        },
        {
            title: "管理",
            dataIndex: "operation",
            key: "operation",
        }
    ];

    const pagination = {
        pageSize: 6,
    };

    const startSearch = () => {
        setSearching(!searching);
    };

    const handleSearch = () => {
        setSearchList(entityList
            .filter((val : any) => val.name.includes(entity) && (id !== ""? val.key.toString() === id : true))
            .map((val: any) => ({ 
                ...val, 
                key: val.id,
                operation:
            <Space>
                <RenameEntity id={val.id} name={val.name} toggleNeedNewFetch={toggleNeedNewFetch}/>
            </Space>
            })));
    };

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="entity-list-content">
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">所有企业</text>
                <div>
                    <Button className="addBtn" onClick={startSearch}>
                        <SearchOutlined style={{ fontSize: "40px", color:"black"}}/>
                    </Button>
                    <CreateEntity toggleNeedNewFetch={toggleNeedNewFetch}/> 
                </div>
            </div>
            <div hidden={!searching} className="user-list-search">
                <Input 
                    placeholder="编号" 
                    className="user-search-input" 
                    style={{width:"15%", borderRadius:"0px"}}
                    onChange={(e) => setId(e.target.value)}
                    allowClear/>
                <Input 
                    placeholder="企业名称" 
                    style={{ marginLeft:"0.5%", width:"59.5%", borderRadius:"0px"}}
                    onChange={(e) => setEntity(e.target.value)}
                    allowClear/>
                <Button 
                    style={{marginLeft:"0.5%", width:"24.5%"}} 
                    className="site-btn"
                    onClick={handleSearch}>搜索</Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={searching? searchList : entityList} 
                className="entityTable"
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                }}/> 
        </div>
    );
};

export default EntityList;