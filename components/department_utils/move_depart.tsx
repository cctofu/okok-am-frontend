import { ControlTwoTone, QuestionCircleOutlined} from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { Button, Form, message, Select, Tooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";

export interface ModifyDepartmentProps {
    parent_department: string;
    cur_department: string;
    department_id: number;
    setDisableClick: React.Dispatch<React.SetStateAction<boolean>>;
    toggleNeedNewFetch: () => void;
}

interface DepartType{
    name: string;
}

const MoveDepartment = (props: ModifyDepartmentProps) => {
    const [form] = Form.useForm();
    const [search_department, setSearchDepartment] = useState<DepartType[]>([]);
    const [department, setDepartment] = useState("");
    const setTop = { value: "", label: "置为顶层部门" };

    useEffect(() => {
        fetchSearchInfo();
    }, []);

    const onBtnClick = () => {
        fetchSearchInfo();
        props.setDisableClick(true);
    };

    const setDisableFalse = () => {
        props.setDisableClick(false);
    };

    const fetchSearchInfo = () => {
        request(`/api/valid_parent_departments/${Cookies.get("sessionID")}/${props.cur_department}`, "GET")
            .then((res) => {
                setSearchDepartment(res.data.slice(1).map((val: any) => ({
                    ...val,
                    name: val.name,
                })));
            });
    };

    const departmentOptions = search_department.map((val: any) => ({
        value: val.name,
        label: val.name,
    }));

    const handleDepartChange = (val : any) =>{
        setDepartment(val);
    };

    return (
        <ModalForm
            title="转移部门"
            form={form}
            width={500}
            trigger={
                <Tooltip title={"转移部门"}>
                    <Button icon={<ControlTwoTone/>} onClick={onBtnClick} ></Button>
                </Tooltip>
            }
            submitter={{
                searchConfig: {
                    submitText: "转移",
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
                if(values.parent == props.parent_department){
                    message.error("不能将部门转移到自己");
                }
                else {
                    const session = Cookies.get("sessionID");
                    request(
                        `/api/department/${session}`, 
                        "PUT",
                        {
                            id: props.department_id,
                            parent: department,
                            name: props.cur_department,
                        }
                    )
                        .then(() => { 
                            message.success("转移成功");
                            props.toggleNeedNewFetch();
                            props.setDisableClick(false);
                        }
                        )
                        .catch((err) => {
                            message.error("错误: " + err);
                            props.setDisableClick(false);
                        });
                    return true;
                }}}>
            <div style={{display:"flex", flexDirection:"row"}}>
                <Select 
                    defaultValue="选择部门" 
                    style={{marginRight:"10px", width:"200px"}}
                    options={[setTop, ...departmentOptions]}
                    onChange={handleDepartChange}
                    showSearch/>
                <Tooltip title="请选择转移到的父部门名称">
                    <QuestionCircleOutlined style={{ color: "black" }} />
                </Tooltip>
            </div>
        </ModalForm>
    );
};

export default MoveDepartment;