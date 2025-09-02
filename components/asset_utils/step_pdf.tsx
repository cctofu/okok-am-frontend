import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Input, InputRef, message, Modal, Result, Space, Steps, Tag, theme, Tooltip } from "antd";
import { BulbOutlined, PlusOutlined, UserOutlined, InfoCircleOutlined, RightSquareTwoTone, SaveOutlined, SmileOutlined} from "@ant-design/icons";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const colorList = ["volcano", "magenta", "cyan", "geekblue", "lime", "purple"];

const tagsData = ["名称", "编号", "从属", "所有人", "部门", "类型", "品类", "价格", "数量", "描述", "位置"];

const StepCustomize =  () => {
    const [open, setOpen] = useState(false);
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [title, setTitle] = useState<string>(String(Cookies.get("title")));
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>(["名称"]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState("");
    const [timeTick, setTimeTick] = useState(3);
    const inputRef = useRef<InputRef>(null);
    const editInputRef = useRef<InputRef>(null);
    const router = useRouter();


    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const changeTitle = (event: any) => {
        setTitle(event.target.value);
    };

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
        if(Cookies.get("tags")){
            setTags(JSON.parse(String(Cookies.get("tags"))));
        }
    }, [inputVisible]);

    useEffect(() => {
        editInputRef.current?.focus();
    }, [inputValue]);

    const handleClose = (removedTag: string) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        console.log(newTags);
        setTags(newTags);
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && tags.indexOf(inputValue) === -1) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue("");
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        console.log(tags);
        setEditInputIndex(-1);
        setInputValue("");
    };

    const tagInputStyle: React.CSSProperties = {
        width: 78,
        verticalAlign: "top",
    };

    const tagPlusStyle: React.CSSProperties = {
        background: token.colorBgContainer,
        borderStyle: "dashed",
    };

    const onChange = (checkedValues: CheckboxValueType[]) => {
        const checked: boolean = checkedValues.length > selectedTags.length;
        const next: string = checked ? checkedValues.map((value) => value.toString()).filter((value) => !selectedTags.includes(value))[0]
            : selectedTags.filter((tag) => !checkedValues.map((value) => value.toString()).includes(tag))[0];
        const nextSelectedTags = checked
            ? [...selectedTags, next.toString()]
            : selectedTags.filter((t) => t !== next);
        if (checked && selectedTags.length === tags.length) {
            message.warning("选择属性超出自定义数量！");
        }
        else {
            setSelectedTags(nextSelectedTags);
        }
    };

    const steps = [
        {
            title: "标题",
            description: "自定义资产标签卡标题",
            content: 
      <>
          <div style={{marginBottom: 8, fontFamily:"Tommy-medium"}}>请输入资产标签卡标题</div>
          <Input
              maxLength={18}
              showCount
              placeholder="请输入资产标签卡标题"
              prefix={<UserOutlined className="site-form-item-icon" />}
              suffix={
                  <Tooltip title="输入资产标签卡片标题">
                      <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
              }
              value={title}
              style={{marginBottom: 8}}
              onChange={changeTitle}
          />
      </>
        },
        {
            title: "属性标签",
            description: "自定义属性标签项",
            content: 
            <>
                <Tooltip title="你最多只能添加6个资产属性标签">
                    <p style={{marginLeft: 2, marginBottom: 4, display: "flex", justifyContent: "center"}}>
                    自定义属性
                    </p>
                </Tooltip>
                <Space size={[0, 8]} direction="vertical" wrap>
                    <Space size={[0, 8]} direction="vertical" wrap>
                        {tags.map((tag, index) => {
                            if (editInputIndex === index) {
                                return (
                                    <Input
                                        ref={editInputRef}
                                        key={tag}
                                        size="middle"
                                        style={tagInputStyle}
                                        value={editInputValue}
                                        onChange={handleEditInputChange}
                                        onBlur={handleEditInputConfirm}
                                        onPressEnter={handleEditInputConfirm}
                                    />
                                );
                            }
                            const isLongTag: boolean = tag.length > 20;
                            const tagElem = (
                                <Tag
                                    key={tag}
                                    closable={index !== 0}
                                    color={colorList[index]}
                                    style={{ userSelect: "none",
                                    }}
                                    onClose={() => handleClose(tag)}
                                >
                                    <span
                                        onDoubleClick={(e) => {
                                            if (index !== 0) {
                                                setEditInputIndex(index);
                                                setEditInputValue(tag);
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                    </span>
                                </Tag>
                            );
                            return isLongTag ? (
                                <Tooltip title={tag} key={tag}>
                                    {tagElem}
                                </Tooltip>
                            ) : (
                                tagElem
                            );
                        })}
                    </Space>
                    {inputVisible ? (
                        <Input
                            ref={inputRef}
                            type="text"
                            size="middle"
                            style={tagInputStyle}
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputConfirm}
                            onPressEnter={handleInputConfirm}
                        />
                    ) : (
                        tags.length < 6 ? <Tag style={tagPlusStyle} onClick={showInput}>
                            <PlusOutlined /> 新标签
                        </Tag> : <></>
                    )}
                </Space>
            </>
        },
        {
            title: "属性选择",
            description: "自定义属性标签所对应的资产属性",
            content:
            <>
                <Space size={[0, 8]} direction="vertical" wrap>

                    {tags.map((tag: string, index: number) => (
                        <Space direction="horizontal" key={Date.now() * Math.random()}>
                            <Tag color={colorList[index]}>{tag}</Tag>
                            <RightSquareTwoTone/>
                            <Tag color={selectedTags.length > index ? colorList[index] : "grey"}>
                                {selectedTags.length > index ? selectedTags[index] : "待定"}</Tag>
                        </Space>
                    ))}
    
                    <span style={{ marginRight: 8, fontFamily:"Tommy-medium"}}>选择属性标签对应的表项</span>
                    <Space size={[0, 8]} wrap>
                        <Checkbox.Group
                            options={tagsData}
                            value={selectedTags}
                            onChange={onChange}
                        >
                        </Checkbox.Group>
                    </Space>
                </Space>
            </>
        },
        {
            title: "结束",
            description: "设置完成",
            content: 
            <>
                <Result
                    icon={<SmileOutlined style={{color:"black"}}/>}
                    title={`保存成功！${timeTick} 秒后将返回主页`}
                    extra={<Button className="modalConfirmBtn"
                        onClick={() => {
                            router.reload();
                        }}>返回</Button>}
                    style={{fontFamily:"Tommy-medium"}}
                >
                </Result>
            </>
        }
    ];

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const items = steps.map((item) => ({ key: item.title, title: item.title, description: item.description}));

    return (
        <>
            <Button 
                className="asset-btn" 
                onClick={showModal}>
                <div style={{display: "flex", alignItems: "center", justifyItems:"center"}}>
                    <BulbOutlined style={{marginRight:"5px"}}/>
                定义资产标签
                </div>
            </Button>
            <Modal
                open={open}
                width={"75%"}
                title="自定义资产标签卡片"
                onCancel={handleCancel}
                footer={[]}
                className="createIDcard-modal"
            >
                <Steps current={current} items={items} />
                <div style={{marginTop: 24}}>{steps[current].content}</div>
                <div style={{ marginTop: 24 }}>
                    {current === 0 && (
                        <Space>
                            <Button className="modalConfirmBtn" onClick={() => next()}>
            下一步
                            </Button>
                            <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
                        取消
                            </Button></Space>
                    )}
                    {current === 1 && (
                        <Space>
                            <Button className="modalConfirmBtn" onClick={() => next()}>
            下一步
                            </Button>
                            <Button className="modalCancelBtn" style={{ margin: "0 8px" }} onClick={() => prev()}>
            上一步
                            </Button>
                            <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
            取消
                            </Button>
                        </Space>
                    )}
                    {current === 2 && (
                        <Space>
                            <Tooltip title={selectedTags.length < tags.length ? "请为所有标签选择对应的属性！" : ""}>
                                <Button className="modalConfirmBtn" onClick={() => {
                                    Cookies.set("tags", JSON.stringify(tags));
                                    Cookies.set("title", title);
                                    Cookies.set("items", JSON.stringify(selectedTags));
                                    message.success("保存成功！");
                                    next();
                                    setTimeout(() => {
                                        setTimeTick((timeTick) => timeTick - 1);
                                    }, 1000);
                                    setTimeout(() => {
                                        setTimeTick((timeTick) => timeTick - 1);
                                    }, 2000);
                                    setTimeout(() => {
                                        router.reload();
                                    }, 3000);
                                }}
                                disabled={selectedTags.length < tags.length}>
                                    <div style={{display: "flex", alignItems: "center"}}>
                                        <SaveOutlined style={{marginRight:"5px"}}/>
                                        保存
                                    </div>
                                </Button>
                            </Tooltip>
                            
                            <Button className="modalCancelBtn" style={{ margin: "0 8px" }} onClick={() => prev()}>
            上一步
                            </Button>
                            <Button key="Back" onClick={handleCancel} className="modalCancelBtn">
            取消
                            </Button>
                        </Space>    
                    )}
                </div>
            </Modal>
        </>
    );
};

export default StepCustomize;