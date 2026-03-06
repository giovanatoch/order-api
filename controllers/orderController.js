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

module.exports = {
  createOrder,
  getOrderById
};