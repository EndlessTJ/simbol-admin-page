"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import DebounceSelect, { OptionsType } from "@/components/DebounceSelect";
import SearchActionWrap from "@/components/SearchActionWrap";
import FormModal from "@/components/FormModal";
import { read, utils } from "xlsx";
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
  Table,
  Button,
  Radio,
  Upload,
} from "antd";
import { requestPost, requestGet, requestPut } from "@/lib/api-client";
import {
  CommonType,
  PartnerChannelType,
  ModalFormText,
  ModalFormHandleStatus,
  CompanyEnum,
  PaginatedResult,
  FundListTypeEnum,
  FundListType,
  FundListFormType,
  FundListQueryType,
  TradeType,
  DebitCreditType,
  DataTypeEnum,
} from "@/type";
import { Company, TradeTextType } from "@/constants";
import { ColumnsType, TableProps } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { matchTradeType } from "@/app/utils";

const { RangePicker } = DatePicker;
const { Item } = Form;
const fundTableKeyMap = {
  交易时间: "tradeTime",
  "借/贷": "debitCreditType",
  收入金额: "incomeAmount",
  支出金额: "expenseAmount",
  交易用途: "tradeType",
  交易说明: "description",
  交易时间戳: "transactionTime"
} as { [key: string]: keyof FundListFormType | 'incomeAmount' | 'expenseAmount' };

export default function FundList() {
  const [messageApi, contextHolder] = message.useMessage();
  const [updateId, setUpdateId] = useState<string>();
  const [dataSource, setDataSource] = useState<FundListType[]>([]);
  // const [amountTotal, setAmountTotal] = useState<number>(0)
  const [dataSourceCount, setDataSourceCount] = useState<number>(0);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<FundListFormType>();
  const [initChannelOptions, setInitChannelOptions] = useState<OptionsType[]>();
  const [initPartnerOptions, setInitPartnerOptions] = useState<OptionsType[]>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<FundListQueryType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Array<{ id: string }>>();
  const [batchUpdateModal, setBatchUpdateModal] = useState<boolean>(false);
  const [selectedKey, setselectedKey] = useState<React.Key[]>();
  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] =
    useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>(
      "CREATE_OPEN"
    );
  const [currentFundType, setCurrentFundType] =
    useState<keyof typeof FundListTypeEnum>("INCOME");
  const [curDebitCreditType, setCurDebitCreditType] =
    useState<keyof typeof DebitCreditType>("CREDIT");
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

  const updateItem = useCallback(
    async (record: FundListType) => {
      handleEditModal("UPDATE_OPEN");
      if (currentFundType === "INCOME") {
        setInitChannelOptions([]);
        setInitPartnerOptions([
          {
            value: (record.settlementPartner as PartnerChannelType).id,
            label: (record.settlementPartner as PartnerChannelType).name,
          },
        ]);
        setCurDebitCreditType("CREDIT");
      }

      if (currentFundType === "EXPENSE") {
        setInitChannelOptions([
          {
            value: (record.settlementChannel as PartnerChannelType).id,
            label: (record.settlementChannel as PartnerChannelType).name,
          },
        ]);
        setInitPartnerOptions([]);
        setCurDebitCreditType("DEBIT");
      }
      setUpdateId(record.id);
      setInitValues({
        tradeTime: dayjs(record.tradeTime), // 交易时间
        tradeType: record.tradeType, // 交易类型
        settlementChannelId: record?.settlementChannel?.id, // 收款方
        settlementPartnerId: record?.settlementPartner?.id, // 打款方
        tradeEntity: record.tradeEntity, // 交易主体
        amount: record.amount, // 交易金额
        description: record.description, // 交易描述
        debitCreditType: record.debitCreditType, // 借贷类型
        isPrepayment: record.isPrepayment, // 是否预付
      });
    },
    [currentFundType, handleEditModal]
  );

  const getDataSource = useCallback(async () => {
    setLoading(true);
    const data = await requestGet<PaginatedResult<FundListType>>(
      "/transaction-detail/list",
      {
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortBy: "tradeTime",
        sortOrder: "DESC",
        debitCreditType: currentFundType === "INCOME" ? "CREDIT" : "DEBIT",
        ...searchParams,
      }
    );
    setLoading(false);
    setDataSource(data.list);
    setDataSourceCount(data.meta.total);
  }, [currentFundType, pagination, searchParams]);

  useEffect(() => {
    getDataSource();
  }, [pathname, pagination, searchParams, getDataSource]);

  useEffect(() => {
    if (!confirmLoading) {
      setModalShow(false);
      setBatchUpdateModal(false);
      getDataSource();
    }
  }, [confirmLoading, getDataSource]);

  const clearModalStatus = () => {
    setInitChannelOptions([]);
    setInitPartnerOptions([]);
  };
  const onSearch = async (values: CommonType) => {
    setPagination({current: 1, pageSize: 10})
    setSearchParams(values as unknown as FundListQueryType);
    
  };

  const handleEditData = async (values: FundListFormType) => {
    try {
      setConfirmLoading(true);
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        values.transactionTime = Date.now().toString();
        values.dataType = DataTypeEnum.RECORD;
        await requestPost("/transaction-detail/create", values);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/transaction-detail/update/${updateId}`, values);
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

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const searchCompany = async (
    value: string,
    type: "partner" | "channel"
  ): Promise<OptionsType[]> => {
    let companys = [] as PartnerChannelType[];
    if (type === "partner") {
      companys = await requestGet("/partners/listbyname", {
        keyword: value,
      });
    }
    if (type === "channel") {
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
    setCurrentFundType(activeKey as keyof typeof FundListTypeEnum);
    setSelectedItem([]);
    setselectedKey([]);
    setPagination({current: 1, pageSize: 10})
  };

  // 删除结算单
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await requestPut(`/transaction-detail/del/${id}`, {});
        getDataSource();
        message.success("删除成功");
      } catch (error) {
        throw error;
      }
    },
    [getDataSource]
  );

  // 文件上传
  const beforeUpload = useCallback(
    async (file: RcFile) => {
      const bufferData = await file.arrayBuffer();
      /* parse */
      const wb = read(bufferData);
      const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
      const jsonData = utils.sheet_to_json<Array<string | number | undefined>>(
        ws,
        { header: 1, range: 1 }
      ); // generate objects
      if (jsonData.length) {
        try {
          const entityItem = (jsonData.shift() as string[]).filter(() => true); // Array.from去除空位
        const keyList = jsonData.shift() as string[];
        const keyObj = {} as {
          [key: number]: keyof FundListFormType | "account" | "brief" | 'incomeAmount' | 'expenseAmount' ;
        };
        let curEntity = CompanyEnum["SBJZ"];
        if (entityItem[1].includes("莘柏景泽")) {
          curEntity = CompanyEnum["SBJZ"];
        }
        if (entityItem[1].includes("青蔓优创")) {
          curEntity = CompanyEnum["QMYC"];
        }
        keyList?.forEach((key: string, index: number) => {
          if (fundTableKeyMap[key]) {
            keyObj[index] = fundTableKeyMap[key];
          }

          // 由于fundTableKeyMap的值是定的是FundListFormType，所以这里单独加上FundListFormType没有的key
          if (key === "对方户名") {
            keyObj[index] = "account";
          }
          if (key === "摘要") {
            keyObj[index] = "brief";
          }
        });
        const tableList = jsonData
          .slice(0, -2)
          .map((item: (string | number | undefined)[]) => {
            const fundItem = {} as {
              [key: string]: string | number | undefined;
            };
            item.forEach((el: string | number | undefined, index: number) => {
              if (keyObj[index]) {
                fundItem[keyObj[index]] = el;
              }
            });
            return fundItem;
          });
        const payload: FundListFormType[] = tableList.map((item) => {
          const payloadItem = {} as FundListFormType;
          payloadItem.tradeEntity = curEntity;
          payloadItem.tradeTime = dayjs(item.tradeTime);
          payloadItem.transactionTime = item.transactionTime as string;
          payloadItem.dataType = DataTypeEnum["IMPORT"];
          payloadItem.isPrepayment = false;
          payloadItem.amount = (item.debitCreditType === '借' ? item.expenseAmount : item.incomeAmount) as number;
          payloadItem.description = item.description as string;
          payloadItem.tradeType = matchTradeType(
            item.tradeType,
            item.debitCreditType as "借" | "贷",
            item.brief as string
          );
          if (item.debitCreditType === "借") {
            payloadItem.debitCreditType = DebitCreditType["DEBIT"];
            payloadItem.settlementChannelId = item.account as string;
          }
          if (item.debitCreditType === "贷") {
            payloadItem.debitCreditType = DebitCreditType["CREDIT"];
            payloadItem.settlementPartnerId = item.account as string;
          }
          return payloadItem;
        });
        messageApi.loading({ content: "文件上传中" });
        const result = await requestPost<void>(
          "/transaction-detail/batch-create",
          payload
        );
        messageApi.destroy();
        getDataSource();
        return result;
        } catch (error) {
          console.log(error)
        }
        
      }
      return false;
    },
    [getDataSource, messageApi]
  );

  const columns: ColumnsType<FundListType> = useMemo(
    () => [
      {
        title: "交易时间",
        dataIndex: "tradeTime",
        key: "tradeTime",
        width: "120px",
        render: (tradeTime: Date) => dayjs(tradeTime).format("YYYY-MM-DD"),
      },
      {
        title: "结算金额",
        dataIndex: "amount",
        key: "amount",
        width: "120px",
      },
      {
        title: "交易类型",
        dataIndex: "tradeType",
        key: "tradeType",
        width: "100px",
        render: (tradeType: keyof typeof TradeType) => TradeTextType[tradeType],
      },
      {
        title: currentFundType === "INCOME" ? "付款公司" : "收款公司",
        dataIndex:
          currentFundType === "INCOME"
            ? "settlementPartner"
            : "settlementChannel",
        key:
          currentFundType === "INCOME"
            ? "settlementPartner"
            : "settlementChannel",
        width: "100px",
        render: (settlementCompany: PartnerChannelType) =>
          settlementCompany?.name,
      },
      {
        title: "交易主体",
        dataIndex: "tradeEntity",
        key: "tradeEntity",
        width: "100px",
        // render: (tradeEntity: keyof typeof CompanyEnum) =>
        //   CompanyEnum[tradeEntity],
      },

      {
        title: "描述",
        dataIndex: "remark",
        key: "remark",
        width: "200px",
      },
      {
        title: "是否预付",
        dataIndex: "isPrepayment",
        key: "isPrepayment",
        width: "80px",
        render: (isPrepayment: boolean) => (isPrepayment ? "是" : "否"),
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
            {/* <Button size="small" onClick={() => copyItem(record)} type="link">复制</Button> */}
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
    [currentFundType, deleteItem, updateItem]
  );
  const rowSelection: TableProps<FundListType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: FundListType[]) => {
      const list = selectedRows.map((item) => ({ id: item.id }));
      setSelectedItem(list);
      setselectedKey(selectedRowKeys);
    },
    selectedRowKeys: selectedKey,
  };

  const handleBatchUpdateModal = useCallback(
    (handleType: ModalFormHandleStatus, form?: FormInstance) => {
      if (handleType !== "CONFIRM") {
        setBatchUpdateModal(!batchUpdateModal);
      }
      if (handleType === "CONFIRM" && form) {
        form
          .validateFields()
          .then(() => {
            form.submit();
          })
          .catch(() => {});
      }
    },
    [batchUpdateModal]
  );

  const batchUpdate = async (values: FundListFormType) => {
    try {
      if(values.settlementChannelId || values.settlementPartnerId || values.isPrepayment !== void 0) {
        setConfirmLoading(true);
        await requestPut("/transaction-detail/batch-update", {
          ids: selectedItem,
          params: {
            isPrepayment: values.isPrepayment,
            settlementChannelId: values.settlementChannelId,
            settlementPartnerId: values.settlementPartnerId,
          },
        });
        setConfirmLoading(false);
        clearModalStatus();
        message.success("修改成功");
      } else {
        message.warning('至少选择一个修改内容')
      }

    } catch (error) {
      setConfirmLoading(false);
      message.error("请求错误");
      console.log(error);
    }
  };
  return (
    <LocaleWrap>
      {contextHolder}
      <AdvancedSearchForm onFinish={onSearch}>
        <Col span={8} key="tradeTimeRange">
          <Item name="tradeTimeRange" label="交易日期">
            <RangePicker />
          </Item>
        </Col>

        <Col span={8} key="tradeType">
          <Item name="tradeType" label="交易类型">
            <Select
              placeholder="请选择"
              style={{ width: "100%" }}
              options={Object.keys(TradeType).map((value: string) => ({
                value,
                label: TradeTextType[value as TradeType],
              }))}
            ></Select>
          </Item>
        </Col>
        {currentFundType === "INCOME" ? (
          <Col span={8} key="settlementPartnerId">
            <Item name="settlementPartnerId" label="付款公司">
              <DebounceSelect
                allowClear
                showSearch
                fetchOptions={(value: string) =>
                  searchCompany(value, "partner")
                }
              />
            </Item>
          </Col>
        ) : (
          <Col span={8} key="settlementChannelId">
            <Item name="settlementChannelId" label="收款公司">
              <DebounceSelect
                allowClear
                showSearch
                fetchOptions={(value: string) =>
                  searchCompany(value, "channel")
                }
              />
            </Item>
          </Col>
        )}

        <Col span={8} key="tradeEntity">
          <Item name="tradeEntity" label="签约主体">
            <Select
              allowClear
              style={{ width: "100%" }}
              options={[
                { value: CompanyEnum.QMYC, label: Company["QMYC"] },
                { value: CompanyEnum.SBJZ, label: Company["SBJZ"] },
              ]}
            ></Select>
          </Item>
        </Col>

        <Col span={8} key="isPrepayment">
          <Item name="isPrepayment" label={`是否预付`}>
            <Select
              allowClear
              style={{ width: "100%" }}
              options={[
                { value: true, label: "是" },
                { value: false, label: "否" },
              ]}
            ></Select>
          </Item>
        </Col>
      </AdvancedSearchForm>
      <SearchActionWrap>
        <Space>
          {selectedKey?.length ? (
            <Button
              onClick={() => {
                handleBatchUpdateModal("CREATE_OPEN");
              }}
              type="primary"
            >
              批量修改
            </Button>
          ) : null}
          <Button
            onClick={() => {
              handleEditModal("CREATE_OPEN");
            }}
            type="primary"
          >
            创建
          </Button>
          <Upload maxCount={1} beforeUpload={beforeUpload}>
            <Button icon={<UploadOutlined />}>导入</Button>
          </Upload>
        </Space>
      </SearchActionWrap>

      <FormModal<FundListFormType>
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      >
        <Form.Item name="tradeTime" label="交易时间">
          <DatePicker />
        </Form.Item>
        <Form.Item name="debitCreditType" required label="收支类型">
          <Select
            allowClear
            onChange={(value: keyof typeof DebitCreditType) => {
              setCurDebitCreditType(value);
            }}
            style={{ width: "100%" }}
            options={[
              { value: "DEBIT", label: "付款" },
              { value: "CREDIT", label: "收款" },
            ]}
          ></Select>
        </Form.Item>
        {curDebitCreditType === "CREDIT" ? (
          <Form.Item name="settlementPartnerId" required label="付款公司">
            <DebounceSelect
              initOptions={initPartnerOptions}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "partner")}
            />
          </Form.Item>
        ) : (
          <Form.Item name="settlementChannelId" required label="收款公司">
            <DebounceSelect
              initOptions={initChannelOptions}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "channel")}
            />
          </Form.Item>
        )}

        <Form.Item name="tradeEntity" required label="交易主体">
          <Select
            placeholder="请选择"
            style={{ width: "100%" }}
            options={Object.values(CompanyEnum).map((value: string) => ({
              value,
              label: value,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="tradeType" required label="交易类型">
          <Select
            placeholder="请选择"
            style={{ width: "100%" }}
            options={Object.keys(TradeType).map((value: string) => ({
              value,
              label: TradeTextType[value as keyof typeof TradeType],
            }))}
          ></Select>
        </Form.Item>

        <Form.Item name="amount" required label="总金额">
          <InputNumber prefix="￥" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="isPrepayment" label="是否预付">
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入" />
        </Form.Item>
      </FormModal>
      <FormModal<FundListFormType>
        handleOk={handleBatchUpdateModal}
        modalTitle={"批量更新"}
        confirmLoading={confirmLoading}
        onFinish={batchUpdate}
        handleCancel={handleBatchUpdateModal}
        show={batchUpdateModal}
      >
        {curDebitCreditType === "CREDIT" ? (
          <Form.Item name="settlementPartnerId" label="付款公司">
            <DebounceSelect
              initOptions={initPartnerOptions}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "partner")}
            />
          </Form.Item>
        ) : (
          <Form.Item name="settlementChannelId" label="收款公司">
            <DebounceSelect
              initOptions={initChannelOptions}
              placeholder="请输入搜索"
              allowClear
              showSearch
              fetchOptions={(value: string) => searchCompany(value, "channel")}
            />
          </Form.Item>
        )}
        <Form.Item name="isPrepayment" label="是否预付">
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
      </FormModal>

      <Tabs
        onChange={tabChange}
        type="card"
        items={[
          {
            label: `收入列表`,
            key: FundListTypeEnum["INCOME"],
            children: (
              <Table<FundListType>
                loading={loading}
                pagination={{ showSizeChanger: true, total: dataSourceCount, current: pagination?.current, pageSize: pagination?.pageSize }}
                rowSelection={{ ...rowSelection }}
                rowKey="id"
                scroll={{ x: "max-content" }}
                onChange={tableChange}
                columns={columns}
                dataSource={dataSource}
              />
            ),
          },
          {
            label: `支出列表`,
            key: FundListTypeEnum["EXPENSE"],
            children: (
              <Table<FundListType>
                loading={loading}
                rowSelection={{ ...rowSelection }}
                pagination={{ showSizeChanger: true, total: dataSourceCount, current: pagination?.current, pageSize: pagination?.pageSize }}
                rowKey="id"
                scroll={{ x: "max-content" }}
                onChange={tableChange}
                columns={columns}
                dataSource={dataSource}
              />
            ),
          },
        ]}
      />
    </LocaleWrap>
  );
}
