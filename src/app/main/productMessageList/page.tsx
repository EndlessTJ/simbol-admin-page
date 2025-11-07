"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormInstance, message, Space, TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import DebounceSelect, { OptionsType } from "@/components/DebounceSelect";
import SearchActionWrap from "@/components/SearchActionWrap";
import FormModal from "@/components/FormModal";
import {
  Col,
  Form,
  Input,
  DatePicker,
  TableProps,
  Tag,
  Table,
  Button,
} from "antd";
import { requestPost, requestGet, requestPut } from "@/lib/api-client";
import {
  CommonType,
  PartnerChannelType,
  ProductsType,
  ProductsSearchQueryType,
  ModalFormText,
  ModalFormHandleStatus,
  ProductsFormType,
  PaginatedResult,
} from "@/type";

const { RangePicker } = DatePicker;
const { Item } = Form;
export default function ProductList() {
  const [updateId, setUpdateId] = useState<string>();
  const [dataSource, setDataSource] = useState<ProductsType[]>([]);
  const [dataSourceCount, setDataSourceCount] = useState<number>(0);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<ProductsFormType>();
  const [initPartnerOptions, setInitPartnerOptions] = useState<OptionsType[]>();
  const [initChannelOptions, setInitChannelOptions] = useState<OptionsType[]>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<ProductsSearchQueryType>();
  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] =
    useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>(
      "CREATE_OPEN"
    );

  const pathname = usePathname();

  const handleEditModal = useCallback(
    (
      handleType: ModalFormHandleStatus,
      form?: FormInstance
    ) => {
      if (handleType !== "CONFIRM") {
        setModalShow(!modalShow);
      }
      if (handleType === "CREATE_OPEN" || handleType === "UPDATE_OPEN") {
        setOpenModalFormOpenStatus(handleType);
      }
      if (handleType === "CONFIRM" && form) {
        form.submit();
      }
      if(handleType !== 'UPDATE_OPEN') {
        clearModalStatus();
      }
    },
    [modalShow],
  )

  const updateItem = useCallback((record: ProductsType) => {
    handleEditModal("UPDATE_OPEN");
    // const linkStrs = record.links.map((link) => link.name).join(",");
    const channelOption = record.channel.map(item => ({value: item.id, label: item.name}));
    setInitPartnerOptions([{value: record.company.id, label: record.company.name}]);
    setInitChannelOptions(channelOption)
    setUpdateId(record.id);
    setInitValues({
      name: record.name,
      contactPerson: record.contactPerson,
      company: record?.company.id,
      remark: record.remark,
      channel: record?.channel.map((item) => item.id),
    });
  }, [handleEditModal]);

  const getDataSource = useCallback(async () => {
    const data = await requestGet<PaginatedResult<ProductsType>>("/products/list", {
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 10,
      sortBy: "createAt",
      sortOrder: "ASC",
      ...searchParams,
    });
    setDataSource(data.list);
    setDataSourceCount(data.meta.total)
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

  const clearModalStatus = () => {
    setInitChannelOptions([]);
    setInitPartnerOptions([]);
  }

  const handleEditData = async (values: ProductsFormType) => {
    try {
      setConfirmLoading(true);
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        await requestPost("/products/create", values);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/products/update/${updateId}`, values);
      }
      setConfirmLoading(false);
      message.success("创建成功");
    } catch (error) {
      setConfirmLoading(false);
      message.error("请求错误");
      console.log(error);
    }
  };
  const onSearch = async (values: CommonType) => {
    setSearchParams(values as unknown as ProductsSearchQueryType);
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const searchCompany = async (value: string): Promise<OptionsType[]> => {
    const partners = await requestGet<PartnerChannelType[]>("/partners/listbyname", {
      keyword: value,
    });
    return partners.map((item: PartnerChannelType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const searchChannel = async (value: string): Promise<OptionsType[]> => {
    const channels = await requestGet<PartnerChannelType[]>("/channels/listbyname", {
      keyword: value,
    });
    return channels.map((item: PartnerChannelType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const columns: TableProps<ProductsType>["columns"] = useMemo(
    () => [
      {
        title: "产品名",
        dataIndex: "name",
        key: "name",
        fixed: true,
        width: '180px'
      },
      {
        title: "所属公司",
        dataIndex: "company",
        key: "company",
        // fixed: true,
        width: '200px',
        render: (company: PartnerChannelType) => company.name,
      },
      {
        title: "推广渠道",
        dataIndex: "channel",
        key: "channel",
        width: '180px',
        render: (channels: PartnerChannelType[]) =>
          channels?.map((channel) => (
            <Tag key={channel.id}>{channel.name}</Tag>
          )),
      },
      {
        title: "创建时间",
        dataIndex: "createAt",
        key: "createAt",
        render: (createAt: Date) => dayjs(createAt).format('YYYY-MM-DD')
      },
      // {
      //   title: "更新时间",
      //   dataIndex: "updateAt",
      //   key: "updateAt",
      // },
      {
        title: "拥有链接",
        dataIndex: "links",
        key: "links",
        width: '280px',
        render: (links: { id: string; name: string, linkStatus: 0 | 1 }[]) => 
          links?.map((link) => {
            return link.linkStatus === 1 ? <Tag key={link.id}>{link.name}</Tag> : null;
          } ),
      },
      {
        title: "对接人",
        dataIndex: "contactPerson",
        key: "contactPerson",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "操作",
        key: "action",
        fixed: 'right',
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
          <Item name={`name`} label={`产品名称`}>
            <Input allowClear placeholder="请输入产品名称" />
          </Item>
        </Col>
        <Col span={8} key={"links"}>
          <Item name={`links`} label={`拥有链接`}>
            <Input allowClear placeholder="请输入链接" />
          </Item>
        </Col>
        <Col span={8} key={"createAt"}>
          <Item name={`createAt`} label={`创建日期`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"company"}>
          <Item name={`company`} label={`所属公司`}>
            <DebounceSelect allowClear showSearch fetchOptions={searchCompany} />
          </Item>
        </Col>
        <Col span={8} key={"channel"}>
          <Item name={`channel`} label={`推广渠道`}>
            <DebounceSelect allowClear showSearch fetchOptions={searchChannel} />
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

      <FormModal<ProductsFormType>
        // status={handleStatus}
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      >
        <Form.Item name="name" required label="产品名称">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="contactPerson" label="对接人">
          <Input placeholder="请输入" />
        </Form.Item>
        {/* <Form.Item name="links" label="拥有链接">
          <Input.TextArea placeholder="如果有多条链接，请使用英文逗号“,”分隔。" />
        </Form.Item> */}
        <Form.Item name="company" required label="所属公司">
          <DebounceSelect
            showSearch
            placeholder="请输入搜索"
            initOptions={initPartnerOptions}
            fetchOptions={searchCompany}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="channel" required label="推广渠道">
          <DebounceSelect
            mode="multiple"
            initOptions={initChannelOptions}
            placeholder="请输入搜索"
            fetchOptions={searchChannel}
          />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={6} />
        </Form.Item>
      </FormModal>

      <Table<ProductsType>
        scroll={{ x: "max-content" }}
        pagination={{ showSizeChanger: true, total: dataSourceCount }}
        rowKey="id"
        onChange={tableChange}
        columns={columns}
        dataSource={dataSource}
      />
    </LocaleWrap>
  );
}
