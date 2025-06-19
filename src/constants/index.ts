// 合作状态
export enum CooperationStatus {
  active = '合作中',
  suspended = '暂停合作',
  terminated = '合作终止'
}

// 目前公司的主体

export enum Company {
  SBJZ = '莘柏景泽',
  QMYC = '青蔓优创'
}

/**
 * @deprecated
 */
// 收入类型
export enum IncomeTextTypeEnum {
  PROMOTION = '推广收入', // 推广收入
  INTEREST = '利息收入', // 利息收入
  SHAREHOLDER_INJECTION = '股东注资', // 股东注资
  REFUND = '退款', // 退款
  PREPAYMENT = '预付款', // 预付款
}
/**
 * @deprecated
 */
// 支出类型
export enum ExpensesTextTypeEnum {
  BANK_FEE = '银行手续费', // 银行手续费
  SMS_FEE = '短信费', // 短信费
  TAX = '税费', // 税费
  SOCIAL_SECURITY_FEE = '社保公积金费', // 社保公积金费
  REIMBURSEMENT = '报销', // 报销
  SALARY = '工资', // 工资
  PROMOTION_FEE = '推广费用', // 推广费用
  OTHER = '其他', // 其他
}

// 交易类型合并枚举
export enum TradeTextType {
  // 收入类型
  PROMOTION = '推广收入', // 推广收入
  INTEREST = '利息收入', // 利息收入
  SHAREHOLDER_INJECTION = '股东注资', // 股东注资
  REFUND = '退款', // 退款
  PREPAYMENT = '预付款', // 预付款
  // 支出类型
  BANK_FEE = '银行手续费', // 银行手续费
  SMS_FEE = '短信费', // 短信费
  TAX = '税费', // 税费
  SOCIAL_SECURITY_FEE = '社保公积金费', // 社保公积金费
  REIMBURSEMENT = '报销', // 报销
  SALARY = '工资', // 工资
  PROMOTION_FEE = '推广费用', // 推广费用
  OTHER = '其他', // 其他
}

// 借贷类型枚举
export enum DebitCreditTextType {
  DEBIT = '借', // 借
  CREDIT = '贷', // 贷
}