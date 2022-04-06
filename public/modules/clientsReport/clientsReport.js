let internals = {
    clientsInvoice: {
        table: {},
        data: []
    },
    invoices: {
        table: {},
        data: []
    },
    services: {
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

    $('#searchDateCheck').change(function () {
        if($(this).prop('checked')){
            $('#searchDate').removeAttr('disabled')
        }else{
            $('#searchDate').attr('disabled',true)
        }
    })

    getParameters()

    $("#search").on('click', function(){
        //chargeClientsTable()
        if($("#searchClient").val()!=0){
            loadInvoices($("#searchClient").val())
            loadServices($("#searchClient").val())
        }
    })

})

async function getParameters() {
    let clientsData = await axios.get('api/clients')
    clients = clientsData.data

    for(let i=0; i < clients.length; i++){
        $("#searchClient").append('<option value="'+clients[i]._id+'">'+clients[i].name+'</option>')
        if(i+1==clients.length){
            $('#searchClient').on('change', function(){
                if($(this).val()!=0){
                    loadInvoices($("#searchClient").val())
                    loadServices($("#searchClient").val())
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

async function loadInvoices(id){
    if(id==0){
        if($.fn.DataTable.isDataTable('#tableInvoices')){
            internals.invoices.table.clear().destroy()
        }
        return
    }

    let startDate = '2000-01-01', endDate = '3000-01-01'
    if($('#searchDateCheck').prop('checked')){
        startDate = $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD')
        endDate = $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD')
    }

    let invoicesData = await axios.post('/api/clientInvoices', {
        client: id,
        startDate: startDate,
        endDate: endDate
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
                internals.invoices.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                
                //internals.dataRowSelected = internals.clientsInvoice.table.row($(this)).data()
                internals.dataRowSelectedInvoice = internals.invoices.table.row($(this)).data()
                loadContainers($("#searchClient").val(), internals.dataRowSelectedInvoice._id)
                //loadInvoices(internals.dataRowSelected._id)
                //loadSingleContainer(internals.dataRowSelected.id)
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
                el.extraDays = moment(el.datetimeOut).diff(moment(el.datetime), 'days')
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

async function loadServices(id){
    /*if(id==0){
        if($.fn.DataTable.isDataTable('#clientsServices')){
            internals.services.table.clear().destroy()
        }
        return
    }*/

    let startDate = '2000-01-01', endDate = '3000-01-01'
    if($('#searchDateCheck').prop('checked')){
        startDate = $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD')
        endDate = $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD')
    }

    let servicesData = await axios.post('/api/clientServices', {
        client: id,
        startDate: startDate,
        endDate: endDate
    })
    let services = servicesData.data

    console.log(services)

    $("#tableBodyServices").html(`
        <tr>
            <td>Almacenamiento Full</td>
            <td style="text-align: center;">${services.storageFull.quantity}</td>
            <td style="text-align: center;">${services.storageFull.inventory}</td>
            <td style="text-align: center;">${services.storageFull.retired}</td>
            <td style="text-align: center;">${services.storageFull.invoiced}</td>
            <td style="text-align: center;">${services.storageFull.retired - services.storageFull.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.storageFull.net)}</td>
            <td style="text-align: right;">${dot_separators(services.storageFull.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.storageFull.total)}</td>
        </tr>
        <tr>
            <td>Almacenamiento Vacío</td>
            <td style="text-align: center;">${services.storageEmpty.quantity}</td>
            <td style="text-align: center;">${services.storageEmpty.inventory}</td>
            <td style="text-align: center;">${services.storageEmpty.retired}</td>
            <td style="text-align: center;">${services.storageEmpty.invoiced}</td>
            <td style="text-align: center;">${services.storageEmpty.retired - services.storageEmpty.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.storageEmpty.net)}</td>
            <td style="text-align: right;">${dot_separators(services.storageEmpty.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.storageEmpty.total)}</td>
        </tr>
        <tr>
            <td>Almacenamiento IMO</td>
            <td style="text-align: center;">${services.storageIMO.quantity}</td>
            <td style="text-align: center;">${services.storageIMO.inventory}</td>
            <td style="text-align: center;">${services.storageIMO.retired}</td>
            <td style="text-align: center;">${services.storageIMO.invoiced}</td>
            <td style="text-align: center;">${services.storageIMO.retired - services.storageIMO.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.storageIMO.net)}</td>
            <td style="text-align: right;">${dot_separators(services.storageIMO.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.storageIMO.total)}</td>
        </tr>
        <tr>
            <td>Desconsolidado</td>
            <td style="text-align: center;">${services.deconsolidated.quantity}</td>
            <td style="text-align: center;">${services.deconsolidated.inventory}</td>
            <td style="text-align: center;">${services.deconsolidated.retired}</td>
            <td style="text-align: center;">${services.deconsolidated.invoiced}</td>
            <td style="text-align: center;">${services.deconsolidated.retired - services.deconsolidated.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.deconsolidated.net)}</td>
            <td style="text-align: right;">${dot_separators(services.deconsolidated.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.deconsolidated.total)}</td>
        </tr>
        <tr>
            <td>Traspaso</td>
            <td style="text-align: center;">${services.transfer.quantity}</td>
            <td style="text-align: center;">${services.transfer.inventory}</td>
            <td style="text-align: center;">${services.transfer.retired}</td>
            <td style="text-align: center;">${services.transfer.invoiced}</td>
            <td style="text-align: center;">${services.transfer.retired - services.transfer.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.transfer.net)}</td>
            <td style="text-align: right;">${dot_separators(services.transfer.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.transfer.total)}</td>
        </tr>
        <tr>
            <td>Porteo</td>
            <td style="text-align: center;">${services.portage.quantity}</td>
            <td style="text-align: center;">${services.portage.inventory}</td>
            <td style="text-align: center;">${services.portage.retired}</td>
            <td style="text-align: center;">${services.portage.invoiced}</td>
            <td style="text-align: center;">${services.portage.retired - services.portage.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.portage.net)}</td>
            <td style="text-align: right;">${dot_separators(services.portage.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.portage.total)}</td>
        </tr>
        <tr>
            <td>Transporte</td>
            <td style="text-align: center;">${services.transport.quantity}</td>
            <td style="text-align: center;">${services.transport.inventory}</td>
            <td style="text-align: center;">${services.transport.retired}</td>
            <td style="text-align: center;">${services.transport.invoiced}</td>
            <td style="text-align: center;">${services.transport.retired - services.transport.invoiced}</td>
            <td style="text-align: right;">${dot_separators(services.transport.net)}</td>
            <td style="text-align: right;">${dot_separators(services.transport.iva)}</td>
            <td style="text-align: right;">${dot_separators(services.transport.total)}</td>
        </tr>
        <tr>
            <th>TOTALES</th>
            <th style="text-align: center;">${services.total.quantity}</th>
            <td style="text-align: center;">${services.total.inventory}</td>
            <td style="text-align: center;">${services.total.retired}</td>
            <td style="text-align: center;">${services.total.invoiced}</td>
            <td style="text-align: center;">${services.total.retired - services.total.invoiced}</td>
            <th style="text-align: right;">${dot_separators(services.total.net)}</th>
            <th style="text-align: right;">${dot_separators(services.total.iva)}</th>
            <th style="text-align: right;">${dot_separators(services.total.total)}</th>
        </tr>
    `)

    return
    
    if($.fn.DataTable.isDataTable('#tablServices')){
        internals.services.table.clear().destroy()
    }

    try {
        internals.services.table = $('#tablServices')
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

                let formatData= services.map(el => {
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

                internals.services.table.rows.add(formatData).draw()
          }
        })

        $('#tablServices tbody').off("click")

        $('#tablServices tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                
            } else {
                internals.invoices.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                
                //internals.dataRowSelected = internals.clientsInvoice.table.row($(this)).data()
                internals.dataRowSelectedInvoice = internals.invoices.table.row($(this)).data()
                loadContainers($("#searchClient").val(), internals.dataRowSelectedInvoice._id)
                //loadInvoices(internals.dataRowSelected._id)
                //loadSingleContainer(internals.dataRowSelected.id)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

function drawTablesContainers(){

    let totalNet = 0
    let totalIVA = 0
    let totalTotal = 0

    $("#tableBodyContainersInvoice").html('')

    invoiceContainers.containersInvoice.sort(function(a,b){
        return new Date(a.datetimeOut) - new Date(b.datetimeOut);
    })

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