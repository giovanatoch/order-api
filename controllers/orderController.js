const pool = require("../db");
const { mapOrderPayload } = require("../utils/mapper");

async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    const mappedOrder = mapOrderPayload(req.body);

    await client.query("BEGIN");

    const existingOrder = await client.query(
      `SELECT "orderId" FROM "Order" WHERE "orderId" = $1`,
      [mappedOrder.orderId]
    );

    if (existingOrder.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Pedido já existe." });
    }

    await client.query(
      `INSERT INTO "Order" ("orderId", "value", "creationDate")
       VALUES ($1, $2, $3)`,
      [mappedOrder.orderId, mappedOrder.value, mappedOrder.creationDate]
    );

    for (const item of mappedOrder.items) {
      await client.query(
        `INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
         VALUES ($1, $2, $3, $4)`,
        [mappedOrder.orderId, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Pedido criado com sucesso.",
      data: mappedOrder
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return res.status(400).json({
      error: error.message || "Erro ao criar pedido."
    });
  } finally {
    client.release();
  }
}

async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const orderResult = await pool.query(
      `SELECT "orderId", "value", "creationDate"
       FROM "Order"
       WHERE "orderId" = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const itemsResult = await pool.query(
      `SELECT "productId", "quantity", "price"
       FROM "Items"
       WHERE "orderId" = $1
       ORDER BY "productId" ASC`,
      [orderId]
    );

    return res.status(200).json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar pedido." });
  }
}

async function listOrders(req, res) {
  try {
    const ordersResult = await pool.query(
      `SELECT "orderId", "value", "creationDate"
       FROM "Order"
       ORDER BY "creationDate" DESC`
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `SELECT "productId", "quantity", "price"
         FROM "Items"
         WHERE "orderId" = $1
         ORDER BY "productId" ASC`,
        [order.orderId]
      );

      orders.push({
        ...order,
        items: itemsResult.rows
      });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar pedidos." });
  }
}

async function updateOrder(req, res) {
  const client = await pool.connect();

  try {
    const { orderId } = req.params;
    const mappedOrder = mapOrderPayload(req.body);

    if (mappedOrder.orderId !== orderId) {
      return res.status(400).json({
        error: "O orderId derivado do numeroPedido precisa corresponder ao parâmetro da URL."
      });
    }

    await client.query("BEGIN");

    const existingOrder = await client.query(
      `SELECT "orderId" FROM "Order" WHERE "orderId" = $1`,
      [orderId]
    );

    if (existingOrder.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    await client.query(
      `UPDATE "Order"
       SET "value" = $2, "creationDate" = $3
       WHERE "orderId" = $1`,
      [orderId, mappedOrder.value, mappedOrder.creationDate]
    );

    await client.query(
      `DELETE FROM "Items" WHERE "orderId" = $1`,
      [orderId]
    );

    for (const item of mappedOrder.items) {
      await client.query(
        `INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Pedido atualizado com sucesso.",
      data: {
        orderId,
        value: mappedOrder.value,
        creationDate: mappedOrder.creationDate,
        items: mappedOrder.items
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return res.status(400).json({
      error: error.message || "Erro ao atualizar pedido."
    });
  } finally {
    client.release();
  }
}

async function deleteOrder(req, res) {
  const client = await pool.connect();

  try {
    const { orderId } = req.params;

    await client.query("BEGIN");

    const existingOrder = await client.query(
      `SELECT "orderId" FROM "Order" WHERE "orderId" = $1`,
      [orderId]
    );

    if (existingOrder.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    await client.query(
      `DELETE FROM "Items" WHERE "orderId" = $1`,
      [orderId]
    );

    await client.query(
      `DELETE FROM "Order" WHERE "orderId" = $1`,
      [orderId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Pedido deletado com sucesso."
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return res.status(500).json({
      error: "Erro ao deletar pedido."
    });
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder
};