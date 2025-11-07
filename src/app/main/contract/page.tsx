"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormInstance, message, Space, TablePaginationConfig } from "antd";
// import dayjs from "dayjs";
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
  CompanyEnum,
  ModalFormText,
  ModalFormHandleStatus,
  PaginatedResult,
  CONTRACT_STATUS,
  PARTNER_CHANNEL_NATURE,
  CONTRACT_TYPE,
  ContractListType,
  ContractFormType,
  ContractQueryType,
  PartnerChannelType,
} from "@/type";
import {
  Company,
  CONTRACT_STATUS_TEXT,
  CONTRACT_TYPE_TEXT,
  PARTNER_CHANNEL_NATURE_TEXT,
} from "@/constants";
import FormModal from "@/components/FormModal";
import DebounceSelect, { OptionsType } from "@/components/DebounceSelect";

const { RangePicker } = DatePicker;
const { Item } = Form;
const { Option } = Select;
export default function Contract() {
  const [dataSource, setDataSource] = useState<ContractListType[]>([]);
  const [dataSourceCount, setDataSourceCount] = useState<number>(0);
  const [updateId, setUpdateId] = useState<string>();
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<ContractFormType>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<ContractQueryType>();
  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] =
    useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>(
      "CREATE_OPEN"
    );
  const pathname = usePathname();
  const handleEditModal = useCallback(
    (handleType: ModalFormHandleStatus, form?: FormInstance) => {
      if (handleType !== "CONFIRM") {
        setModalShow(!modalShow);
      }
      if (handleType === "CREATE_OPEN" || handleType === "UPDATE_OPEN") {
        setOpenModalFormOpenStatus(handleType);
      }
      if (handleType === "CONFIRM" && form) {
        form.submit();
      }
    },
    [modalShow]
  );

  const updateItem = useCallback(
    async (record: ContractListType) => {
      setUpdateId(record.id);
      handleEditModal("UPDATE_OPEN");
      setInitValues({
        ...record,
        // products: record.products?.map(product => product.id),
        // contractDate: dayjs(record.contractDate) as unknown as Date,
      });
    },
    [handleEditModal]
  );

  const getDataSource = useCallback(async () => {
    const data = await requestGet<PaginatedResult<ContractListType>>(
      "/contract/list",
      {
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortBy: "endDate",
        sortOrder: "ASC",
        ...searchParams,
      }
    );
    setDataSource(data.list);
    setDataSourceCount(data.meta.total);
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

  const handleEditData = async (values: ContractFormType) => {
    try {
      setConfirmLoading(true);
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        await requestPost("/contract/create", values);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/contract/update/${updateId}`, values);
      }

      setConfirmLoading(false);
      message.success("创建成功");
    } catch (error) {
      console.log(error);
    }
  };
  const onSearch = async (values: CommonType) => {
    setSearchParams(values as ContractQueryType);
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const searchCompany = async (
    value: string,
    currentSettlementType: "partner" | "channel"
  ): Promise<OptionsType[]> => {
    let companys = [] as PartnerChannelType[];
    if (currentSettlementType === "partner") {
      companys = await requestGet("/partners/listbyname", {
        keyword: value,
      });
    }
    if (currentSettlementType === "channel") {
      companys = await requestGet("/channels/listbyname", {
        keyword: value,
      });
    }

    return companys.map((item: PartnerChannelType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const columns: TableProps<ContractListType>["columns"] = useMemo(
    () => [
      {
        title: "合同编号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "签约主体",
        key: "signCompony",
        dataIndex: "signCompony",
        width: "80px",
        render: (value: CompanyEnum) => (
          <Tag color={value == "莘柏景泽" ? "geekblue" : "green"} key={value}>
            {value}
          </Tag>
        ),
      },
      {
        title: "合作公司",
        key: "signParty",
        dataIndex: "signParty",
        render: (value: string, record: ContractListType) => <Tag>{record.partner ? record.partner.name : record.channel.name}</Tag>,
      },
      {
        title: "签约方性质",
        dataIndex: "partnerNature",
        key: "partnerNature",
        render: (partnerNature: PARTNER_CHANNEL_NATURE) =>
          PARTNER_CHANNEL_NATURE_TEXT[partnerNature],
      },
      {
        title: "合同类型",
        dataIndex: "contractType",
        key: "contractType",
        render: (contractType: CONTRACT_TYPE) =>
          CONTRACT_TYPE_TEXT[contractType],
      },
      {
        title: "电子合同平台",
        dataIndex: "platform",
        key: "platform",
      },
      {
        title: "签约日期",
        dataIndex: "startDate",
        key: "startDate",
      },
      {
        title: "终止日期",
        dataIndex: "endDate",
        key: "endDate",
      },
      {
        title: "合同状态",
        dataIndex: "contractStatus",
        key: "contractStatus",
        render: (contractStatus: CONTRACT_STATUS) =>
          CONTRACT_STATUS_TEXT[contractStatus],
      },

      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
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
        <Col span={8} key={"partner"}>
          <Item name={`partner`} label={`产品方公司`}>
            <DebounceSelect
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "partner")}
            />
          </Item>
        </Col>
        <Col span={8} key={"channel"}>
          <Item name={`channel`} label={`渠道方公司`}>
            <DebounceSelect
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "channel")}
            />
          </Item>
        </Col>
        <Col span={8} key={"startDate"}>
          <Item name={`startDate`} label={`签约日期`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"endDate"}>
          <Item name={`endDate`} label={`截止日期`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"contractStatus"}>
          <Item name={`contractStatus`} label={`合同状态`}>
            <Select allowClear>
              {Object.keys(CONTRACT_STATUS).map((item) => (
                <Option key={item} value={item}>
                  {CONTRACT_STATUS_TEXT[item as keyof typeof CONTRACT_STATUS]}
                </Option>
              ))}
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
      <FormModal<ContractFormType>
        // status={handleStatus}
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      >
        <Form.Item name="code" label="合同编号">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="startDate" label="签约日期">
          <DatePicker placeholder="请选择" />
        </Form.Item>
        <Form.Item name="endDate" label="终止日期">
          <DatePicker placeholder="请选择" />
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
        <Form.Item name="contractStatus" label="合同状态">
          <Select
            placeholder="请选择"
            options={Object.keys(CONTRACT_STATUS).map((value: string) => ({
              value,
              label: CONTRACT_STATUS_TEXT[value as keyof typeof CONTRACT_STATUS],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="partnerNature" label="签约方性质">
          <Select
            placeholder="请选择"
            options={Object.keys(PARTNER_CHANNEL_NATURE).map((value: string) => ({
              value,
              label: PARTNER_CHANNEL_NATURE_TEXT[value as keyof typeof PARTNER_CHANNEL_NATURE],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="contractType" label="合同状态">
          <Select
            placeholder="请选择"
            options={Object.keys(CONTRACT_TYPE).map((value: string) => ({
              value,
              label: CONTRACT_TYPE_TEXT[value as keyof typeof CONTRACT_TYPE],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="platform" label="电子合同平台">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="partner" required label="签约品牌方">
            <DebounceSelect
              initOptions={[]}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, 'partner')}
            />
          </Form.Item>
          <Form.Item name="channel" required label="签约渠道">
            <DebounceSelect
              initOptions={[]}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, 'channel')}
            />
          </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={6} />
        </Form.Item>
      </FormModal>

      <Table<ContractListType>
        pagination={{ showSizeChanger: true, total: dataSourceCount }}
        scroll={{ x: "max-content" }}
        rowKey="id"
        onChange={tableChange}
        columns={columns}
        dataSource={dataSource}
      />
    </LocaleWrap>
  );
}
