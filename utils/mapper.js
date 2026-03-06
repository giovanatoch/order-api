function mapOrderPayload(payload) {
  const { numeroPedido, valorTotal, dataCriacao, items } = payload;

  if (!numeroPedido || valorTotal === undefined || !dataCriacao || !Array.isArray(items)) {
    throw new Error("Payload inválido. Verifique numeroPedido, valorTotal, dataCriacao e items.");
  }

  if (items.length === 0) {
    throw new Error("O pedido deve possuir ao menos 1 item.");
  }

  const orderId = numeroPedido.split("-")[0];

  return {
    orderId,
    value: Number(valorTotal),
    creationDate: new Date(dataCriacao).toISOString(),
    items: items.map((item) => ({
      productId: Number(item.idItem),
      quantity: Number(item.quantidadeItem),
      price: Number(item.valorItem)
    }))
  };
}

module.exports = { mapOrderPayload };