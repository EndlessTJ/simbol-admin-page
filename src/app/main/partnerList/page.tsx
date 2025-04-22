"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormInstance, message, Space, TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import SearchActionWrap from "@/components/SearchActionWrap";
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
} from "antd";
import { requestPost, requestGet, requestPut } from "@/lib/api-client";
// import PartnerMsgEdit from "@/components/PartnerMsgEdit";
import {
  CommonType,
  CooperationStatusEnum,
  CompanyEnum,
  PartnerChannelType,
  ProductsType,
  ModalFormText,
  CooperationStatusTextEnum,
  cooperationType,
  ModalFormHandleStatus,
  PartnerChannelQueryType,
} from "@/type";
import { Company, CooperationStatus } from "@/constants";
import FormModal from "@/components/FormModal";

const { RangePicker } = DatePicker;
const { Item } = Form;
const { Option } = Select;
export default function PartnerList() {
  const [dataSource, setDataSource] = useState<PartnerChannelType[]>([]);
  const [updateId, setUpdateId] = useState<string>();
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<PartnerChannelQueryType >();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] =
    useState<Omit<PartnerChannelType, "products" | "remark">>();
  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] = useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>("CREATE_OPEN");
  const pathname = usePathname();
  const handleEditModal = useCallback(
    (
      handleType: ModalFormHandleStatus,
      form?: FormInstance
    ) => {
      if (handleType !== "CONFIRM") {
        setModalShow(!modalShow);
      }
      if(handleType === "CREATE_OPEN" || handleType === "UPDATE_OPEN") {
        setOpenModalFormOpenStatus(handleType)
      }
      if (handleType === "CONFIRM" && form) {
        form.submit();
      }
    },
    [modalShow],
  );

  const updateItem = useCallback(async (record: PartnerChannelType) => {
    setUpdateId(record.id)
    handleEditModal("UPDATE_OPEN");
    setInitValues({
      ...record,
      // products: record.products?.map(product => product.id),
      contractDate: dayjs(record.contractDate) as unknown as Date,
    });
  }, [handleEditModal]);

  const getDataSource = useCallback(async () => {
    const data = await requestGet("/partners/list", {
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

  const handleEditData = async (values: PartnerChannelType) => {
    try {
      setConfirmLoading(true);
      if(openModalFormOpenStatus === "CREATE_OPEN") {
        await requestPost("/partners/create", values);
      }
      if(openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/partners/update/${updateId}`, values);
      }

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
        render: (products: ProductsType[]) => products?.map(product => <Tag bordered={false} color="orange" key={product.id}>{product.name}</Tag>),
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
            <Button onClick={() => updateItem(record)} type="link">
              修改
            </Button>
          </Space>
        ),
      },
    ],
    [updateItem]
  );
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
      <SearchActionWrap>
        <Button
          onClick={() => {
            handleEditModal("CREATE_OPEN");
          }}
          type="primary"
        >
          创建
        </Button>
      </SearchActionWrap>
      <FormModal<PartnerChannelType>
        // status={handleStatus}
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      >
        <Form.Item name="name" label="公司名称">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="contractDate" label="签约日期">
          <DatePicker placeholder="请选择" />
        </Form.Item>
        <Form.Item name="currentStatus" label="合作状态">
          <Select
            placeholder="请选择"
            options={Object.keys(CooperationStatus).map((value: string) => ({
              value,
              label: CooperationStatus[value as keyof typeof CooperationStatus],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="signCompony" label="签约主体">
          <Select
            placeholder="请选择"
            options={Object.values(Company).map((value: string) => ({
              value,
              label: value,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="alias" label="公司别名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={6} />
        </Form.Item>
      </FormModal>

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
