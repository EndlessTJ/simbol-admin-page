"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from 'next/link'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FundViewOutlined,
  DashboardOutlined,
  LaptopOutlined,
  ProductOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import styles from "./index.module.scss";
const { Header, Sider, Content } = Layout;

const MENUITEM = [
  {
    key: "DASHBOARD",
    icon: <DashboardOutlined />,
    label: <Link href={`/main`}>DASHBOARD</Link>,
  },
  {
    key: "FUNDVIEW",
    icon: <FundViewOutlined />,
    label:<Link href={`/main/fundList`}>财务数据</Link>,
  },
  {
    key: "PRODUCT",
    icon: <ProductOutlined />,
    label: '业务数据',
    children: [
      { key: 'PARTNER', label: <Link href={`/main/partnerList`}>合作甲方列表</Link>},
      { key: 'CHANNEL', label: <Link href={`/main/channelList`}>合作渠道列表</Link> },
      { key: 'PRODUCTSLIST', label: <Link href={`/main/productMessageList`}>甲方产品列表</Link> },
      { key: 'PLANS', label: <Link href={`/main/businessPlans`}>推广计划列表</Link> },
    ],
  },
  {
    key: "BUSINESS",
    icon: <LaptopOutlined />,
    label: <Link href={`/main/bussinessInfoList`}>商务渠道</Link>,
  },
]

const SiderMenuLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className={styles.logo}>
          <div className={styles.logo_inner}>
          <Image
            className="demo-logo-vertical"
            src="/img/logo.png"
            alt="simbol logo"
            width={110}
            height={38}
            priority
          />
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["DASHBOARD"]}
          items={MENUITEM}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            // padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div
          className=" min-h-screen p-8 pb-20"
          >{children}</div>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default SiderMenuLayout;
