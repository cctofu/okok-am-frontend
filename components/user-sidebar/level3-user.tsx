import React, { useEffect, useState } from "react";
import {UserOutlined, UsergroupAddOutlined, BankOutlined, RightCircleFilled, AppstoreOutlined, BulbOutlined} from "@ant-design/icons";
import { Button, MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getLogout } from "@/utils/LoginStatus";
import DepartmentList from "../department_utils/depart_list";
import { request } from "@/pages";
import UserList3 from "../user3-utils/user_list";
import ManageDepartment from "../dashboard_utils/manage_dashboard";
import DepartmentDivider from "../dashboard_utils/dashboard_divider";
import DashboardHome3 from "../user-home/level3-home";
import AsyncTaskList from "../async_task_utils/async_task_list";

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    disabled?: boolean,
): MenuItem {
    return {
        key,
        icon,
        label,
        disabled,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem("首页", "1", <UserOutlined/>, false),
    getItem("用户", "2", <UsergroupAddOutlined/>, false),
    getItem("部门", "3", <BankOutlined/>, false),
    getItem("应用管理", "4", <AppstoreOutlined/>, false),
    getItem("任务管理", "5", <AppstoreOutlined/>, false),
    getItem("", "6", <DepartmentDivider/>, true),
];

interface CustomItem {
    title: string,
    url: string,
}

export default function FourUser() {
    const router = useRouter();
    const [entity, setEntity] = useState<string>("EntityName");
    const [department, setDepartment] = useState<string>("DepartName");
    const [selectedItem, setSelectedItem] = useState<MenuItem>(items[0]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [customItems, setCustomItems] = useState<CustomItem[]>([]);
    const [hasFeishu, setHasFeishu] = useState<boolean>(false);

    useEffect(() => {
        getEntity();
        getLink();
        const curMenuItem = Cookies.get("cur_menuItem");
        if (curMenuItem) {
            setSelectedKeys([curMenuItem]);
            setSelectedItem(items[parseInt(curMenuItem) - 1]);
        }
    }, []);

    useEffect(() => {
    }, [customItems]);

    const getEntity = () => {
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setEntity(res.data.entityName);
                setDepartment(res.data.departmentName);
                if(res.data.feishu_name && res.data.feishu_name){
                    setHasFeishu(true);
                }
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };
    
    const getLink = () => {
        request(
            `/api/url/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setCustomItems(res.data.filter((val:any) => val.authority_level == 3 
                                                        && !val.name.includes("default")
                                                        && val.name !== ""
                ).map((val:any) => ({
                    ...val,
                    title: val.name,
                    url: val.url,
                })));
            })
            .catch((err) => {
                console.log("Error: " + err);
            });
    };
    
    const onClick: MenuProps["onClick"] = (menuItem) => {
        setSelectedItem(menuItem);
        if(Number(menuItem.key) < 6){
            Cookies.set("cur_menuItem", menuItem.key);
        }
        setSelectedKeys([menuItem.key]);
    };

    function toggleNeedNewFetch() {
        getLink();
    }

    const onLogout = () => {
        getLogout(router);
    };

    return (
        <Layout style={{ minHeight: "100vh", width: "100%", display: "flex"}}>
            <Sider className="userSider" width="18%">
                <div style={{ height: 32, margin: 16, justifyContent: "center", alignItems:"center", display:"flex"}}>
                    <h2 className="titleSider">启源</h2>
                </div>
                <Menu selectedKeys={selectedKeys} mode="inline" items={items} onClick={onClick}/>
                <Menu selectable={false} style={{marginTop:"0px"}}>
                    {customItems.map((item: CustomItem) => (
                        <Menu.Item key={item.url} icon={<BulbOutlined/>} style={{paddingLeft:"12%"}}>
                            <a href={`https://${item.url}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none"}}>
                                {item.title}
                            </a>
                        </Menu.Item>
                    ))}
                </Menu>
                <div style={{ position: "absolute", bottom: "5%", left: "12.5%", right: 0, alignContent:"center"}}>
                    <Button onClick={onLogout} className="siderLogoutBtn">
                        <RightCircleFilled style={{ fontSize: "40px"}}/>
                        退出登录
                    </Button>
                </div>
            </Sider>

            <Layout className="site-layout">
                <Content className="site-content">
                    {selectedItem && selectedItem.key === "1" && <DashboardHome3/>}
                    {selectedItem && selectedItem.key === "2" && <UserList3 entity={entity} hasFeishu={hasFeishu}/>}
                    {selectedItem && selectedItem.key === "3" && <DepartmentList department={department} entity={entity} breadcrumb={entity}/>}
                    {selectedItem && selectedItem.key === "4" && <ManageDepartment toggleNeedNewFetch={toggleNeedNewFetch}/>}
                    {selectedItem && selectedItem.key === "5" && <AsyncTaskList/>}
                </Content>
            </Layout>
        </Layout>
    );
}