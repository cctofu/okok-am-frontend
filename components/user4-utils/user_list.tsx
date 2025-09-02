import React, { useEffect, useState } from "react";
import { SearchOutlined, LockTwoTone, UnlockTwoTone, } from "@ant-design/icons";
import { Select, message } from "antd";
import { Button, Input, Space, Table, Tooltip, Badge } from "antd";
import type { ColumnsType } from "antd/es/table";
import PasswordReset from "@/components/user-utils/password_reset";
import UserInfo from "@/components/user-utils/user_info";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import CreateUser4 from "./create_user";
import { DefaultOptionType } from "antd/es/select";

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

const UserList4 = () => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [userList, setUserList] = useState<UserType[]>([]);

    var currPage = 1;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [searching, setSearching] = useState<boolean>(false);
    const [search_entity, setSearchEntity] = useState<string[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<DefaultOptionType[]>([]);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [entity, setEntity] = useState("");
    const [character, setCharacter] = useState("");
    const [islock, setIsLock] = useState("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);

    const [chooseDepart, setChooseDepart] = useState<boolean>(false);
    const allEntity = { value: "", label: "所有企业" };
    const allDepartment = { value: "", label: "所有部门" };

    useEffect(() => {
        setRefreshing(true);
        fetchList(1);
        setRefreshing(false);
        fetchSearchInfo();
    }, []);

    function toggleNeedNewFetch() {
        fetchList(currPage);
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
        request(`/api/entity/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                const entityNames = res.data.map((entity: any) => entity.name);
                setSearchEntity(entityNames);
            });
    };

    const fetchList = (page : number) => {
        //get user based on department
        request(`/api/user_list_all/${Cookies.get("sessionID")}/${page}`, "GET")
            .then((res) => {
                setUserList(res.data.map((val: any) => ({ 
                    ...val, 
                    character: getCharacter(val.character), 
                    entity: val.entityName? val.entityName : "无", 
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
                                            entity: val.entityName,
                                            department: val.departmentName,
                                            character: val.character,
                                            lock: !val.lock,
                                            session: "",
                                            email: val.email
                                        }
                                    )
                                        .then((res) => {
                                            console.log(res);
                                            if (val.lock) { message.success("用户解锁成功"); }
                                            else { message.success("用户锁定成功"); }
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
                console.log("错误: " + err);
            });
    };

    const fetchSearchList = (page : number) => {
        //get user based on department
        request(
            `/api/get_user_all/${Cookies.get("sessionID")}`, 
            "POST",
            {
                id: id,
                name: name,
                entity: entity,
                department: department,
                character: character,
                lock: islock,
                page: page,
            })
            .then((res) => {
                setUserList(res.data.map((val: any) => ({ 
                    ...val, 
                    character: getCharacter(val.character), 
                    entity: val.entityName? val.entityName : "无", 
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
                                            entity: val.entityName,
                                            department: val.departmentName,
                                            character: val.character,
                                            lock: !val.lock,
                                            session: "",
                                            email: val.email
                                        }
                                    )
                                        .then((res) => {
                                            console.log(res);
                                            if (val.lock) { message.success("用户解锁成功"); }
                                            else { message.success("用户锁定成功"); }
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
                console.log("错误: " + err);
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
            title: "用户名",
            dataIndex: "name",
            key: "name",
            width: "20%",
        },
        {
            title: "所属企业",
            dataIndex: "entity",
            key: "entity",
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
            width: "12%",
        },
        {
            title: "状态",
            dataIndex: "lock",
            key: "lock",
            width: "8%",
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
            width: "10%"
        }
    ];

    const pagination = {
        current: currentPage,
        pageSize: 6,
        total: 6 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            fetchList(page);
            currPage = page;
        },
    };

    const search_pagination = {
        current: currentSearchPage,
        pageSize: 6,
        total: 6 * totalSearchPages,
        onChange: (page: number) => {
            setCurrentSearchPage(page);
            fetchSearchList(page);
            currPage = page;
        },
    };

    const startSearch = () => {
        if(searching === false){
            setUserList([]);
        }
        else{
            fetchList(1);
        }
        setSearching(!searching);
    };

    const handleEntityChange = (val : string) =>{
        setEntity(val);
        if(val !== ""){
            setChooseDepart(true);
            request(`/api/all_departments/${Cookies.get("sessionID")}/${val}`, "GET")
                .then((res) => {
                    const departmentNames = res.data.slice(1).map((department: any) => department.name);
                    const _departmentOptions = departmentNames.map((department: string) => ({
                        value: department,
                        label: department,
                    }));
                    setDepartmentOptions(_departmentOptions);
                });
        }
        else{
            setChooseDepart(false);
        }
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
        /*
        console.log("id " + id);
        console.log("name " + name);
        console.log("entity " + entity);
        console.log("department " + department);
        console.log("char " + character);
        console.log("lock " + islock);*/
        setCurrentSearchPage(1);
        fetchSearchList(1);
    };

    const entityOptions = search_entity.map((entity: string) => ({
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
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">所有用户</text>
                <div>
                    <Button className="addBtn" onClick={startSearch}>
                        <SearchOutlined style={{ fontSize: "40px", color:"black"}}/>
                    </Button>
                    <CreateUser4 toggleNeedNewFetch={toggleNeedNewFetch}/> 
                </div>
            </div>
            <div hidden={!searching} className="user-list-search">
                <Input 
                    placeholder="编号" 
                    className="user-search-input" 
                    style={{width:"9.5%", borderRadius:"0px"}}
                    onChange={(e) => setId(e.target.value)}/>
                <Input 
                    placeholder="用户名" 
                    style={{ marginLeft:"0.5%", width:"19%",borderRadius:"0px"}}
                    onChange={(e) => setName(e.target.value)}/>
                <Select 
                    defaultValue="所有企业" 
                    style={{marginLeft:"0.5%", width:"19%",borderRadius:"0px"}}
                    options={[allEntity, ...entityOptions]}
                    onChange={handleEntityChange}
                />
                <Select 
                    defaultValue="所有部门" 
                    style={{marginLeft:"0.5%", width:"18.5%",borderRadius:"0px"}}
                    options={[allDepartment, ...departmentOptions]}
                    onChange={handleDepartChange}
                    disabled={!chooseDepart}/>
                <Select 
                    defaultValue="所有权限" 
                    style={{marginLeft:"0.5%", width:"11%",borderRadius:"0px"}}
                    options={[
                        { value: "", label: "所有权限" },
                        { value: "4", label: "超级管理员" },
                        { value: "3", label: "系统管理员" },
                        { value: "2", label: "资产管理员" },
                        { value: "1", label: "普通用户" },
                    ]}
                    onChange={handleCharacterChange}/>
                <Select 
                    defaultValue="所有" 
                    style={{marginLeft:"0.5%", width:"8%",borderRadius:"0px"}}
                    options={[
                        { value: "", label: "所有" },
                        { value: "0", label: "正常" },
                        { value: "1", label: "锁定" },
                    ]}
                    onChange={handleStatusChange}/>
                <Button 
                    style={{marginLeft:"0.5%", width:"12%",borderRadius:"0px"}} 
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

export default UserList4;