import { EditOutlined, BankOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface entityProps {
    id?: number;
    name: string;
    toggleNeedNewFetch: () => void;
}

const RenameEntity = (props: entityProps) => {
    const [form] = Form.useForm();

    return (
        <ModalForm
            title="重新命名企业"
            form={form}
            width={500}
            trigger={
                <Button className="rename-entity-btn">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <EditOutlined style={{marginRight:"5px"}}/>
                        修改企业名字
                    </div>
                </Button>
            }
            submitter={{
                searchConfig: {
                    submitText: "更改",
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
                if(values.name == props.name){
                    message.error("错误: 新名字不能相同");
                    return false;
                }
                else{
                    request(
                        `/api/entity/${Cookies.get("sessionID")}`, 
                        "PUT",
                        {
                            id: props.id,
                            name: values.name,
                        }
                    )
                        .then(() => {
                            message.success("更改成功");
                            props.toggleNeedNewFetch();
                        }
                        )
                        .catch((err) => {
                            message.error("错误: " + err);
                        });
                    return true;
                }
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
                initialValue={props.name}
                placeholder="请输入新的企业名字"
            >
                <Input prefix = {<BankOutlined/>}/>
            </ProFormText>
        </ModalForm>
    );
};

export default RenameEntity;