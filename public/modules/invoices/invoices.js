let internals = {
    clientsInvoice: {
        table: {},
        data: []
    },
    invoices: {
        table: {},
        data: []
    },
    clients: {
        table: {},
        data: []
    },
    dataRowSelected: {},
    dataRowSelectedInvoice: {}
}

let invoiceContainers = {
    containers: [],
    containersInvoice: []
}

let clients = {}
let containerTypes = {}
let sites = {}
let cranes = {}

$(document).ready(async function () {
    $('#searchDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-1,'months')
        //endDate: moment()
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    $('#searchInvoiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-1,'months')
        //endDate: moment()
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    getParameters()

    $("#search").on('click', function(){
        chargeClientsTable()
    })

    $("#searchInvoice").on('click', function(){
        loadInvoices(internals.dataRowSelected._id)
    })
})

async function getParameters() {
    let clientsData = await axios.get('api/clients')
    clients = clientsData.data

    for(let i=0; i < clients.length; i++){
        $("#searchClient").append('<option value="'+clients[i]._id+'">'+clients[i].name+'</option>')
        if(i+1==clients.length){
            $('#searchClient').on('change', function(){
                loadSingleContainer(0)
                if($(this).val()!=0){
                    chargeClientsTable()
                }else{

                }
            })
        }
    }

    let containerTypesData = await axios.get('api/containerTypes')
    containerTypes = containerTypesData.data
    
    /*let sitesData = await axios.get('api/sites')
    sites = sitesData.data

    let cranesData = await axios.get('api/cranes')
    cranes = cranesData.data

    let servicesData = await axios.get('api/services')
    services = servicesData.data*/

    
    let allContainersData = await axios.get('api/allContainers')
    allContainers = allContainersData.data.sort()
    /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
}

function chargeClientsTable() {
    
    try {
        if($.fn.DataTable.isDataTable('#tableClientsInvoices')){
            internals.clientsInvoice.table.clear().destroy()
        }
        $.fn.dataTable.moment('DD/MM/YYYY HH:mm') //Se utiliza plugin datetime-moment para datatables

        internals.clientsInvoice.table = $('#tableClientsInvoices')
        .DataTable({
            dom: 'Bfrtip',
            buttons: ['excel'],
            iDisplayLength: 50,
            language: {
                url: spanishDataTableLang
            },
            responsive: false,
            order: [[ 0, 'desc' ]],
            ordering: true,
            columnDefs: [{targets: [1,2,3,4,5], className: 'dt-center'}],
            rowCallback: function( row, data ) {
            },
            columns: [
                { data: 'client'},
                { data: 'totalHistoric'},
                { data: 'totalActual' },
                { data: 'invoiced' },
                { data: 'noInvoice'},
                { data: 'toInvoice'}
            ],
            initComplete: function (settings, json) {
                getClientsInvoiceEnabled()
            }
        })

        $('#tableClientsInvoices tbody').off("click")

        $('#tableClientsInvoices tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#addInvoice').prop('disabled', true)
                $('.invoiceFilter').prop('disabled', true)
            } else {
                internals.clientsInvoice.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#addInvoice').prop('disabled', false)
                $('.invoiceFilter').prop('disabled', false)
                internals.dataRowSelected = internals.clientsInvoice.table.row($(this)).data()
                loadInvoices(internals.dataRowSelected._id)
                //loadSingleContainer(internals.dataRowSelected.id)
            }
        })
      } catch (error) {
        console.log(error)
      }

}

async function getClientsInvoiceEnabled() {
    let movementData
    let query = {
        //containerNumber: $("#searchNumber").val(),
        client: $("#searchClient").val()
        /*status: $("#searchStatus").val(),
        startDate: $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        dateOut: $("#searchDateOut").prop('checked'),
        onlyInventory: $("#searchInventory").prop('checked')*/
    }

    clientsInvoicesData = await axios.post('api/clientsInvoices',query)
    
    if (clientsInvoicesData.data.length > 0) {
        let formatData= clientsInvoicesData.data.map(el => {
            
            el.extraDays = 0

            if(Date.parse(el.datetimeOut)){
                el.extraDays = moment(el.datetimeOut).diff(moment(el.datetime).format('YYYY-MM-DD'), 'days')
                if(el.extraDays<=5){
                    el.extraDays = 0
                }else{
                    el.extraDays -= 5
                }
                el.datetimeOut = moment(el.datetimeOut).format('DD/MM/YYYY HH:mm')
            }else{
                el.extraDays = moment().diff(moment(el.datetime).format('YYYY-MM-DD'), 'days')
                if(el.extraDays<=5){
                    el.extraDays = 0
                }else{
                    el.extraDays -= 5
                }
            }
            el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')
            


            el.status = 'EN SITIO'
            if(el.movement=='SALIDA' || el.movement=='TRASPASO'){
                el.status = 'RETIRADO'
            }

            el.client = el.name

            //el.totalHistoric = el.totalHistoric
            //el.totalActual = 0
            //el.invoiced = 0
            //el.noInvoice = 0
            el.toInvoice = el.totalRetired - el.invoiced
            
            return el
        })

        internals.clientsInvoice.table.rows.add(formatData).draw()
        $('#loadingClientsInvoice').empty()
    } else {
        toastr.warning('No se han encontrado movimientos en base a filtrado')
        $('#loadingClientsInvoice').empty()
    }
}

async function loadInvoices(id){
    if(id==0){
        if($.fn.DataTable.isDataTable('#tableInvoices')){
            internals.invoices.table.clear().destroy()
        }
        return
    }
    let invoicesData = await axios.post('/api/clientInvoices', {
        client: id,
        startDate: $("#searchInvoiceDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchInvoiceDate").data('daterangepicker').endDate.format('YYYY-MM-DD')
    })
    let invoices = invoicesData.data
    
    if($.fn.DataTable.isDataTable('#tableInvoices')){
        internals.invoices.table.clear().destroy()
    }

    try {
        internals.invoices.table = $('#tableInvoices')
        .DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'excel'
            ],
            iDisplayLength: 50,
            oLanguage: {
              sSearch: 'Buscar: '
            },
            language: {
                url: spanishDataTableLang
            },
            responsive: false,
            columnDefs: [{targets: [1,3,4,5], className: 'dt-center'},{targets: [6,7,8], className: 'dt-right'}],
            order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'type' },
            { data: 'number' },
            { data: 'date' },
            { data: 'paymentType' },
            { data: 'paymentDate' },
            { data: 'containersQuantity' },
            { data: 'paymentNet' },
            { data: 'paymentIVA' },
            { data: 'paymentTotal' }
          ],
          initComplete: function (settings, json) {

                let formatData= invoices.map(el => {
                    el.date = moment.utc(el.date).format('DD/MM/YYYY')
                    el.paymentDate = moment.utc(el.paymentDate).format('DD/MM/YYYY')

                    if(el.paymentType=='0'){
                        el.paymentType = 'N/A'
                    }
                    el.containersQuantity = el.containers.length
                    el.paymentNet = dot_separators(el.paymentNet)
                    el.paymentIVA = dot_separators(el.paymentIVA)
                    el.paymentTotal = dot_separators(el.paymentTotal)
                    return el
                })

                internals.invoices.table.rows.add(formatData).draw()
          }
        })

        $('#tableInvoices tbody').off("click")

        $('#tableInvoices tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                
            } else {
                internals.invoices.table.$('tr.selected').removeClass('selected')
                $(this).addClass('selected')
                
                //internals.dataRowSelected = internals.clientsInvoice.table.row($(this)).data()
                internals.dataRowSelectedInvoice = internals.invoices.table.row($(this)).data()
                viewInvoice()
                //loadInvoices(internals.dataRowSelected._id)
                //loadSingleContainer(internals.dataRowSelected.id)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

async function loadSingleContainer(id){
    if(id==0){
        if($.fn.DataTable.isDataTable('#tableServices')){
            internals.services.table.clear().destroy()
        }
        return
    }
    let movementData = await axios.post('/api/reportMovement', {id: id})
    let movement = movementData.data

    if($.fn.DataTable.isDataTable('#tableServices')){
        internals.services.table.clear().destroy()
    }

    try {
        internals.services.table = $('#tableServices')
        .DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'excel'
            ],
            iDisplayLength: 50,
            oLanguage: {
              sSearch: 'Buscar: '
            },
            language: {
                url: spanishDataTableLang
            },
            responsive: false,
            columnDefs: [{targets: [1,2,3], className: 'dt-center'},{targets: [4,5,6], className: 'dt-right'}],
            order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'service' },
            { data: 'date' },
            { data: 'paymentType' },
            { data: 'paymentAdvance',
                render: function (data,type,row) {
                    if (data == true) {
                        return '<input type="checkbox" onclick="return false" checked>'
                    } else {
                        return '<input type="checkbox" onclick="return false">'
                    }
                }
            },
            { data: 'paymentNet' },
            { data: 'paymentIVA' },
            { data: 'paymentTotal' }
          ],
          initComplete: function (settings, json) {

                let formatData= movement.services.map(el => {
                    el.service = el.services.name
                    el.date = moment(el.date).format('DD/MM/YYYY')

                    if(el.paymentType=='0'){
                        el.paymentType = 'N/A'
                    }
                    return el
                })

                internals.services.table.rows.add(formatData).draw()
          }
        })
    } catch (error) {
        console.log(error)
    }
}


async function loadContainers(id,onlyInvoice){

    if(onlyInvoice){
        invoiceContainers.containersInvoice = []
    }else{
        invoiceContainers.containers = []
    }

    $("#tableBodyContainers").html('')

    let startDate = '2000-01-01', endDate = '3000-01-01'
    if($('#searchInvoiceDateCheck').prop('checked')){
        startDate = $("#searchContainerInvoiceDate").data('daterangepicker').startDate.format('YYYY-MM-DD')
        endDate = $("#searchContainerInvoiceDate").data('daterangepicker').endDate.format('YYYY-MM-DD')
    }

    let movementData
    let query = {
        table: true,
        containerNumber: '',
        client: id,
        //status: $("#searchStatus").val(),
        startDate: startDate,
        endDate: endDate,
        dateOut: false,
        onlyInventory: false
    }

    if(onlyInvoice){
        query.onlyInvoice = onlyInvoice
    }

    movementData = await axios.post('api/movementsInvoiceByFilter',query)
    
    if (movementData.data.length > 0) {
        for(let i=0; i<movementData.data.length; i++){
            let el = movementData.data[i]
            el.extraDays = 0
            if(Date.parse(el.datetimeOut)){
                el.extraDays = moment(el.datetimeOut).diff(moment(el.datetime).format('YYYY-MM-DD'), 'days')
                if(el.extraDays<=5){
                    el.extraDays = 0
                }else{
                    el.extraDays -= 5
                }
                //el.datetimeOut = moment(el.datetimeOut).format('DD/MM/YYYY HH:mm')
                /*else{
                    el.extraDays = moment().diff(moment(el.datetime), 'days')
                    if(el.extraDays<=5){
                        el.extraDays = 0
                    }else{
                        el.extraDays -= 5
                    }
                }*/
                //el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')
                


                el.status = 'EN SITIO'
                if(el.movement=='SALIDA' || el.movement=='TRASPASO'){
                    el.status = 'RETIRADO'
                }

                el.storage = ''
                el.deconsolidated = false
                el.transfer = false
                el.portage = false
                el.transport = false


                for(let j=0;j<el.services.length;j++){
                    if(el.services[j].services.name=='Almacenamiento Vacío' || el.services[j].services.name=='Almacenamiento Full' || el.services[j].services.name=='Almacenamiento IMO'){
                        el.storage = el.services[j].services.name
                    }else if(el.services[j].services.name=='Desconsolidado'){
                        el.deconsolidated = true
                    }else if(el.services[j].services.name=='Traspaso'){
                        el.transfer = true
                    }else if(el.services[j].services.name=='Porteo'){
                        el.portage = true
                    }else if(el.services[j].services.name=='Transporte'){
                        el.transport = true
                    }
                }

                el.invoiced = ''

                if(onlyInvoice){
                    invoiceContainers.containersInvoice.push(el)
                }else{
                    invoiceContainers.containers.push(el)
                }
            }
            if(i+1==movementData.data.length){
                drawTablesContainers()
            }
        }

        $('#loadingMovements').empty()
    } else {
        toastr.warning('No se han encontrado contenedores para facturar')
        $('#loadingMovements').empty()
    }
}

function drawTablesContainers(){
    $("#tableBodyContainers").html('')
    $("#tableBodyContainersInvoice").html('')

    let totalNet = 0
    let totalIVA = 0
    let totalTotal = 0

    invoiceContainers.containers.sort(function(a,b){
        return new Date(a.datetimeOut) - new Date(b.datetimeOut);
        //return new Date(b.datetimeOut) - new Date(a.datetimeOut);
    })

    invoiceContainers.containersInvoice.sort(function(a,b){
        return new Date(a.datetimeOut) - new Date(b.datetimeOut);
        //return new Date(b.datetimeOut) - new Date(a.datetimeOut);
    })

    for(let i=0; i<invoiceContainers.containers.length; i++){

        let el = invoiceContainers.containers[i]

        $("#tableBodyContainers").append(`
            <tr onclick="autoCheck(this)">
                <td><input type="checkbox" /><input type="hidden" value="${el.id}"></td>
                <td>${moment(el.datetime).format('DD/MM/YYYY HH:mm')}</td>
                <td>${moment(el.datetimeOut).format('DD/MM/YYYY HH:mm')}</td>
                <td>${el.containerNumber}</td>
                <td>${el.storage}</td>
                <td>${el.extraDays}</td>
                <td>${(el.deconsolidated) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.transfer) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.portage) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.transport) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
            </tr>
        `)

    }

    for(let j=0; j<invoiceContainers.containersInvoice.length; j++){

        let el = invoiceContainers.containersInvoice[j]

        $("#tableBodyContainersInvoice").append(`
            <tr onclick="autoCheck(this)">
                <td><input type="checkbox" /><input type="hidden" value="${el.id}"></td>
                <td>${moment(el.datetime).format('DD/MM/YYYY HH:mm')}</td>
                <td>${moment(el.datetimeOut).format('DD/MM/YYYY HH:mm')}</td>
                <td>${el.containerNumber}</td>
                <td>${el.storage}</td>
                <td>${el.extraDays}</td>
                <td>${(el.deconsolidated) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.transfer) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.portage) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
                <td>${(el.transport) ? '<i class="fas fa-check-circle"></i>' : ''}</td>
            </tr>
        `)

        for(k=0;k<invoiceContainers.containersInvoice[j].services.length;k++){
            totalNet += invoiceContainers.containersInvoice[j].services[k].paymentNet
            totalIVA += invoiceContainers.containersInvoice[j].services[k].paymentIVA
            totalTotal += invoiceContainers.containersInvoice[j].services[k].paymentTotal
        }

        if(j+1==invoiceContainers.containersInvoice.length){
            $("#invoiceNet").val(dot_separators(totalNet))
            $("#invoiceIVA").val(dot_separators(totalIVA))
            $("#invoiceTotal").val(dot_separators(totalTotal))
        }
    }
}

$('#addInvoice').on('click', function () { // CREAR FACTURA
    $('#invoiceModal').modal('show');
    $('#modalInv_title').html(`Nueva Factura`)
    $('#modalInv_body').html(createModalBody())

    $('#modalInv_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveInvoice">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    //autocomplete(document.getElementById("searchNumber"), allContainers)
    activateButtons()

    $('#invoiceRUT').val(internals.dataRowSelected.rut)
    $('#invoiceName').val(internals.dataRowSelected.nameFull)
    
    $('#invoiceRUT').on('keyup', function () {
        let rut = $('#invoiceRUT').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#invoiceRUT').val(rutFunc($('#invoiceRUT').val()))
        }
    })

    
    $('#searchContainerInvoiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-1,'months')
        //endDate: moment()
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    $('.invoiceDates').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true,
    }, function(start, end, label) {
    })

    invoiceContainers.containersInvoice = []
    loadContainers(internals.dataRowSelected._id, false)


    $('#addContainers').on('click', async function () {
        $('#tableBodyContainers > tr').each(function(){
            if($($($(this).children()[0]).children()[0]).prop('checked')){
                let arrayItem = invoiceContainers.containers.find(x => x.id === $($($(this).children()[0]).children()[1]).val())

                invoiceContainers.containersInvoice.push(arrayItem)
                /*$('#tableBodyContainersInvoice').append('<tr onclick="autoCheck(this)">'+$(this).html()+'</tr>')
                $(this).remove()*/

                const index = invoiceContainers.containers.indexOf(arrayItem)
                if (index > -1) {
                    invoiceContainers.containers.splice(index, 1)
                }
            }
        })
        drawTablesContainers()
    })

    $('#removeContainers').on('click', async function () {
        $('#tableBodyContainersInvoice > tr').each(function(){
            if($($($(this).children()[0]).children()[0]).prop('checked')){
                let arrayItem = invoiceContainers.containersInvoice.find(x => x.id === $($($(this).children()[0]).children()[1]).val())
                invoiceContainers.containers.push(arrayItem)

                //$('#tableBodyContainers').append('<tr onclick="autoCheck(this)">'+$(this).html()+'</tr>')
                //$(this).remove()
                
                const index = invoiceContainers.containersInvoice.indexOf(arrayItem)
                if (index > -1) {
                    invoiceContainers.containersInvoice.splice(index, 1)
                }
            }
        })
        drawTablesContainers()
    })

    $('#saveInvoice').on('click', async function () {

        let invoiceData = {
            clients: internals.dataRowSelected._id,
            type: $('#invoiceType').val(),
            rut: $('#invoiceRUT').val(),
            number: $('#invoiceNumber').val(),
            name: $('#invoiceName').val(),
            date: $('#invoiceDate').data('daterangepicker').startDate.format('YYYY-MM-DD'),
            paymentType: $('#invoicePaymentType').val(),
            paymentDate: $('#invoicePaymentDate').data('daterangepicker').startDate.format('YYYY-MM-DD'),
            paymentNet: parseInt(replaceAll($('#invoiceNet').val(), '.', '').replace(' ', '')),
            paymentIVA: parseInt(replaceAll($('#invoiceIVA').val(), '.', '').replace(' ', '')),
            paymentTotal: parseInt(replaceAll($('#invoiceTotal').val(), '.', '').replace(' ', '')),
            containers: invoiceContainers.containersInvoice.reduce((acc,el)=>{
                acc.push({
                    containers: el.id
                })
                return acc
            },[])
        }

        const res = validateInvoiceData(invoiceData)
        if(res.ok){
            let saveMovement = await axios.post('/api/invoiceSave', res.ok)
            
            if(saveMovement.data){
                if(saveMovement.data._id){
                    loadInvoices(internals.dataRowSelected._id)
                    $('#invoiceModal').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Contenedor almacenado correctamente</h5>`)
                    //chargeClientsTable()
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show');
        }

    })

})


function viewInvoice() { // VER/MODIFICAR FACTURA
    $('#invoiceModal').modal('show');
    $('#modalInv_title').html(`Ver Factura`)
    $('#modalInv_body').html(createModalBody())

    $('#modalInv_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveInvoice">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)
    //autocomplete(document.getElementById("searchNumber"), allContainers)
    activateButtons()

    $('#invoiceType').val(internals.dataRowSelectedInvoice.type)
    $('#invoiceRUT').val(internals.dataRowSelectedInvoice.rut)
    $('#invoiceName').val(internals.dataRowSelectedInvoice.name)
    $('#invoiceNumber').val(internals.dataRowSelectedInvoice.number)
    $('#invoiceDate').val(internals.dataRowSelectedInvoice.date)
    $('#invoicePaymentDate').val(internals.dataRowSelectedInvoice.paymentDate)
    
    $('#invoiceRUT').on('keyup', function () {
        let rut = $('#invoiceRUT').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#invoiceRUT').val(rutFunc($('#invoiceRUT').val()))
        }
    })

    $('#searchContainerInvoiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-1,'months')
        //endDate: moment()
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    $('.invoiceDates').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true,
    }, function(start, end, label) {
    })

    loadContainers(internals.dataRowSelectedInvoice.clients, false)
    loadContainers(internals.dataRowSelectedInvoice.clients, internals.dataRowSelectedInvoice._id)

    $('#addContainers').on('click', async function () {
        $('#tableBodyContainers > tr').each(function(){
            if($($($(this).children()[0]).children()[0]).prop('checked')){
                let arrayItem = invoiceContainers.containers.find(x => x.id === $($($(this).children()[0]).children()[1]).val())

                invoiceContainers.containersInvoice.push(arrayItem)
                /*$('#tableBodyContainersInvoice').append('<tr onclick="autoCheck(this)">'+$(this).html()+'</tr>')
                $(this).remove()*/

                const index = invoiceContainers.containers.indexOf(arrayItem)
                if (index > -1) {
                    invoiceContainers.containers.splice(index, 1)
                }
            }
        })
        drawTablesContainers()
    })

    $('#removeContainers').on('click', async function () {
        $('#tableBodyContainersInvoice > tr').each(function(){
            if($($($(this).children()[0]).children()[0]).prop('checked')){
                let arrayItem = invoiceContainers.containersInvoice.find(x => x.id === $($($(this).children()[0]).children()[1]).val())
                invoiceContainers.containers.push(arrayItem)

                //$('#tableBodyContainers').append('<tr onclick="autoCheck(this)">'+$(this).html()+'</tr>')
                //$(this).remove()
                
                const index = invoiceContainers.containersInvoice.indexOf(arrayItem)
                if (index > -1) {
                    invoiceContainers.containersInvoice.splice(index, 1)
                }
            }
        })
        drawTablesContainers()
    })

    $('#saveInvoice').on('click', async function () {

        let invoiceData = {
            id: internals.dataRowSelectedInvoice._id,
            clients: internals.dataRowSelectedInvoice.clients,
            type: $('#invoiceType').val(),
            rut: $('#invoiceRUT').val(),
            number: $('#invoiceNumber').val(),
            name: $('#invoiceName').val(),
            date: $('#invoiceDate').data('daterangepicker').startDate.format('YYYY-MM-DD'),
            paymentType: $('#invoicePaymentType').val(),
            paymentDate: $('#invoicePaymentDate').data('daterangepicker').startDate.format('YYYY-MM-DD'),
            paymentNet: parseInt(replaceAll($('#invoiceNet').val(), '.', '').replace(' ', '')),
            paymentIVA: parseInt(replaceAll($('#invoiceIVA').val(), '.', '').replace(' ', '')),
            paymentTotal: parseInt(replaceAll($('#invoiceTotal').val(), '.', '').replace(' ', '')),
            containers: invoiceContainers.containersInvoice.reduce((acc,el)=>{
                acc.push({
                    containers: el.id
                })
                return acc
            },[])
        }
        
        const res = validateInvoiceData(invoiceData)
        if(res.ok){
            let saveMovement = await axios.post('/api/invoiceSave', res.ok)

            if(saveMovement.data){
                if(saveMovement.data._id){

                    loadInvoices(internals.dataRowSelected._id)
                    $('#invoiceModal').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Contenedor almacenado correctamente</h5>`)
                    //chargeClientsTable()
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show');
        }

    })

}


$('#optionDeleteMovement').on('click', function () {
    swal.fire({
        title: '{{ lang.deleteMovement.swalDeleteTitle }}',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        confirmButtonText: '{{ lang.deleteMovement.swalConfirmButtonText }}',
        cancelButtonText: '{{ lang.deleteMovement.swalCancelButtonText }}',
    }).then((result) => {
        if (result.value) {
            ajax({
                url: 'api/movement',
                type: 'DELETE',
                data: {
                    _id: internals.dataRowSelected._id
                }
            }).then(res => {
                if (res.err) {
                    toastr.warning(res.err)
                } else if (res.ok) {
                    $('#optionModMovement').prop('disabled', true)
                    $('#optionDeleteMovement').prop('disabled', true)

                    toastr.success('{{ lang.deleteMovement.swalToastrOK }}')

                    datatableClientsInvoices
                        .row(movementRowSelected)
                        .remove()
                        .draw()

                    // console.log(res.ok)
                }
            })
        }
    })
})


function validateInvoiceData(invoiceData) {
    let errorMessage = ''

    //return new Promise(resolve => {
        if(invoiceData.rut==0){
            errorMessage += '<br> RUT Cliente'
            $('#invoiceRUT').css('border', '1px solid #E74C3C')
        }else{
            $('#invoiceRUT').css('border', '1px solid #CED4DA')
        }
        if(invoiceData.name==0){
            errorMessage += '<br>Nombre Cliente'
            $('#invoiceName').css('border', '1px solid #E74C3C')
        }else{
            $('#invoiceName').css('border', '1px solid #CED4DA')
        }
        if(invoiceData.number==0){
            errorMessage += '<br>Número Factura'
            $('#invoiceNumber').css('border', '1px solid #E74C3C')
        }else{
            $('#invoiceNumber').css('border', '1px solid #CED4DA')
        }

        if(invoiceData.containers.length==0){
            errorMessage += '<br>Containers'
            $('#movementCrane').css('border', '1px solid #E74C3C')
        }else{
            $('#movementCrane').css('border', '1px solid #CED4DA')
        }

        if (errorMessage.length===0) {
            return { ok: invoiceData }
            //resolve({ ok: invoiceData })
        } else {
            $(document).on('hidden.bs.modal', '.modal', function () { //Soluciona problema de scroll
                $('.modal:visible').length && $(document.body).addClass('modal-open');
           });

            $('#modal').modal('show');
            $('#modal_title').html(`Error al almacenar Ingreso`)
            $('#modal_body').html(`<h5 class="alert-heading">Falta ingresar los siguientes datos:</h5>
                                        <p class="mb-0">${errorMessage}</p>`)

            //resolve({ err: invoiceData })
            return { err: invoiceData }
        }
    //})
}

function createModalBody(){
    let body = `
    <div class="row">
        <div class="col-md-3">
            RUT Cliente
            <input id="invoiceRUT" type="text" class="form-control border-input">
        </div>
        <div class="col-md-3">
            Razón Social
            <input id="invoiceName" type="text" class="form-control border-input">
        </div>
        <div class="col-md-2">
            Tipo Registro
            <select id="invoiceType" class="form-control border-input">
                <option value="Factura" selected>Factura</option>
                <option value="Boleta">Boleta</option>
                <option value="Sin Documento">Sin Documento</option>
            </select>
        </div>
        <div class="col-md-2">
            Número Factura
            <input id="invoiceNumber" type="text" class="form-control border-input">
        </div>
        <div class="col-md-2">
            Fecha
            <input id="invoiceDate" type="text" class="form-control border-input invoiceDates" value="${moment().format('DD/MM/YYYY')}">
        </div>
        <div class="col-md-12">
            <br/>
        </div>
        <div class="col-md-5 table-responsive" id="divContainers" style="max-height: 590px">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8 col-xs-12">
                            Containers sin Facturar
                        </div>
                        <div class="col-md-4 col-xs-12">
                            <button class="btn btn-sm btn-secondary btn-block" id="expandContainers">
                                <i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir
                            </button>
                        </div>
                        <!--<div class="form-check col-md-3  col-xs-12">
                            <br/>
                            <input class="form-check-input" type="checkbox" value="" id="searchInvoiceDateCheck">
                            <label class="form-check-label" for="flexCheckDefault">
                                Filtrar por fecha
                            </label>
                        </div>
                        <div class="col-md-4 col-xs-12">
                            Fecha Desde - Hasta
                            <input id="searchContainerInvoiceDate" type="text" class="form-control border-input">
                        </div>

                        <div class="col-md-3 col-xs-12">
                            <br>
                            <button class="btn btn-primary btn-block" id="searchInvoiceContainer">
                                <i class="fas fa-search"></i> BUSCAR
                            </button>
                        </div>-->

                        <div class="col-md-12 col-xs-12 table-responsive"> 
                            <table id="tableContainers" class="display nowrap table table-condensed" cellspacing="0" width="100%">
                                <thead id="tableHeadContainers">
                                    <tr>
                                        <th>SEL.</th>
                                        <th>FECHA INGRESO</th>
                                        <th>FECHA SALIDA</th>
                                        <th>CONTENEDOR</th>
                                        <th>ALMACENAJE</th>
                                        <th>DÍAS EXTRA</th>
                                        <th>DESC</th>
                                        <th>TRASP</th>
                                        <th>PORTEO</th>
                                        <th>TRANSP</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBodyContainers">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-1" style="text-align: center">
            <br/>
            <br/>
            <button class="btn btn-primary" title="Agregar Contenedores" id="addContainers">
                <i class="fas fa-chevron-right"></i>
            </button>
            <br/>
            <br/>
            <br/>
            <button class="btn btn-primary" title="Quitar Contenedores" id="removeContainers">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
        
        <div class="col-md-6 table-responsive" id="divInvoiceContainers" style="max-height: 590px">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8 col-xs-12">
                            A Facturar
                        </div>
                        <div class="col-md-4 col-xs-12">
                            <button class="btn btn-sm btn-secondary btn-block" id="expandInvoiceContainers">
                                <i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir
                            </button>
                        </div>
                        <div class="col-md-12 col-xs-12">
                            <table id="tableContainersInvoice" class="display nowrap table table-condensed" cellspacing="0" width="100%">
                                <thead id="tableHeadContainersInvoice">
                                    <tr>
                                        <th>SEL.</th>
                                        <th>FECHA INGRESO</th>
                                        <th>FECHA SALIDA</th>
                                        <th>CONTENEDOR</th>
                                        <th>ALMACENAJE</th>
                                        <th>DÍAS EXTRA</th>
                                        <th>DESC</th>
                                        <th>TRASP</th>
                                        <th>PORTEO</th>
                                        <th>TRANSP</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBodyContainersInvoice">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
        </div>
        <div class="col-md-3">
            <table>
                <tr>
                    <td>Medio de Pago</td>
                    <td>
                        <select id="invoicePaymentType" class="custom-select classMove classPayment">
                            <option value="0">POR DEFINIR</option>
                            <option value="EFECTIVO">EFECTIVO</option>
                            <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                            <option value="TRANSBANK">TRANSBANK</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Fecha</td>
                    <td><input id="invoicePaymentDate" type="text" class="form-control border-input invoiceDates" value="${moment().format('DD/MM/YYYY')}"></td>
                </tr>
            </table>
        </div>
        <div class="col-md-3">
            <table>
                <tr>
                    <td>Neto</td>
                    <td><input id="invoiceNet" type="text" class="form-control border-input" style="text-align: right"></td>
                </tr>
                <tr>
                    <td>IVA</td>
                    <td><input id="invoiceIVA" type="text" class="form-control border-input" style="text-align: right"></td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td><input id="invoiceTotal" type="text" class="form-control border-input" style="text-align: right"></td>
                </tr>
            </table>
        </div>
       
        <div class="form-group col-md-12">
            <h4 class="card-title">&nbsp;Observaciones</h4>
            <textarea id="movementObservation" placeholder="EJEMPLO: CONTENEDOR DAÑADO" class="form-control" rows="5"></textarea>
        </div>

    </div>
`
    return body
}

function activateButtons(){
    $("#expandContainers").on('click', function(){
        if($($(this).children()[0]).hasClass('fa-chevron-left')){
            $(this).html('<i class="fas fa-chevron-right"></i><i class="fas fa-chevron-left"></i> Contraer')
            $("#divContainers").removeClass('col-md-5 col-md-2').addClass('col-md-9')
            $("#divInvoiceContainers").removeClass('col-md-6 col-md-9').addClass('col-md-2')
            $("#expandInvoiceContainers").html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
        }else{
            $(this).html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
            $("#divContainers").removeClass('col-md-9 col-md-2').addClass('col-md-5')
            $("#divInvoiceContainers").removeClass('col-md-2 col-md-9').addClass('col-md-6')
            $("#expandInvoiceContainers").html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
        }
    })

    $("#expandInvoiceContainers").on('click', function(){
        if($($(this).children()[0]).hasClass('fa-chevron-left')){
            $(this).html('<i class="fas fa-chevron-right"></i><i class="fas fa-chevron-left"></i> Contraer')
            $("#divContainers").removeClass('col-md-9 col-md-5').addClass('col-md-2')
            $("#divInvoiceContainers").removeClass('col-md-6 col-md-2').addClass('col-md-9')
            $("#expandContainers").html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
        }else{
            $(this).html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
            $("#divContainers").removeClass('col-md-9 col-md-2').addClass('col-md-5')
            $("#divInvoiceContainers").removeClass('col-md-2 col-md-9').addClass('col-md-6')
            $("#expandContainers").html('<i class="fas fa-chevron-left"></i><i class="fas fa-chevron-right"></i> Expandir')
        }
    })
    
}

function autoCheck(tr){
    if(!$($($(tr).children()[0]).children()[0]).prop('checked')){
        $($($(tr).children()[0]).children()[0]).prop('checked',true)
    }else{
        $($($(tr).children()[0]).children()[0]).prop('checked',false)
    }
}

async function getClients(){
    let clientData = await axios.get('api/clients')
    if (clientData.data.length > 0) {
        internals.clients.table.rows.add(clientData.data).draw()
    }
}

async function selectClientSearch(btn) {
    
    let clientSelectedData = await Swal.fire({
        title: 'Seleccione Cliente',
        customClass: 'swal-wide',
        html: `
            <div style="max-height: 400px !important; overflow-y: scroll;">
                <table id="tableSearchClients" class="display nowrap table table-condensed" cellspacing="0">
                    <thead>
                        <tr class="table-dark">
                            <th>RUT</th>
                            <th>NOMBRE</th>
                            <th>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody id="tableSearchClientsBody"></tbody>
                </table>
            </div>
        `,
        onBeforeOpen: () => {
            try {

                if($.fn.DataTable.isDataTable('#tableSearchClients')){
                    internals.clients.table.clear().destroy()
                }
                internals.clients.table = $('#tableSearchClients')
                .DataTable( {
                    dom: 'Bfrtip',
                    buttons: [
                        'excel'
                    ],
                    iDisplayLength: 50,
                    oLanguage: {
                        sSearch: 'Buscar: '
                    },
                    lengthMenu: [[50, 100, 500, -1], [50, 100, 500, 'Todos los registros']],
                    language: {
                        url: spanishDataTableLang
                    },
                    responsive: false,
                    columnDefs: [//{targets: [1], className: 'dt-right'},
                                {targets: [0], className: 'dt-center'}],
                    order: [[ 0, 'desc' ]],
                    ordering: true,
                    rowCallback: function( row, data ) {
                        //$(row).find('td:eq(1)').html(dot_separators(data.value))
                        if(data.status=='enabled'){
                            $(row).find('td:eq(2)').html('Habilitado')
                        }else{
                            $(row).find('td:eq(2)').html('Deshabilitado')
                        }
                    },
                    columns: [
                        { data: 'rut' },
                        { data: 'name' },
                        { data: 'status' }
                    ],
                    initComplete: function (settings, json) {
                        getClients()
                    }
                })
        
                $('#tableSearchClients tbody').off("click")
        
                $('#tableSearchClients tbody').on('click', 'tr', function () {
                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected')
                    } else {
                        internals.clients.table.$('tr.selected').removeClass('selected')
                        $(this).addClass('selected')
                        internals.clientRowSelected = internals.clients.table.row($(this)).data()
                    }
                })

            } catch (error) {
                loadingHandler('stop')

                console.log(error)
            }
        },
        preConfirm: async () => {
            try {
                let clientSelected = internals.clientRowSelected

                if (clientSelected) {
                    return {
                        ...clientSelected
                    }
                }

                throw new Error('Debe seleccionar un cliente')
            } catch (error) {
                Swal.showValidationMessage(error)
            }
        },
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        focusConfirm: false,
        confirmButtonText: 'Seleccionar',
        cancelButtonText: 'Cancelar'
    })

    if (clientSelectedData.value) {
        $('#searchClient').val(clientSelectedData.value._id)
    }
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

function getTextureTable(containerTypes){
    let table = '<table id="tableTextures" class="collapse"><tr>'
    for(var i=0; i<containerTypes.length; i++){
        table += '<td><img src="/public/img/textures/'+containerTypes[i].texture+'.jpg" style="width: 32px" onclick="changeTexture(\'image\',\''+containerTypes[i].texture+'\')"></td>'
        if( ((i+1)%6==0 && i>0) || i+1==containerTypes.length ){
            table += '</tr>'
            if(i+1<containerTypes.length){
                table += '<tr>'
            }
        }
    }
    table += '</table>'
    return table
}

function changeTexture(by,texture){
    if(by=='image'){
        $("#imgTexture").prop('src','/public/img/textures/'+texture+'.jpg')
        $("#imgTexture").val(texture)
    }else{
        let texture = $("#movementContainerType").find('option:selected').attr('data-texture') 

        $("#imgTexture").prop('src','/public/img/textures/'+texture+'.jpg')
        $("#imgTexture").val(texture)
    }
}

