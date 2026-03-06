const express = require("express");
const orderRoutes = require("./routes/orderRoutes");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(orderRoutes);

app.get("/", (req, res) => {
  res.send("API de pedidos funcionando 🚀");
});

app.use((req, res) => {
  return res.status(404).json({ error: "Rota não encontrada." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});