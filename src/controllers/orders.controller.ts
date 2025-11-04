import type { Request, Response } from "express";
import pool from "../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { ActionType } from "../type/type.js";
import { validateOrder } from "../libs/validation/order.js";

const getOrders = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT a.*, b.name AS product_name FROM tr_order a LEFT JOIN ms_products b ON a.product_id = b.id"
    );

    console.log(rows);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("❌ failed to get orders:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const getShowOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id ?? 0;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order id is Invalid",
        data: null,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT a.*, b.name, b.price as satuan_price, c.stock FROM tr_order a LEFT JOIN ms_products b ON a.product_id = b.id LEFT JOIN ms_product_stock c ON a.product_id = c.id WHERE a.id = ?",
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ failed to get order:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const createOrder = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action: ActionType = "create";

  try {
    const now = new Date();
    const order_code = req.body.order_code as string;
    const product_id = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    const status = req.body.status as
      | "pending"
      | "processing"
      | "completed"
      | "cancle";
    const start_process = req.body.start_process
      ? new Date(req.body.start_process)
      : now;
    const end_process = req.body.end_process
      ? new Date(req.body.end_process)
      : now;
    const payment_type = req.body.payment_type as string;
    const creby = req.body.creby as string;
    const cretime = req.body.cretime ? new Date(req.body.cretime) : now;

    const { isValid, errors } = validateOrder({
      action,
      order_code,
      product_id,
      quantity,
      price,
      status,
      start_process,
      end_process,
      payment_type,
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

    // queery insert order
    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO tr_order SET ?",
      [
        {
          order_code,
          product_id,
          quantity,
          price,
          status,
          start_process,
          end_process,
          payment_type,
          creby,
          cretime,
        },
      ]
    );

    await connection.query(
      `UPDATE ms_product_stock
   SET stock = GREATEST(
       stock + CASE WHEN ? = 'cancel' THEN ? ELSE -? END,
       0
     ),
     modby = ?, modtime = ?
   WHERE product_id = ?`,
      [status, quantity, quantity, creby, cretime, product_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: result.insertId,
        order_code,
        product_id,
        quantity,
        price,
        status,
        start_process,
        end_process,
        payment_type,
        creby,
        cretime,
      },
    });
  } catch (error) {
    console.error("❌ Transaction failed while creating order:", error);

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

const updateOrder = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action = "update";

  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
        data: null,
      });
    }

    const now = new Date();
    const order_code = req.body.order_code as string;
    const product_id = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    const status = req.body.status as
      | "pending"
      | "processing"
      | "completed"
      | "cancle";
    const start_process = req.body.start_process
      ? new Date(req.body.start_process)
      : now;
    const end_process = req.body.end_process
      ? new Date(req.body.end_process)
      : now;
    const payment_type = req.body.payment_type as string;
    const modby = req.body.modby as string;
    const modtime = req.body.modtime ? new Date(req.body.modtime) : now;

    // validasi
    const { isValid, errors } = validateOrder({
      action,
      order_code,
      product_id,
      quantity,
      price,
      status,
      start_process,
      end_process,
      payment_type,
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

    await connection.query<ResultSetHeader>(
      `
      UPDATE tr_order 
      SET order_code = ?, product_id = ?, quantity = ?, price = ?, status = ?, start_process = ?, end_process = ?, payment_type = ?, modby = ?, modtime = ?
      WHERE id = ?
      `,
      [
        order_code,
        product_id,
        quantity,
        price,
        status,
        start_process,
        end_process,
        payment_type,
        modby,
        modtime,
        orderId,
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: {
        id: orderId,
        order_code,
        product_id,
        quantity,
        price,
        status,
        start_process,
        end_process,
        payment_type,
        modby,
        modtime,
      },
    });
  } catch (error) {
    console.error("❌ Transaction failed while updating order:", error);
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

const deleteOrder = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  const action: ActionType = "delete";

  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        data: null,
      });
    }

    await connection.beginTransaction();

    const [response] = await connection.query<ResultSetHeader>(
      "DELETE FROM tr_order WHERE id = ?",
      [orderId]
    );

    if (response.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: orderId,
    });
  } catch (error) {
    console.error("❌ Transaction failed while deleting order:", error);
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

export { getOrders, createOrder, getShowOrder, updateOrder, deleteOrder };
