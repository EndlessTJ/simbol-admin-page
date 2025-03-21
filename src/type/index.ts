// 通用类型

export interface CommonType {
  [key: string]: unknown;
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
  companyId: string; // 产品所属公司id
  channelIds: string[]; //推广产品的渠道的ID
}
// 渠道、产品方类型
export interface PartnerChannelType {
  name: string;
  contractDate: Date;
  currentStatus: CooperationStatusEnum;
  signCompony: CompanyEnum;
  products?: ProductsType[];
  alias?: string;
  remark?: string;
}

export enum ModalText {
  CREATE = "创建合作方",
  UPDATE = "修改合作方",
}