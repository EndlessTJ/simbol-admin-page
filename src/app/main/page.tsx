"use client";
import {
  Button,
  Col,
  // DatePicker,
  Divider,
  Dropdown,
  Flex,
  Form,
  MenuProps,
  // message,
  Row,
  Segmented,
  Select,
  Statistic,
} from "antd";
import { Dayjs } from "dayjs";
import styles from "./index.module.scss";
import { useCallback, useEffect, useState } from "react";
import { requestGet } from "@/lib/api-client";
import {
  PartnerChannelType,
  TradeType,
  FinancialSummary,
  // RealFinancialSummary,
  PeriodTypeEnum,
  Company,
} from "@/type";
import { TradeTextType } from "@/constants";
import DebounceSelect, { OptionsType } from "@/components/DebounceSelect";
import LocaleWrap from "@/components/LocaleConfigWrap";
import CompanyLineChart from "./components/CompanyLineChart";
// import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import CycleChart from "./components/CycleChart";
type CompanyName = (typeof Company)[keyof typeof Company];
type PeriodType = (typeof PeriodTypeEnum)[keyof typeof PeriodTypeEnum];
interface FormType {
  channels: string[];
  partners: string[];
  tradeTypes: string[];
  date: [Dayjs, Dayjs];
}

interface TotalDataType {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
}

interface ChartOptionType {
  legend: string[];
  category: string[];
  data: Array<{
    name: string;
    type: "line";
    data: number[];
  }>;
}

const companys: MenuProps["items"] = [
  {
    label: Company.SBJZ,
    key: "SBJZ",
  },
  {
    label: Company.QMYC,
    key: "QMYC",
  },
  {
    label: Company.ALL,
    key: "ALL",
  },
];

// const { RangePicker } = DatePicker;
export default function Dashboard() {
  // const [messageApi, contextHolder] = message.useMessage();
  const [totalDataLoading, setTotalDataLoading] = useState<boolean>(false);
  const [entity, setEntity] = useState<CompanyName>(Company.SBJZ);
  const [filterParams, setFilterParams] = useState<FormType>();
  const [segmentValue, setSegmentValue] = useState<PeriodType>(
    PeriodTypeEnum.REALYEAR
  );
  const [chartSegmentValue, setChartSegmentValue] = useState<PeriodType>(
    PeriodTypeEnum.MONTH
  );
  const [totalData, setTotalData] = useState<TotalDataType>();
  const [companyLineChartOptions, setCompanyLineChartOptions] = useState<{
    incomeOptions: ChartOptionType;
    expenseOptions: ChartOptionType;
  }>();
  const [incomeExpenseChartOptions, setIncomeExpenseChartOptions] =
    useState<ChartOptionType>();
  const [incomeExpenseChartBarOptions, setIncomeExpenseChartBarOptions] =
    useState<ChartOptionType>();
  const [expenseCategory, setExpenseCategory] =
    useState<Array<{ name: string; value: number }>>();
  const [form] = Form.useForm();

  // 处理数据
  const handleData = useCallback((data: FinancialSummary[]) => {
    let totalExpense = 0,
      totalIncome = 0,
      totalProfit = 0;
    data.forEach((item: FinancialSummary) => {
      totalIncome += Number(item.totalIncome);
      totalExpense += Number(item.totalExpense);
      totalProfit += Number(item.profit);
    });
    return {
      totalExpense,
      totalIncome,
      totalProfit,
    };
  }, []);

  // const handleRealData = useCallback((data: RealFinancialSummary[]) => {
  //   let totalExpense = 0,
  //     totalIncome = 0,
  //     totalProfit = 0;
  //   data.forEach((item: RealFinancialSummary) => {
  //     totalIncome += Number(item.totalIncome);
  //     totalExpense += Number(item.totalExpense);
  //     totalProfit += Number(item.totalProfit);
  //   });
  //   console.log(totalExpense, totalIncome, totalProfit);
  // }, []);

  const getData = useCallback(async () => {
    setTotalDataLoading(true);

    const data = await requestGet<FinancialSummary[]>("dashboard/financial", {
      period: segmentValue,
      companies: [entity],
      ...filterParams,
    });
    // 获取实时数据代码，勿删除
    // const data1 = await requestGet<RealFinancialSummary[]>(
    //   "dashboard/real-financial",
    //   {
    //     startDate: new Date("2023-08-18"),
    //     endDate: new Date(),
    //     period: "month",
    //   }
    // );
    const totalDataObj = handleData(data);
    setTotalData(totalDataObj);
    // handleRealData(data1);
    setTotalDataLoading(false);
  }, [entity, filterParams, handleData, segmentValue]);

  const getPartners = useCallback(async (ids: string[]) => {
    if(!ids.length) {
      return []
    }
    return await requestGet<PartnerChannelType[]>("partners/listByIds", {
      ids,
    });
  }, []);

  const getChannels = useCallback(async (ids: string[]) => {
    if(!ids.length) {
      return []
    }
    return await requestGet<PartnerChannelType[]>("channels/listByIds", {
      ids,
    });
  }, []);

  const handleChartData = useCallback( async (data: FinancialSummary[]) => {
    const periodSet = new Set<string>();
    const expenseLegendSet = new Set<string>();
    const incomeLegendSet = new Set<string>();

    const expenseMap: Record<string, Record<string, number>> = {};
    const incomeMap: Record<string, Record<string, number>> = {};

    data.forEach(
      ({ periodDate, channelId, partnerId, totalExpense, totalIncome }) => {
        const dateStr = String(periodDate);
        periodSet.add(dateStr);

        if (channelId) {
          expenseLegendSet.add(channelId);
          expenseMap[channelId] = expenseMap[channelId] || {};
          expenseMap[channelId][dateStr] =
            (expenseMap[channelId][dateStr] || 0) + Number(totalExpense);
        }

        if (partnerId) {
          incomeLegendSet.add(partnerId);
          incomeMap[partnerId] = incomeMap[partnerId] || {};
          incomeMap[partnerId][dateStr] =
            (incomeMap[partnerId][dateStr] || 0) + Number(totalIncome);
        }
      }
    );

    const periodCategory = Array.from(periodSet).sort(); // 按日期排序，保持一致性

    const fillMissingPeriods = (
      map: Record<string, Record<string, number>>
    ) => {
      for (const key in map) {
        periodCategory.forEach((period) => {
          if (!(period in map[key])) {
            map[key][period] = 0;
          }
        });
      }
    };

    fillMissingPeriods(expenseMap);
    fillMissingPeriods(incomeMap);

    const buildSeries = (map: Record<string, Record<string, number>>, compareData: Record<string, string>) =>
      Object.entries(map).map(([name, data]) => ({
        name: compareData[name],
        type: "line" as const,
        data: periodCategory.map((period) => data[period]),
      }));
    const partners = await getPartners(Array.from(incomeLegendSet));
    const channels = await getChannels(Array.from(expenseLegendSet));
    return {
      incomeOptions: {
        legend: partners.map(item => item.name),
        category: periodCategory,
        data: buildSeries(incomeMap, Object.assign({}, ...partners.map(item => ({[item.id]: item.name})))),
      },
      expenseOptions: {
        legend: channels.map(item => item.name),
        category: periodCategory,
        data: buildSeries(expenseMap, Object.assign({}, ...channels.map(item => ({[item.id]: item.name})))),
      },
    };
  }, [getChannels, getPartners]);

  const handleDataWithIncomeExpense = useCallback(
    (data: FinancialSummary[], chartType?: string) => {
      const periodSet = new Set<string>();
      const expenseMap = new Map<string, number>();
      const incomeMap = new Map<string, number>();

      for (const item of data) {
        const dateStr = String(item.periodDate);
        periodSet.add(dateStr);

        if (item.channelId) {
          expenseMap.set(
            dateStr,
            (expenseMap.get(dateStr) || 0) + Number(item.totalExpense)
          );
        }
        if (item.partnerId) {
          incomeMap.set(
            dateStr,
            (incomeMap.get(dateStr) || 0) + Number(item.totalIncome)
          );
        }
      }

      const periodCategory = Array.from(periodSet).sort();
      const profitData: number[] = [];
      const incomeData: number[] = [];
      const expenseData: number[] = [];

      periodCategory.forEach((period) => {
        const income = incomeMap.get(period) || 0;
        const expense = expenseMap.get(period) || 0;

        incomeData.push(income);
        expenseData.push(expense);
        profitData.push(income - expense);
      });

      return {
        legend: ["收入", "支出", "盈利"],
        category: periodCategory,
        data: [
          {
            name: "收入",
            type: chartType || "line",
            data: incomeData,
          },
          {
            name: "支出",
            type: chartType || "line",
            data: expenseData,
          },
          {
            name: "盈利",
            type: chartType || "line",
            data: profitData,
          },
        ],
      };
    },
    []
  );

  const handleDataWithExpenseCategory = useCallback(
    (data: FinancialSummary[]) => {
      const expenseMap = new Map<string, number>();
      const expenseList = [];
      for (const item of data) {
        if (item.channelId) {
          expenseMap.set(
            item.tradeType,
            (expenseMap.get(item.tradeType) || 0) + Number(item.totalExpense)
          );
        }
      }  
      for (const [key, value] of expenseMap) {
        expenseList.push({ name: TradeTextType[key as keyof typeof TradeTextType], value });
      }
      return expenseList;
    },
    []
  );

  const getChartData = useCallback(async () => {
    const data = await requestGet<FinancialSummary[]>("dashboard/financial", {
      period: chartSegmentValue,
      companies: [entity],
      ...filterParams,
    });
    const companyLineChart = await handleChartData(data);
    const incomeExpenseChart = handleDataWithIncomeExpense(
      data
    ) as ChartOptionType;
    const incomeExpenseChartBar = handleDataWithIncomeExpense(
      data,
      "bar"
    ) as ChartOptionType;
    const expenseCategory = handleDataWithExpenseCategory(data);
    setCompanyLineChartOptions(companyLineChart);
    setIncomeExpenseChartOptions(incomeExpenseChart);
    setIncomeExpenseChartBarOptions(incomeExpenseChartBar);
    setExpenseCategory(expenseCategory);
    // setChartData(data);
  }, [
    chartSegmentValue,
    entity,
    filterParams,
    handleChartData,
    handleDataWithExpenseCategory,
    handleDataWithIncomeExpense,
  ]);

  const entitySelect = useCallback(
    (info: { key: string; selectedKeys: string[] }) => {
      setEntity(Company[info.key as keyof typeof Company]);
    },
    []
  );

  const segmentedChange = useCallback((value: PeriodType) => {
    setSegmentValue(value);
  }, []);
  const chartSegmentedChange = useCallback((value: PeriodType) => {
    setChartSegmentValue(value);
  }, []);

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

  const onFormFinish = useCallback((values: FormType) => {
    setFilterParams(values);
  }, []);

  useEffect(() => {
    getChartData();
  }, [getChartData]);
  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <LocaleWrap>
      {/* {contextHolder} */}
      <div className={styles.dashboard}>
        <Flex vertical gap="large">
          <Flex justify="space-between" align="center">
            <Form<FormType>
              layout={"inline"}
              form={form}
              onFinish={onFormFinish}
            >
              <Form.Item name="channels" label="渠道">
                <DebounceSelect
                  style={{ width: "150px" }}
                  allowClear
                  mode="multiple"
                  showSearch
                  fetchOptions={(value: string) =>
                    searchCompany(value, "channel")
                  }
                />
              </Form.Item>
              <Form.Item name="partners" label="品牌方">
                <DebounceSelect
                  style={{ width: "150px" }}
                  allowClear
                  mode="multiple"
                  showSearch
                  fetchOptions={(value: string) =>
                    searchCompany(value, "partner")
                  }
                />
              </Form.Item>
              <Form.Item name="tradeTypes" label="类型">
                <Select
                  placeholder="请选择"
                  style={{ width: "120px" }}
                  mode="multiple"
                  options={Object.keys(TradeType).map((value: string) => ({
                    value,
                    label: TradeTextType[value as keyof typeof TradeType],
                  }))}
                ></Select>
              </Form.Item>
              {/* <Form.Item name="date" label="日期">
                <RangePicker style={{ width: "200px" }} />
              </Form.Item> */}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  筛选
                </Button>
              </Form.Item>
            </Form>
            <Dropdown.Button
              size="small"
              style={{ width: "auto" }}
              menu={{
                items: companys,
                defaultSelectedKeys: ["SBJZ"],
                selectable: true,
                onSelect: entitySelect,
              }}
            >
              {entity}
            </Dropdown.Button>
          </Flex>
          <Divider style={{ margin: "auto" }} />
          <Flex justify="space-between">
            <Segmented
              options={[
                { label: "总计", value: PeriodTypeEnum.ALL },
                { label: "年度", value: PeriodTypeEnum.REALYEAR },
                { label: "季度", value: PeriodTypeEnum.REALQUARTER },
                {
                  label: "月度",
                  value: PeriodTypeEnum.REALMONTH,
                  disabled: true,
                },
              ]}
              defaultValue={PeriodTypeEnum.REALYEAR}
              onChange={segmentedChange}
            />
          </Flex>
          <Flex className="w-full" justify="space-around">
            <Statistic
              loading={totalDataLoading}
              title="总收入(CNY)"
              value={totalData?.totalIncome}
              precision={2}
            />
            <Divider style={{ height: "auto" }} type="vertical" />
            <Statistic
              loading={totalDataLoading}
              title="总支出(CNY)"
              value={totalData?.totalExpense}
              precision={2}
            />
            <Divider style={{ height: "auto" }} type="vertical" />
            <Statistic
              loading={totalDataLoading}
              title="总盈利(CNY)"
              value={totalData?.totalProfit}
              precision={2}
            />
          </Flex>
        </Flex>
        <Divider dashed />
        <Segmented
          options={[
            { label: "年度", value: PeriodTypeEnum.YEAR },
            { label: "季度", value: PeriodTypeEnum.QUARTER },
            { label: "月度", value: PeriodTypeEnum.MONTH },
          ]}
          defaultValue={PeriodTypeEnum.MONTH}
          onChange={chartSegmentedChange}
        />
        <div className={styles.charsContainer}>
          <Row gutter={16}>
            <Col className="gutter-row" span={24}>
              <CompanyLineChart
                legend={incomeExpenseChartOptions?.legend as string[]}
                category={incomeExpenseChartOptions?.category as string[]}
                data={
                  incomeExpenseChartOptions?.data as unknown as {
                    name: string;
                    type: string;
                    data: string[];
                  }[]
                }
              />
            </Col>
            <Col className="gutter-row" span={24}>
              <BarChart
                legend={incomeExpenseChartBarOptions?.legend as string[]}
                category={incomeExpenseChartBarOptions?.category as string[]}
                data={
                  incomeExpenseChartBarOptions?.data as unknown as {
                    name: string;
                    type: string;
                    data: string[];
                  }[]
                }
              />
            </Col>
            <Col className="gutter-row" span={24}>
              <CompanyLineChart
                legend={
                  companyLineChartOptions?.incomeOptions.legend as string[]
                }
                category={
                  companyLineChartOptions?.incomeOptions.category as string[]
                }
                data={
                  companyLineChartOptions?.incomeOptions.data as unknown as {
                    name: string;
                    type: string;
                    data: string[];
                  }[]
                }
              />
            </Col>
            <Col className="gutter-row" span={24}>
              <CompanyLineChart
                legend={
                  companyLineChartOptions?.expenseOptions.legend as string[]
                }
                category={
                  companyLineChartOptions?.expenseOptions.category as string[]
                }
                data={
                  companyLineChartOptions?.expenseOptions.data as unknown as {
                    name: string;
                    type: string;
                    data: string[];
                  }[]
                }
              />
            </Col>
            <Col className="gutter-row" span={12}>
              <CycleChart data={expenseCategory} />
            </Col>
          </Row>
        </div>
      </div>
    </LocaleWrap>
  );
}
