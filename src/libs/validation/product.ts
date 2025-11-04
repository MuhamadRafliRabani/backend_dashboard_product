import type { ProductType } from "../../type/type.js";

export const validateProduct = (product: ProductType) => {
  const errors: string[] = [];

  if (!product.name) {
    errors.push("Name is required");
  }

  if (!product.image) {
    errors.push("Image is required");
  }

  if (product.price === undefined) {
    errors.push("Price is required");
  }

  if (typeof product.status !== "boolean") {
    errors.push("Status must be a boolean");
  }

  if (!product.stock && product.stock !== 0) {
    errors.push("Stock is required");
  }

  if (product.action === "create") {
    if (!product.creby) {
      errors.push("Created by is required");
    }

    if (!product.cretime) {
      errors.push("Creation time is required");
    }
  } else if (product.action === "update" || product.action === "delete") {
    if (!product.modby) {
      errors.push("Modified by is required");
    }

    if (!product.modtime) {
      errors.push("Modification time is required");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
