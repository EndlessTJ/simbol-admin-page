"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormInstance, message, Space, TablePaginationConfig } from "antd";
import dayjs from 'dayjs';
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import {
  Col,
  Form,
  Input,
  DatePicker,
  Select,
  TableProps,
  Tag,
  Table,
  Button,
  Row,
} from "antd";
import { requestPost, requestGet } from "@/lib/api-client";
import PartnerMsgEdit from "@/components/PartnerMsgEdit";
import {
  CommonType,
  CooperationStatusEnum,
  CompanyEnum,
  PartnerChannelType,
  ProductsType,
  ModalText,
  CooperationStatusTextEnum,
  cooperationType,
} from "@/type";
import { Company, CooperationStatus } from "@/constants";

import styles from "./index.module.scss";
const { RangePicker } = DatePicker;
const { Item } = Form;
const { Option } = Select;
export default function PartnerList() {
  const [dataSource, setDataSource] = useState<PartnerChannelType[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<PartnerChannelType>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] =
    useState<Omit<PartnerChannelType, "products" | "remark">>();
  const [handleStatus, setHandleStatus] =
    useState<keyof typeof ModalText>("CREATE");
  const pathname = usePathname();

  const columns: TableProps<PartnerChannelType>["columns"] = useMemo(
    () => [
      {
        title: "公司名",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "签约日期",
        dataIndex: "contractDate",
        key: "contractDate",
      },
      {
        title: "合作状态",
        dataIndex: "currentStatus",
        key: "currentStatus",
        render: (currentStatus: cooperationType) =>
          CooperationStatusTextEnum[currentStatus],
      },
      {
        title: "公司产品",
        dataIndex: "products",
        key: "products",
        render: (products: ProductsType) => products?.name,
      },
      {
        title: "签约主体",
        key: "signCompony",
        dataIndex: "signCompony",
        render: (value: CompanyEnum) => (
          <Tag color={value == "莘柏景泽" ? "geekblue" : "green"} key={value}>
            {value}
          </Tag>
        ),
      },
      {
        title: "别名",
        dataIndex: "alias",
        key: "alias",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "操作",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <Button onClick={() => updateItem(record)} type="link">修改</Button>
          </Space>
        ),
      },
    ],
    []
  );

  const updateItem = useCallback(
    (record: PartnerChannelType) => {
      handleEditModal("update");
      
      console.log(record, 6666)
      setInitValues({
        ...record,
        contractDate: dayjs(record.contractDate) as unknown as Date,
        // name: record.name,
        // currentStatus: record.currentStatus,
        // signCompony: record.signCompony,
        // products: record.products,
        // alias: record.alias,
        // remark: record.remark
      })
    },
    [],
  )
  

  const getDataSource = useCallback(async () => {
    const data = await requestGet("/business/partner", {
      page: pagination?.current || 1,
      limit: pagination?.size || 10,
      sortBy: "contractDate",
      sortOrder: "ASC",
      ...searchParams,
    });
    setDataSource(data);
  }, [pagination, searchParams]);

  useEffect(() => {
    getDataSource();
  }, [pathname, pagination, searchParams, getDataSource]);

  useEffect(() => {
    if (!confirmLoading) {
      setModalShow(false);
      getDataSource();
    }
  }, [confirmLoading, getDataSource]);

  const handleEditModal = (
    handleType: "close" | "confirm" | "create" | "update",
    form?: FormInstance
  ) => {
    if (handleType !== "confirm") {
      setModalShow(!modalShow);
    }
    if (handleType === "create") {
      setHandleStatus("CREATE");
    }
    if(handleType === 'update') {
      setHandleStatus("UPDATE");
    }

    if (handleType === "confirm" && form) {
      form.submit();
      // form.resetFields();
    }
    // if(handleType === "confirm" || handleType === "close") {
    //   form?.resetFields();
    // }
  };

  const handleEditData = async (values: PartnerChannelType) => {
    try {
      setConfirmLoading(true);
      await requestPost("/business/partner", values);
      setConfirmLoading(false);
      message.success("创建成功");
    } catch (error) {
      console.log(error);
    }
  };
  const onSearch = async (values: CommonType) => {
    setSearchParams(
      values as Omit<PartnerChannelType, "products" | "alias" | "remark">
    );
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };
  return (
    <LocaleWrap>
      <AdvancedSearchForm onFinish={onSearch}>
        <Col span={8} key={"name"}>
          <Item name={`name`} label={`公司名称`}>
            <Input allowClear placeholder="请输入公司名" />
          </Item>
        </Col>
        <Col span={8} key={"alias"}>
          <Item name={`alias`} label={`公司别名`}>
            <Input allowClear placeholder="请输入别名" />
          </Item>
        </Col>
        <Col span={8} key={"contractDate"}>
          <Item name={`contractDate`} label={`签约日期`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"currentStatus"}>
          <Item name={`currentStatus`} label={`合作状态`}>
            <Select allowClear>
              <Option value={CooperationStatusEnum.ACTIVE}>
                {CooperationStatus[CooperationStatusEnum.ACTIVE]}
              </Option>
              <Option value={CooperationStatusEnum.SUSPENDED}>
                {CooperationStatus[CooperationStatusEnum.SUSPENDED]}
              </Option>
              <Option value={CooperationStatusEnum.TERMINATED}>
                {CooperationStatus[CooperationStatusEnum.TERMINATED]}
              </Option>
            </Select>
          </Item>
        </Col>
        <Col span={8} key={"signCompony"}>
          <Item name={`signCompony`} label={`签约主体`}>
            <Select allowClear>
              <Option value={CompanyEnum.QMYC}>{Company["QMYC"]}</Option>
              <Option value={CompanyEnum.SBJZ}>{Company["SBJZ"]}</Option>
            </Select>
          </Item>
        </Col>
      </AdvancedSearchForm>

      <Row className={styles.contorlwrap} gutter={[16, 16]} justify={"end"}>
        <Col>
          <Button
            onClick={() => {
              handleEditModal("create");
            }}
            type="primary"
          >
            创建
          </Button>
        </Col>
      </Row>
      <PartnerMsgEdit
        status={handleStatus}
        handleOk={handleEditModal}
        modalTitle={ModalText[handleStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      />

      <Table<PartnerChannelType>
        pagination={{ showSizeChanger: true }}
        rowKey="id"
        onChange={tableChange}
        columns={columns}
        dataSource={dataSource}
      />
    </LocaleWrap>
  );
}
