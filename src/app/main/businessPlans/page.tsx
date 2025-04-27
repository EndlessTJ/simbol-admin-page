"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FormInstance,
  message,
  Select,
  Space,
  TablePaginationConfig,
  Typography,
} from "antd";
import _ from 'lodash';
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
  Table,
  Button,
} from "antd";
import { requestPost, requestGet, requestPut } from "@/lib/api-client";
import {
  CommonType,
  PartnerChannelType,
  ProductsType,
  ModalFormText,
  ModalFormHandleStatus,
  BusinessPlansType,
  ProductLinksType,
  PlansStatus,
  PlansPricingType,
  BusinessPlansFormType,
  BusinessPlansQueryType,
} from "@/type";

const { RangePicker } = DatePicker;
const { Item } = Form;
const { Text } = Typography;
export default function BusinessPlans() {
  const [updateId, setUpdateId] = useState<string>();
  const [dataSource, setDataSource] = useState<BusinessPlansType[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<BusinessPlansFormType>();
  const [initProductsOptions, setInitProductsOptions] = useState<OptionsType[]>();
  const [initChannelOptions, setInitChannelOptions] = useState<OptionsType[]>();
  const [linkOptions, setLinkOptions] = useState<OptionsType[]>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<BusinessPlansQueryType>();
  const [loading, setLoading] = useState<boolean>(false)
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
        form
          .validateFields()
          .then(() => {
            form.submit();
          })
          .catch(() => {});
      }
      if (handleType !== "UPDATE_OPEN") {
        clearModalStatus();
      }
    },
    [modalShow],
  );

  const updateItem = useCallback((record: BusinessPlansType) => {
    handleEditModal("UPDATE_OPEN");
    setInitProductsOptions([{value: record.product.id, label: record.product.name}]);
    setInitChannelOptions([{value: record.channel.id, label: record.channel.name}]);
    setLinkOptions([{value: record.link.id, label: record.link.name}])
    setUpdateId(record.id);
    setInitValues({
      name: record.name, // 计划名称
      startDate: dayjs(record.startDate), // 计划开始时间
      endDate: dayjs(record.endDate), // 计划结束时间
      status: record.status, //计划状态
      productId: record.product.id, // 所属产品id
      channelId: record.channel.id, // 投放的渠道Id
      link: record.link.id, // 产品链接
      description: record.description, // 计划描述
      cost: record.cost, //计划单价
      pricingType: record.pricingType, //计价类型
    });
  }, [handleEditModal]);

  const getDataSource = useCallback(async () => {
    setLoading(true)
    const data = await requestGet("/plans/list", {
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 10,
      sortBy: "createAt",
      sortOrder: "ASC",
      ...searchParams,
    });
    setLoading(false)
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

  const clearModalStatus = () => {
    setInitChannelOptions([]);
    setInitProductsOptions([]);
    setLinkOptions([]);
  };

  const handleEditData = async (values: BusinessPlansFormType) => {
    try {
      setConfirmLoading(true);
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        await requestPost("/plans/create", values);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/plans/update/${updateId}`, values);
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
    setSearchParams(values as unknown as BusinessPlansQueryType);
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const searchProducts = async (value: string): Promise<OptionsType[]> => {
    const products = await requestGet("/products/productListByName", {
      keyword: value,
    });
    return products.map((item: ProductsType) => ({
      label: item.name,
      value: item.id,
    }));
  };
  const searchChannel = async (value: string): Promise<OptionsType[]> => {
    const channels = await requestGet("/channels/listbyname", {
      keyword: value,
    });
    return channels.map((item: PartnerChannelType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const searchProductLink = async (value: string): Promise<OptionsType[]> => {
    const productLink = await requestGet("/products/linkListByName", {
      // 修改
      keyword: value,
    });
    return productLink.map((item: ProductLinksType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const editFormValuesChange = (changedValues: CommonType) => {
    (_.debounce(async () => {
      if(changedValues.productId) {
        const linkList = await requestGet("/products/linkListByProductId", {
          // 修改
          productId: changedValues.productId,
        });
        const linkOptions = linkList.map((link: ProductLinksType) => ({label: link.name, value: link.id}))
        setLinkOptions(linkOptions);
      }
    }, 600))()
  }

  const columns: TableProps<BusinessPlansType>["columns"] = useMemo(
    () => [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        fixed: true,
        width: '180px'
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: '80px',
        render: (status: keyof typeof PlansStatus) => PlansStatus[status],
      },
      {
        title: "单价",
        dataIndex: "cost",
        key: "cost",
        width: '60px',
      },
      {
        title: "计价类型",
        dataIndex: "pricingType",
        key: "pricingType",
        width: '100px',
        render: (pricingType: keyof typeof PlansPricingType) => PlansPricingType[pricingType]
      },
      {
        title: "开始时间",
        dataIndex: "startDate",
        key: "startDate",
        render: (startDate: Date) => dayjs(startDate).format('YYYY-MM-DD')
      },
      {
        title: "结束时间",
        dataIndex: "endDate",
        key: "endDate",
        render: (endDate: Date) => dayjs(endDate).format('YYYY-MM-DD')
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description",
        width: '180px',
        render: (description: string) => (
          <Text type="secondary">{description}</Text>
        ),
      },
      {
        title: "所属产品",
        dataIndex: "product",
        key: "product",
        width: '160px',
        render: (product: ProductsType) => product.name,
      },
      {
        title: "投放渠道",
        dataIndex: "channel",
        key: "channel",
        width: '160px',
        render: (channel: PartnerChannelType) => channel.name
      },
      {
        title: "投放链接",
        dataIndex: "link",
        fixed: 'right',
        key: "link",
        render: (link: ProductLinksType) => link.name,
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
          <Item name={`name`} label={`名称`}>
            <Input allowClear placeholder="请输入名称" />
          </Item>
        </Col>
        <Col span={8} key={"startDate"}>
          <Item name={`startDate`} label={`开始时间`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"endDate"}>
          <Item name={`endDate`} label={`结束时间`}>
            <RangePicker />
          </Item>
        </Col>
        <Col span={8} key={"status"}>
          <Item name={`status`} label={`状态`}>
            <Select
              placeholder="请选择"
              style={{ width: "100%" }}
              options={Object.keys(PlansStatus).map((value: string) => ({
                value,
                label: PlansStatus[value as keyof typeof PlansStatus],
              }))}
            ></Select>
          </Item>
        </Col>
        <Col span={8} key={"isDeleted"}>
          <Item name={`isDeleted`} label={`是否被删除`}>
            <Select
              placeholder="请选择"
              options={[{value: 0, label: '已删除'}, {value: 1, label: '未删除'}]}
            ></Select>
          </Item>
        </Col>

        <Col span={8} key={"link"}>
          <Item name={`link`} label={`投放链接`}>
            <DebounceSelect
              allowClear
              showSearch
              fetchOptions={searchProductLink}
            />
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

      <FormModal<BusinessPlansFormType>
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        onValuesChange={editFormValuesChange}
        show={modalShow}
      >
        <Form.Item name="name" required label="名称">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="startDate" label="开始时间">
          <DatePicker showTime placeholder="请选择" />
        </Form.Item>
        <Form.Item name="endDate" label="结束时间">
          <DatePicker showTime placeholder="请选择" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select
            placeholder="请选择"
            options={Object.keys(PlansStatus).map((value: string) => ({
              value,
              label: PlansStatus[value as keyof typeof PlansStatus],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="pricingType" label="计价类型">
          <Select
            placeholder="请选择"
            options={Object.keys(PlansPricingType).map((value: string) => ({
              value,
              label: PlansPricingType[value as keyof typeof PlansPricingType],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="productId" required label="所属产品">
          <DebounceSelect
            showSearch
            placeholder="请输入搜索"
            initOptions={initProductsOptions}
            fetchOptions={searchProducts}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="channelId" required label="投放渠道">
          <DebounceSelect
            initOptions={initChannelOptions}
            placeholder="请输入搜索"
            fetchOptions={searchChannel}
          />
        </Form.Item>
        <Form.Item name="link" label="投放链接">
          <Select
            placeholder="请选择"
            options={linkOptions}
          ></Select>
        </Form.Item>
        <Form.Item name="cost" required label="单价">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入" />
        </Form.Item>
      </FormModal>

      <Table<BusinessPlansType>
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{ showSizeChanger: true }}
        rowKey="id"
        onChange={tableChange}
        columns={columns}
        dataSource={dataSource}
      />
    </LocaleWrap>
  );
}
