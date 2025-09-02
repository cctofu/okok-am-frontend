import { PlusCircleFilled } from "@ant-design/icons";
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface CreateProps{
    toggleNeedNewFetch: () => void;
}

const CreateEntity = (props : CreateProps) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="创建新的企业"
            form={form}
            width={500}
            trigger={
                <Button className="addBtn">
                    <PlusCircleFilled style={{ fontSize: "40px", color:"black"}}/>
                </Button>
            }
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
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                closable: false,
            }}
            onFinish={async (values) => {
                request(
                    `/api/entity/${Cookies.get("sessionID")}`, 
                    "POST",
                    {
                        name: values.name,
                    }
                )
                    .then(() => {
                        message.success("创建成功");
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
                        message: "创建企业必须填写名字"
                    },
                ]}
                name="name"
                width="md"
                placeholder="请输入新企业的名字"
            />
        </ModalForm>
    );
};

export default CreateEntity;