import React, { useEffect, useState } from "react";
import {UserOutlined, MoneyCollectFilled, FileAddOutlined, RightCircleFilled, BulbOutlined, FileSearchOutlined} from "@ant-design/icons";
import { Button, MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getLogout } from "@/utils/LoginStatus";
import AssetListUser from "../user_asset_utils/asset_list_user";
import AssetReceive from "../user_asset_utils/asset_receive";
import { request } from "@/utils/network";
import DashboardHome1 from "../user-home/level1-home";
import PendingRequestListUser from "../pending_request_utils/pending_request_list_user";
import DepartmentDivider from "../dashboard_utils/dashboard_divider";

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
    getItem("首页", "1", <UserOutlined/>),
    getItem("我的资产", "2", <MoneyCollectFilled/>),
    getItem("申请资产", "3", <FileAddOutlined/>),
    getItem("审批资产", "4", <FileSearchOutlined/>),
    getItem("", "5", <DepartmentDivider/>, true),
];

export default function OneUser() {
    const router = useRouter();
    const [department, setDepartment] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [entity, setEntity] = useState<string>("");

    const [selectedItem, setSelectedItem] = useState<MenuItem>(items[0]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);

    const [customItems, setCustomItems] = useState<CustomItem[]>([]);

    const onClick: MenuProps["onClick"] = (menuItem) => {
        setSelectedItem(menuItem);
        Cookies.set("cur_menuItem", menuItem.key);
        setSelectedKeys([menuItem.key]);
    };
    
    const onLogout = () => {
        getLogout(router);
    };

    useEffect(() => {
        getDepart();
        getLink();
        const curMenuItem = Cookies.get("cur_menuItem");
        if (curMenuItem) {
            setSelectedKeys([curMenuItem]);
            setSelectedItem(items[parseInt(curMenuItem) - 1]);
        }
    }, []);

    const getDepart = () => {
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setDepartment(res.data.departmentName);
                setName(res.data.name);
                setEntity(res.data.entityName);
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
                setCustomItems(res.data.filter((val:any) => val.authority_level == 1 
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

    interface CustomItem {
        title: string,
        url: string,
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>

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
                    {selectedItem && selectedItem.key === "1" && <DashboardHome1 />}
                    {selectedItem && selectedItem.key === "2" && <AssetListUser name={name} department={department} entity={entity}/>}
                    {selectedItem && selectedItem.key === "3" && <AssetReceive department={department} user={name}/>}
                    {selectedItem && selectedItem.key === "4" && <PendingRequestListUser name={name}/>}
                </Content>
            </Layout>

        </Layout>
    );
}