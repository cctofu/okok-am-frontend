import React, { useEffect, useState } from "react";
import { MinusOutlined, CloseCircleTwoTone, FilePdfTwoTone, VerticalAlignBottomOutlined, VerticalAlignTopOutlined, DiffTwoTone} from "@ant-design/icons";
import { Badge, InputNumber, message, Select, Switch, Tooltip } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import ModifyAsset from "./modify_asset";
import AssetCurve from "./asset_curve";
import AssetHistory from "./asset_history";
import AssetInfo from "./asset_info";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AssetDocument from "./asset_pdf";

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
  operation: any;
  status: number;
}

interface assetListProps {
    nodeName?: string | number,
    department?: string,
    name?: string,
    needNewFetch?: boolean,
}

interface DigitType {
    key: React.Key;
    count: number;
}

const AssetList = (props: assetListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [digitList, setDigitList] = useState<DigitType[]>([]);
    
    const [isUseId, setIsUseId] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [assetList, setAssetList] = useState<AssetType[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [searching, setSearching] = useState<boolean>(false);
    const [expire, setExpire] = useState<boolean>(false);

    useEffect(() => {
        fetchList(currentPage);
    }, [expire]);

    const fetchList = (page : number) => {
        if (!props.nodeName) {
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        request(`/api/asset_tree_node/${Cookies.get("sessionID")}/${props.nodeName}/${page}/${expire ? 1 : 0}`, "GET")
            .then((res) => {
                setAssetList(res.data.reverse().map((val: any) => ({
                    ...val, key: val.id, id: val.id, class: `${val.assetClass === 0 ? "条目型" : "数量型"}`,
                    assetcategory: val.assetTree, parent: val.parentName,
                    price: val.expire ? 0.0 : val.price, user: val.userName,
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
                    number: val.count,
                    operation: 
                    !val.expire ?
                        <Space>
                            <AssetInfo
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
                                department={props.department}
                                treeNode={props.nodeName}
                                create_time={val.create_time}
                                deadline={val.deadline}
                            />
                            <AssetCurve 
                                name={val.name}
                                id={val.id}/>
                            <AssetHistory
                                name={val.name}
                                id={val.id}
                            />
                            {
                                val.status != 3 &&
                            <ModifyAsset
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
                                position={val.position}
                                department={props.department}
                                treeNode={props.nodeName}
                                callback={toggleNeedNewFetch}
                                disabled={val.status === 3}
                            ></ModifyAsset>}
                            {
                                val.status === 3 && 
                                <Tooltip title={"无法修改维保中的资产信息"}>
                                    <Button icon={<DiffTwoTone/>} disabled></Button>
                                </Tooltip>
                            }
                            <PDFDownloadLink document={<AssetDocument type={true}
                                id={val.id}
                                name={val.name}
                                parent={val.parentName}
                                class={val.assetClass === 0 ? "条目型" : "数量型"}
                                user={val.userName}
                                price={`¥ ${val.price}`}
                                number={val.count}
                                assetcategory={val.assetTree}
                                description={val.description}
                                position={val.position}
                                department={val.departmentName}
                            />} fileName={`资产${val.id}${val.name}标签卡.pdf`}>
                                <Tooltip title={"获取资产标签卡"}>
                                    <Button icon={<FilePdfTwoTone/>}></Button>
                                </Tooltip>
                            </PDFDownloadLink>
                        </Space>
                        :
                        <Space>
                            <Tooltip title={"资产已到期，无法进行任何操作！"}>
                                <Button icon={<CloseCircleTwoTone/>} disabled></Button>
                            </Tooltip>
                        </Space>
                })));
                setTotalPages(res.pages);
                setRefreshing(false);
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
                disabled: record.expire,
                checked: !record.expire,
            };
        }
    };
    const hasSelected = selectedRowKeys.length > 0;
    
    const columns: ColumnsType<AssetType> = [
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            width: "7%",
        },
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: "14%",
        },
        {
            title: "类型",
            dataIndex: "class",
            key: "class",
            width: "8%",
        },
        {
            title: "所有人",
            dataIndex: "user",
            key: "user",
            width: "13%",
        },
        {
            title: "价格",
            dataIndex: "price",
            key: "price",
            width: "15%",
            render: (price: number) => Number(price).toFixed(2),
        },
        {
            title: "数量选择",
            dataIndex: "count",
            key: "count",
            width: "10%",
        },
        {
            title: "状态",
            dataIndex: "expire",
            key: "expire",
            width: "9%",
            render: (expire: boolean, record: AssetType) => {
                if (expire)
                    return (<Space>
                        <Badge status = "error" 
                            text = "已清退" />
                    </Space>);
                else if (record.status === 1) {
                    return (<Space>
                        <Badge status = "success" 
                            text = "闲置" />
                    </Space>);
                }
                else if (record.status === 2) {
                    return (<Space>
                        <Badge status = "processing" 
                            text = "使用中" />
                    </Space>);
                }
                else if (record.status === 3) {
                    return (<Space>
                        <Badge status = "warning" 
                            text = "维保中" />
                    </Space>);
                }
            }
        },
        {
            title: "操作",
            dataIndex: "operation",
            key: "operation",
            width:"21%"
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

    const startSearch = () => {
        setSearching(!searching);
    };

    // 搜索列表功能 useState
    const [id, setId] = useState<string>("");
    const [assetName, setAssetName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [owner, setOwner] = useState<string>("");
    const [priceLowerBound, setPriceLowerBound] = useState<number>(0);
    const [priceUpperBound, setPriceUpperBound] = useState<number>(2147483647);
    const [status, setStatus] = useState<string >("");
    const [description, setDescription] = useState<string>("");

    const [currentSearchPage, setCurrentSearchPage] = useState(1);
    const [totalSearchPages, setTotalSearchPages] = useState(0);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);

    const fetchSearchList = async (page : number) => {
        setSearchLoading(true);
        // if (!props.nodeName) {
        //     setSearchLoading(false);
        //     return;
        // }
        await request(`/api/search_assets/${Cookies.get("sessionID")}`, 
            "POST",
            {
                asset_tree_node: props.nodeName,
                id: id === "" ? "" : Number(id),
                name: assetName,
                price_inf: priceLowerBound,
                price_sup: priceUpperBound,
                description: description,
                page: page,
            })
            .then((res) => {
                setAssetList(res.data.reverse().map((val: any) => ({
                    ...val, key: val.id, id: val.id, class: `${val.assetClass === 0 ? "条目型" : "数量型"}`,
                    assetcategory: val.assetTree, parent: val.parentName,
                    price: val.expire ? 0.0 : val.price, user: val.userName,
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
                    number: val.count,
                    operation: 
                    !val.expire ?
                        <Space>
                            <AssetInfo
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
                                department={props.department}
                                treeNode={props.nodeName}
                                create_time={val.create_time}
                                deadline={val.deadline}
                            />
                            <AssetCurve 
                                name={val.name}
                                id={val.id}/>
                            <AssetHistory
                                name={val.name}
                                id={val.id}
                            />
                            <ModifyAsset
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
                                position={val.position}
                                department={props.department}
                                treeNode={props.nodeName}
                                callback={toggleNeedNewFetch}
                                disabled={val.status === 3}
                            ></ModifyAsset>
                            <PDFDownloadLink document={<AssetDocument type={true}
                                id={val.id}
                                name={val.name}
                                parent={val.parentName}
                                class={val.assetClass === 0 ? "条目型" : "数量型"}
                                user={val.userName}
                                price={`¥ ${val.price}`}
                                number={val.count}
                                assetcategory={val.assetTree}
                                description={val.description}
                                position={val.position}
                                department={val.departmentName}
                            />} fileName={`资产${val.id}${val.name}标签卡.pdf`}>
                                <Tooltip title={"获取资产标签卡"}>
                                    <Button icon={<FilePdfTwoTone/>}></Button>
                                </Tooltip>
                            </PDFDownloadLink>
                        </Space>
                        :
                        <Space>
                            <Tooltip title={"资产已到期！无法进行任何操作！"}>
                                <Button icon={<CloseCircleTwoTone/>} disabled></Button>
                            </Tooltip>
                        </Space>
                })));
                setTotalSearchPages(res.pages);
                setSearchLoading(false);
            })
            .catch((err) => {
                console.log("error: " + err);
                setSearchLoading(false);
            });
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

    useEffect(() => {
        if (searching) {
            setSearching((searching) => !searching);
            fetchList(1);
            setId("");
            setAssetName("");
            setCategory("");
            setOwner("");
            setPriceLowerBound(0);
            setPriceUpperBound(2147483647);
            setStatus("");
            setDescription("");
        }
        else {
            fetchList(1);
        }
    }, [props.nodeName]);

    function toggleNeedNewFetch () {
        if (searching) {
            setCurrentSearchPage(1);
            fetchSearchList(1);
        }
        else {
            setCurrentPage(1);
            fetchList(1);
        }
    }

    function toggleNeedNewFetchFirst () {
        if (searching) {
            setCurrentSearchPage(1);
            fetchSearchList(1);
        }
        else {
            setCurrentPage(1);
            fetchList(1);
        }
    }

    useEffect(() => {
        toggleNeedNewFetchFirst();
    }, [props.needNewFetch]);

    return refreshing? (
        <div className="loading-div">
            <div className="loader"/>
        加载中...
        </div>
    ) : (
        <>  
            <Space>
                <Button className="asset-btn" disabled={!hasSelected} loading={loadingDelete} style={{ marginLeft: 10, marginBottom:"10px" }} onClick ={async () => {
                    setLoadingDelete(true);
                    for (let val of selectedRowKeys) {
                        const count: number = digitList.filter((digit) => {return digit.key === val;})[0].count;
                        await request(
                            `/api/expire_asset/${Cookies.get("sessionID")}`,
                            "PUT",
                            {
                                id: val,
                                count: count,
                            }
                        )
                            .then((res) => { 
                                console.log(res);
                                message.success(`资产 ${val} 清退成功!`);
                            })
                            .catch((err) => {
                                console.log(err);
                                message.error(`资产 ${val} 清退失败:` + err);
                            });
                    }
                    if (!searching) fetchList(1);
                    else fetchSearchList(1);
                    setSelectedRowKeys([]);
                    setLoadingDelete(false);
                }}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <MinusOutlined style={{marginRight:"5px"}}/>
                清退资产
                    </div>
                </Button>
                <Button className="asset-btn" style={{ marginBottom: 8 }} onClick={async () => {
                    await request(
                        `/api/export_task/${Cookies.get("sessionID")}`,
                        "POST",
                        assetList.map((asset) => asset.id)
                    )
                        .then((res) => { 
                            console.log(res);
                            message.success("任务创建成功！");
                        })
                        .catch((err) => {
                            console.log(err);
                            message.error("任务创建失败:" + err);
                        });
                }}>
                导出该页资产
                </Button>
                <Button className="logRefreshBtn" onClick={startSearch} style={{fontFamily:"Tommy-medium", marginBottom:"12%"}}>
                    搜索
                </Button>
                <Switch checkedChildren="空闲" unCheckedChildren="过期" checked={!expire} disabled={searching} defaultChecked onClick={(checked) => {
                    setExpire(!checked);}} style={{float: "left", marginBottom: 8}}/>
            </Space>
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
                    value={assetName}
                    style={{ marginLeft:"0.5%", width:"13.5%",borderRadius:"0px"}}
                    onChange={(e) => setAssetName(e.target.value)}
                />
                <Select 
                    disabled
                    defaultValue="" 
                    value={category}
                    style={{marginLeft:"0.5%", width:"7.5%",borderRadius:"0px"}} 
                    options={[
                        { value: "", label: "所有" },
                        { value: 0, label: "条目型" },
                        { value: 1, label: "数量型" },
                    ]}
                />
                <Input
                    disabled
                    placeholder="所有人名称"
                    value={owner}
                    style={{marginLeft:"0.5%", width:"12.5%",borderRadius:"0px"}}
                />
                <InputNumber 
                    disabled={isUseId}
                    placeholder="价格下限"
                    defaultValue={0}
                    value={priceLowerBound}
                    onChange={(val: any) => setPriceLowerBound(val)}
                    style={{marginLeft:"0.5%", width:"11.5%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间下界"}>
                        <VerticalAlignBottomOutlined/>
                    </Tooltip>}
                />
                <InputNumber 
                    disabled={isUseId}
                    placeholder="价格上限"
                    defaultValue={2147483647}
                    value={priceUpperBound}
                    onChange={(val: any) => setPriceUpperBound(val)}
                    style={{marginLeft:"0.5%", width:"14%",borderRadius:"0px"}}
                    addonBefore={<Tooltip title={"输入价格区间上界"}>
                        <VerticalAlignTopOutlined/>
                    </Tooltip>}
                />
                <Select 
                    disabled
                    defaultValue="" 
                    value={status}
                    style={{marginLeft:"0.5%", width:"8%",borderRadius:"0px"}}  
                    options={[
                        { value: "",label: "所有" },
                        { value: 1, label: "空闲" },
                        { value: 2, label: "使用中" },
                        { value: 3, label: "维保中" },
                        { value: 0, label: "已清退" },
                    ]}
                />
                <Input 
                    disabled={isUseId}
                    placeholder="描述" 
                    value={description}
                    style={{ marginLeft:"0.5%", width:"15%",borderRadius:"0px"}}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Button 
                    style={{marginLeft:"0.5%", width:"7%",borderRadius:"0px"}} 
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

export default AssetList;