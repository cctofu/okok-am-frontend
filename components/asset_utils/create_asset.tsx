import type { ProColumns } from "@ant-design/pro-components";
import { EditableProTable, ProForm, ProFormText, DrawerForm } from "@ant-design/pro-components";
import { Button, message,} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

type AssetType = {
  id: React.Key;
  name?: string;
  parent?: string;
  assetClass?: number;
  price?: number;
  count?: number;
  deadline?: number;
  assetTree?: string;
  description?: string;
};

interface CreateAssetProps{
    user?: string,
    department?: string,
    asset_tree_node?: string | number,
    callback: () => void,
}

interface AssetSelectType {
    label: string,
    value: number,
    disabled: boolean,
}

const CreateAsset = (props: CreateAssetProps) => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [assetSelectList, setAssetSelectList] = useState<AssetSelectType[]>([]);

    const columns: ProColumns<AssetType>[] = [
        {
            title: "资产名",
            dataIndex: "name",
            width: "10%",
            align: "center"
        },
        {
            title: "资产从属",
            dataIndex: "parent",
            width: "10%",
            valueType: "select",
            fieldProps: {
                options: assetSelectList,
                showSearch: true,
            },
            align: "center",
            tooltip: "可选择该品类下的现有资产",
            
        },
        {
            title: "资产类型",
            dataIndex: "assetClass",
            width: "10%",
            valueType: "select",
            valueEnum: {
                0: {text: "条目型"},
                1: {text: "数量型"}
            },
            align: "center"
        },
        {
            title: "资产价值",
            dataIndex: "price",
            width: "10%",
            valueType: "money",
            align: "center"
        },
        {
            title: "资产数量",
            dataIndex: "count",
            width: "10%",
            valueType: "digit",
            align: "center",
            initialValue: 1,
            tooltip: "倘若选择条目型资产则无须更改"
        },
        {
            title: "使用期限",
            dataIndex: "deadline",
            width: "10%",
            valueType: "digit",
            align: "center",
            initialValue: 1,
            tooltip: "单位为天"
        },
        {
            title: "资产品类",
            dataIndex: "assetTree",
            width: "10%",
            align: "center",
            initialValue: props.asset_tree_node,
        },
        {
            title: "描述信息",
            dataIndex: "description",
            width: "15%",
            align: "center"
        },
        {
            title: "位置信息",
            dataIndex: "position",
            width: "10%",
            align: "center"
        },
        {
            title: "操作",
            valueType: "option",
            align: "center"
        },
    ];

    useEffect(()=> {
        fetchList();
    },[]);

    useEffect(()=> {
        fetchList();
    },[props.asset_tree_node]);

    const fetchList = () => {
        request(`/api/all_item_assets/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setAssetSelectList(res.data.map((val: any) => ({
                    ...val, label: val.id.toString() + " " + val.name, value: val.id,
                    disabled: val.expire,
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    }; 

    return (
        <DrawerForm width={"90%"}
            trigger={
                <Button className="asset-btn">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <PlusOutlined style={{marginRight:"5px"}}/>
                    批量创建
                    </div>
                </Button>
            }
            onFinish={async (values) => {
                console.log(values.dataSource);
                await request(
                    `/api/post_asset/${Cookies.get("sessionID")}`,
                    "POST",
                    values.dataSource.map((val: any) => ({
                        name: val.name ? val.name : "",
                        parent: val.parent ? val.parent : 0,
                        assetClass: val.assetClass ? val.assetClass : "",
                        user: props.user,
                        price: val.price ? val.price : 0.0,
                        description: val.description ? val.description : "",
                        position: val.position ? val.position : "",
                        expire: 0,
                        deadline: val.deadline ? val.deadline : 0,
                        count: val.assetClass === "1" ? val.count : 1,
                        assetTree: val.assetTree ? val.assetTree : "",
                        department: props.department,
                        richtext: ""
                    }))
                )
                    .then(() => {
                        message.success("资产批量创建成功！");
                        return true;
                    }
                    )
                    .catch((err) => {
                        message.error("资产创建失败" + err); 
                    });
                props.callback();
            }}
            drawerProps={{
                destroyOnClose: true,
            }}
            submitter={{
                searchConfig: {
                    submitText: "创建",
                    resetText: "取消",
                },
                resetButtonProps: {
                    className:"modalCancelBtn",
                },
                submitButtonProps: {
                    className:"modalConfirmBtn",
                },
            }}
        >            
            <ProForm.Group>
                <ProFormText
                    width={200}
                    name="name"
                    label="资产挂账人"
                    tooltip="资产挂账人默认为当前资产管理员"
                    initialValue={props.user}
                    placeholder={props.user}
                    disabled
                />
            </ProForm.Group>
            <ProForm.Item
                label="批量创建"
                name="dataSource"
                trigger="onValuesChange"
            >
                <EditableProTable<AssetType>
                    rowKey="id"
                    toolBarRender={false}
                    columns={columns}
                    
                    recordCreatorProps={{
                        newRecordType: "dataSource",
                        creatorButtonText: "新增资产信息",
                        style:{ fontFamily:"Tommy-regular"},
                        position: "top",
                        record: () => ({
                            id: Date.now(),
                        }),
                    }}
                    editable={{
                        type: "multiple",
                        editableKeys,
                        onChange: setEditableRowKeys,
                        actionRender: (__, _, dom) => {
                            return [dom.delete];
                        },
                    }}
                />
            </ProForm.Item>
        </DrawerForm>
    );
};

export default CreateAsset;