import { MinusOutlined } from "@ant-design/icons";
import {
    ModalForm,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
//import { useRouter } from "next/router";
import Cookies from "js-cookie";

interface deleteAssetCategotyProps {
    name?: string | number,
    type?: boolean,
    callback: () => void,
}

const DeleteAssetCategory = (props: deleteAssetCategotyProps) => {
    const [form] = Form.useForm();
    //const router = useRouter();

    return (
        <ModalForm
            title={`你确定要删除资产品类 ${props.name} 吗?`}
            form={form}
            width={500}
            trigger={
                <Button 
                    type="primary" 
                    disabled={props.type ? false : true}
                    className="asset-btn">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <MinusOutlined style={{marginRight:"5px"}}/>
                    删除分类
                    </div>
                </Button>
            }
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
            }}
            onFinish={async (values) => {
                await request(
                    `/api/sub_asset_tree/${Cookies.get("sessionID")}/${props.name}`, 
                    "DELETE",
                )
                    .then((res) => {
                        console.log(res);
                        message.success("删除成功!");
                        //router.reload();
                    }
                    )
                    .catch((err) => {
                        message.error("删除错误" + err);
                        console.log("error: " + err);
                    });
                console.log(values);
                props.callback();
                return true;
            }}
        >
        </ModalForm>
    );
};

export default DeleteAssetCategory;