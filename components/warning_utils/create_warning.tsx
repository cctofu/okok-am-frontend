import { WarningTwoTone } from "@ant-design/icons";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Button, Form, Input, message, Tooltip } from "antd";
import { request } from "@/utils/network";
import Cookies from "js-cookie";

interface WarningProps {
    asset: string;
    cur_amount: number;
    cur_date: number;
    count: number;
    id: number;
    toggleNeedNewFetch: () => void;
}

const CreateWarning = (props: WarningProps) => {
    const [form] = Form.useForm();

    console.log("AMOUNT: " + props.cur_amount);
    console.log("DATE: " + props.cur_date);

    return (
        <ModalForm
            title={(props.cur_amount === -1 && props.cur_date === -1)?  "Create new warning rule" : "Modify warning rules"}
            form={form}
            width={400}
            style={{fontFamily:"Tommy-regular"}}
            trigger={
                <Tooltip title={"设置告警值"}>
                    <Button icon={<WarningTwoTone/>}></Button>
                </Tooltip>
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
                const session = Cookies.get("sessionID");
                let date_: string | number = -1;
                let amount_: string | number = -1;
                if((values.date === "" && values.amount === "")){
                    message.error("至少需要制定一个告警策略");
                }
                else if((values.date !== "" && isNaN(values.date)) || (values.amount !== "" && isNaN(values.amount))) {
                    message.error("告警日期或者数量必须为数字");
                }
                else {
                    if(values.date !== ""){
                        date_ = values.date;
                    }
                    if(values.amount !== ""){
                        amount_ = values.amount;
                    }
                    request(
                        `/api/warning/${session}`, 
                        "PUT",
                        {
                            date: date_,
                            amount: amount_,
                            id: props.id,
                        }
                    )
                        .then(() => { 
                            message.success("成功指定告警策略");
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
            <text>资产名称:</text>
            <ProFormText
                rules={[
                    {
                        required: true,
                    },
                ]}
                name="name"
                width="md"
                initialValue={props.asset}
                disabled={true}
            >
                <Input />
            </ProFormText>

            <text> 为资产设置告警日期: </text>
            <ProFormText
                name="date"
                width="md"
                placeholder="Please date at which to warn user"
                initialValue={props.cur_date === -1? "" : props.cur_date}
            >
                <Input />
            </ProFormText>

            <text>还剩下
                <span className="home-right-user-info"> {props.count} </span> 
                个
                <span className="home-right-user-info"> {props.asset} </span>
            </text>
            <ProFormText
                name="amount"
                width="md"
                placeholder="Please amount at which to warn user"
                initialValue={props.cur_amount === -1? "" : props.cur_amount}
            >
                <Input />
            </ProFormText>
        </ModalForm>
    );
};

export default CreateWarning;