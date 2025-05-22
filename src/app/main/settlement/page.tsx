"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import _ from "lodash";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import DebounceSelect, { OptionsType } from "@/components/DebounceSelect";
import SearchActionWrap from "@/components/SearchActionWrap";
import FormModal from "@/components/FormModal";
import {
  FormInstance,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  TablePaginationConfig,
  Tabs,
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
  ModalFormText,
  ModalFormHandleStatus,
  SettlementType,
  SettlementFormType,
  SettlementQueryType,
  CompanyEnum,
  SettlementTypeEnum,
  SettlementStatusTextEnum,
  SettlementStatusEnum,
  PaginatedResult,
} from "@/type";

const { RangePicker } = DatePicker;
const { Item } = Form;

export default function Settlement() {
  const [updateId, setUpdateId] = useState<string>();
  // const [incomingDataSource, setIncomingDataSource] = useState<
  //   SettlementType[]
  // >([]);
  // const [outgoingDataSource, setOutgoingDataSource] = useState<
  //   SettlementType[]
  // >([]);
  const [dataSource, setDataSource] = useState<SettlementType[]>([]);
  const [dataSourceCount, setDataSourceCount] = useState<number>(0);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<SettlementFormType>();
  const [productOptions, setProductOptions] = useState<OptionsType[]>();
  const [initChannelOptions, setInitChannelOptions] = useState<OptionsType[]>();
  const [initPartnerOptions, setInitPartnerOptions] = useState<OptionsType[]>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<OptionsType[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<SettlementQueryType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] =
    useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>(
      "CREATE_OPEN"
    );
  const [currentSettlementType, setCurrentSettlementType] =
    useState<keyof typeof SettlementTypeEnum>("INCOMING");
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
        form
          .validateFields()
          .then(() => {
            form.submit();
          })
          .catch(() => {});
      }
      if (handleType !== "UPDATE_OPEN" && handleType !== "CONFIRM") {
        clearModalStatus();
      }
    },
    [modalShow]
  );

  const getProductByCompany = useCallback(
    (changedValues: CommonType) => {
      return _.debounce(async () => {
        let productList;
        if (
          currentSettlementType === "INCOMING" &&
          changedValues.settlementPartnerId
        ) {
          productList = await requestGet<ProductsType[]>("/partners/productsByPartnerId", {
            partnerId: changedValues.settlementPartnerId,
          });
        }
        if (
          currentSettlementType === "OUTGOING" &&
          changedValues.settlementChannelId
        ) {
          productList = await requestGet<ProductsType[]>("/channels/productsByChannelId", {
            channelId: changedValues.settlementChannelId,
          });
        }
        const productOptions = productList?.map((product: ProductsType) => ({
          label: product.name,
          value: product.id,
        }));
        setProductOptions(productOptions);
      }, 600)();
    },
    [currentSettlementType]
  );

  const editFormValuesChange = useCallback(
    async (changedValues: CommonType) => {
      if (
        changedValues.settlementPartnerId ||
        changedValues.settlementChannelId
      ) {
        getProductByCompany(changedValues);
      }
      if (
        (changedValues as { settlementProductIds: string[] })
          .settlementProductIds?.length
      ) {
        _.debounce(async () => {
          const settlementProducts = (
            changedValues as { settlementProductIds: string[] }
          ).settlementProductIds.map((value) => {
            return productOptions?.find((el) => el.value === value);
          });
          setSelectedProducts((settlementProducts as OptionsType[]) || []);
        }, 300)();

        // setSelectedProducts(changedValues.settlementProductIds as string[]);
      }
    },
    [getProductByCompany, productOptions]
  );

  const updateItem = useCallback(
    async (record: SettlementType) => {
      handleEditModal("UPDATE_OPEN");
      if (currentSettlementType === "INCOMING") {
        setInitChannelOptions([]);
        setInitPartnerOptions([
          {
            value: (record.settlementPartner as PartnerChannelType).id,
            label: (record.settlementPartner as PartnerChannelType).name,
          },
        ]);
        await editFormValuesChange({
          settlementPartnerId: (record.settlementPartner as PartnerChannelType)
            .id,
        });
      }

      if (currentSettlementType === "OUTGOING") {
        setInitChannelOptions([
          {
            value: (record.settlementChannel as PartnerChannelType).id,
            label: (record.settlementChannel as PartnerChannelType).name,
          },
        ]);
        setInitPartnerOptions([]);
        await editFormValuesChange({
          settlementChannelId: (record.settlementChannel as PartnerChannelType)
            .id,
        });
      };
      const productObj = {} as {[key: string]: string}; // 产品金额的初始值
      const productAmountValue = {} as {[key: string]: string};// 产品金额输入项数据
      record.settlementProducts.forEach((item) => { productObj[item.id] = item.name})
      const curSelectedProducts = record.productAmount?.map(item => {
        productAmountValue[`productAmount_${item.productId}`] = item.amount.toString();
        return {value: item.productId, label: productObj[item.productId]};
      })
      setSelectedProducts(curSelectedProducts || []);
      
      setUpdateId(record.id);
      // setTimeout(() => {
        setInitValues({
          settlementPartnerId: record?.settlementPartner?.id, // 结算产品方Id
          settlementChannelId: record?.settlementChannel?.id, // 结算渠道方Id
          settlementEntity: record.settlementEntity, // 结算主体
          settlementType: record.settlementType,
          amount: record.amount, // 结算金额
          settlementPeriod: [dayjs(record.startDate), dayjs(record.endDate)], // 结算金额
          settlementStatus: record.settlementStatus, // 结算单状态
          number: record.number, // 结算数量
          settlementProductIds: record.settlementProducts.map(
            (product) => product.id
          ), // 结算产品Id
          remark: record.remark,
          invoiceRate: record.invoiceRate, // 发票税率
          ...productAmountValue
        });
      // });
    },
    [currentSettlementType, editFormValuesChange, handleEditModal]
  );

  const copyItem = useCallback(
    async (record: SettlementType) => {
      handleEditModal("CREATE_OPEN"); 
      if (currentSettlementType === "INCOMING") {
        setInitChannelOptions([]);
        setInitPartnerOptions([
          {
            value: (record.settlementPartner as PartnerChannelType).id,
            label: (record.settlementPartner as PartnerChannelType).name,
          },
        ]);
        await editFormValuesChange({
          settlementPartnerId: (record.settlementPartner as PartnerChannelType)
            .id,
        });
      }

      if (currentSettlementType === "OUTGOING") {
        setInitChannelOptions([
          {
            value: (record.settlementChannel as PartnerChannelType).id,
            label: (record.settlementChannel as PartnerChannelType).name,
          },
        ]);
        setInitPartnerOptions([]);
        await editFormValuesChange({
          settlementChannelId: (record.settlementChannel as PartnerChannelType)
            .id,
        });
      };
      const productObj = {} as {[key: string]: string}; // 产品金额的初始值
      const productAmountValue = {} as {[key: string]: string};// 产品金额输入项数据
      record.settlementProducts.forEach((item) => { productObj[item.id] = item.name})
      const curSelectedProducts = record.productAmount?.map(item => {
        productAmountValue[`productAmount_${item.productId}`] = item.amount.toString();
        return {value: item.productId, label: productObj[item.productId]};
      })
      setSelectedProducts(curSelectedProducts || []);
      
      // setUpdateId(record.id);
      // setTimeout(() => {
        setInitValues({
          settlementPartnerId: record?.settlementPartner?.id, // 结算产品方Id
          settlementChannelId: record?.settlementChannel?.id, // 结算渠道方Id
          settlementEntity: record.settlementEntity, // 结算主体
          settlementType: record.settlementType,
          amount: record.amount, // 结算金额
          settlementPeriod: [dayjs(record.startDate), dayjs(record.endDate)], // 结算金额
          settlementStatus: record.settlementStatus, // 结算单状态
          number: record.number, // 结算数量
          settlementProductIds: record.settlementProducts.map(
            (product) => product.id
          ), // 结算产品Id
          remark: record.remark,
          invoiceRate: record.invoiceRate, // 发票税率
          ...productAmountValue
        });
      // });
    },
    [currentSettlementType, editFormValuesChange, handleEditModal]
  );

  const getDataSource = useCallback(async () => {
    setLoading(true);

    const data = await requestGet<PaginatedResult<SettlementType>>("/settlement/list", {
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 10,
      sortBy: "createAt",
      sortOrder: "ASC",
      settlementType: currentSettlementType,
      ...searchParams,
    });
    setLoading(false);
    // const incomingData = [] as SettlementType[];
    // const outgoingData = [] as SettlementType[];
    // data.list.forEach((settlement: SettlementType) => {
    //   if (settlement.settlementType === "INCOMING") {
    //     incomingData.push(settlement);
    //   }
    //   if (settlement.settlementType === "OUTGOING") {
    //     outgoingData.push(settlement);
    //   }
    // });
    // setOutgoingDataSource(outgoingData);
    // setIncomingDataSource(incomingData);
    setDataSource(data.list);
    setDataSourceCount(data.meta.total);
  }, [currentSettlementType, pagination, searchParams]);

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
    setProductOptions([]);
    setSelectedProducts([]);
  };

  const handleEditData = async (values: SettlementFormType) => {
    try {
      setConfirmLoading(true);
      const productAmount = Object.keys(values).filter((item) => item.includes('productAmount_')).map((key) => ({productId: key.split('_')[1], amount: parseFloat(values[key as keyof SettlementFormType] as string) }));
      if( productAmount.reduce((acc, cur ) => (acc + cur.amount), 0) !== parseFloat(values.amount as unknown as string) ) {
        message.error('产品金额之和不等于总金额');
        setConfirmLoading(false);
        return false;
      }
      const settlementPayload = {
        settlementEntity: values.settlementEntity, // 结算主体
        settlementType: currentSettlementType,
        amount: values.amount, // 结算金额
        productAmount,
        startDate: values.settlementPeriod[0], // 结算周期开始日期
        endDate: values.settlementPeriod[1], // 结算周期结束日期
        settlementStatus: values.settlementStatus, // 结算单状态
        number: values.number, // 结算数量
        settlementProductIds: values.settlementProductIds, // 结算产品Id
        remark: values.remark,
        invoiceRate: values.invoiceRate, // 发票税率
      } as SettlementFormType;

      if (currentSettlementType === "INCOMING") {
        settlementPayload.settlementPartnerId = values.settlementPartnerId; // 结算产品方Id
      }
      if (currentSettlementType === "OUTGOING") {
        settlementPayload.settlementChannelId = values.settlementChannelId; // 结算产品方Id
      }
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        settlementPayload.settlementStatus = SettlementStatusEnum["GENERATED"];
        await requestPost("/settlement/create", settlementPayload);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/settlement/update/${updateId}`, settlementPayload);
      }
      setConfirmLoading(false);
      clearModalStatus();
      message.success("创建成功");
    } catch (error) {
      setConfirmLoading(false);
      message.error("请求错误");
      console.log(error);
    }
  };
  const onSearch = async (values: CommonType) => {
    setSearchParams(values as unknown as SettlementQueryType);
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const searchCompany = async (value: string): Promise<OptionsType[]> => {
    let companys = [] as PartnerChannelType[];
    if (currentSettlementType === "INCOMING") {
      companys = await requestGet("/partners/listbyname", {
        keyword: value,
      });
    }
    if (currentSettlementType === "OUTGOING") {
      companys = await requestGet("/channels/listbyname", {
        keyword: value,
      });
    }

    return companys.map((item: PartnerChannelType) => ({
      label: item.name,
      value: item.id,
    }));
  };

  const tabChange = (activeKey: string) => {
    setCurrentSettlementType(activeKey as keyof typeof SettlementTypeEnum);
  };

  // 处理表格中修改状态
  const handleSettlementStatusChange = useCallback(
    async (
      settlementStatus: keyof typeof SettlementStatusEnum,
      settlementid: string
    ) => {
      try {
        await requestPut(`/settlement/updateStatus/${settlementid}`, {
          settlementStatus,
        });
        getDataSource();
        message.success("更新成功");
      } catch (error) {
        throw error;
      }
    },
    [getDataSource]
  );

  // 删除结算单
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await requestPut(`/settlement/del/${id}`, {});
        getDataSource();
        message.success("删除成功");
      } catch (error) {
        throw error;
      }
    },
    [getDataSource]
  );

  const columns: TableProps<SettlementType>["columns"] = useMemo(
    () => [
      {
        title: "结算金额",
        dataIndex: "amount",
        key: "amount",
        width: "120px",
        // render: (status: keyof typeof PlansStatus) => PlansStatus[status],
      },
      {
        title: "结算周期",
        dataIndex: "startDate",
        key: "startDate",
        width: "220px",
        render: (_, record) =>
          `${dayjs(record.startDate).format("YYYY-MM-DD")} 至 ${dayjs(
            record.endDate
          ).format("YYYY-MM-DD")}`,
      },
      {
        title: "结算数量",
        dataIndex: "number",
        key: "number",
        width: "100px",
      },
      {
        title: "结算产品",
        dataIndex: "settlementProducts",
        key: "settlementProducts",
        width: "200px",
        render: (products: ProductsType[], record) => {
          const amountObj = record.productAmount?.reduce((acc, cur) => { acc[cur.productId] = cur.amount; return acc}, {} as {[key: string]: number})
          return products.map((product) => <Tag key={product.id}>{amountObj ? `${product.name} ¥${amountObj?.[product.id]}` : product.name}</Tag>)
        }
      },
      {
        title: "支付日期",
        dataIndex: "payDate",
        key: "payDate",
        width: "120px",
        render: (payDate: Date) =>
          payDate ? dayjs(payDate).format("YYYY-MM-DD") : "-",
      },
      {
        title: "发票税率",
        dataIndex: "invoiceRate",
        key: "invoiceRate",
        width: "100px",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
        width: "200px",
      },
      {
        title: "结算状态",
        dataIndex: "settlementStatus",
        key: "settlementStatus",
        fixed: "right",
        width: "120px",
        render: (
          settlementStatus: SettlementStatusEnum,
          record: SettlementType
        ) => (
          <Select
            value={settlementStatus}
            style={{ width: "100%" }}
            onChange={(value) => handleSettlementStatusChange(value, record.id)}
            options={Object.keys(SettlementStatusTextEnum).map((item) => ({
              value: item,
              label:
                SettlementStatusTextEnum[
                  item as keyof typeof SettlementStatusTextEnum
                ],
            }))}
          />
        ),
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        width: "80px",
        render: (_, record) => (
          <Space size={0}>
            <Button size="small" onClick={() => updateItem(record)} type="link">
              修改
            </Button>
            <Button size="small" onClick={() => copyItem(record)} type="link">复制</Button>
            <Popconfirm
              title="确定要删除吗?"
              onConfirm={() => deleteItem(record.id)}
            >
              <Button size="small" type="link">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteItem, handleSettlementStatusChange, updateItem]
  );

  const outgoingColumns: TableProps<SettlementType>["columns"] = useMemo(
    () => [
      {
        title: "付款方",
        dataIndex: "settlementEntity",
        key: "settlementEntity",
        fixed: true,
        width: "120px",
      },
      {
        title: "收款方",
        dataIndex: "settlementChannel",
        key: "settlementChannel",
        fixed: true,
        width: "100px",
        render: (settlementChannel: PartnerChannelType) =>
          settlementChannel?.name,
      },
      ...columns,
    ],
    [columns]
  );
  const incomingColumns: TableProps<SettlementType>["columns"] = useMemo(
    () => [
      {
        title: "付款方",
        dataIndex: "settlementPartner",
        key: "settlementPartner",
        fixed: true,
        width: "120px",
        render: (settlementPartner: PartnerChannelType) =>
          settlementPartner?.name,
      },
      {
        title: "收款方",
        dataIndex: "settlementEntity",
        key: "settlementEntity",
        fixed: true,
        width: "100px",
      },
      ...columns,
    ],
    [columns]
  );

  return (
    <LocaleWrap>
      <AdvancedSearchForm onFinish={onSearch}>
        {currentSettlementType === "INCOMING" ? (
          <Col span={8} key={"settlementPartnerId"}>
            <Item name={`settlementPartnerId`} label={`产品方结算公司`}>
              <DebounceSelect
                allowClear
                showSearch
                fetchOptions={searchCompany}
              />
            </Item>
          </Col>
        ) : (
          <Col span={8} key={"settlementChannelId"}>
            <Item name={`settlementChannelId`} label={`渠道方结算公司`}>
              <DebounceSelect
                allowClear
                showSearch
                fetchOptions={searchCompany}
              />
            </Item>
          </Col>
        )}

        <Col span={8} key={"settlementPeriod"}>
          <Item name={`settlementPeriod`} label={`结算周期`}>
            <RangePicker />
          </Item>
        </Col>

        <Col span={8} key={"settlementStatus"}>
          <Item name={`settlementStatus`} label={`结算状态`}>
            <Select
              placeholder="请选择"
              style={{ width: "100%" }}
              options={Object.keys(SettlementStatusTextEnum).map(
                (value: string) => ({
                  value,
                  label:
                    SettlementStatusTextEnum[
                      value as keyof typeof SettlementStatusTextEnum
                    ],
                })
              )}
            ></Select>
          </Item>
        </Col>
        {/* <Col span={8} key={"settlementType"}>
          <Item name={`settlementType`} label={`结算类型`}>
            <Select
              placeholder="请选择"
              options={[
                { value: "INCOMING", label: "产品结算(收入)" },
                { value: "OUTGOING", label: "渠道结算（支出）" },
              ]}
            ></Select>
          </Item>
        </Col> */}
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

      <FormModal<SettlementFormType>
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        onValuesChange={editFormValuesChange}
        show={modalShow}
      >
        {currentSettlementType === "INCOMING" ? (
          <Form.Item name="settlementPartnerId" required label="结算公司">
            <DebounceSelect
              initOptions={initPartnerOptions}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={searchCompany}
            />
          </Form.Item>
        ) : (
          <Form.Item name="settlementChannelId" required label="结算渠道">
            <DebounceSelect
              initOptions={initChannelOptions}
              placeholder="请输入搜索"
              fetchOptions={searchCompany}
            />
          </Form.Item>
        )}

        <Form.Item name="settlementEntity" required label="结算主体">
          <Select
            placeholder="请选择"
            style={{ width: "100%" }}
            options={Object.values(CompanyEnum).map((value: string) => ({
              value,
              label: value,
            }))}
          ></Select>
        </Form.Item>
        {openModalFormOpenStatus === "UPDATE_OPEN" ? (
          <Form.Item name="settlementStatus" required label="结算状态">
            <Select
              placeholder="请选择"
              style={{ width: "100%" }}
              options={Object.keys(SettlementStatusTextEnum).map(
                (value: string) => ({
                  value,
                  label:
                    SettlementStatusTextEnum[
                      value as keyof typeof SettlementStatusTextEnum
                    ],
                })
              )}
            ></Select>
          </Form.Item>
        ) : null}

        <Form.Item name="settlementProductIds" required label="结算产品">
          <Select
            mode="multiple"
            allowClear
            placeholder="请选择"
            options={productOptions}
          ></Select>
        </Form.Item>

        {selectedProducts.map((item) => (
          <Form.Item
            labelCol={{ xs: { span: 24 }, sm: { span: 12 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 12 } }}
            key={item.value}
            name={`productAmount_${item.value}`}
            required
            label={`${item.label}金额`}
          >
            <InputNumber size="small" prefix="￥" style={{ width: "100%" }} />
          </Form.Item>
        ))}

        <Form.Item name="settlementPeriod" label="结算周期">
          <RangePicker />
        </Form.Item>

        <Form.Item name="amount" required label="总金额">
          {/* <Input placeholder="请输入" /> */}
          <InputNumber prefix="￥" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="number" required label="结算数量">
          {/* <Input placeholder="请输入" /> */}
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="invoiceRate" label="发票税率">
          <Input.TextArea placeholder="请输入" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="请输入" />
        </Form.Item>
      </FormModal>

      <Tabs
        onChange={tabChange}
        type="card"
        items={[
          {
            label: `产品结算(收入)`,
            key: SettlementTypeEnum["INCOMING"],
            children: (
              <Table<SettlementType>
                loading={loading}
                pagination={{ showSizeChanger: true, total: dataSourceCount }}
                rowKey="id"
                scroll={{ x: "max-content" }}
                onChange={tableChange}
                columns={incomingColumns}
                dataSource={dataSource}
              />
            ),
          },
          {
            label: `渠道结算（支出）`,
            key: SettlementTypeEnum["OUTGOING"],
            children: (
              <Table<SettlementType>
                loading={loading}
                pagination={{ showSizeChanger: true, total: dataSourceCount }}
                rowKey="id"
                scroll={{ x: "max-content" }}
                onChange={tableChange}
                columns={outgoingColumns}
                dataSource={dataSource}
              />
            ),
          },
        ]}
      />
    </LocaleWrap>
  );
}
