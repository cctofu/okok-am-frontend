import { DiffTwoTone } from "@ant-design/icons";
import {
    DrawerForm,
    ProFormText,
    ProFormDigit,
    ProFormMoney,
    ProFormSelect
} from "@ant-design/pro-components";
import { Button, Form, message, Tooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

// interface ModifyAssetProp{
//     toggleNeedNewFetch?: () => void;
// }
interface modifyAssetProps {
    id?: number;
    name?: string;
    parent?: string;
    assetClass?: number;
    user?: string;
    price?: number;
    count?: number;
    assetTree?: string;
    expire?: boolean;
    description?: string;
    position?: string;
    department?: string;
    treeNode?: string | number;
    disabled?: boolean;
    callback: ()=> void,
}

interface AssetSelectType {
    label: string,
    value: number,
    disabled: boolean,
}

const ModifyAsset = (props: modifyAssetProps) => {
    const [form] = Form.useForm();
    const [assetSelectList, setAssetSelectList] = useState<AssetSelectType[]>([]);
    
    useEffect(()=> {
        fetchList();
    },[]);

    const fetchList = () => {
        request(`/api/all_item_assets/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setAssetSelectList(res.data.map((val: any) => ({
                    ...val, label: val.id.toString() + "." + val.name, value: val.id,
                    disabled: (val.expire || val.id === props.id),
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    }; 

    return (
        <DrawerForm
            title="修改资产实例信息"
            form={form}
            width="md"
            trigger={
                <Tooltip title={"修改资产实例信息"}>
                    <Button icon={<DiffTwoTone/>} disabled={props.disabled}></Button>
                </Tooltip>
            }
            autoFocusFirstInput
            drawerProps={{
                destroyOnClose: true,
            }}
            onFinish={async (values) => {
                console.log(values);
                const session = Cookies.get("sessionID");
                await request(
                    `/api/asset/${session}`,
                    "PUT",
                    {
                        id: props.id,
                        parent: values.parent ? values.parent : 0,
                        name: values.name,
                        assetClass: props.assetClass,
                        user: props.user,
                        price: values.price,
                        description: values.description,
                        position: values.position,
                        expire: props.expire,
                        count: values.count,
                        userDefined: "",
                        assetTree: values.assetTree,
                        department: props.department,
                    }
                )
                    .then(() => {
                        message.success("修改成功!");
                    }
                    )
                    .catch((err) => {
                        message.error("错误:" + err);
                    });
                props.callback();
                return true;
            }}
        >
            <ProFormText
                rules={[
                    {
                        required: true,
                    },
                ]}
                name="name"
                width="md"
                label="资产名"
                placeholder="请输入资产名"
                initialValue={props.name}
            />
            <ProFormSelect
                rules={[
                    {
                        required: false,
                    },
                ]}
                options={assetSelectList}
                width="md"
                name="parent"
                label="资产从属"
                placeholder="请输入资产从属"
                showSearch
            />
            <ProFormMoney
                rules={[
                    {
                        required: true,
                    },
                ]}
                width={100}
                name="price"
                label="资产价值"
                placeholder="请输入资产价值"
                initialValue={props.price}
            />
            <ProFormDigit
                rules={[
                    {
                        required: true,
                    },
                ]}
                width={100}
                name="count"
                label="资产数量"
                placeholder="请输入资产数量"
                initialValue={props.count}
                
            />
            <ProFormText
                rules={[
                    {
                        required: true,
                    },
                ]}
                width="md"
                name="assetTree"
                label="资产品类"
                placeholder="请输入资产品类"
                initialValue={props.assetTree}
            />
            <ProFormText
                rules={[
                    {
                        required: false,
                    },
                ]}
                width="md"
                name="description"
                label="描述信息"
                placeholder="请输入描述信息"
                initialValue={props.description}
            />
            <ProFormText
                rules={[
                    {
                        required: false,
                    },
                ]}
                width="md"
                name="position"
                label="位置信息"
                placeholder="请输入位置信息"
                initialValue={props.position}
            />
        </DrawerForm>
    );
};

export default ModifyAsset;