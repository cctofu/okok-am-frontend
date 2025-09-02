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

const ChangePassword = (props : Prop) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="修改密码"
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
                if(values.old_pass === values.new_pass){
                    message.error("修改错误");
                }
                else{
                    request(
                        `/api/user_password/${Cookies.get("sessionID")}`, 
                        "PUT",
                        {
                            oldpassword: MD5(values.old_pass).toString(),
                            newpassword: MD5(values.new_pass).toString(),
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
                }
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
                label="旧密码"
                name="old_pass"
                width="md"
                placeholder="请输入当前用户密码"
            >
                <Input.Password />
            </ProFormText>
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "必须填写新的密码"
                    },
                ]}
                label="新密码"
                name="new_pass"
                width="md"
                placeholder="请输入新的用户密码"
            >
                <Input.Password />
            </ProFormText>
        </ModalForm>
    );
};

export default ChangePassword;