import React from "react";
import { Page, Text, Document, StyleSheet, Font} from "@react-pdf/renderer";
import Cookies from "js-cookie";


Font.register({
    family: "ZCool",
    src: "https://fonts.gstatic.com/s/zcoolkuaile/v7/tssqApdaRQokwFjFJjvM6h2WpozzoXhC2g.ttf"
});

interface assetDocumentProps {
    id?: number;
    name?: string;
    parent?: string;
    class?: string;
    user?: string;
    price?: string;
    description?: string;
    position?: string;
    number?: number;
    assetcategory?: string;
    department?: string;
    type: boolean;
  }

const styles = StyleSheet.create({
    title: {
        fontSize: 13,
        textAlign: "center",
        fontFamily: "ZCool"
    },
    subtitle: {
        fontSize: 9,
        paddingLeft: 5,
        marginVertical: 2.5,
        textAlign: "justify",
        fontFamily: "ZCool"
    },
    page: {
        border: "1.5px solid black",
        borderRadius: 5,
    },
    footer: {
        fontSize: 9,
        paddingright: 2.5,
        textAlign: "right",
        fontFamily: "ZCool"
    },
});


// Create Document Component
const AssetDocument = (props: assetDocumentProps) => {

    const fetchTags = (index: number) => {
        return (JSON.parse(String(Cookies.get("tags")))[index] ? `${JSON.parse(String(Cookies.get("tags")))[index]}：` : "") ;
    };

    const fetchProps = (index: number) => {
        const relationList: string[] = JSON.parse(String(Cookies.get("items")));
        if (relationList[index] === "名称") return props.name;
        if (relationList[index] === "编号") return props.id;
        if (relationList[index] === "从属") return props.parent;
        if (relationList[index] === "所有人") return props.user;
        if (relationList[index] === "类型") return props.class;
        if (relationList[index] === "品类") return props.assetcategory;
        if (relationList[index] === "价格") return props.price;
        if (relationList[index] === "数量") return props.number;
        if (relationList[index] === "描述") return props.description;
        if (relationList[index] === "位置") return props.position;
        if (relationList[index] === "部门") return props.department;
        else return "";
    };

    const generateLine = (index: number) => {
        const result: string = fetchTags(index) + " " + String(fetchProps(index)); 
        let returnValue: string = "";
        if (result.length > 26) {
            for (let i = 0; i < 26; i ++) returnValue += result[i];
            returnValue += "...";
        }
        else returnValue = result;
        return returnValue;
    };

    if (!props.type) {
        return(
            <Document>
                <Page size={[225, 125]} style ={styles.page}>
                    <Text style={styles.title}>{Cookies.get("title")}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(0)}`}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(1)}`}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(2)}`}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(3)}`}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(4)}`}</Text>
                    <Text style={styles.subtitle}>{`${fetchTags(5)}`}</Text>
                    <Text style={styles.footer}>{"    年     月    日  "}</Text>
                </Page>
            </Document>
        );}
    else {
        return(
            <Document>
                <Page size={[225, 125]} style ={styles.page}>
                    <Text style={styles.title}>{Cookies.get("title")}</Text>
                    <Text style={styles.subtitle}>{generateLine(0)}</Text>
                    <Text style={styles.subtitle}>{generateLine(1)}</Text>
                    <Text style={styles.subtitle}>{generateLine(2)}</Text>
                    <Text style={styles.subtitle}>{generateLine(3)}</Text>
                    <Text style={styles.subtitle}>{generateLine(4)}</Text>
                    <Text style={styles.subtitle}>{generateLine(5)}</Text>
                    <Text style={styles.footer}>{`${new Date().getFullYear()} 年 ${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日  `}</Text>
                </Page>
            </Document>
        );
    }
};

export default AssetDocument;