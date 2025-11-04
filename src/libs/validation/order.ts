import type { OrderType } from "../../type/type.js";

export const validateOrder = (order: OrderType) => {
  const errors: string[] = [];

  if (!order.order_code) {
    errors.push("Order code is required");
  }
  if (!order.product_id) {
    errors.push("Product ID is required");
  }
  if (!order.quantity) {
    errors.push("Quantity is required");
  }
  if (order.price === undefined) {
    errors.push("Price is required");
  }
  if (!order.status) {
    errors.push("Status is required");
  }
  if (!order.start_process) {
    errors.push("Start process date is required");
  }
  if (!order.end_process) {
    errors.push("End process date is required");
  }
  if (!order.payment_type) {
    errors.push("Payment type is required");
  }

  if (order.action === "create") {
    if (!order.creby) {
      errors.push("Created by is required");
    }
    if (!order.cretime) {
      errors.push("Created time is required");
    }
  } else {
    if (!order.modby) {
      errors.push("Modified by is required");
    }
    if (!order.modtime) {
      errors.push("Modified time is required");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
