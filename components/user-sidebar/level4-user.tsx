import React, { useEffect, useState } from "react";
import {UserOutlined, BankOutlined, UsergroupAddOutlined, RightCircleFilled} from "@ant-design/icons";
import { Button, MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getLogout } from "@/utils/LoginStatus";
import EntityList from "../entity-utils/entity_list";
import UserList4 from "../user4-utils/user_list";
import DashboardHome4 from "../user-home/level4-home";

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem("首页", "1", <UserOutlined/>),
    getItem("用户", "2", <UsergroupAddOutlined/>),
    getItem("企业", "3", <BankOutlined/>),
];

export default function FourUser() {
    const router = useRouter();

    const [selectedItem, setSelectedItem] = useState<MenuItem>(items[0]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    
    const onClick: MenuProps["onClick"] = (menuItem) => {
        setSelectedItem(menuItem);
        Cookies.set("cur_menuItem", menuItem.key);
        setSelectedKeys([menuItem.key]);
    };
    
    const onLogout = () => {
        // Delete info in cookie and return to index
        getLogout(router);
    };

    useEffect(() => {
        const curMenuItem = Cookies.get("cur_menuItem");
        if (curMenuItem) {
            setSelectedKeys([curMenuItem]);
            setSelectedItem(items[parseInt(curMenuItem) - 1]);
        }
    }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider className="userSider" width="18%">
                <div style={{ height: 32, margin: 16, justifyContent: "center", alignItems:"center", display:"flex"}}>
                    <h2 className="titleSider">启源</h2>
                </div>
                <Menu selectedKeys={selectedKeys} mode="inline" items={items} onClick={onClick}/>
                <div style={{ position: "absolute", bottom: "5%", left: "12.5%", right: 0, alignContent:"center"}}>
                    <Button onClick={onLogout} className="siderLogoutBtn">
                        <RightCircleFilled style={{ fontSize: "40px"}}/>
                        退出登录
                    </Button>
                </div>
            </Sider>

            <Layout className="site-layout">
                <Content className="site-content">
                    {selectedItem && selectedItem.key === "1" && <DashboardHome4 />}
                    {selectedItem && selectedItem.key === "2" && <UserList4/>}
                    {selectedItem && selectedItem.key === "3" && <EntityList />}
                </Content>
            </Layout>
        </Layout>
    );
}