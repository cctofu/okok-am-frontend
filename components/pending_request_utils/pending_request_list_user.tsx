import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, ContainerOutlined, InboxOutlined, InteractionOutlined, RestOutlined,} from "@ant-design/icons";
import { Badge, InputRef, Tag, } from "antd";
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
  type: number;
  result: number;
  operation: any;
  count: number;
  request_time: string;
}

type DataIndex = keyof PendingRequestType;

interface pendingRequestListProps {
    name?: string,
}

const PendingRequestListUser = (props: pendingRequestListProps) => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [pendingRequestList, setPendingRequestList] = useState<PendingRequestType[]>([]);

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
                        asset: val.assetName, 
                        operation: ""
                    
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
            width: "15%",
            ...getColumnSearchProps("initiator"),
        },
        {
            title: "资产",
            dataIndex: "asset",
            key: "asset",
            width: "15%",
            ...getColumnSearchProps("asset"),
        },
        {
            title: "申请种类",
            dataIndex: "type",
            key: "type",
            width: "10%",
            render: (type: number) => {
                if (type === 1)
                    return(
                        <Space>
                            <Tag icon={<ContainerOutlined/>} color={"green"}>
                                领用
                            </Tag>
                        </Space>
                    );
                else if (type === 2)
                    return(
                        <Space>
                            <Tag icon={<InboxOutlined/>} color={"red"}>
                                退库
                            </Tag>
                        </Space>
                    );
                else if (type === 3)
                    return(
                        <Space>
                            <Tag icon={<RestOutlined/>} color={"yellow"}>
                                维保
                            </Tag>
                        </Space>
                    );
                else if (type === 4)
                    return(
                        <Space>
                            <Tag icon={<InteractionOutlined/>} color={"cyan"}>
                                转移
                            </Tag>
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
            title: "状态",
            dataIndex: "result",
            key: "result",
            width: "30%",
            render: (result: number) => {
                if (result === 0)
                    return(
                        <Space>
                            <Badge status="processing" 
                                text="等待中"></Badge>
                        </Space>
                    );
                else if (result === 1)
                    return(
                        <Space>
                            <Badge status="success" 
                                text="通过"></Badge>
                        </Space>
                    );
                else if (result === 2)
                    return(
                        <Space>
                            <Badge status="error" 
                                text="未通过"></Badge>
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

export default PendingRequestListUser;