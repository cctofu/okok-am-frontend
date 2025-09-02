import React, { useEffect, useState } from "react";
import { ClockCircleOutlined, CheckCircleOutlined} from "@ant-design/icons";
import { InputNumber, message, } from "antd";
import { Button, Space, Table,} from "antd";
import type { ColumnsType } from "antd/es/table";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface MaintainType {
  key: React.Key;
  id: number;
  owner: string;
  asset: string;
  price: number;
  count: number;
  assetDeadline: string;
  operation: any;
  deadline: number;
  priceoperate: any;
  deadlineoperate: any;
}

interface MaintainListProps {
    name?: string,
}

interface DigitType {
    key: React.Key,
    digit: number,
}

const MaintainList = (props: MaintainListProps) => {
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [maintainList, setMaintainList] = useState<MaintainType[]>([]);
    const [deadlineList, setDeadlineList] = useState<DigitType[]>([]);
    const [priceList, setPriceList] = useState<DigitType[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = () => {
        setRefreshing(true);
        console.log(props.name);
        request(`/api/get_maintain_list/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setMaintainList(res.data.map((val: any) => ({
                    ...val, key: val.assetID, id: val.assetID,
                    asset: val.assetName, price: val.assetInitialPrice, count: val.assetAmount, owner: val.assetOwner, deadline: 0,
                    priceoperate:
                    <Space>
                        <InputNumber prefix="¥" max={Number(val.assetInitialPrice)} min={0.0} defaultValue={Number(val.assetInitialPrice)}
                            step={0.01} style={{ width: 160 }} onChange={(value) => {
                                setPriceList((priceList) => {
                                    const key = val.assetID;
                                    return priceList.map((val: any) => ({
                                        ...val, digit: val.key === key ? value : val.digit,
                                    }));
                                            
                                });
                            }}>
                        </InputNumber>
                    </Space>,
                    deadlineoperate:
                    <Space>
                        <InputNumber prefix={<ClockCircleOutlined/>} min={0} defaultValue={0}
                            step={1} style={{ width: 160 }} onChange={(value) => {
                                setDeadlineList((deadlineList) => {
                                    const key = val.assetID;
                                    return deadlineList.map((val: any) => ({
                                        ...val, digit: val.key === key ? value : val.digit,
                                    }));
                                });
                            }}>
                        </InputNumber>
                    </Space>, 
                    operation: val.assetID,
                })));
                setRefreshing(false);
            })
            .catch((err) => {
                console.log("error: " + err);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        setRefreshing(true);
        setDeadlineList(() => maintainList.map((val: any) => ({
            ...val, key: val.key, digit: Number(val.deadline),
        })));
        setPriceList(() => maintainList.map((val: any) => ({
            ...val, key: val.key, digit: Number(val.price),
        })));
        setRefreshing(false);
    },[maintainList]);

    const columns: ColumnsType<MaintainType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "8%",
        },
        {
            title: "资产名称",
            dataIndex: "asset",
            key: "asset",
            width: "10%",
            ellipsis: true,
        },
        {
            title: "所有人",
            dataIndex: "owner",
            key: "owner",
            width: "10%",
            ellipsis: true,
        },
        {
            title: "数量",
            dataIndex: "count",
            key: "count",
            width: "8%",
        },
        {
            title: "价格",
            dataIndex: "priceoperate",
            key: "priceoperate",
            width: "17%",
        },
        {
            title: "期限",
            dataIndex: "deadlineoperate",
            key: "deadlineoperate",
            width: "17%",
        },
        {
            title: "原到期时间",
            dataIndex: "assetDeadline",
            key: "assetDeadline",
            width: "13%",
        },
        {
            title: "管理",
            dataIndex: "operation",
            key: "operation",
            render: (_, record) => 
                <Space>
                    <Button className="asset-btn" disabled={disabled} onClick={async ()=>{
                        setDisabled(true);
                        const price: number = priceList.filter((price) => {return price.key === record.key;})[0].digit;
                        const deadline: number = deadlineList.filter((deadline) => {return deadline.key === record.key;})[0].digit;
                        await request(
                            `/api/maintain_asset/${Cookies.get("sessionID")}`,
                            "PUT",
                            {
                                id: record.id,
                                name: record.owner,
                                new_deadline: deadline,
                                new_price: price,
                                count: record.count,
                            }
                        )
                            .then((res) => { 
                                console.log(res);
                                message.success("维保期满，资产已转移回用户！");
                                fetchList();
                            })
                            .catch((err) => {
                                console.log(err);
                                message.error("维保完成失败：" + err);
                            });
                        setDisabled(false);
                    }
                    }>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <CheckCircleOutlined style={{marginRight:"5px"}}/>
                        维保完成
                        </div>
                            
                    </Button>
                </Space>
                    
            
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
        <div className="asset-list-content">  
            <div style={{justifyContent: "space-between", display:"flex", alignItems:"center", paddingBottom:"2%"}}>
                <text className="user-list-title">维保资产表单</text>
            </div>
            <Table 
                columns={columns} 
                dataSource={maintainList} 
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                }}/> 
        </div>
    );
};

export default MaintainList;