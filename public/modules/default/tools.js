const ready = fn => {
    if (document.readyState != 'loading'){
      fn()
    } else {
      document.addEventListener('DOMContentLoaded', fn)
    }
}
const querySelector = query => document.querySelector(query)

const querySelectorAll = query => document.querySelectorAll(query)

function cutText(text, length) {
  return `${text.substring(0, length || 10)}...`
}

function cutText2(text, length) {
  return `${text.substring(0, length || 10)}`
}

function splitText(text, length) {
  return `${text.substring(0, length || 10)}\n`
}

const capitalizeAll = val => {
  return (val ? val.toLowerCase() : val).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase() })
}
const capitalizeFirst = val =>{
  return val.substr(0,1).toUpperCase() + val.substr(1).toLowerCase()
}

function isInt(n){
    return Number(n) === n && n % 1 === 0
}
function isFloat(n){
    return Number(n) === n && n % 1 !== 0
}
const dateRangePickerDefaultLocale = {
    applyLabel: 'Aplicar',
    cancelLabel: 'Cancelar',
    format: 'DD/MM/YYYY',
    daysOfWeek: [
        'Dom',
        'Lun',
        'Mar',
        'Mie',
        'Jue',
        'Vie',
        'Sab'
    ],
    monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    firstDay: 1
}
const dateRangePickerDefaultLocaleWithTime = {
    applyLabel: 'Aplicar',
    cancelLabel: 'Cancelar',
    format: 'DD/MM/YYYY HH:mm',
    daysOfWeek: [
        'Dom',
        'Lun',
        'Mar',
        'Mie',
        'Jue',
        'Vie',
        'Sab'
    ],
    monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    firstDay: 1
}

const spanishDataTableLang = '/public/DataTables/Spanish.json'

const checkSession = async () => {
  let sessionData = await axios('/api/check');

  if (sessionData.data.isAuthenticated === false) {
      toastr.remove();

      toastr.error(`Su sesión ha finalizado, le recomendamos actualizar la página para reestablecer su sesión. <b><a href="/login">Recargar</a></b>`, 'Sesión finalizada');
  }
}
function dot_separators(num)
  {
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return num_parts.join(".");
  }

const comma_format = (amount, decimals) => {
  amount += ''; // por si pasan un numero en vez de un string
  amount = parseFloat(amount.replace(/[^0-9\,]/g, '')); // elimino cualquier cosa que no sea numero o punto

  decimals = decimals || 0; // por si la variable no fue fue pasada

  // si no es un numero o es igual a cero retorno el mismo cero
  if (isNaN(amount) || amount === 0)
      return parseFloat(0).toFixed(decimals);

  // si es mayor o menor que cero retorno el valor formateado como numero
  amount = '' + amount.toFixed(decimals);

  var amount_parts = amount.split(','),
      regexp = /(\d+)(\d{3})/;

  while (regexp.test(amount_parts[0]))
      amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');

  return amount_parts.join(',');
}

function replaceAll(target, search, replacement) {
  return target.split(search).join(replacement)
}

function removeSpecials(data) {
  data = data.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '');
  data = data.replace(/\s/g,'')
  data = data.replace(/-/g,'')
  return data
};

function validateRut(userRut) {
    let rut = new Rut(userRut)
    console.log(userRut)

    if ( rut.isValid ) {
        return rut.getNiceRut()
    }
}

const isEmail = (email) => {
  let regexEmail = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regexEmail.test(email);
}

const isRut = (rut) => {
  return $.validateRut(rut)
}

const cleanRut = (rut) => {
  var replace1 = rut.split('.').join('');
  var replace2 = replace1.replace('-', '');
  return replace2;
}