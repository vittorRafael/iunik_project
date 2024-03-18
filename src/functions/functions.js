function dataAtualFormatada() {
  var data = new Date(),
    dia = data.getDate().toString(),
    diaF = dia.length == 1 ? '0' + dia : dia,
    mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
    mesF = mes.length == 1 ? '0' + mes : mes,
    anoF = data.getFullYear();
  return diaF + '/' + mesF + '/' + anoF;
}

function compararDatas(dataA, dataB, dias) {
  // Convertendo as strings em objetos Date
  var data1 = new Date(converterDataBrasileiraParaEUA(dataA));
  var data2 = new Date(converterDataBrasileiraParaEUA(dataB));

  // Adicionando dias à data B
  data2.setDate(data2.getDate() + dias);

  // Verificando se a data A é maior que a data B
  if (data1 > data2) {
    return true;
  } else {
    return false;
  }
}

function converterDataBrasileiraParaEUA(dataBrasileira) {
  var partes = dataBrasileira.split('/');
  return partes[2] + '-' + partes[1] + '-' + partes[0];
}

module.exports = {
  dataAtualFormatada,
  compararDatas,
};
