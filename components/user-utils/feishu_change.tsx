import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface LinkFeishuProps {
    name: string;
    phone: string;
    toggleNeedNewFetch: () => void;
}

const LinkFeishu = (props : LinkFeishuProps) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="关联飞书账户"
            form={form}
            width={500}
            trigger={
                <Button className="home-left-edit">修改</Button>
            }
            submitter={{
                searchConfig: {
                    submitText: "关联",
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
                        feishu_name: values.name,
                        feishu_phone: values.phone,
                    }
                )
                    .then((res) => {
                        console.log(res);
                        message.success("成功关联");
                        props.toggleNeedNewFetch();
                    }
                    )
                    .catch((err) => {
                        message.error("错误: " + err);
                    });
                console.log(values);
                return true;
            }}
        >
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "飞书用户名不能为空"
                    },
                ]}
                name="name"
                width="md"
                label="飞书用户名"
                placeholder="请输入飞书账户用户名"
                initialValue={props.name}
            />
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "飞书电话号不能为空"
                    },
                ]}
                name="phone"
                width="md"
                label="飞书电话"
                placeholder="请输入飞书账户电话号码"
                initialValue={props.phone}
            />
        </ModalForm>
    );
};

export default LinkFeishu;