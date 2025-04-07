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

// 产品类型
export interface ProductsType {
  id: string;
  name: string; // 产品名称
  company: PartnerChannelType; // 产品所属公司
  channel: PartnerChannelType[]; //推广产品的渠道
  createAt: Date;
  updateAt: Date;
  deletedAt: Date | null;
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
  products?: ProductsType[];
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
// export enum ModalText {
//   CREATE = "创建合作方",
//   UPDATE = "修改合作方",
// }

export enum ModalFormText {
  CREATE_OPEN = "创建",
  UPDATE_OPEN = "修改",
}

export type ModalFormHandleStatus = 'CLOSE' | 'CONFIRM' | 'UPDATE_OPEN' | 'CREATE_OPEN'