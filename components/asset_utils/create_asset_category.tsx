import { PlusOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
//import { useRouter } from "next/router";
import Cookies from "js-cookie";

interface createAssetCategotyProps {
    department?: string,
    parent?: string | number,
    type?: boolean,
    callback: () => void,
}

const CreateAssetCategory = (props: createAssetCategotyProps) => {
    const [form] = Form.useForm();
    //const router = useRouter();

    return (
        <ModalForm
            title="创建新的资产品类"
            form={form}
            width={500}
            trigger={
                <Button 
                    type="primary" 
                    disabled={props.type ? false : true}
                    className="asset-btn">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <PlusOutlined style={{marginRight:"5px"}}/>
                    创建分类
                    </div>
                </Button>
            }
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
            }}
            onFinish={async (values) => {
                await request(
                    `/api/asset_tree/${Cookies.get("sessionID")}`, 
                    "POST",
                    {
                        name: values.name,
                        parent: props.parent,
                        department: props.department,
                    }
                )
                    .then((res) => {
                        console.log(res);
                        message.success("成功创建");
                        //router.reload();
                    }
                    )
                    .catch((err) => {
                        message.error("创建失败" + err);
                        console.log("error: " + err);
                    });
                console.log(values);
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
                label="资产品类"
                placeholder="请输入资产品类的名称"
            />
        </ModalForm>
    );
};

export default CreateAssetCategory;