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
  
}

export {
  calcularPlazoEntrega,
  calcularPlazoEntregaFormated,
  ordenarCompraVentaMensual
}