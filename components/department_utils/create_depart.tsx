import { PlusCircleFilled } from "@ant-design/icons";
import {
    ModalForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import React from "react";

interface CreateDepartmentProps{
    cur_department: string;
    toggleNeedNewFetch: () => void;
}

const CreateDepartment = (props : CreateDepartmentProps) => {
    const [form] = Form.useForm();
    const [entity, setEntity] = useState<string>("placeholder_entity");

    useEffect(() => {
        getEntity();
    }, []);

    const getEntity = () => {
        request(
            `/api/cur_entity/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => { 
                setEntity(res.data.entityName);
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    return (
        <ModalForm
            title="创建部门"
            form={form}
            width={500}
            trigger={
                <Button className="addBtn">
                    <PlusCircleFilled style={{ fontSize: "40px", color:"black"}}/>
                </Button>
            }
            autoFocusFirstInput
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
            modalProps={{
                destroyOnClose: true,
                closable: false,
            }}
            onFinish={async (values) => {
                const session = Cookies.get("sessionID");
                request(
                    `/api/department/${session}`,
                    "POST",
                    {
                        name: values.name,
                        entity: entity,
                        parent: props.cur_department === entity? "" : props.cur_department,
                    }
                )
                    .then(() => {
                        message.success("创建成功");
                        props.toggleNeedNewFetch();
                    }
                    )
                    .catch((err) => {
                        message.error("错误:" + err);
                    });
                
                return true;
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
                placeholder="请输入新部门的名字"
            />
        </ModalForm>
    );
};

export default CreateDepartment;