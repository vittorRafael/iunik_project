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

function convertToISO8601(dateString) {
  // Dividir a string de data no formato dd/mm/YYYY
  const [day, month, year] = dateString.split('/').map(Number);

  // Criar um objeto Date usando os componentes da data
  const date = new Date(year, month - 1, day);

  // Calcular o deslocamento do fuso horário
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = (num) => String(num).padStart(2, '0');

  const hoursOffset = pad(Math.floor(Math.abs(offset) / 60));
  const minutesOffset = pad(Math.abs(offset) % 60);

  // Construir a string no formato ISO 8601
  const isoString =
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0') +
    sign +
    hoursOffset +
    ':' +
    minutesOffset;

  return isoString;
}

function adicionarMes(dataString) {
  // Dividir a string de data no formato dd/mm/yyyy
  const [dia, mes, ano] = dataString.split('/').map(Number);

  // Criar um objeto Date usando os componentes da data
  const data = new Date(ano, mes - 1, dia);

  // Adicionar um mês à data
  data.setMonth(data.getMonth() + 1);

  // Ajustar o dia se necessário (por exemplo, de 31 para 30 ou 28/29 de fevereiro)
  if (data.getDate() !== dia) {
    data.setDate(0); // Define para o último dia do mês anterior
  }

  // Formatar a nova data no formato dd/mm/yyyy
  const diaF = data.getDate().toString().padStart(2, '0');
  const mesF = (data.getMonth() + 1).toString().padStart(2, '0'); // +1 pois getMonth() retorna 0-11
  const anoF = data.getFullYear();

  return `${diaF}/${mesF}/${anoF}`;
}

module.exports = {
  dataAtualFormatada,
  compararDatas,
  convertToISO8601,
  adicionarMes,
};
