import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, ContainerOutlined, InboxOutlined, InteractionOutlined, RestOutlined, CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";
import { Badge, InputRef, message, Tag, Tooltip, } from "antd";
import { Button, Input, Space, Table,} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface PendingRequestType {
  key: React.Key;
  id: number;
  initiator: string;
  participant: string;
  asset: string;
  assetID: number;
  type: number;
  result: number;
  operation: any;
  count: number;
  request_time: string;
  target: string;
  valid: boolean;
}

type DataIndex = keyof PendingRequestType;

interface pendingRequestListProps {
    name?: string,
}

const PendingRequestList = (props: pendingRequestListProps) => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [pendingRequestList, setPendingRequestList] = useState<PendingRequestType[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);

    useEffect(() => {
        fetchList(props);
    }, [props]);

    const fetchList = (props: pendingRequestListProps) => {
        setRefreshing(true);
        console.log(props.name);
        if (props.name) {
            request(`/api/pending_request_list/${Cookies.get("sessionID")}/${props.name}`, "GET")
                .then((res) => {
                    setPendingRequestList(res.data.reverse().map((val: any) => ({
                        ...val, key: val.id, id: val.id,
                        initiator: val.initiatorName, participant: val.participantName,
                        asset: val.assetName, target: val.targetName,
                        operation: 1
                        // <Space>
                        //     <Tooltip title={val.valid ? "" : "该资产已被操作完毕！无法同意请求！"}>
                        //         <Button className="pending-btn-accept" disabled={!val.valid || val.result != 0} onClick={async ()=>{
                        //             let flag: boolean = true;
                        //             if (val.type === 1) {
                        //                 await request(
                        //                     `/api/receive_asset/${Cookies.get("sessionID")}`,
                        //                     "PUT",
                        //                     {
                        //                         id: val.assetID,
                        //                         name: val.initiatorName,
                        //                         count: val.count,
                        //                         request_id: val.id,
                        //                     }
                        //                 )
                        //                     .then((res) => { 
                        //                         console.log(res);
                        //                         message.success("资产转移成功!");
                        //                     })
                        //                     .catch((err) => {
                        //                         console.log(err);
                        //                         flag = false;
                        //                         message.error("资产转移失败" + err);
                        //                     });
                        //             }
                        //             else if (val.type === 2) {
                        //                 await request(
                        //                     `/api/return_asset/${Cookies.get("sessionID")}`,
                        //                     "PUT",
                        //                     {
                        //                         id: val.assetID,
                        //                         name: val.initiatorName,
                        //                         count: val.count,
                        //                         request_id: val.id,
                        //                     }
                        //                 )
                        //                     .then((res) => { 
                        //                         console.log(res);
                        //                         message.success("资产退库成功!");
                        //                     })
                        //                     .catch((err) => {
                        //                         console.log(err);
                        //                         flag = false;
                        //                         message.error("资产退库失败" + err);
                        //                     });
                        //             }
                        //             else if (val.type === 4) {
                        //                 await request(
                        //                     `/api/transfer_asset/${Cookies.get("sessionID")}`,
                        //                     "PUT",
                        //                     {
                        //                         id: val.assetID,
                        //                         sender: val.initiatorName,
                        //                         target: val.targetName,
                        //                         count: val.count,
                        //                         request_id: val.id,
                        //                     }
                        //                 )
                        //                     .then((res) => { 
                        //                         console.log(res);
                        //                         message.success("资产转移成功");
                        //                     })
                        //                     .catch((err) => {
                        //                         console.log(err);
                        //                         flag = false;
                        //                         message.error("资产转移失败" + err);
                        //                     });
                        //             }
                        //             if (flag) {
                        //                 await request(
                        //                     `/api/return_pending_request/${Cookies.get("sessionID")}`,
                        //                     "PUT",
                        //                     {
                        //                         id: val.id,
                        //                         result: 1,
                        //                     }
                        //                 )
                        //                     .then((res) => { 
                        //                         console.log(res);
                        //                         message.success("请求批准!");
                        //                     })
                        //                     .catch((err) => {
                        //                         console.log(err);
                        //                         message.error("请求批准失败" + err);
                        //                     });
                        //             }
                        //             fetchList(props);
                        //         }
                        //         }>
                        //             <div style={{display: "flex", alignItems: "center"}}>
                        //                 <CheckCircleOutlined style={{marginRight:"5px"}}/>
                        //             同意
                        //             </div>
                        //         </Button>
                        //     </Tooltip>
                        //     <Button className="pending-btn-reject" disabled={val.result != 0} onClick={async ()=>{
                        //         await request(
                        //             `/api/return_pending_request/${Cookies.get("sessionID")}`,
                        //             "PUT",
                        //             {
                        //                 id: val.id,
                        //                 result: 2,
                        //             }
                        //         )
                        //             .then((res) => { 
                        //                 console.log(res);
                        //                 message.success("请求拒绝!");
                        //             })
                        //             .catch((err) => {
                        //                 console.log(err);
                        //                 message.error("请求拒绝失败" + err);
                        //             });
                        //         fetchList(props);
                        //     }
                        //     }>
                        //         <div style={{display: "flex", alignItems: "center"}}>
                        //             <CloseCircleOutlined style={{marginRight:"5px"}}/>
                        //             拒绝
                        //         </div>
                        //     </Button>
                        // </Space>
                    
                    })));
                    setRefreshing(false);
                })
                .catch((err) => {
                    console.log("error: " + err);
                    setRefreshing(false);
                });
        }
    };

    const handleSearch = (
        selectedKeys: string[],
        confirm: () => void,
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<PendingRequestType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={"搜索"}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
            搜索
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
            重置
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
            过滤
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
            关闭
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffffff", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    
    const columns: ColumnsType<PendingRequestType> = [
        {
            title: "发起人",
            dataIndex: "initiator",
            key: "initiator",
            width: "10%",
            ...getColumnSearchProps("initiator"),
        },
        {
            title: "资产",
            dataIndex: "asset",
            key: "asset",
            width: "12%",
            ...getColumnSearchProps("asset"),
        },
        {
            title: "状态",
            dataIndex: "result",
            key: "result",
            width: "8%",
            ...getColumnSearchProps("result"),
            render: (result: number) => {
                if (result === 0)
                    return(
                        <Space>
                            <Badge status="processing" 
                                text="未审批"></Badge>
                        </Space>
                    );
                else if (result === 1)
                    return(
                        <Space>
                            <Badge status="success" 
                                text="已通过"></Badge>
                        </Space>
                    );
                else if (result === 2)
                    return(
                        <Space>
                            <Badge status="error" 
                                text="已拒绝"></Badge>
                        </Space>
                    );
            }
        },
        {
            title: "申请种类",
            dataIndex: "type",
            key: "type",
            width: "15%",
            render: (type: number, record: PendingRequestType) => {
                if (type === 1)
                    return(
                        <Space>
                            <Tag className="pending-tag" icon={<ContainerOutlined/>} color={"green"}>
                                领用
                            </Tag>
                        </Space>
                    );
                else if (type === 2)
                    return(
                        <Space>
                            <Tag className="pending-tag" icon={<InboxOutlined/>} color={"red"}>
                                退库
                            </Tag>
                        </Space>
                    );
                else if (type === 3)
                    return(
                        <Space>
                            <Tag className="pending-tag" icon={<RestOutlined/>} color={"yellow"}>
                                维保
                            </Tag>
                        </Space>
                    );
                else if (type === 4)
                    return(
                        <Space>
                            <Tooltip title={`转移至 ${record.target}`}>
                                <Tag className="pending-tag" icon={<InteractionOutlined/>} color={"cyan"}>
                                转移
                                </Tag>
                            </Tooltip>
                        </Space>
                    );
            }
        },
        {
            title: "数量",
            dataIndex: "count",
            key: "count",
            width: "10%",
        },
        {
            title: "请求时间",
            dataIndex: "request_time",
            key: "request_time",
            width: "20%",
        },
        {
            title: "处理",
            dataIndex: "operation",
            key: "operation",
            render: (_, record: PendingRequestType) => {
                return (
                    <Space>
                        <Tooltip title={record.valid ? "" : "该资产已被操作完毕！无法同意请求！"}>
                            <Button className="pending-btn-accept" disabled={disabled || !record.valid || record.result != 0} onClick={async ()=>{
                                setDisabled(true);
                                let flag: boolean = true;
                                if (record.type === 1) {
                                    await request(
                                        `/api/receive_asset/${Cookies.get("sessionID")}`,
                                        "PUT",
                                        {
                                            id: record.assetID,
                                            name: record.initiator,
                                            count: record.count,
                                            request_id: record.id,
                                        }
                                    )
                                        .then((res) => { 
                                            console.log(res);
                                            message.success("资产转移成功!");
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            flag = false;
                                            message.error("资产转移失败" + err);
                                        });
                                }
                                else if (record.type === 2) {
                                    await request(
                                        `/api/return_asset/${Cookies.get("sessionID")}`,
                                        "PUT",
                                        {
                                            id: record.assetID,
                                            name: record.initiator,
                                            count: record.count,
                                            request_id: record.id,
                                        }
                                    )
                                        .then((res) => { 
                                            console.log(res);
                                            message.success("资产退库成功!");
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            flag = false;
                                            message.error("资产退库失败" + err);
                                        });
                                }
                                else if (record.type === 4) {
                                    await request(
                                        `/api/transfer_asset/${Cookies.get("sessionID")}`,
                                        "PUT",
                                        {
                                            id: record.assetID,
                                            sender: record.initiator,
                                            target: record.target,
                                            count: record.count,
                                            request_id: record.id,
                                        }
                                    )
                                        .then((res) => { 
                                            console.log(res);
                                            message.success("资产转移成功");
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            flag = false;
                                            message.error("资产转移失败" + err);
                                        });
                                }
                                if (flag) {
                                    await request(
                                        `/api/return_pending_request/${Cookies.get("sessionID")}`,
                                        "PUT",
                                        {
                                            id: record.id,
                                            result: 1,
                                        }
                                    )
                                        .then((res) => { 
                                            console.log(res);
                                            message.success("请求批准!");
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            message.error("请求批准失败" + err);
                                        });
                                }
                                setDisabled(false);
                                fetchList(props);
                            }
                            }>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <CheckCircleOutlined style={{marginRight:"5px"}}/>
                                同意
                                </div>
                            </Button>
                        </Tooltip>
                        <Button className="pending-btn-reject" disabled={disabled || record.result != 0} onClick={async ()=>{
                            setDisabled(true);
                            await request(
                                `/api/return_pending_request/${Cookies.get("sessionID")}`,
                                "PUT",
                                {
                                    id: record.id,
                                    result: 2,
                                }
                            )
                                .then((res) => { 
                                    console.log(res);
                                    message.success("请求拒绝!");
                                })
                                .catch((err) => {
                                    console.log(err);
                                    message.error("请求拒绝失败" + err);
                                });
                            setDisabled(false);
                            fetchList(props);
                        }
                        }>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <CloseCircleOutlined style={{marginRight:"5px"}}/>
                                拒绝
                            </div>
                        </Button>
                    </Space>
                );
            }
        },
    ];


    const pagination = {
        pageSize: 6,
    };

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <div className="asset-content">  
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">待处理请求</text>
            </div>
            <Table 
                columns={columns} 
                dataSource={pendingRequestList} 
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                }}
                className="dTable"/> 
        </div>
    );
};

export default PendingRequestList;