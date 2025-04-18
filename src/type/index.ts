import { Dayjs } from 'dayjs'
// 通用类型

export interface CommonType {
  [key: string]: unknown;
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
  QMYC = '青蔓优创', // 莘柏景泽
}

export interface ProductLinksType{
  id: string;
  name: string;
}

// 产品类型
export interface ProductsType {
  id: string;
  name: string; // 产品名称
  company: PartnerChannelType; // 产品所属公司
  channel: PartnerChannelType[]; //推广产品的渠道
  links: ProductLinksType[];
  contactPerson: string;
  createAt: Date;
  updateAt: Date;
  deletedAt: Date | null;
}


export interface ProductsFormType {
  name: string; // 产品名称
  company: string; // 产品所属公司
  channel: string[]; //推广产品的渠道
  links: string;
  contactPerson: string;
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

export enum ModalFormText {
  CREATE_OPEN = "创建",
  UPDATE_OPEN = "修改",
}

export type ModalFormHandleStatus = 'CLOSE' | 'CONFIRM' | 'UPDATE_OPEN' | 'CREATE_OPEN'