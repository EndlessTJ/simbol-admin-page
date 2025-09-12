/**
 * @description 匹配交易类型
 * 
 */

import { TradeType } from "@/type";

export const matchTradeType = (info: string | number | undefined, type: '借' | '贷', brief: string) => {
  let tradeType = TradeType["OTHER"] as TradeType;
  if(type === '贷') {
    if(brief === '转存') {
      tradeType = TradeType['PROMOTION']
      if(typeof info === 'string') {
        if(info.includes('退回') || info.includes('退款')){
          tradeType = TradeType["REFUND"]
        }
        if(info.includes('转账') || info.includes('投资款') || info.includes('注资')){
          tradeType = TradeType['SHAREHOLDER_INJECTION']
        }
      }

    }
    if(brief === '批量结息'){
      tradeType = TradeType['INTEREST']
    }
  }
  if(type === '借') {
    if(brief === '转取'){
      tradeType = TradeType["PROMOTION_FEE"]
      if(typeof info === 'string') {
        if(info.includes('还款') || info.includes('报销')){
          tradeType = TradeType["REIMBURSEMENT"]
        }
        if(info.includes('工资')){
          tradeType = TradeType["SALARY"]
        }
        if(info.includes('短信费')){
          tradeType = TradeType["SMS_FEE"]
        }
      }

    }
    if(brief === '费用外收'){
      tradeType = TradeType["BANK_FEE"]
      // if(typeof info === 'string' && info.includes('短信费')){
      //   tradeType = TradeType["SMS_FEE"]
      // }
    }
    if(brief === '公共缴费'){
      tradeType = TradeType['TAX']
    }
  }
  return tradeType;
}