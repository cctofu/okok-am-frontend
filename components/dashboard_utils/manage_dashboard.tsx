import React, { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Select, Space, message } from "antd";
import { request } from "@/pages";
import Cookies from "js-cookie";

const { Panel } = Collapse;

interface ManageProps{
    toggleNeedNewFetch: () => void;
}

interface FormValue {
    title: string,
    link: string,
}

const ManageDepartment = (props : ManageProps) => {
    const [entity, setEntity] = useState<string>("EntityName");

    const [initValue1, setInitValue1] = useState<FormValue[]>();
    const [initValue2, setInitValue2] = useState<FormValue[]>();
    const [initValue3, setInitValue3] = useState<FormValue[]>();

    const [caneditlevel1, setEditLevel1] = useState<boolean>(false);
    const [caneditlevel2, setEditLevel2] = useState<boolean>(false);
    const [caneditlevel3, setEditLevel3] = useState<boolean>(false);

    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();

    useEffect(() => {
        getEntity();
        getInfo();
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

    const getInfo = () => {
        request(
            `/api/url/${Cookies.get("sessionID")}`,
            "GET",
        )
            .then((res) => {
                //get res
                setInitValue1(res.data.filter((val:any) => val.authority_level == 1 
                                                        && !val.name.includes("default")
                                                        && val.name !== ""
                ).map((val:any) => ({
                    ...val,
                    title: val.name,
                    link: val.url,
                })));
                setInitValue2(res.data.filter((val:any) => val.authority_level == 2 
                                                        && !val.name.includes("default")
                                                        && val.name !== ""
                ).map((val:any) => ({
                    ...val,
                    title: val.name,
                    link: val.url,
                })));
                setInitValue3(res.data.filter((val:any) => val.authority_level == 3 
                                                        && !val.name.includes("default")
                                                        && val.name !== ""
                ).map((val:any) => ({
                    ...val,
                    title: val.name,
                    link: val.url,
                })));
            })
            .catch((err) => {
                console.log("error: " + err);
            });
    };

    const getData = (values : any, level : number) : any => {
        console.log(values);
        let data = [
            {
                entity: entity,
                name: values[0].title,
                url: values[0].link,
                character: level
            },
            {
                entity: entity,
                name: values[1].title,
                url: values[1].link,
                character: level
            },
            {
                entity: entity,
                name: values[2].title,
                url: values[2].link,
                character: level
            },
            {
                entity: entity,
                name: values[3].title,
                url: values[3].link,
                character: level
            },
            {
                entity: entity,
                name: values[4].title,
                url: values[4].link,
                character: level
            }
        ];
        return data;
    };

    //BEGIN 1
    const onFinish1 = (values: any) => {
        if(caneditlevel1 == false){
            setEditLevel1(true);
        }
        else{
            let currentId = 1;
            const linkList = values.LinkList1.slice();
            while(linkList.length < 5){
                linkList.push({ title: `default${currentId}`, link: `default${currentId}.cn` });
                currentId++;
            }
            request(
                `/api/url/${Cookies.get("sessionID")}`,
                "PUT",
                getData(linkList, 1),
            )
                .then(() => { 
                    message.success("成功");
                    setEditLevel1(false);
                })
                .catch((err) => {
                    message.error("错误: " + err);
                });
        }
    };
    const buttonTitle1 = caneditlevel1 ? "保存" : "修改";
    //END 1

    //BEGIN 2
    const onFinish2 = (values: any) => {
        if(caneditlevel2 == false){
            setEditLevel2(true);
        }
        else{
            let currentId = 1;
            const linkList = values.LinkList2.slice();
            while(linkList.length < 5){
                linkList.push({ title: `default${currentId}`, link: `default${currentId}.cn` });
                currentId++;
            }
            request(
                `/api/url/${Cookies.get("sessionID")}`,
                "PUT",
                getData(linkList, 2),
            )
                .then(() => { 
                    message.success("成功");
                    setEditLevel2(false);
                })
                .catch((err) => {
                    message.error("错误: " + err);
                });
        }
    };
    const buttonTitle2 = caneditlevel2 ? "保存" : "修改";
    //END 2

    //BEGIN 3
    const onFinish3 = (values: any) => {
        if(caneditlevel3 == false){
            setEditLevel3(true);
        }
        else{
            let currentId = 1;
            const linkList = values.LinkList3.slice();
            while(linkList.length < 5){
                linkList.push({ title: `default${currentId}`, link: `default${currentId}.cn` });
                currentId++;
            }
            request(
                `/api/url/${Cookies.get("sessionID")}`,
                "PUT",
                getData(linkList, 3),
            )
                .then(() => { 
                    message.success("成功");
                    props.toggleNeedNewFetch();
                    setEditLevel3(false);
                })
                .catch((err) => {
                    message.error("错误: " + err);
                });
            
        }
    };
    const buttonTitle3 = caneditlevel3 ? "保存" : "修改";
    //END 3

    const selectBefore = (
        <Select defaultValue="1"
            options={[
                { value: "1", label: "https://" },
                { value: "2", label: "http://" },
            ]}>
        </Select>
    );

    return(
        <div className="man-dash-content">
            <text className="man-dash-title">应用管理</text>
            <Collapse accordion className="man-dash-collapse">
                <Panel header="制定普通用户应用" key="1">
                    <Form
                        form={form1}
                        name="link_form"
                        onFinish={onFinish1}
                        style={{ width: "100%", height:"300px"}}
                        autoComplete="off"
                        disabled={!caneditlevel1}
                        initialValues={{
                            LinkList1: initValue1
                        }}
                    >
                        <Form.Item>
                            <div style={{justifyContent: "space-between", display:"flex"}}>
                                <text style={{fontFamily:"Tommy-regular"}}>每种用户最多只能有5个应用</text>
                                <Button disabled={false} className="editLinkBtn" htmlType='submit'>{buttonTitle1}</Button>
                            </div>
                        </Form.Item>

                        <Form.List name="LinkList1">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} align="baseline" className="form-input" style={{display: "flex", alignItems: "center"}}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "title"]}
                                                rules={[{ required: true, message: "请输入名称" }]}
                                            >
                                                <Input placeholder="应用名称" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "link"]}
                                                rules={[{ required: true, message: "请输入连接"}]}
                                            >
                                                <Input addonBefore={selectBefore} placeholder="输入网页地址"/>
                                            </Form.Item>
                                            <MinusCircleOutlined hidden={!caneditlevel1} onClick={() => remove(name)} style={{paddingBottom:"80%"}}/>
                                        </Space>
                                    ))}
                                    <Form.Item style={{width:"90%"}}>
                                        <Button 
                                            onClick={() => add()} 
                                            block icon={<PlusOutlined />} 
                                            disabled={fields.length == 5 || !caneditlevel1}
                                            className="addLinkBtn">
                                            添加应用
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Panel>

                <Panel header="制定资产管理员应用" key="2">
                    <Form
                        form={form2}
                        name="link_form"
                        onFinish={onFinish2}
                        style={{ width: "100%", height:"300px"}}
                        autoComplete="off"
                        disabled={!caneditlevel2}
                        initialValues={{
                            LinkList2: initValue2
                        }}
                    >
                        <Form.Item>
                            <div style={{justifyContent: "space-between", display:"flex"}}>
                                <text style={{fontFamily:"Tommy-regular"}}>每种用户最多只能有5个应用</text>
                                <Button disabled={false} className="editLinkBtn" htmlType='submit'>{buttonTitle2}</Button>
                            </div>
                        </Form.Item>

                        <Form.List name="LinkList2">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} align="baseline" className="form-input" style={{display: "flex", alignItems: "center"}}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "title"]}
                                                rules={[{ required: true, message: "请输入名称" }]}
                                            >
                                                <Input placeholder="应用名称" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "link"]}
                                                rules={[{ required: true, message: "请输入连接"}]}
                                            >
                                                <Input addonBefore={selectBefore} placeholder="输入网页地址" />
                                            </Form.Item>
                                            <MinusCircleOutlined hidden={!caneditlevel2} onClick={() => remove(name)} style={{paddingBottom:"80%"}}/>
                                        </Space>
                                    ))}
                                    <Form.Item style={{width:"90%"}}>
                                        <Button 
                                            onClick={() => add()} 
                                            block icon={<PlusOutlined />} 
                                            disabled={fields.length == 5 || !caneditlevel2}
                                            className="addLinkBtn">
                                            添加应用
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Panel>

                <Panel header="制定系统管理员应用" key="3">
                    <Form
                        form={form3}
                        name="link_form"
                        onFinish={onFinish3}
                        style={{ width: "100%", height:"300px"}}
                        autoComplete="off"
                        disabled={!caneditlevel3}
                        initialValues={{
                            LinkList3: initValue3
                        }}
                    >
                        <Form.Item>
                            <div style={{justifyContent: "space-between", display:"flex"}}>
                                <text style={{fontFamily:"Tommy-regular"}}>每种用户最多只能有5个应用</text>
                                <Button disabled={false} className="editLinkBtn" htmlType='submit'>{buttonTitle3}</Button>
                            </div>
                        </Form.Item>

                        <Form.List name="LinkList3">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} align="baseline" className="form-input" style={{display: "flex", alignItems: "center"}}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "title"]}
                                                rules={[{ required: true, message: "请输入名称" }]}
                                            >
                                                <Input placeholder="应用名称" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "link"]}
                                                rules={[{ required: true, message: "请输入连接"}]}
                                            >
                                                <Input addonBefore={selectBefore} placeholder="输入网页地址" />
                                            </Form.Item>
                                            <MinusCircleOutlined hidden={!caneditlevel3} onClick={() => remove(name)} style={{paddingBottom:"80%"}}/>
                                        </Space>
                                    ))}
                                    <Form.Item style={{width:"90%"}}>
                                        <Button 
                                            onClick={() => add()} 
                                            block icon={<PlusOutlined />} 
                                            disabled={fields.length == 5 || !caneditlevel3}
                                            className="addLinkBtn">
                                            添加应用
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Panel>
            </Collapse>
        </div>
    );
};

export default ManageDepartment;