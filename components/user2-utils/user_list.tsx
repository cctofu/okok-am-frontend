import React, { useEffect, useState } from "react";
import { SearchOutlined, } from "@ant-design/icons";
import { Select } from "antd";
import { Button, Input, Space, Table, Badge } from "antd";
import type { ColumnsType } from "antd/es/table";
import UserInfo from "@/components/user-utils/user_info";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

export interface UserType {
  key: number;
  id: number;
  name: string;
  entity: string;
  department: string;
  character: string;
  lock: boolean;
  email: string;
  operation: any;
}

interface UserListProps {
    department?: string
}

const UserList2 = (props: UserListProps) => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [userList, setUserList] = useState<UserType[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searching, setSearching] = useState<boolean>(false);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [character, setCharacter] = useState("");
    const [islock, setIsLock] = useState("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);

    useEffect(() => {
        fetchList(props, 1);
    }, [props]);
    
    const getCharacter = (character: number) => {
        switch(character) {
        case 1:
            return "普通用户";
        case 2:
            return "资产管理员";
        case 3:
            return "系统管理员";
        case 4:
            return "超级管理员";
        }
    };
    const fetchList = (props : UserListProps, page : number) => {
        //get user based on department
        if(props.department){
            setRefreshing(true);
            request(`/api/user_department/${Cookies.get("sessionID")}/${props.department}/${page}`, "GET")
                .then((res) => {
                    setUserList(res.data.map((val: any) => ({ ...val, character: getCharacter(val.character), entity: val.entityName, department: val.departmentName, key: val.id,
                        operation:
                    <Space>
                        <UserInfo
                            id={val.id}
                            name={val.name}
                            entity={val.entityName}
                            department={val.departmentName}
                            character={val.character}
                            lock={val.lock}
                            email={val.email}></UserInfo>
                    </Space>
                    })));
                    setTotalPages(res.pages);
                    setRefreshing(false);
                })
                .catch((err) => {
                    console.log("错误: " + err);
                    
                });
        }
        setRefreshing(false);
    };

    const fetchSearchList = (props : UserListProps, page : number) => {
        //get user based on department
        if(props.department){
            setRefreshing(true);
            request(
                `/api/get_user_department/${Cookies.get("sessionID")}`, 
                "POST",
                {
                    id: id,
                    name: name,
                    character: character,
                    lock: islock,
                    page: page,
                })
                .then((res) => {
                    setUserList(res.data.map((val: any) => ({ ...val, character: getCharacter(val.character), entity: val.entityName, department: val.departmentName, key: val.id,
                        operation:
                    <Space>
                        <UserInfo
                            id={val.id}
                            name={val.name}
                            entity={val.entityName}
                            department={val.departmentName}
                            character={val.character}
                            lock={val.lock}
                            email={val.email}></UserInfo>
                    </Space>
                    })));
                    setTotalSearchPages(res.pages);
                    setRefreshing(false);
                })
                .catch((err) => {
                    console.log("错误: " + err);
                    
                });
        }
        setRefreshing(false);
    };


    const columns: ColumnsType<UserType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "10%",
        },
        {
            title: "名字",
            dataIndex: "name",
            key: "name",
            width: "30%",
        },
        {
            title: "用户类型",
            dataIndex: "character",
            key: "character",
            width: "30%",
        },
        {
            title: "状态",
            dataIndex: "lock",
            key: "lock",
            width: "20%",
            render: (lock: boolean) => 
                <Space>
                    <Badge status = {lock ? "error" : "success"} 
                        text = {lock ? "锁定" : "正常"}/>
                </Space>
        },
        {
            title: "管理",
            dataIndex: "operation",
            key: "operation",
            width:"15%"
        }
    ];

    const pagination = {
        current: currentPage,
        pageSize: 6,
        total: 6 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            fetchList(props, page);
        },
    };

    const search_pagination = {
        current: currentSearchPage,
        pageSize: 6,
        total: 6 * totalSearchPages,
        onChange: (page: number) => {
            setCurrentSearchPage(page);
            fetchSearchList(props, page);
        },
    };

    const startSearch = () => {
        if(searching === false){
            setUserList([]);
        }
        else{
            fetchList(props, 1);
        }
        setSearching(!searching);
    };

    const handleCharacterChange = (val : string) =>{
        setCharacter(val);
    };
    const handleStatusChange = (val : string) =>{
        setIsLock(val);
    };
    const handleSearch = () => {
        setCurrentSearchPage(1);
        fetchSearchList(props, 1);
    };

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="user-list-content">
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">部门用户列表</text>
                <Button className="addBtn" onClick={startSearch}>
                    <SearchOutlined style={{ fontSize: "40px", color:"black"}}/>
                </Button>
            </div>
            <div hidden={!searching} className="user-list-search">
                <Input 
                    placeholder="编号" 
                    className="user-search-input" 
                    style={{width:"10%", borderRadius:"0px"}}
                    onChange={(e) => setId(e.target.value)}/>
                <Input 
                    placeholder="用户名" 
                    style={{ marginLeft:"0.5%", width:"29.5%",borderRadius:"0px"}}
                    onChange={(e) => setName(e.target.value)}/>
                <Select 
                    defaultValue="所有权限" 
                    style={{marginLeft:"0.5%", width:"29.5%",borderRadius:"0px"}}
                    options={[
                        { value: "", label: "所有权限" },
                        { value: "2", label: "资产管理员" },
                        { value: "1", label: "普通用户" },
                    ]}
                    onChange={handleCharacterChange}/>
                <Select 
                    defaultValue="所有" 
                    style={{marginLeft:"0.5%", width:"14.5%",borderRadius:"0px"}}
                    options={[
                        { value: "", label: "所有" },
                        { value: "0", label: "正常" },
                        { value: "1", label: "锁定" },
                    ]}
                    onChange={handleStatusChange}/>
                <Button 
                    style={{marginLeft:"0.5%", width:"14.5%",borderRadius:"0px"}} 
                    className="site-btn"
                    onClick={handleSearch}>搜索</Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={userList} 
                pagination={searching? {
                    ...search_pagination,
                    showSizeChanger: false,
                } :{
                    ...pagination,
                    showSizeChanger: false,
                }}
            /> 
        </div>
    );
};

export default UserList2;