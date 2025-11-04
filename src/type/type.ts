export interface ProcessType {
  action: ActionType;
}

export interface ProductType extends ProcessType {
  name: string;
  image: string | null;
  price: number;
  status: boolean;
  stock: number;
  creby?: string;
  cretime?: Date;
  modby?: string;
  modtime?: Date;
}

export interface OrderType extends ProcessType {
  order_code: string;
  product_id: number;
  quantity: number;
  price: number;
  status: "pending" | "processing" | "completed" | "cancle";
  start_process: Date;
  end_process: Date;
  payment_type: string;
  creby?: string;
  cretime?: Date;
  modby?: string;
  modtime?: Date;
}

export type ActionType = "create" | "update" | "delete";
