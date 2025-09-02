import { EditTwoTone, BankOutlined } from "@ant-design/icons";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Button, Form, Input, message, Tooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import React from "react";

export interface ModifyDepartmentProps {
    parent_department: string;
    cur_department: string;
    department_id: number;
    setDisableClick: React.Dispatch<React.SetStateAction<boolean>>;
    toggleNeedNewFetch: () => void;
}

const ModifyDepartment = (props: ModifyDepartmentProps) => {
    const [form] = Form.useForm();

    const onBtnClick = () => {
        props.setDisableClick(true);
    };

    const setDisableFalse = () => {
        props.setDisableClick(false);
    };

    return (
        <ModalForm
            title="更改部门名称"
            form={form}
            width={500}
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
            trigger={
                <Tooltip title={"修改名称"}>
                    <Button icon={<EditTwoTone/>} onClick={onBtnClick} ></Button>
                </Tooltip>
            }
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                afterClose: setDisableFalse,
            }}
            onAbort={setDisableFalse}
            onFinish={async (values) => {
                if(values.name == props.cur_department){
                    message.error("错误: 新名字不能相同");
                }
                else {
                    const session = Cookies.get("sessionID");
                    request(
                        `/api/department/${session}`, 
                        "PUT",
                        {
                            id: props.department_id,
                            parent: props.parent_department,
                            name: values.name,
                        }
                    )
                        .then(() => { 
                            message.success("修改成功");
                            props.toggleNeedNewFetch();
                            props.setDisableClick(false);
                        }
                        )
                        .catch((err) => {
                            message.error("错误: " + err);
                            props.setDisableClick(false);
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
                placeholder="请输入新的部门名称"
                initialValue={props.cur_department}
            >
                <Input prefix={<BankOutlined/>} />
            </ProFormText>
        </ModalForm>
    );
};

export default ModifyDepartment;