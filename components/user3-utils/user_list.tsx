import React, { useEffect, useState } from "react";
import { SearchOutlined, LockTwoTone, UnlockTwoTone, } from "@ant-design/icons";
import { Select, message } from "antd";
import { Button, Input, Space, Table, Tooltip, Badge } from "antd";
import type { ColumnsType } from "antd/es/table";
import PasswordReset from "@/components/user-utils/password_reset";
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
    entity: string,
    department?: string
    hasFeishu?: boolean
}

const UserList3 = (props: UserListProps) => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [userList, setUserList] = useState<UserType[]>([]);

    const [searching, setSearching] = useState<boolean>(false);
    const [search_department, setSearchDepartment] = useState<string[]>([]);
    const allDepartment = { value: "", label: "所有部门" };

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [character, setCharacter] = useState("");
    const [islock, setIsLock] = useState("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);

    var currPage = 1;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setRefreshing(true);
        fetchList(props, 1);
        setRefreshing(false);
        fetchSearchInfo();
    }, [props]);

    function toggleNeedNewFetch() {
        fetchList(props, currPage);
    }

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

    const fetchSearchInfo = () => {
        request(`/api/all_departments/${Cookies.get("sessionID")}/${props.entity}`, "GET")
            .then((res) => {
                const names = res.data.slice(1).map((val: any) => val.name);
                setSearchDepartment(names);
            });
    };

    const fetchList = (props : UserListProps, page : number) => {
        request(`/api/user_entity/${Cookies.get("sessionID")}/${props.entity}/${page}`, "GET")
            .then((res) => {
                setUserList(res.data.map((val: any) => ({ 
                    ...val, 
                    character: getCharacter(val.character), 
                    entity: val.entityName, 
                    department: val.departmentName? val.departmentName : "无", 
                    key: val.id,
                    operation:
                <Space>
                    <Tooltip title={val.lock ? "解锁用户" : "锁定用户"}>
                        <Button icon={val.lock ? <UnlockTwoTone/> : <LockTwoTone/> } onClick = {
                            () => {
                                request(
                                    `/api/user/${Cookies.get("sessionID")}`, 
                                    "PUT",
                                    {
                                        id: val.id,
                                        name: val.name,
                                        password: val.password,
                                        entity: props.entity,
                                        department: val.departmentName,
                                        character: val.character,
                                        lock: !val.lock,
                                        session: "",
                                        email: val.email
                                    }
                                )
                                    .then(() => {
                                        if (val.lock) { message.success("用户成功解锁"); }
                                        else { message.success("用户已被锁定"); }
                                        toggleNeedNewFetch();
                                    }
                                    )
                                    .catch((err) => {
                                        message.error("错误:" + err);
                                    });
                            }
                        }></Button>
                    </Tooltip>
                    <PasswordReset 
                        id={val.id}
                        name={val.name}
                        entity={val.entityName}
                        department={val.departmentName}
                        character={val.character}
                        lock={val.lock}
                        email={val.email}
                    ></PasswordReset>
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
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const fetchSearchList = (props : UserListProps, page : number) => {
        request(
            `/api/get_user_entity/${Cookies.get("sessionID")}`, 
            "POST",
            {
                id: id,
                name: name,
                department: department,
                character: character,
                lock: islock,
                page: page,
            })
            .then((res) => {
                setUserList(res.data.map((val: any) => ({ 
                    ...val, 
                    character: getCharacter(val.character), 
                    entity: val.entityName, 
                    department: val.departmentName? val.departmentName : "无", 
                    key: val.id,
                    operation:
                <Space>
                    <Tooltip title={val.lock ? "解锁用户" : "锁定用户"} style={{fontFamily:"Tommy-regular"}}>
                        <Button icon={val.lock ? <UnlockTwoTone/> : <LockTwoTone/> } onClick = {
                            () => {
                                request(
                                    `/api/user/${Cookies.get("sessionID")}`, 
                                    "PUT",
                                    {
                                        id: val.id,
                                        name: val.name,
                                        password: val.password,
                                        entity: props.entity,
                                        department: val.departmentName,
                                        character: val.character,
                                        lock: !val.lock,
                                        session: "",
                                        email: val.email
                                    }
                                )
                                    .then(() => {
                                        if (val.lock) { message.success("用户成功解锁"); }
                                        else { message.success("用户已被锁定"); }
                                        toggleNeedNewFetch();
                                    }
                                    )
                                    .catch((err) => {
                                        message.error("错误:" + err);
                                    });
                            }
                        }></Button>
                    </Tooltip>
                    <PasswordReset 
                        id={val.id}
                        name={val.name}
                        entity={val.entityName}
                        department={val.departmentName}
                        character={val.character}
                        lock={val.lock}
                        email={val.email}
                        session={val.session}
                    ></PasswordReset>
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
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const updateFeishu = () => {
        request(
            `/api/feishu_users/${Cookies.get("sessionID")}`,
            "POST",
        )
            .then(() => { 
                message.success("同步成功");
            })
            .catch((err) => {
                message.error("错误:" + err);
            });
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
            width: "20%",
        },
        {
            title: "所属部门",
            dataIndex: "department",
            key: "department",
            width: "20%",
        },
        {
            title: "用户权限",
            dataIndex: "character",
            key: "character",
            width: "20%",
        },
        {
            title: "状态",
            dataIndex: "lock",
            key: "lock",
            width: "15%",
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
        }
    ];

    const pagination = {
        current: currentPage,
        pageSize: 8,
        total: 8 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            fetchList(props, page);
            currPage = page;
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

    const handleDepartChange = (val : string) =>{
        setDepartment(val);
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

    const departmentOptions = search_department.map((entity: string) => ({
        value: entity,
        label: entity,
    }));

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="user-list-content">
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"3%", paddingTop:"12px"}}>
                <text className="user-list-title">用户列表</text>
                <Button className="user-list-update-btn" onClick={updateFeishu} hidden={!props.hasFeishu}>同步飞书企业用户</Button>
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
                    style={{ marginLeft:"0.5%", width:"19.5%",borderRadius:"0px"}}
                    onChange={(e) => setName(e.target.value)}/>
                <Select 
                    defaultValue="所有部门" 
                    style={{marginLeft:"0.5%", width:"19.5%",borderRadius:"0px"}}
                    options={[allDepartment, ...departmentOptions]}
                    onChange={handleDepartChange}/>
                <Select 
                    defaultValue="所有权限" 
                    style={{marginLeft:"0.5%", width:"19.5%",borderRadius:"0px"}}
                    options={[
                        { value: "", label: "所有权限" },
                        { value: "3", label: "系统管理员" },
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

export default UserList3;