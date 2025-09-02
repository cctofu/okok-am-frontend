import React, { useEffect, useState } from "react";
import {UserOutlined, UsergroupAddOutlined, MoneyCollectFilled, FileSearchOutlined, TransactionOutlined, RightCircleFilled, BulbOutlined, RestOutlined} from "@ant-design/icons";
import { Button, MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getLogout } from "@/utils/LoginStatus";
import { request } from "@/pages";
import AssetSelect from "@/components/asset_utils/asset_select";
import UserList2 from "../user2-utils/user_list";
import AssetShift from "../asset_utils/asset_shift";
import PendingRequestList from "../pending_request_utils/pending_request_list";
import DashboardHome2 from "../user-home/level2-home";
import DepartmentDivider from "../dashboard_utils/dashboard_divider";
import MaintainList from "../pending_request_utils/maintain_list";

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
    getItem("用户", "2", <UsergroupAddOutlined/>),
    getItem("资产", "3", <MoneyCollectFilled/>),
    getItem("调拨", "4", <TransactionOutlined/>),
    getItem("审批", "5", <FileSearchOutlined/>),
    getItem("维保", "6", <RestOutlined/>),
    getItem("", "7", <DepartmentDivider/>, true),
];

interface CustomItem {
    title: string,
    url: string,
}

export default function ThreeUser() {
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
                setCustomItems(res.data.filter((val:any) => val.authority_level == 2 
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

    const onLogout = () => {
        getLogout(router);
    };

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
                    {selectedItem && selectedItem.key === "1" && <DashboardHome2 />}
                    {selectedItem && selectedItem.key === "2" && <UserList2 department={department} />}
                    {selectedItem && selectedItem.key === "3" && <AssetSelect department={department}/>}
                    {selectedItem && selectedItem.key === "4" && <AssetShift entity={entity} user={name}/>}
                    {selectedItem && selectedItem.key === "5" && <PendingRequestList name={name}/>}
                    {selectedItem && selectedItem.key === "6" && <MaintainList name={name}/>}
                </Content>
            </Layout>

        </Layout>
    );
}