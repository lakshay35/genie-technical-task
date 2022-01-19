export interface IRaribleOrder {
  type: string;
  maker: string;
  make: {
    assetType: {
      assetClass: string;
      contract: string;
      tokenId: string;
    },
    value: string;
    valueDecimal: number;
  },
  take: {
    assetType: {
      assetClass: string;
    },
    value: string;
    valueDecimal: number;
  },
  fill: string;
  fillValue: number;
  start: number;
  end: number;
  makeStock: string;
  makeStockValue: number;
  cancelled: boolean;
  salt: string;
  signature: string;
  createdAt: string;
  lastUpdateAt: string;
  pending: Array<any>,
  hash: string;
  makeBalance: string;
  makePrice: number;
  makePriceUsd: number;
  priceHistory: Array<{
    date: string;
    makeValue: number;
    takeValue: number;
  }>;
  status: string;
  data: {
    dataType: string;
    exchange: string;
    makerRelaryerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFEe: string;
    feeRecipient: string;
    feeMethod: string;
    side: string;
    saleKind: String;
    howToCall: string;
    callData: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtraDAta: string;
    extra: string;
  }
}