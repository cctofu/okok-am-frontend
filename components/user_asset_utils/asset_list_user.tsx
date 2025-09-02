import React, { ReactNode, useEffect, useState } from "react";
import { FolderOpenOutlined, ContainerTwoTone, RestTwoTone, InteractionTwoTone, IdcardTwoTone, SmileTwoTone, FrownTwoTone, CaretRightOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, ContactsTwoTone } from "@ant-design/icons";
import { Badge, Collapse, InputNumber, message, Modal, Pagination, Result, Select, Steps, Tooltip, } from "antd";
import { Button, Input, Space, Table, } from "antd";
import type { ColumnsType } from "antd/es/table";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { CheckCard } from "@ant-design/pro-components";
import AssetInfo2 from "../asset_utils/asset_info2";
const { Panel } = Collapse;

interface AssetType {
  key: React.Key;
  id: number;
  name: string;
  parent: string;
  class: string;
  user: string;
  price: number;
  description: string;
  position: string;
  expire: boolean;
  count: any;
  status: number;
  assetcategory: string;
  userdefined: string[];
  image: any;
  operation: any;
}

interface assetListProps {
    name?: string,
    department?: string,
    entity?: string,
}

interface ManagerValues {
    label: string,
    value: string,
    title: string,
}

interface UserCard {
    value: string,
    avatar: ReactNode,
    title: string,
    description: string,
}

interface DigitType {
    key: React.Key;
    count: number;
}

const AssetListUser = (props: assetListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [digitList, setDigitList] = useState<DigitType[]>([]);

    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [assetList, setAssetList] = useState<AssetType[]>([]);
    const [managerList, setManagerList] = useState<ManagerValues[]>([]);
    const [selectedManager, setSelectedManager] = useState<string>("");
    const [util, setUtil] = useState<number>(0);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [userCards, setUserCards] = useState<UserCard[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [isUseId, setIsUseId] = useState<boolean>(false);

    useEffect(() => {
        fetchList(1);
        handleCardSearch(1);
    }, []);
    
    const fetchList = (page : number) => {
        setRefreshing(true);
        console.log(props.name);
        request(`/api/asset_user_list/${Cookies.get("sessionID")}/${page}`, "GET")
            .then((res) => {
                setAssetList(res.data.map((val: any) => ({
                    ...val, key: val.id, id: val.id, class: `${val.assetClass === 0 ? "条目型" : "数量型"}`,
                    user: val.userName, assetcategory: val.assetTree, parent: val.parentName,
                    price: val.expire ? 0.0 : val.price, number: val.count, 
                    count: 
                        <InputNumber min={1} max={val.count} defaultValue={val.count} disabled={!val.assetClass || val.expire}
                            onChange={(value) => {
                                setDigitList((digitList) => {
                                    const key = val.id;
                                    return digitList.map((val: any) => ({
                                        ...val, count: val.key === key ? value : val.count,
                                    }));
                                });
                                console.log(digitList);
                            }}></InputNumber>,
                    operation:
                        <Space>
                            <AssetInfo2
                                id={val.id}
                                name={val.name}
                                parent={val.parentName}
                                assetClass={val.assetClass}
                                user={val.userName}
                                price={val.price}
                                count={val.count}
                                assetTree={val.assetTree}
                                expire={val.expire}
                                description={val.description}
                                department={val.departmentName}
                                treeNode={val.nodeName}
                                create_time={val.create_time}
                                deadline={val.deadline}/>
                        </Space>
                })));
                setTotalPages(res.pages);
                setAssetList((assetList) => assetList.reverse());
            })
            .catch((err) => {
                console.log("error: " + err);
                setRefreshing(false);
            });
        request(`/api/asset_manager/${Cookies.get("sessionID")}/${props.department}`, "GET")
            .then((res) => {
                setManagerList(res.data.map((val: any) => ({
                    ...val, label: val.name, value: val.name, title: val.name,
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        setDigitList(assetList.map((val: any) => ({
            ...val, key: val.id, count: val.number,
        })));
        setRefreshing(false);
    },[assetList]);

    const [userCurrentPages, setUserCurrentPages] = useState<number>(1);
    const [userTotalPages, setUserTotalPages] = useState<number>(0);

    const handleCardSearch = (page: number) => {
        setUserCurrentPages(page);
        request(`/api/user_entity4user/${Cookies.get("sessionID")}/${page}`, "GET")
            .then((res) => {
                setUserCards(res.data.map((val: any) => ({
                    ...val, value: val.name, title: val.name, description: "部门 " + val.departmentName,
                    avatar: <ContactsTwoTone twoToneColor={"blue"} style={{fontSize: 30}}/>
                })));
                setRefreshing(false);
                setUserTotalPages(res.pages);
            })
            .catch((err) => {
                console.log("error: " + err);
                setRefreshing(false);
            });
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record: any) => {
            return {
                disabled: record.expired,
            };
        }
    };
    const hasSelected = selectedRowKeys.length > 0;
    
    const columns: ColumnsType<AssetType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "类型",
            dataIndex: "class",
            key: "class",
            width: "10%",
        },
        {
            title: "价格",
            dataIndex: "price",
            key: "price",
            width: "10%",
            render: (price: number) => Number(price).toFixed(2),
        },
        {
            title: "数量",
            dataIndex: "count",
            key: "count",
            width: "10%",
        },
        {
            title: "描述",
            dataIndex: "description",
            key: "decription",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "状态",
            dataIndex: "expire",
            key: "expire",
            width: "10%",
            render: (expire: boolean) => 
                <Space>
                    <Badge status = {expire ? "error" : "success"} 
                        text = {expire ? "过期" : "正常"}/>
                </Space>
        },
        {
            title: "操作",
            dataIndex: "operation",
            key: "operation",
            width: "10%",
        }
    ];

    const pagination = {
        current: currentPage,
        pageSize: 8,
        total: 8 * totalPages,
        onChange: (page: number) => {
            setCurrentPage(page);
            fetchList(page);
        },
    };

    const [searching, setSearching] = useState<boolean>(false);

    const startSearch = () => {
        setSearching(!searching);
    };

    // 搜索列表功能 useState
    const [assetName, setAssetName] = useState<string>("");
    const [priceLowerBound, setPriceLowerBound] = useState<number>(0);
    const [priceUpperBound, setPriceUpperBound] = useState<number>(2147483647);
    const [description, setDescription] = useState<string>("");
    const [id, setId] = useState<string>("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);

    const fetchSearchList = async (page : number) => {
        setSearchLoading(true);
        await request(`/api/search_personal_assets/${Cookies.get("sessionID")}`, 
            "POST",
            {
                id: id,
                asset_tree_node: "",
                name: assetName,
                price_inf: priceLowerBound,
                price_sup: priceUpperBound,
                description: description,
                page: page, 
            })
            .then((res) => {
                setAssetList(res.data.map((val: any) => ({
                    ...val, key: val.id, id: val.id, class: `${val.assetClass === 0 ? "条目型" : "数量型"}`,
                    assetcategory: val.assetTree, 
                    price: val.expire ? 0.0 : val.price, number: val.count,
                    count: 
                    <InputNumber min={1} max={val.count} defaultValue={val.count} disabled={!val.assetClass || val.expire}
                        onChange={(value) => {
                            setDigitList((digitList) => {
                                const key = val.id;
                                return digitList.map((val: any) => ({
                                    ...val, count: val.key === key ? value : val.count,
                                }));
                            });
                            console.log(digitList);
                        }}></InputNumber>,
                    operation:
                        <Space>
                            <AssetInfo2
                                id={val.id}
                                name={val.name}
                                parent={val.parentName}
                                assetClass={val.assetClass}
                                user={val.userName}
                                price={val.price}
                                count={val.count}
                                assetTree={val.assetTree}
                                expire={val.expire}
                                description={val.description}
                                department={val.departmentName}
                                treeNode={val.nodeName}
                                create_time={val.create_time}
                                deadline={val.deadline}/>
                        </Space>
                })));
                setTotalSearchPages(res.pages);
            })
            .catch((err) => {
                console.log("error: " + err);
            });
        setSearchLoading(false);
    };

    const search_pagination = {
        current: currentSearchPage,
        pageSize: 6,
        total: 6 * totalSearchPages,
        onChange: (page: number) => {
            setCurrentSearchPage(page);
            fetchSearchList(page);
        },
    };

    const handleAssetSearch = () => {
        // console.log("id " + id);
        // console.log("name " + assetName);
        // console.log("category " + category);
        // console.log("owner " + owner);
        // console.log("lower " + priceLowerBound);
        // console.log("upper " + priceUpperBound);
        // console.log("status " + status);
        // console.log("description " + description);
        setCurrentSearchPage(1);
        fetchSearchList(1);
    };

    // Step Utils
    const [open, setOpen] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(0);
    const [timeTick, setTimeTick] = useState(3);
    const [requestStatus, setRequestStatus] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string[]>([]);

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const steps = [
        {
            title: "选择功能",
            description: "选择批量操作功能",
            content:
            <>
                <CheckCard.Group options={
                    [{
                        value: 2,
                        avatar: <ContainerTwoTone twoToneColor={"red"} style={{fontSize: 30}}/>,
                        title: "资产退库",
                    },
                    {
                        value: 3,
                        avatar: <RestTwoTone twoToneColor={"green"} style={{fontSize: 30}}/>,
                        title: "资产维保",

                    },
                    {
                        value: 4,
                        avatar: <InteractionTwoTone twoToneColor={"cyan"} style={{fontSize: 30}}/>,
                        title: "资产转移",

                    }]
                } style={{display: "flex", width: 600, marginLeft: 180}}
                onChange={(value) => {
                    console.log(value);
                    setUtil(value === undefined ? 0 : Number(value));
                }}
                value={util}
                ></CheckCard.Group>
            </>
        },
        {
            title: "选择管理员",
            description: "选择需要申请的目标资产管理员",
            content:
            <>
                <CheckCard.Group options={
                    managerList.map((manager) => ({
                        title: manager.title,
                        avatar : <IdcardTwoTone twoToneColor={"blue"} style={{fontSize: 30, marginRight: 8}}></IdcardTwoTone>,
                        value: manager.title,
                    }))
                } onChange={(value) => {
                    console.log(value);
                    setSelectedManager(value === undefined ? "" : String(value));
                }}
                value={selectedManager}
                size="small"
                ></CheckCard.Group>
            </>
        },
        {
            title: "选择用户",
            description: "选择需要转移资产的目标用户",
            content:
            <>
                {/* <Select
                    style={{width: 160}}
                    showSearch
                    disabled={!hasSelected || util != 4}
                    placeholder={hasSelected ? "选择员工"  : "还未选择资产"}
                    onChange={onSelectUser}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={userList}
                /> */}
                <CheckCard.Group options={userCards}
                    size="small"
                    onChange={(value) => {
                        console.log(value);
                        setSelectedUser(value === undefined ? "" : String(value));
                    }}
                >
                </CheckCard.Group>
                <Pagination total={8 * userTotalPages} pageSize={8} 
                    onChange={(page: number) => handleCardSearch(page)}
                    current={userCurrentPages} showSizeChanger={false}/>
            </>
        },
        {
            title: "结束",
            description: "申请结束",
            content:
            <>
                {requestStatus === 1 && <Result
                    icon={<SmileTwoTone twoToneColor={"blue"}/>}
                    title={`申请已发送！${timeTick} 秒后将返回主页`}
                    extra={<Button className="modalConfirmBtn"
                        onClick={() => {
                            handleCancel();
                            setCurrent(0);
                            setUtil(0);
                            setSelectedManager("");
                        }}>返回</Button>}
                >
                </Result>}
                {requestStatus === 2 && 
                <>
                    <Result
                        icon={<FrownTwoTone twoToneColor={"red"}/>}
                        title={"申请发送出现异常！请检查申请内容！"}
                        extra={
                            <Space direction="vertical">
                                <Collapse collapsible="header"
                                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />} 
                                    bordered={false} style={{width: 500}}>
                                    <Panel header="查看错误详细信息" key="1">
                                        {errorMessage.map((err) => (
                                            <div key={Date.now()} style={{display: "flex", alignItems: "center"}}>{err}</div>
                                        ))}
                                    </Panel>
                                </Collapse>
                                <Button className="modalConfirmBtn"
                                    onClick={() => {
                                        handleCancel();
                                        setCurrent(0);
                                        setErrorMessage([]);
                                        setUtil(0);
                                        setSelectedManager("");
                                    }}>返回</Button>
                            </Space>}
                    >
                    </Result>
                </>
                }
            </>
        }
    ];

    const items = steps.map((item) => ({ key: item.title, title: item.title, description: item.description}));

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

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="asset-list-user-content">  
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">我的资产</text>
                <Space>
                    <span style={{fontFamily:"Tommy-medium", marginRight:"10px"}}>
                        {hasSelected ? `已选择 ${selectedRowKeys.length} 项资产` : ""}
                    </span>
                    <Button className="logRefreshBtn" onClick={startSearch} style={{fontFamily:"Tommy-medium"}}>
                        搜索
                    </Button>
                    <Button 
                        className="asset-btn" 
                        disabled={!hasSelected}
                        onClick={() => {
                            showModal();
                            setTimeTick(3);
                        }}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <FolderOpenOutlined style={{marginRight:"5px"}}/>
                        批量操作
                        </div>
                    </Button>
                    <Modal
                        open={open}
                        width={1000}
                        title="用户资产批量操作"
                        onCancel={handleCancel}
                        footer={[]}
                        className="createIDcard-modal"
                    >
                        <Steps current={current} items={items} />
                        <div style={{marginTop: 24}}>{steps[current].content}</div>
                        <div style={{ marginTop: 24 }}></div>
                        {current === 0 && (
                            <Space>
                                <Button className="modalConfirmBtn" disabled={util === 0} onClick={() => (setCurrent((cur) => cur + 1))}>
                        下一步
                                </Button>
                                <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                                </Button>
                            </Space>
                        )}
                        {current === 1 && (
                            <Space>
                                <Button className="modalCancelBtn" style={{ margin: "0 8px" }} onClick={() => setCurrent((cur) => cur - 1)}>
                        上一步      
                                </Button>
                                {
                                    util === 4 &&
                                (<Button className="modalConfirmBtn" disabled={selectedManager === ""} onClick={() => setCurrent((cur) => cur + 1)}>
                        下一步
                                </Button>)
                                }
                                {
                                    (util === 2 || util === 3) &&
                                (<Button className="modalConfirmBtn" disabled={selectedManager === ""} onClick={async () => {
                                    let flag : boolean = true;
                                    for (let val of selectedRowKeys) {
                                        console.log(digitList);
                                        const count: number = digitList.filter((digit) => {return digit.key === val;})[0].count;
                                        await request(
                                            `/api/pending_request/${Cookies.get("sessionID")}`,
                                            "POST",
                                            {
                                                initiator: props.name,
                                                participant: selectedManager,
                                                asset_id: val,
                                                target: "",
                                                type: util,
                                                count: count,
                                            }
                                        )
                                            .then((res) => { 
                                                console.log(res);
                                                setSelectedRowKeys((keys) => keys.filter((key) => key != val));
                                            })
                                            .catch((err) => {
                                                flag = false;
                                                console.log(err);
                                                setErrorMessage((errMessage) => {errMessage.push(`资产编号 ${val} 导入错误：`+ err); return errMessage;});
                                            });
                                        console.log(val);
                                    }
                                    if (flag) {
                                        setRequestStatus(1);
                                        message.success("资产批量申请已发送！");
                                        setSelectedRowKeys([]);
                                        setCurrent((cur) => cur + 2);
                                        setTimeout(() => {
                                            setTimeTick((timeTick) => timeTick - 1);
                                        }, 1000);
                                        setTimeout(() => {
                                            setTimeTick((timeTick) => timeTick - 1);
                                        }, 2000);
                                        setTimeout(() => {
                                            handleCancel();
                                            setCurrent(0);
                                            setUtil(0);
                                            setSelectedManager("");
                                            setRequestStatus(0);
                                        }, 3000);}
                                    else {
                                        setRequestStatus(2);
                                        setCurrent((cur) => cur + 2);
                                    }
                                }}>
                        申请
                                </Button>)
                                }
                                <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                                </Button>
                            </Space>
                        )}
                        {current === 2 && (
                            <Space>
                                <Button className="modalCancelBtn" style={{ margin: "0 8px" }} onClick={() => setCurrent((cur) => cur - 1)}>
                        上一步      
                                </Button>
                                <Button className="modalConfirmBtn" disabled={util === 0} onClick={async () => {
                                    let flag : boolean = true;
                                    for (let val of selectedRowKeys) {
                                        console.log(digitList);
                                        const count: number = digitList.filter((digit) => {return digit.key === val;})[0].count;
                                        await request(
                                            `/api/pending_request/${Cookies.get("sessionID")}`,
                                            "POST",
                                            {
                                                initiator: props.name,
                                                participant: selectedManager,
                                                asset_id: val,
                                                target: selectedUser,
                                                type: util,
                                                count: count,
                                            }
                                        )
                                            .then((res) => { 
                                                console.log(res);
                                                setSelectedRowKeys((keys) => keys.filter((key) => key != val));
                                            })
                                            .catch((err) => {
                                                flag = false;
                                                console.log(err);
                                                setErrorMessage((errMessage) => {errMessage.push(`资产编号 ${val} 导入错误：`+ err); return errMessage;});
                                            });
                                        console.log(val);
                                    }
                                    if (flag) {
                                        setRequestStatus(1);
                                        message.success("资产批量申请已发送！");
                                        setSelectedRowKeys([]);
                                        setCurrent((cur) => cur + 1);
                                        setTimeout(() => {
                                            setTimeTick((timeTick) => timeTick - 1);
                                        }, 1000);
                                        setTimeout(() => {
                                            setTimeTick((timeTick) => timeTick - 1);
                                        }, 2000);
                                        setTimeout(() => {
                                            handleCancel();
                                            setCurrent(0);
                                            setUtil(0);
                                            setSelectedManager("");
                                            setRequestStatus(0);
                                        }, 3000);}
                                    else {
                                        setRequestStatus(2);
                                        setCurrent((cur) => cur + 1);
                                    }
                                }}>
                        申请
                                </Button>
                                <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                                </Button>
                            </Space>
                        )}
                    </Modal>
                </Space>
            </div>
            <div hidden={!searching} className="user-list-search">
                <Input 
                    placeholder="编号" 
                    value={id}
                    className="user-search-input" 
                    style={{width:"9.5%", borderRadius:"0px"}}
                    onChange={handleIdChange}
                />
                <Input 
                    disabled={isUseId}
                    placeholder="资产名称" 
                    style={{ marginLeft:"0.5%", width:"14%",borderRadius:"0px"}}
                    onChange={(e) => setAssetName(e.target.value)}
                />
                <Select 
                    disabled
                    defaultValue="" 
                    style={{marginLeft:"0.5%", width:"10%",borderRadius:"0px"}} 
                    options={[
                        { value: "", label: "所有类型" },
                        { value: 0, label: "条目型" },
                        { value: 1, label: "数量型" },
                    ]}
                />
                <InputNumber 
                    disabled={isUseId}
                    placeholder="价格下限"
                    defaultValue={0}
                    onChange={(val: any) => setPriceLowerBound(val)}
                    style={{marginLeft:"0.5%", width:"12.5%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间下界"}>
                        <VerticalAlignBottomOutlined/>
                    </Tooltip>}
                />
                <InputNumber 
                    disabled={isUseId}
                    placeholder="价格上限"
                    defaultValue={2147483647}
                    onChange={(val: any) => setPriceUpperBound(val)}
                    style={{marginLeft:"0.5%", width:"11.5%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间上界"}>
                        <VerticalAlignTopOutlined/>
                    </Tooltip>}
                />
                <Input 
                    disabled={isUseId}
                    placeholder="描述" 
                    style={{ marginLeft:"0.5%", width:"14%",borderRadius:"0px"}}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Select 
                    disabled
                    defaultValue="" 
                    style={{marginLeft:"0.5%", width:"10%",borderRadius:"0px"}}  
                    options={[
                        { value: "",label: "空闲" },
                    ]}
                />
                <Button 
                    style={{marginLeft:"0.5%", width:"15%",borderRadius:"0px"}} 
                    className="site-btn"
                    loading={searchLoading}
                    onClick={handleAssetSearch}
                >搜索</Button>
            </div>
            <Table 
                rowSelection={rowSelection}
                columns={columns} 
                dataSource={assetList} 
                className="dTable"
                pagination={searching? {
                    ...search_pagination,
                    showSizeChanger: false,
                } :{
                    ...pagination,
                    showSizeChanger: false,
                }}/> 
        </div>
    );
};

export default AssetListUser;