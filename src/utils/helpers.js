const calcularPlazoEntrega = (fecha, vencimiento) => {
  // return date in string format
  const fechaDate = new Date(fecha);
  const vencimientoDate = new Date(vencimiento);
  const diffTime = Math.abs(vencimientoDate - fechaDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calcularPlazoEntregaFormated = (fecha, vencimiento) => {
  // return date in string format
  const fechaDate = new Date(fecha);
  const vencimientoDate = new Date(vencimiento);
  const diffTime = Math.abs(vencimientoDate - fechaDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return fechaDate.toLocaleDateString() + " - " + vencimientoDate.toLocaleDateString() + " (" + diffDays + " días)";
};

const ordenarCompraVentaMensual = (resultado) => {
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  for(let i = 0; i < 12; i++) {
    const index = resultado.meses.findIndex(m => m === i + 1);
    if (index === -1) {
      resultado.meses.push(i + 1);
      resultado.compras.push(0);
      resultado.ventas.push(0);
    }
  }
  
  const mesesOrdenados = [];
  const comprasOrdenadas = [];
  // const ventasOrdenadas = [];
  for(let i = 0; i < 12; i++) {
    const mes = (mesActual + i) % 12 + 1;
    const index = resultado.meses.findIndex(m => m === mes);
      mesesOrdenados.push(mes);
      comprasOrdenadas.push(resultado.compras[index]);
      // ventasOrdenadas.push(resultado.ventas[index]);
  }
  resultado.meses = mesesOrdenados;
  resultado.compras = comprasOrdenadas;
  // resultado.ventas = ventasOrdenadas;
}

export {
  calcularPlazoEntrega,
  calcularPlazoEntregaFormated,
  ordenarCompraVentaMensual,
}