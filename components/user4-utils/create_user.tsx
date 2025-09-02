import { PlusCircleFilled } from "@ant-design/icons";
import {
    DrawerForm,
    ProFormSelect,
    ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, message } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import { MD5 } from "crypto-js";
import { useEffect, useState } from "react";

interface entityValues {
    value: string,
    label: string,
}

interface CreateUserProp{
    toggleNeedNewFetch: () => void;
}

const CreateUser4 = (props : CreateUserProp) => {
    const [form] = Form.useForm();
    const [entityValues, setEntityValues] = useState<entityValues[]>([]);

    useEffect(()=>{
        fetchList();
    },[]);

    const fetchList = () => {
        request(`/api/entity/${Cookies.get("sessionID")}`, "GET")
            .then((res) => {
                setEntityValues(res.data.map((val: any) => ({ 
                    value: val.name,
                    lable: val.name
                })));
            })
            .catch((err) => {
                message.error("错误: " + err);
            });
    };

    return (
        <DrawerForm
            title="创建新用户"
            form={form}
            width="md"
            trigger={
                <Button className="addBtn">
                    <PlusCircleFilled style={{ fontSize: "40px", color:"black"}}/>
                </Button>
            }
            autoFocusFirstInput
            drawerProps={{
                destroyOnClose: true,
                closable: false,
            }}
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
            onFinish={async (values) => {
                console.log(values);
                const session = Cookies.get("sessionID");
                await request(
                    `/api/user/${session}`,
                    "POST",
                    {
                        name: values.name,
                        password: MD5(values.password).toString(),
                        entity: values.entity,
                        department: "",
                        character: 3,
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
            >
                <Input.Password placeholder="请输入密码"/>
            </ProFormText>
            <ProFormSelect
                rules={[
                    {
                        required: true,
                        message: "用户必须属于企业" 
                    },
                ]}
                width="md"
                name="entity"
                options={entityValues}
                label="用户所属企业"
                placeholder="请选择用户所属企业"
            />
            <ProFormText
                disabled
                width="md"
                name="department"
                label="部门"
                placeholder="超级管理员不能制定部门"
            />
            <ProFormText
                disabled
                initialValue="系统管理员"
                width="sm"
                name="character"
                label="用户类型"
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

export default CreateUser4;