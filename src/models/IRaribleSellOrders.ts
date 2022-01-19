import { IRaribleOrder } from "./IRaribleOrder";

export interface IRaribleSellOrders {
  orders: Array<IRaribleOrder>;
  continuation: string;
}