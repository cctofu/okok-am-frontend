import {
    ModalForm,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface LinkFeishuProps {
    user_name: string;
    feishu_name: string;
    toggleNeedNewFetch: () => void;
}

const DisconnetFeishu = (props : LinkFeishuProps) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="关联飞书账户"
            form={form}
            width={500}
            trigger={
                <Button className="home-left-edit" disabled={props.feishu_name === ""}>解绑</Button>
            }
            submitter={{
                searchConfig: {
                    submitText: "确认",
                    resetText: "取消",
                },
                resetButtonProps: {
                    className:"modalCancelBtn",
                },
                submitButtonProps: {
                    className:"modalConfirmBtn",
                },
            }}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                closable: false,
            }}
            onFinish={async (values) => {
                request(
                    `/api/feishu_name/${Cookies.get("sessionID")}`, 
                    "PUT",
                    {
                        feishu_name: "",
                        feishu_phone: "",
                    }
                )
                    .then(() => {
                        message.success("解除成功");
                        props.toggleNeedNewFetch();
                    })
                    .catch((err) => {
                        message.error("错误: " + err);
                    });
                console.log(values);
                return true;
            }}
        >
            <text style={{fontFamily:"Tommy-regular", fontSize:"18px"}}>
                确认解除用户
                <span style={{color:"rgb(184, 150, 27)"}}> {props.user_name} </span>
                与飞书账户
                <span style={{color:"rgb(184, 150, 27)"}}> {props.feishu_name} </span>
                的绑定关系吗
            </text>
        </ModalForm>
    );
};

export default DisconnetFeishu;