import { Button, Form, Input, message, Tooltip} from "antd";
import { CloseCircleTwoTone } from "@ant-design/icons";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import React from "react";
import { ModalForm, ProFormText } from "@ant-design/pro-components";

interface DeleteDepartmentProps {
    cur_department: string;
    setDisableClick: React.Dispatch<React.SetStateAction<boolean>>;
    toggleNeedNewFetch: () => void;
}

const DeleteDepartment = (props : DeleteDepartmentProps) => {
    const [form] = Form.useForm();

    const onBtnClick = () => {
        props.setDisableClick(true);
    };

    const setDisableFalse = () => {
        props.setDisableClick(false);
    };

    return (
        <div>
            <ModalForm
                title="请输入 'CONFIRM' 删除当前部门"
                form={form}
                width={500}
                trigger={
                    <Tooltip title={"删除"}>
                        <Button icon={<CloseCircleTwoTone/>} onClick={onBtnClick} ></Button>
                    </Tooltip>
                }
                submitter={{
                    searchConfig: {
                        submitText: "删除",
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
                    afterClose: setDisableFalse,
                }}
                onAbort={setDisableFalse}
                onFinish={async (values) => {
                    if(values.confirm == "CONFIRM"){
                        request(
                            `/api/department/${Cookies.get("sessionID")}/${props.cur_department}`,
                            "DELETE",
                        )
                            .then(() => { 
                                message.success("删除成功");
                                props.toggleNeedNewFetch();
                            })
                            .catch((err) => {
                                message.error("错误:" + err.message);
                            });
                        props.setDisableClick(false);
                    }
                    else {
                        message.error("请检查输入，确保是 CONFIRM");
                    }
                    return true;
                }}
            >
                <ProFormText
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    name="confirm"
                    width="md"
                    placeholder="输入 CONFIRM"
                ><Input prefix={<CloseCircleTwoTone/>}/>
                </ProFormText>
            </ModalForm>
        </div>
    );
};

export default DeleteDepartment;