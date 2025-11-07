import { Dayjs } from 'dayjs'
// 通用类型

export interface CommonType {
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  list: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 分页类型
export interface paginationType {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC'
}

export enum CooperationStatusEnum {
  ACTIVE = 'active', // 合作中
  SUSPENDED = 'suspended', // 暂停合作
  TERMINATED = 'terminated', // 合作终止
}
export type cooperationType = typeof CooperationStatusEnum[keyof typeof CooperationStatusEnum];

export enum CooperationStatusTextEnum {
  active = '合作中', // 合作中
  suspended = '暂停合作', // 暂停合作
  terminated = '合作终止', // 合作终止
}
export enum CompanyEnum {
  SBJZ = '莘柏景泽', // 莘柏景泽
  QMYC = '青蔓优创', // 青蔓优创
}

export interface ProductLinksType{
  id: string;
  name: string;
  linkStatus: 0 | 1
}

// 产品类型
export interface ProductsType {
  id: string;
  name: string; // 产品名称
  company: PartnerChannelType; // 产品所属公司
  channel: PartnerChannelType[]; //推广产品的渠道
  links: ProductLinksType[];
  remark?: string;
  contactPerson: string;
  createAt: Date;
  updateAt: Date;
  deletedAt: Date | null;
}


export interface ProductsFormType {
  name: string; // 产品名称
  company: string; // 产品所属公司
  channel: string[]; //推广产品的渠道
  // links: string;
  contactPerson: string;
  remark?: string;
}

export interface ProductsSearchQueryType {
  name: string; // 产品名称
  company: string; // 产品所属公司
  channel: string; //推广产品的渠道
  createAt: Date[];
}
// 渠道、产品方类型
export interface PartnerChannelType {
  id: string;
  name: string;
  contractDate: Date;
  currentStatus: CooperationStatusEnum;
  signCompony: CompanyEnum;
  // products?: ProductsType[];
  invoiceInfo?: string;
  addressInfo?: string;
  settlementPolicy?: string;
  alias?: string;
  remark?: string;
}
export interface PartnerChannelQueryType {
  id: string;
  name: string;
  contractDate: Date;
  currentStatus: CooperationStatusEnum;
  signCompony: CompanyEnum;
  products?: string[];
  alias?: string;
}


// 业务计划类型区域

export enum PlansStatus {
  draft = '待上线',
  active = '已上线',
  archived = '已下线',
}
export enum PlansPricingType {
  CPC = '点击计价',
  CPA = '领取计价',
  CPS = '下单计价',
  CPM = '曝光计价',
}

export enum PlansIsDelete {
  "已删除" = 0,
  "未删除" = 1
}

export interface BusinessPlansType {
  id: string;
  name: string; // 计划名称
  status: PlansStatus; //计划状态
  startDate: Dayjs; // 计划开始时间
  endDate: Dayjs; // 计划结束时间
  product: ProductsType; // 所属产品
  link: ProductLinksType; // 产品链接
  isDeleted: 0 | 1;
  channel: PartnerChannelType; // 投放的渠道Id
  description: string; // 计划描述
  cost: string; //计划单价
  pricingType: PlansPricingType; //计价类型
}

export interface BusinessPlansQueryType {
  name?: string;
  status?: PlansStatus;
  startDate?: Date[];
  endDate?: Date[]; // 计划结束时间
  isDeleted?: number; // 是否被删除 0｜ 1
  link?: string; // 产品链接
}

export interface BusinessPlansFormType {
  name: string; // 计划名称
  startDate: Dayjs; // 计划开始时间
  endDate: Dayjs; // 计划结束时间
  status: PlansStatus; //计划状态
  productId: string; // 所属产品id
  channelId: string; // 投放的渠道Id
  link: string; // 产品链接
  description?: string; // 计划描述
  cost?: string; //计划单价
  pricingType: PlansPricingType; //计价类型
}

// 结算单类型

// 结算类型枚举
export enum SettlementTypeEnum {
  OUTGOING = 'OUTGOING', // 向外结算（主动支付给他人）
  INCOMING = 'INCOMING', // 被别人结算（他人支付给我）
}

// 结算状态枚举
export enum SettlementStatusEnum {
  GENERATED = 'GENERATED', // 结算生成
  INVOICED = 'INVOICED', // 已开票
  PAID = 'PAID', // 已付款
}
// 结算状态枚举
export enum SettlementStatusTextEnum {
  GENERATED = '结算生成', // 
  INVOICED = '已开票', // 
  PAID = '已付款', // 
}
export interface SettlementType {
  id: string;
  settlementPartner?: PartnerChannelType; // 结算产品方Id
  settlementChannel?: PartnerChannelType; // 结算渠道方Id
  settlementEntity: CompanyEnum; // 结算主体
  settlementType: SettlementTypeEnum;
  productAmount?: Array<{
    productId: string;
    amount: number;
  }>;
  amount: number; // 结算金额
  startDate: Date; // 结算周期开始日期
  endDate: Date; // 结算周期结束日期
  settlementStatus: SettlementStatusEnum; // 结算单状态
  number: number; // 结算数量
  settlementProducts: ProductsType[]; // 结算产品
  payDate: Date; // 支付日期
  remark?: string;
  invoiceRate: string; // 发票税率
}
export interface SettlementQueryType {
  settlementPartnerId?: string; // 结算产品方Id
  settlementChannelId?: string; // 结算渠道方Id
  settlementType: SettlementTypeEnum;
  startDate: Date; // 结算周期开始日期
  endDate: Date; // 结算周期结束日期
  settlementStatus: SettlementStatusEnum; // 结算单状态
}

export interface SettlementFormType {
  settlementPartnerId?: string; // 结算产品方Id
  settlementChannelId?: string; // 结算渠道方Id
  settlementEntity: CompanyEnum; // 结算主体
  settlementType: SettlementTypeEnum;
  amount: number; // 结算金额
  startDate?: Dayjs; // 结算周期开始日期
  endDate?: Dayjs; // 结算周期结束日期
  settlementPeriod: [Dayjs, Dayjs]
  productAmount?: Array<{
    productId: string;
    amount: number;
  }>;
  settlementStatus: SettlementStatusEnum; // 结算单状态
  number: number; // 结算数量
  settlementProductIds: string[]; // 结算产品Id
  remark?: string;
  invoiceRate: string; // 发票税率
}


// 商务渠道
export enum ChannelInfoListTypeEnum {
  TMK = 'TMK', // tmk
  INFORMATIONFLOW = '信息流', // 
  WXG = '社群', // 
  PRIVATEDOMAIN = '私域', // 
  MSG = '短信', // 
  LIVE = '直播', // 
  SHORTVIDEO = '短视频', // 
  SCHOOL = '入校', // 
  TOOL = '工具', // 
  OTHER = '其他', // 
}

export enum ChannelInfoListStatusEnum {
  /** 待联系 - 尚未与对方建立联系 */
  ToBeContacted = '待联系',

  /** 沟通中 - 正在与对方进行洽谈或协商 */
  InCommunication = '沟通中',

  /** 已合作 - 已达成合作协议并建立合作关系 */
  Cooperated = '已合作',

  /** 暂未合作 - 当前阶段未能达成合作 */
  NotCooperated = '暂未合作',
}
export interface BusinessInfoType {
  id: string;
  name: string;
  type: keyof typeof ChannelInfoListTypeEnum;
  contactInfo: string;
  status: keyof typeof ChannelInfoListStatusEnum;
  contactDate: Date;
  remark: string;
}

export interface BusinessInfoFormType {
  name: string;
  type: keyof typeof ChannelInfoListTypeEnum;
  contactInfo: string;
  status: keyof typeof ChannelInfoListStatusEnum;
  // contactDate: Date;
  remark: string;
}

export interface BusinessInfoQueryType {
  status: ChannelInfoListStatusEnum;
}

export enum ModalFormText {
  CREATE_OPEN = "创建",
  UPDATE_OPEN = "修改",
}

export type ModalFormHandleStatus = 'CLOSE' | 'CONFIRM' | 'UPDATE_OPEN' | 'CREATE_OPEN'

/**
 * 财务列表数据
*/
// 交易类型合并枚举
export enum TradeType {
  // 收入类型
  PROMOTION = 'PROMOTION',
  INTEREST = 'INTEREST',
  SHAREHOLDER_INJECTION = 'SHAREHOLDER_INJECTION',
  REFUND = 'REFUND',
  PREPAYMENT = 'PREPAYMENT',

  // 支出类型
  BANK_FEE = 'BANK_FEE',
  SMS_FEE = 'SMS_FEE',
  TAX = 'TAX',
  SOCIAL_SECURITY_FEE = 'SOCIAL_SECURITY_FEE',
  REIMBURSEMENT = 'REIMBURSEMENT',
  SALARY = 'SALARY',
  PROMOTION_FEE = 'PROMOTION_FEE',
  OTHER = 'OTHER',
}

// 借贷类型枚举
export enum DebitCreditType {
  DEBIT = 'DEBIT', // 借
  CREDIT = 'CREDIT', // 贷
}

export enum FundListTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}
// 交易列表数据分类
export enum DataTypeEnum {
  RECORD = 'RECORD', // 录入
  IMPORT = 'IMPORT', // 导入
}
export interface FundListType {
  id: string;
  tradeTime: Date; // 交易时间
  tradeType: TradeType; // 交易类型
  settlementChannel: PartnerChannelType; // 收款方
  settlementPartner: PartnerChannelType; // 打款方
  tradeEntity: CompanyEnum; // 交易主体
  amount: number; // 交易金额
  description: string; // 交易描述
  debitCreditType: DebitCreditType; // 借贷类型
  transactionTime: string; // 交易时间戳
  isPrepayment: boolean; // 是否预付
}

export interface FundListQueryType {
  tradeTimeRange: [Date, Date];
  tradeType: TradeType;
  settlementChannelId: string;
  settlementPartnerId: string; // 打款方
  tradeEntity: CompanyEnum;
  isPrepayment: boolean;
}

export interface FundListFormType {
  tradeTime: Dayjs; // 交易时间
  tradeType: TradeType; // 交易类型
  settlementChannelId: string; // 收款方
  settlementPartnerId: string; // 打款方
  tradeEntity: CompanyEnum; // 交易主体
  amount: number; // 交易金额
  description: string; // 交易描述
  debitCreditType: DebitCreditType; // 借贷类型
  transactionTime?: string; // 交易时间戳
  isPrepayment: boolean; // 是否预付
  dataType?: DataTypeEnum; // 数据类型
}

/**
 * @deprecated
 * 收入支出财务数据
 */
export interface FundListCommonType {
  id: string;
  amount: number; // 金额
  remark: string; // 描述
  isPrepayment: boolean; // 是否预防
}


/**
 * @deprecated
 * 收入类型枚举
 */
export enum IncomeTypeEnum {
  PROMOTION = 'PROMOTION', // 推广收入
  INTEREST = 'INTEREST', // 利息收入
  SHAREHOLDER_INJECTION = 'SHAREHOLDER_INJECTION', // 股东注资
  REFUND = 'REFUND', // 退款
  PREPAYMENT = 'PREPAYMENT', // 预付款
}
/**
 * @deprecated
 * 收入列表数据类型
 */
export interface IncomesType extends FundListCommonType {
  incomeDate: Date; // 收入日期
  incomeType: IncomeTypeEnum; // 收入类型
  incomeEntity: CompanyEnum; // 收入主体
  settlementPartner: PartnerChannelType; // 付款公司
}
/**
 * @deprecated
 * 收入查询数据类型
 */
export interface IncomesQueryType {
  incomeDateRange: [Date, Date];
  incomeType: IncomeTypeEnum;
  settlementPartnerId: string;
  incomeEntity: keyof typeof CompanyEnum;
  isPrepayment: boolean;
}
/**
 * @deprecated
 * 收入列表数据类型
 */
export interface IncomesFormType {
  incomeDate: Date;
  incomeType: IncomeTypeEnum;
  settlementPartnerId: string;
  incomeEntity: keyof typeof CompanyEnum;
  amount: number;
  remark: string;
  transactionTime: string;
  isPrepayment: boolean;
}


/**
 * @deprecated
 * 支出类型
 */
export enum ExpensesTypeEnum {
  BANK_FEE = 'BANK_FEE', // 银行手续费
  SMS_FEE = 'SMS_FEE', // 短信费
  TAX = 'TAX', // 税费
  SOCIAL_SECURITY_FEE = 'SOCIAL_SECURITY_FEE', // 社保公积金费
  REIMBURSEMENT = 'REIMBURSEMENT', // 报销
  SALARY = 'SALARY', // 工资
  PROMOTION_FEE = 'PROMOTION_FEE', // 推广费用
  OTHER = 'OTHER', // 其他
}
/**
 * @deprecated
 * 支出类型
 */
export interface ExpensesType extends FundListCommonType {
  expenseDate: Date;
  expenseType: ExpensesTypeEnum;
  settlementChannel: PartnerChannelType;
  expenseEntity: CompanyEnum;
}
/**
 * @deprecated
 * 支出类型
 */export interface ExpenseFormType {
  expenseDate: Date;
  expenseType: ExpensesTypeEnum;
  settlementChannelId: string;
  expenseEntity: keyof typeof CompanyEnum;
  amount: number;
  remark: string;
  transactionTime: string;
  isPrepayment: boolean;
}
/**
 * @deprecated
 * 支出类型
 */
export interface ExpenseQueryType {
  expenseDateRange: [Date, Date];
  expenseType: ExpensesTypeEnum;
  settlementChannelId: string;
  expenseEntity: keyof typeof CompanyEnum;
  isPrepayment: boolean;
}

// dashboard

export interface FinancialSummary {
  channelId: string | null;
  createAt: Date;
  id: string;
  partnerId: string | null;
  periodDate: Date;
  periodType: string;
  profit: string;
  totalExpense: string;
  totalIncome: string;
  tradeEntity: CompanyEnum;
  tradeType: keyof typeof TradeType
  updateAt: Date;
}

export interface RealFinancialSummary {
  channelId: string | null;
  partnerId: string | null;
  period: Date;
  totalProfit: string;
  totalExpense: string;
  totalIncome: string;
  tradeEntity: CompanyEnum;
  tradeType: keyof typeof TradeType
}

// 财务数据聚合范围类型
export enum PeriodTypeEnum {
  DAY = "day",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  REALYEAR = "real_year",
  REALQUARTER = "real_quarter",
  REALMONTH = "real_month",
  ALL = "all",
}

export enum Company {
  SBJZ = "莘柏景泽",
  QMYC = "青蔓优创",
  ALL = "所有主体",
}

// 合同管理
export enum PARTNER_CHANNEL_NATURE {
  PARTNER = 'PARTNER',
  CHANNEL = 'CHANNEL',
}

// 合同类型
export enum CONTRACT_TYPE {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
// 合同状态

export enum CONTRACT_STATUS {
  PENDING = 'PENDING', // 待生效
  ACTIVE = 'ACTIVE', // 已生效
  EXPIRED = 'EXPIRED', // 已失效
  IN_PROCESS = 'IN_PROCESS', // 流程中
  RESIGNED = 'RESIGNED', // 已重签
}
export interface ContractListType {
  id: string;
  code: string;  // 合同编号
  signCompony: Company; // 签约主体
  partnerNature: PARTNER_CHANNEL_NATURE; // 签约方性质
  contractType: CONTRACT_TYPE; // 合同类型
  contractStatus: CONTRACT_STATUS; // 合同状态
  platform: string; // 电子合同平台
  startDate: Date; // 合同开始日期
  endDate: Date; // 合同终止日期
  partner: PartnerChannelType; // 
  channel: PartnerChannelType;
  remark: string; // 备注
}

export interface ContractFormType {
  code: string;  // 合同编号
  signCompony: Company; // 签约主体
  partnerNature: PARTNER_CHANNEL_NATURE; // 签约方性质
  contractType: CONTRACT_TYPE; // 合同类型
  contractStatus: CONTRACT_STATUS; // 合同状态
  platform: string; // 电子合同平台
  startDate: Date; // 合同开始日期
  endDate: Date; // 合同终止日期
  partner: PartnerChannelType; // 
  channel: PartnerChannelType;
  remark: string; // 备注
}

export interface ContractQueryType {
  contractStatus?: CONTRACT_STATUS;
  startDate?: Date[];
  endDate?: Date[];
  partner?: string;
  channel?: string;
}