"use client";
import React from "react";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import { Col, Form, Input, DatePicker, Select, TableProps, Tag, Table } from "antd";
import apiClient from "@/lib/api-client";
import { CommonType, CooperationStatusEnum, CompanyEnum, PartnerChannelType, ProductsType  } from "@/type";
import {
  Company,
  CooperationStatus,
} from "@/constants";
const { RangePicker } = DatePicker;
const { Item } = Form;
const { Option } = Select;


const columns: TableProps<PartnerChannelType>['columns'] = [
  {
    title: '公司名',
    dataIndex: 'name',
    key: 'name',
    // render: (text) => <a>{text}</a>,
  },
  {
    title: '签约日期',
    dataIndex: 'contractDate',
    key: 'contractDate',
  },
  {
    title: '合作状态',
    dataIndex: 'currentStatus',
    key: 'currentStatus',
  },
  {
    title: '公司产品',
    dataIndex: 'products',
    key: 'products',
    render: (products: ProductsType) => products.name
  },
  {
    title: '签约主体',
    key: 'signCompony',
    dataIndex: 'signCompony',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: '别名',
    dataIndex: 'alias',
    key: 'alias',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   render: (_, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.name}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

export default function PartnerList() {
  const onFinish = async (values: CommonType) => {
    // const data = await fetch('http://localhost:3001/users/getRole')
    const data = await apiClient.get('/users/getRole')
    // try {
    //   const res = await apiClient.get('/users/getRole')
    //   console.log('res', res)
    // } catch (error) {
    //   console.error('error', error)
    // }
    
      console.log('data', data)
    console.log(values);
  };

  return (
    <div className="dash">
      <AdvancedSearchForm onFinish={onFinish}>
        <Col span={8} key={'name'}>
          <Item
            name={`name`}
            label={`公司名称`}
            rules={[
              {
                required: true,
                message: "请输入公司名",
              },
            ]}
          >
            <Input placeholder="请输入公司名" />
          </Item>
        </Col>
        <Col span={8} key={'contractDate'}>
          <Item
            name={`contractDate`}
            label={`签约日期`}
            rules={[
              {
                required: true,
                message: "请选择日期",
              },
            ]}
          >
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={'currentStatus'}>
          <Item
            name={`currentStatus`}
            label={`合作状态`}
            rules={[
              {
                required: true,
                message: "请输入合作状态",
              },
            ]}
          >
            <Select>
              <Option value={CooperationStatusEnum.ACTIVE}>{CooperationStatus[CooperationStatusEnum.ACTIVE]}</Option>
              <Option value={CooperationStatusEnum.SUSPENDED}>{CooperationStatus[CooperationStatusEnum.SUSPENDED]}</Option>
              <Option value={CooperationStatusEnum.TERMINATED}>{CooperationStatus[CooperationStatusEnum.TERMINATED]}</Option>
            </Select>
          </Item>
        </Col>
        <Col span={8} key={'signCompony'}>
          <Item
            name={`signCompony`}
            label={`签约主体`}
            rules={[
              {
                required: true,
                message: "请输入签约主体",
              },
            ]}
          >
            <Select>
              <Option value={CompanyEnum.QMYC}>{Company['QMYC']}</Option>
              <Option value={CompanyEnum.SBJZ}>{Company['SBJZ']}</Option>
            </Select>
          </Item>
        </Col>
      </AdvancedSearchForm>
      <Table<PartnerChannelType> columns={columns} dataSource={[]} />
    </div>
  );
}
