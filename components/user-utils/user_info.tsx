import React, { useState } from "react";
import { Button, Descriptions, Modal, Tooltip } from "antd";
import {InfoCircleTwoTone} from "@ant-design/icons";

export interface UserProps {
    id?: number;
    name?: string;
    entity?: string;
    department?: string;
    character?: number;
    lock?: boolean;
    email?: string;
}

const UserInfo = (user: UserProps) => {
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const getCharacter = (character: any) => {
        switch(character) {
        case 1:
            return "普通用户";
        case 2:
            return "资产管理员";
        case 3:
            return "系统管理员";
        case 4:
            return "超级管理员";
        }
    };

    return (
        <>
            <Tooltip title={"查看详细信息"}>
                <Button icon={<InfoCircleTwoTone/>} onClick={showModal}></Button>
            </Tooltip>
            <Modal
                title="用户信息"
                open={open}
                onCancel={handleCancel}
                width = {800}
                footer={null}
            >
                <div style={{width:"100%"}}>
                    <Descriptions bordered>
                        <Descriptions.Item label="工号" labelStyle={{fontFamily:"Tommy-bold"}}>{user.id}</Descriptions.Item>
                        <Descriptions.Item label="姓名" labelStyle={{fontFamily:"Tommy-bold"}}>{user.name}</Descriptions.Item>
                        <Descriptions.Item label="权限" labelStyle={{fontFamily:"Tommy-bold"}}>{getCharacter(user.character)}</Descriptions.Item>
                        <Descriptions.Item label="企业" labelStyle={{fontFamily:"Tommy-bold"}} span={3}>{user.entity}</Descriptions.Item>
                        <Descriptions.Item label="部门" labelStyle={{fontFamily:"Tommy-bold"}} span={2}>{user.department}</Descriptions.Item>
                        <Descriptions.Item label="状态" labelStyle={{fontFamily:"Tommy-bold"}}>
                            {user.lock ? "锁定" : "正常"}
                        </Descriptions.Item>
                        <Descriptions.Item label="邮箱" labelStyle={{fontFamily:"Tommy-bold"}} span={3}>{user.email}</Descriptions.Item>
                    </Descriptions>
                </div>
            </Modal>
        </>
    );
};

export default UserInfo;

