import { PlusCircleTwoTone } from "@ant-design/icons";
import {
    DrawerForm,
    ProFormSelect,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, Tooltip, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { MD5 } from "crypto-js";
import React from "react";

interface CreateUserProp{
    entity: string;
    department: string;
    setDisableClick: React.Dispatch<React.SetStateAction<boolean>>;
    toggleNeedNewFetch: () => void;
}

const CreateDepartmentUser = (props : CreateUserProp) => {
    const [form] = Form.useForm();

    const onBtnClick = () => {
        props.setDisableClick(true);
    };

    const setDisableFalse = () => {
        props.setDisableClick(false);
    };

    return (
        <DrawerForm
            title="创建用户"
            form={form}
            width="md"
            trigger={
                <Tooltip title={"在此部门添加用户"}>
                    <Button icon={<PlusCircleTwoTone/>} onClick={onBtnClick}></Button>
                </Tooltip>
            }
            submitter={{
                searchConfig: {
                    submitText: "创建",
                    resetText: "取消",
                },
                resetButtonProps: {
                    className:"formCancelBtn",
                },
                submitButtonProps: {
                    className:"formConfirmBtn",
                },
            }}
            autoFocusFirstInput
            drawerProps={{
                destroyOnClose: true,
                onClose: setDisableFalse,
            }}
            onFinish={async (values) => {
                const session = Cookies.get("sessionID");

                await request(
                    `/api/user/${session}`,
                    "POST",
                    {
                        name: values.name,
                        password: MD5(values.password).toString(),
                        entity: values.entity,
                        department: values.department,
                        character: values.character,
                        lock: false,
                        session: "",
                        email: values.email
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
                        message: "用户名不能为空" 
                    },
                ]}
                name="name"
                width="md"
                label="用户名"
                placeholder="请输入用户名"
            />
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "密码不能为空"
                    },
                ]}
                width="md"
                name="password"
                label="密码"
                placeholder="请输入密码"
            >
                <Input.Password placeholder="请输入密码"/>
            </ProFormText>
            <ProFormText
                width="md"
                name="entity"
                label="用户所属企业"
                disabled={true}
                initialValue={props.entity}
            />
            <ProFormText
                width="md"
                name="department"
                label="用户所属部门"
                disabled={true}
                initialValue={props.department}
            />
            <ProFormSelect
                rules={[
                    {
                        required: true,
                        message: "用户必须制定类型"
                    },
                ]}
                options={[
                    {
                        value: 1,
                        label: "普通用户",
                    },
                    {
                        value: 2,
                        label: "资产管理员",
                    },
                    {
                        value: 3,
                        label: "系统管理员",
                        disabled: true,
                    },
                ]}
                width="sm"
                name="character"
                label="用户类型"
                placeholder="请选择用户类型"
            />
            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "邮箱不能为空" 
                    },
                ]}
                width="md"
                name="email"
                label="邮箱"
                placeholder="请输入有效邮箱"
            />
        </DrawerForm>
    );
};

export default CreateDepartmentUser;