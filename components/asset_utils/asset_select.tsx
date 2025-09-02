import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Space, } from "antd";
import AssetList from "./asset_list";
import { DownloadOutlined, } from "@ant-design/icons";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import CreateAssetCategory from "./create_asset_category";
import DeleteAssetCategory from "./delete_asset_category";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AssetDocument from "./asset_pdf";
import CreateAsset from "./create_asset";
import ExcelImport from "./excel_import";

interface Option {
  value?: string | number | null;
  label: React.ReactNode;
  children?: Option[];
  isLeaf?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const optionLists: Option[] = [
    {
        value: "loading",
        label: "loading",
        isLeaf: true,
        loading: false,
        disabled: true,
    },
];

interface assetSelectProps {
  department?: string;
}

const AssetSelect = (props: assetSelectProps) => {
    const [options, setOptions] = useState<Option[]>(optionLists);
    const [value, setvalue] = useState<string | number>("");
    const [root, setRoot] = useState<string | number>("");
    const [name, setName] = useState<string>("");
    const [isempty, setEmpty] = useState<boolean>(true);
    const [selectedOps, setSelectedOps] = useState<Option[]>([]);
    const [targetValues, setTargetValues] = useState<(string | number)[]>([]);

    const getInfo = () => {
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setName(res.data.name);
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const initialize = (props: assetSelectProps) => {
        if (props.department) {
            request(`/api/asset_tree_root/${Cookies.get("sessionID")}/${props.department}`, "GET")
                .then((res) => {
                    setOptions([
                        {
                            value: res.data.name,
                            label: res.data.name,
                            isLeaf: false,
                        }
                    ]);
                    setRoot(res.data.name);
                })
                .catch((err) => {
                    console.log("error: " + err);     
                });
        }
    }; 

    useEffect(() => {
        getInfo();
        initialize(props);
    }, [props]);

    useEffect(() => {
        if (isempty) {
            initialize(props);
        }
    },[isempty]);

    const onChange = (value: (string | number)[], selectedOptions: Option[]) => {
        setTargetValues(value);
        setSelectedOps(selectedOptions);
        console.log(value, selectedOptions);
        if (value) {
            setvalue(value[value.length - 1]);
            setEmpty(false);
        }
        else {
            setEmpty(true);
            setvalue("");
        }
    };

    const loadData = async (selectedOptions: Option[]) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        console.log(selectedOptions);
        console.log(targetOption);
        targetOption.loading = true;

        await request(`/api/sub_asset_tree/${Cookies.get("sessionID")}/${targetOption.value}`, "GET")
            .then((res) => {
                targetOption.children = res.data.map((val: any) => ({
                    value: val.name,
                    label: val.name,
                    isLeaf: false,
                }));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
        
        if (!targetOption.children) {
            message.warning("该品类已不可划分！");
            targetOption.isLeaf = true;
        }
        else if (targetOption.children.length === 0) {
            message.warning("该品类已不可划分！");
            targetOption.isLeaf = true;
        }
        setOptions([...options]);
        console.log(options);
    };

    function toggleAdd () {
        console.log(selectedOps);
        loadData(selectedOps);
    }

    function toggleDelete () {
        console.log(selectedOps);
        initialize(props);
        setTargetValues([]);
    }

    const [fetch, setFetch] = useState<boolean>(false);

    function toggleFetch () {
        setFetch((fetch) => !fetch);
    }

    return (
        <div className="asset-list-content">
            <Cascader size='large'  style = {{width: "100%", paddingBottom: "10px"}} options={options} value={targetValues} loadData={loadData} onChange={onChange} changeOnSelect 
                placeholder={"请选择资产品类，搜索模式下置空为全局搜索"} className="assetCascader"/>
            <Space>
                <CreateAssetCategory parent={value} department={props.department} type={(!value || value === root) ? false : true} callback={toggleAdd}></CreateAssetCategory>
                <DeleteAssetCategory name={value} type={(!value || value === root) ? false : true} callback={toggleDelete}></DeleteAssetCategory>
                <PDFDownloadLink document={<AssetDocument type={false} />} fileName="资产标签卡模板.pdf">
                    <Button className="asset-btn">
                        <div style={{display: "flex", alignItems: "center"}}>
                            <DownloadOutlined style={{marginRight:"5px"}}/>
                        下载资产标签卡
                        </div>
                    </Button>
                </PDFDownloadLink>
                <CreateAsset user={name} department={props.department} asset_tree_node={value} callback={toggleFetch}/>
                <ExcelImport user={name} department={props.department} asset_tree_node={value}/>
            </Space>
            <AssetList nodeName={value} department={props.department} name={name} needNewFetch={fetch}/>
        </div>
    );
};

export default AssetSelect;