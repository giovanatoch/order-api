const express = require("express");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "API e banco funcionando",
      databaseTime: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao conectar no banco" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});