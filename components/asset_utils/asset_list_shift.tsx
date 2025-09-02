import React, { useEffect, useState } from "react";
import { MinusOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Badge, InputNumber, Select, Tooltip, message, } from "antd";
import { Button, Input, Space, Table, } from "antd";
import type { ColumnsType} from "antd/es/table";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import AssetInfo2 from "./asset_info2";

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
  number: number;
  assetcategory: string;
  userdefined: string[];
  image: any;
  operation: any;
}

interface assetListProps {
    name?: string;
    user?: string;
}

interface DigitType {
    key: React.Key;
    count: number;
}

const AssetListShift = (props: assetListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingShift, setLoadingShift] = useState<boolean>(false);
    const [digitList, setDigitList] = useState<DigitType[]>([]);
    
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [assetList, setAssetList] = useState<AssetType[]>([]);
    const [isUseId, setIsUseId] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchList(1);
    }, []);

    const fetchList = (page : number) => {
        setRefreshing(true);
        request(`/api/unallocated_asset/${Cookies.get("sessionID")}/${props.user}/${page}`, "GET")
            .then((res) => {
                setAssetList(res.data.map((val: any) => ({
                    ...val, 
                    key: val.id, 
                    id: val.id, 
                    class: `${val.assetClass === 0 ? "条目型" : "数量型"}`,
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
        },
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: "15%",
        },
        {
            title: "类型",
            dataIndex: "class",
            key: "class",
            width: "8%",
        },
        {
            title: "价格",
            dataIndex: "price",
            key: "price",
            width: "17%",
            render: (price: number) => Number(price).toFixed(2),
        },
        {
            title: "数量",
            dataIndex: "count",
            key: "count",
            width: "20%",
        },
        {
            title: "状态",
            dataIndex: "expire",
            key: "expire",
            width: "10%",
            render: (expire: boolean) => 
                <Space>
                    <Badge status = {expire ? "error" : "success"} 
                        text = {expire ? "已清退" : "闲置"}/>
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
        pageSize: 6,
        total: 6 * totalPages,
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
    const [id, setId] = useState<string>("");
    const [assetName, setAssetName] = useState<string>("");
    const [priceLowerBound, setPriceLowerBound] = useState<number>(0);
    const [priceUpperBound, setPriceUpperBound] = useState<number>(2147483647);
    const [description, setDescription] = useState<string>("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);

    const fetchSearchList = async (page : number) => {
        setSearchLoading(true);
        await request(`/api/search_assets/${Cookies.get("sessionID")}`, 
            "POST",
            {
                asset_tree_node: "",
                id: id === "" ? "" : Number(id),
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
                            department={val.department}
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
        setCurrentSearchPage(1);
        fetchSearchList(1);
    };

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
        <>  
            <Space style={{marginBottom:"10px"}}>
                <Button disabled={!hasSelected} loading={loadingShift} className="asset-btn" onClick ={async () => {
                    setLoadingShift(true);
                    let flag = true;
                    for (let val of selectedRowKeys) {
                        const count: number = digitList.filter((digit) => {return digit.key === val;})[0].count;
                        await request(
                            `/api/allot_asset/${Cookies.get("sessionID")}`,
                            "PUT",
                            {
                                id: val,
                                name: props.name,
                                count: count
                            }
                        )
                            .then((res) => { 
                                console.log(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                message.error(`资产 ${val} 调拨错误:` + err);
                                flag = false;
                            });
                        console.log(val);
                    }
                    if (flag) message.success("资产调拨成功！");
                    setSelectedRowKeys([]);
                    setLoadingShift(false);
                }}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <MinusOutlined style={{marginRight:"5px"}}/>
                        批量调拨资产
                    </div>
                </Button>
                <Button className="logRefreshBtn" onClick={startSearch}>
                    搜索
                </Button>
                <span style={{ marginLeft: 12, fontFamily:"Tommy-medium", color:"rgb(184, 150, 27)"}}>
                    {hasSelected ? `已选择 ${selectedRowKeys.length} 项资产` : ""}
                </span>   
            </Space>
            <div hidden={!searching} className="user-list-search">
                <Input 
                    placeholder="编号" 
                    className="user-search-input" 
                    value={id}
                    style={{width:"8.5%", borderRadius:"0px"}}
                    onChange={handleIdChange}
                />
                <Input 
                    disabled={isUseId}
                    placeholder="资产名称" 
                    value={assetName}
                    style={{ marginLeft:"0.5%", width:"13%",borderRadius:"0px"}}
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
                    style={{marginLeft:"0.5%", width:"12%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间下界"}>
                        <VerticalAlignBottomOutlined/>
                    </Tooltip>}
                />
                <InputNumber 
                    disabled={isUseId}
                    placeholder="价格上限"
                    defaultValue={2147483647}
                    onChange={(val: any) => setPriceUpperBound(val)}
                    style={{marginLeft:"0.5%", width:"12%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间上界"}>
                        <VerticalAlignTopOutlined/>
                    </Tooltip>}
                />
                <Input 
                    disabled={isUseId}
                    placeholder="描述" 
                    value={description}
                    style={{ marginLeft:"0.5%", width:"17.5%",borderRadius:"0px"}}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Select 
                    disabled
                    defaultValue="" 
                    style={{marginLeft:"0.5%", width:"10%",borderRadius:"0px"}}  
                    options={[
                        { value: "",label: "所有状态" },
                        { value: 1, label: "空闲" },
                        { value: 0, label: "已清退" },
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
                pagination={searching? {
                    ...search_pagination,
                    showSizeChanger: false,
                } :{
                    ...pagination,
                    showSizeChanger: false,
                }}
            /> 
        </>
    );
};

export default AssetListShift;