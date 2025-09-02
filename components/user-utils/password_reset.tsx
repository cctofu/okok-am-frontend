import { EditTwoTone, UserOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, message, Tooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { MD5 } from "crypto-js";

export interface passwordResetProps {
    id?: number;
    name?: string;
    entity?: string;
    department?: string;
    character?: number;
    session?: string;
    lock?: boolean;
    email?: string;
}

const PasswordReset = (props: passwordResetProps) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="重置用户密码"
            width={500}
            form={form}
            trigger={
                <Tooltip title={"重置密码"}>
                    <Button icon={<EditTwoTone/>} ></Button>
                </Tooltip>
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
            }}
            onFinish={async (values) => {
                const session = Cookies.get("sessionID");
                await request(
                    `/api/user/${session}`, 
                    "PUT",
                    {
                        id: props.id,
                        name: props.name,
                        password: MD5(values.password).toString(),
                        entity: props.entity,
                        department: props.department,
                        character: props.character,
                        lock: props.lock,
                        session: "",
                        email: props.email
                    }
                )
                    .then((res) => { 
                        message.success("密码修改成功!");
                        console.log(res);
                    }
                    )
                    .catch((err) => {
                        message.error("密码修改失败" + err);
                        console.log("error: " + err);
                    });
                console.log(values);
                return true;
            }}
        >
            <ProFormText
                rules={[
                    {
                        required: true,
                    },
                ]}
                name="password"
                width="md"
                label="重置用户密码"
                placeholder="请输入新密码"
            >
                <Input.Password prefix={<UserOutlined/>} />
            </ProFormText>
        </ModalForm>
    );
};

export default PasswordReset;