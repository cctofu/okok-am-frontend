import React, { useEffect, useState } from "react";
import { Breadcrumb, Space, Table, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { ColumnsType } from "antd/es/table";
import CreateDepartment from "./create_depart";
import ModifyDepartment from "./modify_depart";
import DeleteDepartment from "./delete_depart";
import MoveDepartment from "./move_depart";
import CreateDepartmentUser from "./department_user";

interface DepartType {
    key: number;
    name: string;
    userCount: number;
    depCount: number;
}

interface DepartListProps {
    entity: string,
    department: string,
    breadcrumb: string
}

export default function DepartmentList( props: DepartListProps) {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [userList, setUserList] = useState<DepartType[]>([]);
    const [breadCrumbArray, setBreadCrumbArray] = useState<string[]>([props.breadcrumb]);
    const [parent_department, setParentDepartment] = useState<string>("");
    const [disableClick, setDisableClick] = useState<boolean>(false);


    useEffect(() => {
        //update html when values changes
    }, [parent_department]);

    //第一次进入
    useEffect(() => {
        initEntity();
        setRefreshing(false);
        saveCurPage(props.entity);
    }, []);

    const saveCurPage = (val : string) => {
        Cookies.set("cur_depart", val);
    };

    const clickBreadcrumb = (text : any) => {
        saveCurPage(text);
        if(text === props.entity){
            initEntity();
        }
        else {
            fetchList(text);
        }
    };

    function toggleNeedNewFetch() {
        if(parent_department === props.entity){
            initEntity();
        }
        else {
            fetchList(parent_department);
        }
    }

    function toggleCurFetch() {
        const current_d = Cookies.get("cur_depart");
        if(current_d){
            if(current_d === props.entity){
                initEntity();
            }
            else {
                fetchList(current_d);
            }
        }
    }

    const initEntity = () => {
        request(`/api/department/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setUserList(res.data.map((val : any) => ({
                    ...val,
                    key: val.id,
                    name: val.name,
                    userCount: val.userNumber,
                    depCount: val.subDepartmentNumber,
                    operation:
                <Space>
                    <ModifyDepartment 
                        parent_department= {props.department} 
                        cur_department={val.name} 
                        department_id={val.id} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <MoveDepartment 
                        parent_department= {props.department} 
                        cur_department={val.name} 
                        department_id={val.id} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <DeleteDepartment 
                        cur_department= {val.name} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <CreateDepartmentUser
                        entity={props.entity}
                        department={val.name}
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                </Space>
                })));
                setParentDepartment(props.entity);
                const currentBreadcrumbs = [props.breadcrumb];
                setBreadCrumbArray(currentBreadcrumbs);
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };

    const fetchList = (parent_dept : string) => {
        request(`/api/sub_department/${Cookies.get("sessionID")}/${parent_dept}`, "GET")
            .then((res) => {
                setUserList(res.data.map((val : any) => ({
                    ...val,
                    key: val.id,
                    name: val.name,
                    userCount: val.userNumber,
                    depCount: val.subDepartmentNumber,
                    operation:
                <Space>
                    <ModifyDepartment 
                        parent_department= {parent_dept} 
                        cur_department={val.name} 
                        department_id={val.id} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <MoveDepartment 
                        parent_department= {parent_dept} 
                        cur_department={val.name} 
                        department_id={val.id} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <DeleteDepartment 
                        cur_department= {val.name} 
                        setDisableClick={setDisableClick}
                        toggleNeedNewFetch={toggleCurFetch}/>
                    <CreateDepartmentUser 
                        entity={props.entity}
                        department={val.name} 
                        setDisableClick={setDisableClick} 
                        toggleNeedNewFetch={toggleCurFetch}/>
                </Space>
                })));
                setParentDepartment(parent_dept);
                const currentBreadcrumbs = [...breadCrumbArray];
                const index = currentBreadcrumbs.indexOf(parent_dept);
                if(index !== -1){
                    currentBreadcrumbs.splice(index + 1);
                }
                else{
                    currentBreadcrumbs.push(parent_dept);      
                }
                setBreadCrumbArray(currentBreadcrumbs);
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };

    const handleItemClick = (item: DepartType, e: any) => {
        if (e.target.closest(".ant-space") !== null || disableClick === true) {
            return;
        }   
        else{  
            saveCurPage(item.name);
            const current_d = Cookies.get("cur_depart");
            if(current_d){
                fetchList(current_d);
            }
        }
    };

    const columns: ColumnsType<DepartType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "10%",
        },
        {
            title: "部门名称",
            dataIndex: "name",
            key: "name",
            width: "40%",
        },
        {
            title: "用户数量",
            dataIndex: "userCount",
            key: "userCount",
            width: "18%",
        },
        {
            title: "子部门数量",
            dataIndex: "depCount",
            key: "depCount",
            width: "17%",
        },
        {
            title: "管理",
            dataIndex: "operation",
            key: "operation",
            width: "15%",
        }
    ];

    const pagination = {
        pageSize: 6,
    };
    
    const bcItems = breadCrumbArray.map(item => <Breadcrumb.Item key={item} onClick={() => clickBreadcrumb(item)}>{item}</Breadcrumb.Item>);

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="depart-list-content">
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <Breadcrumb className="depart-list-breadcrumb">
                    {bcItems}
                </Breadcrumb>
                <div>
                    <CreateDepartment 
                        cur_department={parent_department} 
                        toggleNeedNewFetch={toggleNeedNewFetch}/> 
                </div>
            </div>
            <Table 
                columns={columns} 
                dataSource={userList} 
                onRow={(record) => {
                    return {
                        onClick: (e) => handleItemClick(record,e),
                    };
                }}
                style={{marginBottom:"20px",
                    fontFamily:"Founder",
                }}
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                }}>
            </Table> 
        </div>
    );
}
