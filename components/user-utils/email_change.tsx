import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { MD5 } from "crypto-js";

interface Prop {
    toggleNeedNewFetch: () => void;
}

const ChangeEmail = (props : Prop) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="修改邮箱"
            form={form}
            width={500}
            trigger={
                <Button className="home-left-edit">修改</Button>
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
                    `/api/user_email/${Cookies.get("sessionID")}`, 
                    "PUT",
                    {
                        oldpassword: MD5(values.password).toString(),
                        email: values.email,
                    }
                )
                    .then((res) => {
                        console.log(res);
                        message.success("修改成功");
                        props.toggleNeedNewFetch();
                    }
                    )
                    .catch((err) => {
                        message.error("错误: " + err);
                    });
                return true;
            }}
        >
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "必须填写当前密码"
                    },
                ]}
                label="密码"
                name="password"
                width="md"
                placeholder="请输入当前用户密码"
            >
                <Input.Password />
            </ProFormText>
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "必须填写新的邮箱"
                    },
                ]}
                label="新邮箱"
                name="email"
                width="md"
                placeholder="请输入新的邮箱"
            >
            </ProFormText>
        </ModalForm>
    );
};

export default ChangeEmail;