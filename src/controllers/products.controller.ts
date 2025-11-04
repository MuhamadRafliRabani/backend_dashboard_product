import type { Request, Response } from "express";
import pool from "../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { validateProduct } from "../libs/validation/product.js";
import type { ActionType } from "../type/type.js";

const getProducts = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT a.*, b.stock FROM ms_products a LEFT JOIN ms_product_stock b ON a.id = b.product_id"
    );

    console.log(rows);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("❌ failed to get product:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const getShowProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id ?? 0;
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT a.*, b.stock FROM ms_products a LEFT JOIN ms_product_stock b ON a.id = b.product_id WHERE a.id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ failed to get product:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const createProduct = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action: ActionType = "create";

  try {
    const now = new Date();
    const name = req.body.name as string;
    const price = parseFloat(req.body.price);
    const status = req.body.status === "true";
    const stock = parseInt(req.body.stock);
    const creby = req.body.creby as string;
    const cretime = req.body.cretime ? new Date(req.body.cretime) : now;

    const imagePath = req.file ? `/public/products/${req.file.filename}` : null;

    const { isValid, errors } = validateProduct({
      action,
      name,
      image: imagePath,
      price,
      status,
      stock,
      creby,
      cretime,
    });

    if (isValid === false) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: null,
        errors,
      });
    }

    await connection.beginTransaction();

    // queery insert product
    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO ms_products SET ?",
      [{ name, image: imagePath, price, status, creby, cretime }]
    );

    const [result_stock] = await connection.query<ResultSetHeader>(
      "INSERT INTO ms_product_stock SET ?",
      [{ product_id: result.insertId, stock, creby, cretime }]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        id: result.insertId,
        name,
        image: imagePath,
        price,
        status,
        stock,
        creby,
        cretime,
      },
    });
  } catch (error) {
    console.error("❌ Transaction failed while creating product:", error);

    await connection.rollback();

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    connection.release();
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action = "update";

  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    const now = new Date();
    const name = req.body.name as string;
    const price = parseFloat(req.body.price);
    const status =
      req.body.status === "true" ||
      req.body.status === "1" ||
      req.body.status === true;
    const stock = parseInt(req.body.stock);
    const modby = req.body.modby as string;
    const modtime = req.body.modtime ? new Date(req.body.modtime) : now;

    const imagePath = req.file
      ? `/public/products/${req.file.filename}`
      : req.body.imagePath
      ? req.body.imagePath
      : null;

    // validasi
    const { isValid, errors } = validateProduct({
      action,
      name,
      image: imagePath,
      price,
      status,
      stock,
      modby,
      modtime,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: null,
        errors,
      });
    }

    await connection.beginTransaction();

    // 🔹 Update ms_products
    await connection.query<ResultSetHeader>(
      `
      UPDATE ms_products 
      SET name = ?, image = ?, price = ?, status = ?, modby = ?, modtime = ?
      WHERE id = ?
      `,
      [name, imagePath, price, status, modby, modtime, productId]
    );

    // 🔹 Update ms_product_stock
    await connection.query<ResultSetHeader>(
      `
      UPDATE ms_product_stock 
      SET stock = ?, modby = ?, modtime = ?
      WHERE product_id = ?
      `,
      [stock, modby, modtime, productId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        id: productId,
        name,
        image: imagePath,
        price,
        status,
        stock,
        modby,
        modtime,
      },
    });
  } catch (error) {
    console.error("❌ Transaction failed while updating product:", error);
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    connection.release();
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action: ActionType = "delete";

  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    await connection.beginTransaction();

    const [response] = await connection.query<ResultSetHeader>(
      "DELETE FROM ms_products WHERE id = ?",
      [productId]
    );

    if (response.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: productId,
    });
  } catch (error) {
    console.error("❌ Transaction failed while deleting product:", error);
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    connection.release();
  }
};

export {
  getProducts,
  createProduct,
  getShowProduct,
  updateProduct,
  deleteProduct,
};
