import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, DownloadOutlined, UpSquareOutlined, DownSquareOutlined} from "@ant-design/icons";
import { Badge, InputRef, Tag, Tooltip, message, } from "antd";
import { Button, Input, Space, Table,} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import FailedTaskRetry from "./failed_task_retry";

interface FailedTaskType {
  name: string;
  parent : number;
  assetClass: number;
  user: string;
  price: number;
  description: string;
  position: string;
  expire: boolean;
  deadline: number;
  count: number;
  assetTree: string;
  department: string;
  message: string;
}

interface AsyncTaskType {
  key: React.Key;
  id: number;
  manager: string;
  create_time: string;
  number_need: number;
  number_succeed: number;
  finish: number;
  failed_task: FailedTaskType[];
  operation: any;
  port_type: string;
}

type DataIndex = keyof AsyncTaskType;

interface asyncTaskListProps {
    name?: string,
}

const AsyncTaskList = (props: asyncTaskListProps) => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [asyncTaskList, setAsyncTaskList] = useState<AsyncTaskType[]>([]);

    useEffect(() => {
        fetchList();
    }, []);

    const download_import = async (id: number) =>{
        console.log(asyncTaskList);
        let target: FailedTaskType[] = [];
        if (asyncTaskList.filter((task) => {return task.id === id;})[0].failed_task.length === 0) {
            await request(`/api/failed_task/${Cookies.get("sessionID")}/${id}`, "GET")
                .then((res) => {
                    target = (res.data.map((val: any) => ({
                        ...val,
                    })));
                    setAsyncTaskList((list) => list.map((task) => ({
                        ...task, failed_task: task.id != id ? task.failed_task : (res.data.map((val: any) => ({
                            ...val,
                        })))
                    })));
                })
                .catch((err) => {
                    message.error("获取导入结果信息失败！请稍后再试！" + err);
                    console.log("拉取导入任务结果错误: " + err);
                    setRefreshing(false);
                });
        }
        else target = asyncTaskList.filter((task) => {return task.id === id;})[0].failed_task;
        console.log(target.map((info) => [info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price, info.count, info.deadline, info.assetTree, info.description, info.position, info.message]));
        let data =[
            ["资产名", "资产类型", "资产价值", "资产数量", "使用期限", "所属品类", "描述信息", "位置信息", "结果"],
        ];
        for (let info of target) {
            data.push([info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price.toString(), info.count.toString(), info.deadline.toString(), info.assetTree, info.description, info.position, (info.message ? info.message : "服务器故障，未能成功导入！")]);
        }
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        XLSX.writeFile(wb, `异步任务${id}结果记录.xlsx`);
    };

    const download_export = async (id: number) =>{
        console.log(asyncTaskList);
        let target: FailedTaskType[] = [];
        if (asyncTaskList.filter((task) => {return task.id === id;})[0].failed_task.length === 0) {
            await request(`/api/export_task/${Cookies.get("sessionID")}/${id}`, "GET")
                .then((res) => {
                    target = (res.data.map((val: any) => ({
                        ...val, 
                    })));
                    setAsyncTaskList((list) => list.map((task) => ({
                        ...task, failed_task: task.id != id ? task.failed_task : (res.data.map((val: any) => ({
                            ...val, 
                        })))
                    })));
                })
                .catch((err) => {
                    message.error("获取导出任务信息失败！请稍后再试！" + err);
                    console.log("拉取导出任务结果错误: " + err);
                    setRefreshing(false);
                });
        }
        else target = asyncTaskList.filter((task) => {return task.id === id;})[0].failed_task;
        console.log(target.map((info) => [info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price, info.count, info.deadline, info.assetTree, info.description, info.position, info.message]));
        let data =[
            ["资产名", "资产类型", "资产价值", "资产数量", "使用期限", "所属品类", "描述信息", "位置信息"],
        ];
        for (let info of target) {
            data.push([info.name, info.assetClass === 0 ? "条目型" : "数量型", info.price.toString(), info.count.toString(), info.deadline.toString(), info.assetTree, info.description, info.position]);
        }
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        XLSX.writeFile(wb, `异步任务${id}结果记录.xlsx`);
    };

    const fetchList = () => {
        setRefreshing(true);
        console.log(props.name);
        request(`/api/async_task/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setAsyncTaskList(res.data.reverse().map((val: any) => ({
                    ...val, key: val.id, id: val.id, operation: val.id,
                    failed_task: [], port_type: val.port_type === 1 ? "导入" : "导出"
                })));
                setRefreshing(false);
            })
            .catch(() => {
                setRefreshing(false);
            });
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

    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<AsyncTaskType> => ({
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
    
    const columns: ColumnsType<AsyncTaskType> = [
        {
            title: "任务编号",
            dataIndex: "id",
            key: "id",
            width: "10%",
            ...getColumnSearchProps("id"),
        },
        {
            title: "任务类型",
            dataIndex: "port_type",
            key: "port_type",
            width: "10%",
            ...getColumnSearchProps("port_type"),
            render: (type: string) => {
                if (type === "导入") {
                    return (
                        <Space>
                            <Tag icon={<UpSquareOutlined/>} color={"green"}>
                                导入
                            </Tag>
                        </Space>
                    );
                }
                else return (
                    <Space>
                        <Tag icon={<DownSquareOutlined/>} color={"blue"}>
                            导出
                        </Tag>
                    </Space>
                );
            }
        },
        {
            title: "任务发起人",
            dataIndex: "manager",
            key: "manager",
            width: "15%",
            ...getColumnSearchProps("manager"),
        },
        {
            title: "创建时间",
            dataIndex: "create_time",
            key: "create_time",
            width: "15%",
        },
        {
            title: "总数量",
            dataIndex: "number_need",
            key: "number_need",
            width: "10%",
        },
        {
            title: "导入成功数量",
            dataIndex: "number_succeed",
            key: "number_succeed",
            width: "15%",
        },
        {
            title: "状态",
            dataIndex: "finish",
            key: "finish",
            width: "15%",
            render: (finish: number) => {
                if (finish === 0)
                    return(
                        <Space>
                            <Badge status="processing" 
                                text="进行中"></Badge>
                        </Space>
                    );
                else if (finish === 1)
                    return(
                        <Space>
                            <Badge status="success" 
                                text="成功"></Badge>
                        </Space>
                    );
                else if (finish === 2)
                    return(
                        <Space>
                            <Badge status="error" 
                                text="失败"></Badge>
                        </Space>
                    );
            }
        },
        {
            title: "管理",
            dataIndex: "operation",
            key: "operation",
            width:"10%",
            render: (id: number, record) => 
                <Space>
                    <Tooltip title={"下载任务结果文件"}>
                        <Button onClick={() => {
                            if (record.port_type === "导入") {
                                download_import(id);
                            }
                            else {
                                download_export(id);
                            }
                        }} icon={<DownloadOutlined/>}>
                        </Button>
                    </Tooltip>
                    <FailedTaskRetry id={id} status={record.finish} port_type={record.port_type === "导出" ? 2 : 1}/>
                </Space>
        }
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
                <text className="user-list-title">异步任务列表</text>
                <Button onClick={fetchList} className="logRefreshBtn" style={{marginRight:0}}>刷新</Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={asyncTaskList} 
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                }}
                className="dTable"/> 
        </div>
    );
};

export default AsyncTaskList;