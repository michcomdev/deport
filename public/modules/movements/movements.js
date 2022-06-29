let internals = {
    movements: {
        table: {},
        data: []
    },
    clients: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

let clients = {}
let containerTypes = {}
let sites = {}
let cranes = {}
let allContainers = []

let siteMap = {}
let selectedSiteMap = {}

$(document).ready(async function () {
    $('#searchDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-2,'weeks')
        //endDate: moment()
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    $('#searchInventory').change(function () {
        if($(this).prop('checked')){
            $('.noInventory').attr('disabled',true)
            $('#searchStatus').val('TODOS')
        }else{
            $('.noInventory').removeAttr('disabled')
        }
    })

    //loadMovementTable()
    getParameters()

    $("#search").on('click', function(){
        loadMovementTable()
    })

    $('body').on('hidden.bs.modal', function () { //Evita pérdida de scroll modal
        if(($(".modal").data('bs.modal') || {})._isShown){
            $('body').addClass('modal-open')
        }/*else{
            $('body').removeClass('modal-open')
        }*/

        /*if($('.modal').length > 0){
            $('body').addClass('modal-open')
        }*/
    })
    
})

async function getParameters() {
    let clientsData = await axios.get('api/clients')
    clients = clientsData.data

    for(let i=0; i < clients.length; i++){
        $("#searchClient").append('<option value="'+clients[i]._id+'">'+clients[i].name+'</option>')
    }

    let containerTypesData = await axios.get('api/containerTypes')
    containerTypes = containerTypesData.data
    
    let sitesData = await axios.get('api/sites')
    sites = sitesData.data

    let cranesData = await axios.get('api/cranes')
    cranes = cranesData.data

    let servicesData = await axios.get('api/services')
    services = servicesData.data

    let allContainersData = await axios.get('api/allContainers')
    allContainers = allContainersData.data.sort()
    /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
    autocomplete(document.getElementById("searchNumber"), allContainers)
    
    loadMovementTable()
}

async function setPositionList(editSite, editRow, editPosition, editLevel) {

    if(editSite){ //CASO DE CARGA DE DATOS
        $("#movementPositionRow").html('<option value="0">SEL</option>')
        $("#movementPositionPosition").html('<option value="0">SEL</option>')
        $("#movementPositionLevel").html('<option value="0">SEL</option>')
        $("#movementPositionRowOld").html('<option value="0">SEL</option>')
        $("#movementPositionPositionOld").html('<option value="0">SEL</option>')
        $("#movementPositionLevelOld").html('<option value="0">SEL</option>')

        $("#movementSiteOld").val(editSite)

        let siteData = await axios.post('/api/siteSingle', {id: editSite})
        siteMap = siteData.data.rows

        

        for(let i=0; i<siteMap.length; i++){
            if(editRow==siteMap[i].row){
                $("#movementPositionRow").append(`<option value="${siteMap[i].row}" selected>${siteMap[i].row}</option>`)
                $("#movementPositionRowOld").append(`<option value="${siteMap[i].row}" selected>${siteMap[i].row}</option>`)
            }else{
                $("#movementPositionRow").append(`<option value="${siteMap[i].row}">${siteMap[i].row}</option>`)
                $("#movementPositionRowOld").append(`<option value="${siteMap[i].row}">${siteMap[i].row}</option>`)
            }
        }

        let positions = siteMap.find(x => x.row === editRow).positions
        for(let i=0; i<positions.length; i++){
            if(editPosition==positions[i].position){
                $("#movementPositionPosition").append(`<option value="${positions[i].position}" selected>${positions[i].position}</option>`)
                $("#movementPositionPositionOld").append(`<option value="${positions[i].position}" selected>${positions[i].position}</option>`)
            }else{
                $("#movementPositionPosition").append(`<option value="${positions[i].position}">${positions[i].position}</option>`)
                $("#movementPositionPositionOld").append(`<option value="${positions[i].position}">${positions[i].position}</option>`)
            }
        }

        //Se toma como referencia las alturas del primer container
        for(let j=0; j<positions[0].levels.length; j++){
            if(editLevel==positions[0].levels[j]){
                $("#movementPositionLevel").append(`<option value="${positions[0].levels[j]}" selected>${positions[0].levels[j]}</option>`)
                $("#movementPositionLevelOld").append(`<option value="${positions[0].levels[j]}" selected>${positions[0].levels[j]}</option>`)
            }else{
                $("#movementPositionLevel").append(`<option value="${positions[0].levels[j]}">${positions[0].levels[j]}</option>`)
                $("#movementPositionLevelOld").append(`<option value="${positions[0].levels[j]}">${positions[0].levels[j]}</option>`)
            }
        }

    }

    $('#movementSite').change(async function () {
        $("#movementPositionRow").html('<option value="0">SEL</option>')
        $("#movementPositionPosition").html('<option value="0">SEL</option>')
        $("#movementPositionLevel").html('<option value="0">SEL</option>')

        if($(this).val()==0){
            $("#movementPositionRow").val(0)
            $("#movementPositionPosition").val(0)
            $("#movementPositionLevel").val(0)
        
        }else{
            let siteData = await axios.post('/api/siteSingle', {id: $(this).val()})
            siteMap = siteData.data.rows

            for(let i=0; i<siteMap.length; i++){
                $("#movementPositionRow").append(`<option value="${siteMap[i].row}">${siteMap[i].row}</option>`)
            }
        }
    })

    $('#movementPositionRow').change(async function () {

        $("#movementPositionPosition").html('<option value="0">SEL</option>')
        $("#movementPositionLevel").html('<option value="0">SEL</option>')

        if($(this).val()==0){
            $("#movementPositionPosition").val(0)
            $("#movementPositionLevel").val(0)
        
        }else{
            let positions = siteMap.find(x => x.row === $(this).val()).positions
            for(let i=0; i<positions.length; i++){
                let color = ''
                if(positions[i].levelOnUse){
                    if(positions[i].levels.length==positions[i].levelOnUse.length){
                        color = 'style="color: red"'
                    }
                }
                $("#movementPositionPosition").append(`<option ${color} value="${positions[i].position}">${positions[i].position}</option>`)
            }

            //Se toma como referencia las alturas del primer container
            for(let j=0; j<positions[0].levels.length; j++){
                $("#movementPositionLevel").append(`<option value="${positions[0].levels[j]}">${positions[0].levels[j]}</option>`)
            }
        }
    })

    $('#movementPositionPosition').change(async function () {
        
        if($(this).val()==0){
            $("#movementPositionLevel").val(0)
        
        }else{
            let positions = siteMap.find(x => x.row === $('#movementPositionRow').val()).positions

            let position = positions.find(x => x.position == $(this).val())
            if(position){
                if(position.levelOnUse){
                    for(i=0;i<position.levelOnUse.length;i++){
                        $('#movementPositionLevel option[value="'+position.levelOnUse[i]+'"]').css('color','red')
                    }
                }
            }
        }
    })


    $('#movementSiteOld').change(async function () {
        $("#movementPositionRowOld").html('<option value="0">SEL</option>')
        $("#movementPositionPositionOld").html('<option value="0">SEL</option>')
        $("#movementPositionLevelOld").html('<option value="0">SEL</option>')

        if($(this).val()==0){
            $("#movementPositionRowOld").val(0)
            $("#movementPositionPositionOld").val(0)
            $("#movementPositionLevelOld").val(0)
        
        }else{
            let siteData = await axios.post('/api/siteSingle', {id: $(this).val()})
            siteMap = siteData.data.rows

            for(let i=0; i<siteMap.length; i++){
                $("#movementPositionRowOld").append(`<option value="${siteMap[i].row}">${siteMap[i].row}</option>`)
            }
        }
    })

    $('#movementPositionRowOld').change(async function () {

        $("#movementPositionPositionOld").html('<option value="0">SEL</option>')
        $("#movementPositionLevelOld").html('<option value="0">SEL</option>')

        if($(this).val()==0){
            $("#movementPositionPositionOld").val(0)
            $("#movementPositionLevelOld").val(0)
        
        }else{
            let positions = siteMap.find(x => x.row === $(this).val()).positions
            
            for(let i=0; i<positions.length; i++){
                $("#movementPositionPositionOld").append(`<option value="${positions[i].position}">${positions[i].position}</option>`)
            }

            //Se toma como referencia las alturas del primer container
            for(let j=0; j<positions[0].levels.length; j++){
                $("#movementPositionLevelOld").append(`<option value="${positions[0].levels[j]}">${positions[0].levels[j]}</option>`)
            }
        }
    })
}

function loadMovementTable() {
    try {
        if($.fn.DataTable.isDataTable('#tableMovements')){
            internals.movements.table.clear().destroy()
        }
        $.fn.dataTable.moment('DD/MM/YYYY HH:mm') //Se utiliza plugin datetime-moment para datatables

        internals.movements.table = $('#tableMovements')
        .DataTable({
            dom: 'Bfrtip',
            buttons: ['excel'],
            iDisplayLength: 25,
            /*"search": {Sólo para propósitos de prueba
                "search": "HLBU-326026-4"
            },*/
            language: {
                url: spanishDataTableLang
            },
            responsive: false,
            order: [[ 0, 'desc' ]],
            ordering: true,
            columnDefs: [{targets: [0,1,2,8,11], className: 'dt-center'}],
            rowCallback: function( row, data ) {
            },
            columns: [
                { data: 'datetime'},
                { data: 'datetimeOut'},
                { data: 'extraDays'},
                { data: 'movement' },
                { data: 'status' },
                { data: 'client' },
                { data: 'containerNumber' },
                { data: 'containerType' },
                { data: 'containerLarge' },
                { data: 'containerState' },
                { data: 'site' },
                { data: 'position' },
                { data: 'driverName' },
                { data: 'driverPlate' }
            ],
            initComplete: function (settings, json) {
                getMovementsEnabled()
            }
        })

        $('#tableMovements tbody').off("click")

        $('#tableMovements tbody').on('click', 'tr', function () {
            $('#optionModMovement').removeClass('btn-outline-primary btn-outline-success btn-outline-warning')

            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModMovement').prop('disabled', true)
                $('#optionModMovement').addClass('btn-outline-success')
                $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR')
                $('#optionCloseMovement').prop('disabled', true)
                $('#optionMovMovement').prop('disabled', true)
                $('#optionDeconsolidatedMovement').prop('disabled', true)
            } else {
                internals.movements.table.$('tr.selected').removeClass('selected')
                $(this).addClass('selected')
                internals.dataRowSelected = internals.movements.table.row($(this)).data()
                $('#optionModMovement').prop('disabled', false)

                let movementType = internals.dataRowSelected.movement

                if(movementType=='POR INGRESAR' || movementType=='INGRESADO' || movementType=='TRASLADO' || movementType=='DESCONSOLIDADO'){
                    $('#optionModMovement').addClass('btn-outline-success')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR')
                }else if(movementType=='SALIDA' || movementType=='POR SALIR'){
                    $('#optionModMovement').addClass('btn-outline-primary')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR SALIDA')
                /*}else if(movementType=='DESCONSOLIDADO'){
                    $('#optionModMovement').addClass('btn-outline-warning')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR DESCONSOLIDADO')*/
                }else if(movementType=='TRASPASO'){
                    $('#optionModMovement').addClass('btn-outline-primary')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR TRASPASO')
                }

                $('#optionCloseMovement').prop('disabled', false)
                if(movementType=='INGRESADO' || movementType=='TRASLADO'){
                    $('#optionCloseMovement').prop('disabled', false)
                    $('#optionMovMovement').prop('disabled', false)
                    if(internals.dataRowSelected.containerState=='LLENO'){
                        $('#optionDeconsolidatedMovement').prop('disabled', false)
                    }else{
                        $('#optionDeconsolidatedMovement').prop('disabled', true)
                    }
                }else if(movementType=='DESCONSOLIDADO'){
                    $('#optionCloseMovement').prop('disabled', false)
                    $('#optionMovMovement').prop('disabled', false)
                    $('#optionDeconsolidatedMovement').prop('disabled', true)
                }else{
                    $('#optionCloseMovement').prop('disabled', true)
                    $('#optionMovMovement').prop('disabled', true)
                    $('#optionDeconsolidatedMovement').prop('disabled', true)
                }
            }
        })
    } catch (error) {
        console.log(error)
    }

}

async function getMovementsEnabled() {

    loadingHandler('start')
    let movementData
    let query = {
        table: true,
        containerNumber: $("#searchNumber").val(),
        client: $("#searchClient").val(),
        status: $("#searchStatus").val(),
        startDate: $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        dateOut: $("#searchDateOut").prop('checked'),
        onlyInventory: $("#searchInventory").prop('checked')
    }

    movementData = await axios.post('api/movementsByFilter',query)
    
    if (movementData.data.length > 0) {
        let formatData= movementData.data.map(el => {

            /////CÁLCULO DE DÍAS EXTRAS SEGÚN SERVICIOS/////
            el.extraDays = 0
            deconExtraDays = 0 //Por si aplican días extras después de desconsolidado

            let momentEndDate = moment()

            if(Date.parse(el.datetimeOut)){
                momentEndDate = moment(el.datetimeOut)
                el.datetimeOut = moment(el.datetimeOut).format('DD/MM/YYYY HH:mm')
            }
                
            if(el.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)){
                let serviceName = el.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0).services.name
                
                let deconDate = el.movements.find(x => x.movement==='DESCONSOLIDADO').datetime

                //Días Extras posteriores a Desconsolidado
                deconExtraDays = momentEndDate.diff(moment(deconDate).format('YYYY-MM-DD'), 'days')
                
                let serviceDays = el.services.find(x => x.services.name===serviceName).services.days
                //////Verificación de días especiales de cliente////
                let serviceID = el.services.find(x => x.services.name===serviceName).services._id
                let clientService = el.clientRates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
                /////////////////////////////////////////////////

                if(deconExtraDays<=serviceDays){
                    deconExtraDays = 0
                }else{
                    deconExtraDays -= serviceDays
                }

                el.extraDays = moment(deconDate).diff(moment(el.datetime).format('YYYY-MM-DD'), 'days') //Se toma como último día el del desconsolidado
            }else{
                el.extraDays = momentEndDate.diff(moment(el.datetime).format('YYYY-MM-DD'), 'days')
            }
        
            //if(el.services.find(x => x.services.name==='Almacenamiento IMO')){
                //let serviceDays = el.services.find(x => x.services.name==='Almacenamiento IMO').services.days
                
            if(el.services.find(x => x.services.name.indexOf('Almacenamiento')>=0)){
                let serviceDays = el.services.find(x => x.services.name.indexOf('Almacenamiento')>=0).services.days
                
                //////Verificación de días especiales de cliente////
                let serviceID = el.services.find(x => x.services.name.indexOf('Almacenamiento')>=0).services._id
                let clientService = el.clientRates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
                /////////////////////////////////////////////////

                if(el.extraDays<=serviceDays){
                    el.extraDays = 0
                }else{
                    el.extraDays -= serviceDays
                }
            }else{
                if(el.extraDays<=5){
                    el.extraDays = 0
                }else{
                    el.extraDays -= 5
                }
            }
            
            el.extraDays += deconExtraDays
            
            /////////////////////////////////////////


            el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')

            el.status = 'EN SITIO'
            if(el.movement=='SALIDA' || el.movement=='TRASPASO'){
                el.status = 'RETIRADO'
            }

            return el
        })

        internals.movements.table.rows.add(formatData).draw()
        $('#loadingMovements').empty()

        loadingHandler('stop')
    } else {
        toastr.warning('No se han encontrado movimientos en base a filtrado')
        $('#loadingMovements').empty()
        loadingHandler('stop')
    }
}

$('#sendMail').on('click', async function () {
    let email = await axios.post('api/sendMail',{id: '627be1774a15be6ebc60667c', type: 'INGRESO', driverName: 'YUSNEIVY', pdf: ''})
})

$('#optionCreateMovement').on('click', function () { // CREAR MOVIMIENTO
    loadingHandler('start')
    $('#movementsModal').modal('show')
    $('#modalMov_title').html(`Llegada`)
    $('#modalMov_body').html(createModalBody())

    $('#imgTexture').val('cai')
    
    setServiceList('ALL')

    setPositionList()

    $('#modalMov_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#divPrintIn').html('')
    $('#divPrintDecon').html('')
    $('#divPrintOut').html('')

    $("#btnMap").css('display','none')
    $("#btnHistory").css('display','none')

    $('#movementType').val('POR INGRESAR')
    $('#movementType').prop('disabled',true)

    var element = document.getElementById('movementContainerNumber')
    var maskOptions = {
        mask: 'aaaa-000000-0',
        lazy: false //shows placeholder
    };
    var mask = IMask(element, maskOptions)

    $('#movementDriverForeigner').change(function () {
        if(!$(this).prop('checked')){
            let rut = validateRut($('#movementDriverRUT').val())
            if(rut){
                $('#movementDriverRUT').val(rut)
                getDriver(rut)
            }
        }else{
            getDriver($('#movementDriverRUT').val())
        }
    })

    $('#movementDriverRUT').on('keyup', function () {
        if(!$('#movementDriverForeigner').prop('checked')){
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut)
            }
        }else{
            getDriver($('#movementDriverRUT').val())
        }
    })

    $('.classStacker').attr('disabled',true)
    $('#movementStacker').prop('checked',true)

    $('#movementStacker').change(function () {
        if($(this).prop('checked')){
            $('.classStacker').attr('disabled',true)
        }else{
            $('.classStacker').removeAttr('disabled')
        }
    })

    $('#saveMovement').on('click', async function () {


        /*
        EN PROCESO!!!!!!!!!!!!!!!!!!!
        if(!$('#movementContainerNumber').val().includes('_')){
            let query = {
                table: true,
                containerNumber: $("#movementContainerNumber").val()
            }
        
            let movementData = await axios.post('api/movementsByContainerNumber',query)

            console.log(movementData)
        }

        console.log('testing')
        return*/

        //let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
        //let iva = Math.round(net * 0.19)
        //let total = parseInt(net) + parseInt(iva)

        let movement = $('#movementType').val()

        if($('#movementCrane').val()!=0 && $('#movementCrane').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0){
            movement = 'INGRESADO'
        }

        //Servicios
        let services = []
        let errorNet = false, errorIVA = false
        $("#tableServicesBody > tr").each(function() {
            let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            //let iva = Math.round(net * 0.19)
            let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            let total = parseInt(net) + parseInt(iva)
            
            if(!$.isNumeric(net)){
                errorNet = true
            }
            if(!$.isNumeric(iva)){
                errorIVA = true
            }else{
                if(iva!=0){
                    if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                        errorIVA = true
                    }
                }
            }

            services.push({
                services: $($($(this).children()[0]).children()[0]).val(),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total
            })
        })    

        //Pagos
        let payments = []
        let errorAmount = false
        $("#tablePaymentBody > tr").each(function() {
            let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            
            if(!$.isNumeric(amount)){
                errorAmount = true
            }else if(amount<=0){
                errorAmount = true
            }

            payments.push({
                paymentType: $($($(this).children()[0]).children()[0]).val(),
                paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                paymentAmount: amount
            })
        })    
        
        if(errorNet){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorIVA){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorAmount){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
            $('#modal').modal('show')
            return
        }

        let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
        if(totalBalance<0){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
            $('#modal').modal('show')
            return
        }
    
        let movementData = {
            movement: movement,
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),//$('#movementDate').val() + 'T' + $('#movementTime').val() + ':00.000Z'
            client: $('#movementClient').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            driverForeigner: $('#movementDriverForeigner').prop('checked'),
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            /*services: $('#movementService').val(),
            paymentType: $('#movementPaymentType').val(),
            paymentNumber: $('#movementPaymentNumber').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentNet: net,
            paymentIVA: iva,
            paymentTotal: total,*/
            services: services,
            payments: payments,
            paymentCredit: $('#chkCredit').prop('checked'),
            observation: $('#movementObservation').val()
        }

        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementSave', res.ok)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')
                    printVoucher('in',saveMovement.data._id, true) //true==envío por email

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Contenedor almacenado correctamente</h5>`)

                    loadMovementTable()
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show')
        }

    })
    loadingHandler('stop')
})

$('#optionModMovement').on('click', async function () {
    loadingHandler('start')
    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    if(container.movements[movementID].movement=='POR INGRESAR' || container.movements[movementID].movement=='INGRESADO' || container.movements[movementID].movement=='TRASLADO' || container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA' || container.movements[movementID].movement=='DESCONSOLIDADO'){

        $('#movementsModal').modal('show')
        $('#modalMov_body').html(createModalBody(container.movements[movementID].movement))
        $('#imgTexture').val('cai')
        setServiceList('ALL', container.services)
        setPayments(container.payments)
        if(container.paymentCredit){
            $('#chkCredit').prop('checked',true)
        }

        $('#movementClient').val(container.clients._id)
        setClientRUT()
        setClientRates()

        /////CÁLCULO DE DÍAS EXTRAS SEGÚN SERVICIOS/////
        extraDays = 0
        deconExtraDays = 0 //Por si aplican días extras después de desconsolidado
        let serviceType = 'normal'
        let momentEndDate = moment()
        
        if(container.movements[movementID].movement=='POR INGRESAR' || container.movements[movementID].movement=='INGRESADO' || container.movements[movementID].movement=='TRASLADO' || container.movements[movementID].movement=='DESCONSOLIDADO'){
            $('#modalMov_title').html(`Modifica Registro`)

        }else if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
            $('#modalMov_title').html(`Modifica Salida`)

            momentEndDate = moment(container.movements[movementID].datetime)
        }
        
        if(container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)){
            let serviceName = container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0).services.name
            let deconDate = container.movements.find(x => x.movement==='DESCONSOLIDADO').datetime
            //Días Extras posteriores a Desconsolidado
            deconExtraDays = momentEndDate.diff(moment(deconDate).format('YYYY-MM-DD'), 'days')


            let serviceDays = container.services.find(x => x.services.name===serviceName).services.days
            //////Verificación de días especiales de cliente////
            if(container.clients.rates){
                let serviceID = container.services.find(x => x.services.name===serviceName).services._id
                let clientService = container.clients.rates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
            }
            /////////////////////////////////////////////////
            
            if(deconExtraDays<=serviceDays){
                deconExtraDays = 0
            }else{
                deconExtraDays -= serviceDays
            }

            extraDays = moment(deconDate).diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days') //Se toma como último día el del desconsolidado
        }else{
            extraDays = momentEndDate.diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days')
        }

        if(container.services.find(x => x.services.name==='Almacenamiento IMO')){
            serviceType = 'imo'
            let serviceDays = container.services.find(x => x.services.name==='Almacenamiento IMO').services.days

            //////Verificación de días especiales de cliente////
            if(container.clients.rates){
                let serviceID = container.services.find(x => x.services.name==='Almacenamiento IMO').services._id
                let clientService = container.clients.rates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
            }
            /////////////////////////////////////////////////

            if(extraDays<=serviceDays){
                extraDays = 0
            }else{
                extraDays -= serviceDays
            }
        }else if(container.services.find(x => x.services.name==='Almacenamiento Full')){
            let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Full').services.days

            //////Verificación de días especiales de cliente////
            if(container.clients.rates){
                let serviceID = container.services.find(x => x.services.name==='Almacenamiento Full').services._id
                let clientService = container.clients.rates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
            }
            /////////////////////////////////////////////////
            if(extraDays<=serviceDays){
                extraDays = 0
            }else{
                extraDays -= serviceDays
            }
        }else if(container.services.find(x => x.services.name==='Almacenamiento Vacío')){
            let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Vacío').services.days

            //////Verificación de días especiales de cliente////
            if(container.clients.rates){
                let serviceID = container.services.find(x => x.services.name==='Almacenamiento Vacío').services._id
                let clientService = container.clients.rates.find(x => x.services==serviceID)
                if(clientService){
                    serviceDays = clientService.days
                }
            }
            /////////////////////////////////////////////////
            if(extraDays<=serviceDays){
                extraDays = 0
            }else{
                extraDays -= serviceDays
            }
        }else{
            if(extraDays<=5){
                extraDays = 0
            }else{
                extraDays -= 5
            }
        }

        setExtraDays(extraDays,deconExtraDays,serviceType)

        $('#modalMov_footer').html(`
            <button class="btn btn-dark" data-dismiss="modal">
                <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
            </button>

            <button class="btn btn-primary" id="saveMovement">
                <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
            </button>
        `)

        let numberIn = '', numberOut = '', numberDecon = ''
        if(container.numberIn){
            numberIn = 'N° ' + container.numberIn
        }
        if(container.numberOut){
            numberOut = 'N° ' + container.numberOut
        }
        if(container.numberDecon){
            numberDecon = 'N° ' + container.numberDecon
        }

        $('#divPrintIn').html(`
            <button class="btn btn-info btn-sm" id="printMovementIn" onclick="printVoucher('in','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER INGRESO ${numberIn}
            </button>
        `)
        
        $('#divPrintOut').html(`
            <button class="btn btn-info btn-sm" id="printMovementOut" onclick="printVoucher('out','${internals.dataRowSelected.id}')" disabled>
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER SALIDA ${numberOut}
            </button>
        `)

        if(container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)){
            $('#divPrintDecon').html(`
                <button class="btn btn-warning btn-sm" id="printMovementDecon" onclick="printVoucher('decon','${internals.dataRowSelected.id}')">
                    <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER DESCONSOLIDADO ${numberDecon}
                </button>
            `)
        }else{
            $('#divPrintDecon').html('')
        }

        $('#movementType').prop('disabled',true)

        if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
            $('#printMovementOut').removeAttr('disabled')
            $(".classOut").prop('disabled',true)
        }

        var element = document.getElementById('movementContainerNumber')
        var maskOptions = {
            mask: 'aaaa-000000-0',
            lazy: false //shows placeholder
        };
        var mask = IMask(element, maskOptions)

        $('#movementStacker').change(function () {
            if($(this).prop('checked')){
                $('.classStacker').attr('disabled',true)
            }else{
                $('.classStacker').removeAttr('disabled')
            }
        })

        $('#movementType').val(container.movements[movementID].movement)
        if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
            $('#movementDate').val(moment(container.movements[0].datetime).format('YYYY-MM-DD'))
            $('#movementTime').val(moment(container.movements[0].datetime).format('HH:mm'))
            $('#movementOutDate').val(moment(container.movements[movementID].datetime).format('YYYY-MM-DD'))
            $('#movementOutTime').val(moment(container.movements[movementID].datetime).format('HH:mm'))
        }else{
            //$('#movementDate').val(moment(container.movements[movementID].datetime).format('YYYY-MM-DD'))
            //$('#movementTime').val(moment(container.movements[movementID].datetime).format('HH:mm'))
            $('#movementDate').val(moment(container.movements[0].datetime).format('YYYY-MM-DD'))
            $('#movementTime').val(moment(container.movements[0].datetime).format('HH:mm'))
        }

        $('#movementContainerNumber').val(container.containerNumber)
        $('#movementContainerType').val(container.containertypes)
        if(container.containerTexture==''){
            container.containerTexture = 'cai'
        }
        $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
        $('#imgTexture').val(container.containerTexture)
        $('#movementContainerLarge').val(container.containerLarge)
        
        if(container.movements[movementID].cranes){
            $('#movementCrane').val(container.movements[movementID].cranes)
        }
        selectedSiteMap = 0
        if(container.movements[movementID].sites){
            selectedSiteMap = container.movements[movementID].sites
            $('#movementSite').val(container.movements[movementID].sites)
            setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)
        }else{
            setPositionList()
        }

        getClientRates() //Revisión de modificación de tarifas



        //$('#movementPositionRow').val(container.movements[movementID].position.row)
        //$('#movementPositionPosition').val(container.movements[movementID].position.position)
        //$('#movementPositionLevel').val(container.movements[movementID].position.level)

        if(!container.movements[movementID].cranes && !container.movements[movementID].sites && container.movements[movementID].position.row==0 && container.movements[movementID].position.position==0 && container.movements[movementID].position.level==0){
            $('#movementStacker').prop('checked',true)
            $('.classStacker').attr('disabled',true)
        }

        
        if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
            $('#movementDriverForeigner').prop('checked',container.movements[0].driverForeigner)
            $('#movementDriverRUT').val(container.movements[0].driverRUT)
            $('#movementDriverName').val(container.movements[0].driverName)
            $('#movementDriverPlate').val(container.movements[0].driverPlate)
            $('#movementDriverGuide').val(container.movements[0].driverGuide)
            $('#movementDriverSeal').val(container.movements[0].driverSeal)

            if(container.movements[movementID].driverRUT){
                $('#movementDriverOutForeigner').prop('checked',container.movements[movementID].driverOutForeigner)
                $('#movementDriverOutRUT').val(container.movements[movementID].driverRUT)
                $('#movementDriverOutName').val(container.movements[movementID].driverName)
                $('#movementDriverOutPlate').val(container.movements[movementID].driverPlate)
                $('#movementDriverOutGuide').val(container.movements[movementID].driverGuide)
                $('#movementDriverOutSeal').val(container.movements[movementID].driverSeal)
            }else{
                for(let i=container.movements.length-1;i>=0;i--){
                    if(container.movements[i].driverRUT){
                        $('#movementDriverOutForeigner').prop('checked',container.movements[i].driverOutForeigner)
                        $('#movementDriverOutRUT').val(container.movements[i].driverRUT)
                        $('#movementDriverOutName').val(container.movements[i].driverName)
                        $('#movementDriverOutPlate').val(container.movements[i].driverPlate)
                        $('#movementDriverOutGuide').val(container.movements[i].driverGuide)
                        $('#movementDriverOutSeal').val(container.movements[i].driverSeal)
                        i=0
                    }
                }
            }
        }else{
            $('#movementDriverForeigner').prop('checked',container.movements[movementID].driverForeigner)
            $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
            $('#movementDriverName').val(container.movements[movementID].driverName)
            $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
            $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
            $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
        }
        
        $('#movementObservation').val(container.movements[movementID].observation)

        $('#movementDriverForeigner').change(function () {
            if(!$(this).prop('checked')){
                let rut = validateRut($('#movementDriverRUT').val())
                if(rut){
                    $('#movementDriverRUT').val(rut)
                    getDriver(rut)
                }
            }else{
                getDriver($('#movementDriverRUT').val())
            }
        })

        $('#movementDriverRUT').on('keyup', function () {
            if(!$('#movementDriverForeigner').prop('checked')){
                let rut = validateRut($(this).val())
                if(rut){
                    $(this).val(rut)
                    getDriver(rut)
                }
            }else{
                getDriver($('#movementDriverRUT').val())
            }
        })

        //$("#btnMap").css('display','block')
        $("#btnHistory").css('display','block')
        
        $('#saveMovement').on('click', async function () {

            let movement = $('#movementType').val()

            if($('#movementCrane').val()!=0 && $('#movementCrane').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0){
                if(movement=='POR INGRESAR'){
                    movement = 'INGRESADO'
                }
            }

            //Servicios
            let services = []
            let hasDeconsolidated = false //Para el caso en que se borre el desconsolidado
            let errorNet = false, errorIVA = false
            $("#tableServicesBody > tr").each(function() {
                let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                //let iva = Math.round(net * 0.19)
                let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                let total = parseInt(net) + parseInt(iva)
                
                if(!$.isNumeric(net)){
                    errorNet = true
                }
                if(!$.isNumeric(iva)){
                    errorIVA = true
                }else{
                    if(iva!=0){
                        if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                            errorIVA = true
                        }
                    }
                }

                services.push({
                    services: $($($(this).children()[0]).children()[0]).val(),
                    paymentNet: net,
                    paymentIVA: iva,
                    paymentTotal: total
                })

                if($($($(this).children()[0]).children()[0]).children(':selected').text().indexOf('Desconsolidado')>=0){
                    hasDeconsolidated = true
                }
            })

            if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
                $("#tableServicesExtraBody > tr").each(function() {
                    let extraDays = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace(' ', ''))
                    let net = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                    //let iva = Math.round(net * 0.19)
                    let iva = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                    let total = parseInt(net) + parseInt(iva)
                    
                    if(!$.isNumeric(net)){
                        errorNet = true
                    }
                    if(!$.isNumeric(iva)){
                        errorIVA = true
                    }else{
                        if(iva!=0){
                            if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                                errorIVA = true
                            }
                        }
                    }
                
                    services.push({
                        services: $($($(this).children()[1]).children()[1]).val(),
                        paymentNet: net,
                        paymentIVA: iva,
                        paymentTotal: total,
                        extraDays: extraDays
                    })
                })
            }

            
            //Pagos
            let payments = []
            let errorAmount = false
            $("#tablePaymentBody > tr").each(function() {
                let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                
                if(!$.isNumeric(amount)){
                    errorAmount = true
                }else if(amount<=0){
                    errorAmount = true
                }

                payments.push({
                    paymentType: $($($(this).children()[0]).children()[0]).val(),
                    paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                    date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                    paymentAmount: amount
                })
            })   

            if(errorNet){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
                $('#modal').modal('show')
                return
            }
    
            if(errorIVA){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
                $('#modal').modal('show')
                return
            }

            if(errorAmount){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
                $('#modal').modal('show')
                return
            }

            let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
            if(totalBalance<0){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
                $('#modal').modal('show')
                return
            }


            let datetime = $('#movementDate').val() + ' ' + $('#movementTime').val()
            if(movement=='POR SALIR' || movement=='SALIDA'){
                datetime = $('#movementOutDate').val() + ' ' + $('#movementOutTime').val()
            }

            if(movement=='DESCONSOLIDADO' && hasDeconsolidated==false){
                movement = 'INGRESADO'
            }

            let movementData = {
                id: internals.dataRowSelected.id,
                movementID: movementID,
                movement: movement,
                datetime: datetime,
                client: $('#movementClient').val(),
                containerNumber: $('#movementContainerNumber').val(),
                containerType: $('#movementContainerType').val(),
                containerTexture: $('#imgTexture').val(),
                containerLarge: $('#movementContainerLarge').val(),
                cranes: $('#movementCrane').val(),
                sites: $('#movementSite').val(),
                position: {
                    row: $('#movementPositionRow').val(),
                    position: parseInt($('#movementPositionPosition').val()),
                    level: parseInt($('#movementPositionLevel').val())
                },
                driverForeigner: $('#movementDriverForeigner').prop('checked'),
                driverRUT: $('#movementDriverRUT').val(),
                driverName: $('#movementDriverName').val(),
                driverPlate: $('#movementDriverPlate').val(),
                driverGuide: $('#movementDriverGuide').val(),
                driverSeal: $('#movementDriverSeal').val(),
                services: services,
                payments: payments,
                paymentCredit: $('#chkCredit').prop('checked'),
                observation: $('#movementObservation').val()
            }

            const res = validateMovementData(movementData)
            if(res.ok){
                let saveMovement = await axios.post('/api/movementUpdate', res.ok)
                if(saveMovement.data){
                    if(saveMovement.data._id){
                        $('#movementsModal').modal('hide')

                        $('#modal_title').html(`Almacenado`)
                        $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                        loadMovementTable()
                    }else{
                        $('#modal_title').html(`Error`)
                        $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                    }
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
                $('#modal').modal('show')
            }
        })

    }else if(container.movements[movementID].movement=='TRASPASO'){

        $('#movementsModal').modal('show')
        $('#modalMov_title').html(`Modifica Traspaso`)
        $('#modalMov_body').html(createModalBody('TRASPASO'))
        $('#imgTexture').val('cai')

        $('#movementClient').val(container.clients._id)
        setClientRUT()
        setClientRates()

        $('#modalMov_footer').html(`
            <button class="btn btn-dark" data-dismiss="modal">
                <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
            </button>

            <button class="btn btn-primary" id="saveMovement">
                <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
            </button>
        `)

        let transferIn = '', transferOut = ''
        if(container.transferIn){
            transferIn = 'N° ' + container.transferIn
        }
        if(container.transferOut){
            transferOut = 'N° ' + container.transferOut
        }

        $('#divPrintIn').html(`
            <button class="btn btn-info btn-sm" id="printMovementTransferIn" onclick="printVoucher('transferIn','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER INGRESO ${transferIn}
            </button>
        `)
        
        $('#divPrintOut').html(`
            <button class="btn btn-info btn-sm" id="printMovementTransferOut" onclick="printVoucher('transferOut','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER SALIDA ${transferOut}
            </button>
        `)

        $('#movementType').prop('disabled',true)

        $('#movementStacker').change(function () {
            if($(this).prop('checked')){
                $('.classStacker').attr('disabled',true)
            }else{
                $('.classStacker').removeAttr('disabled')
            }
        })

        var element = document.getElementById('movementContainerNumber')
        var maskOptions = {
            mask: 'aaaa-000000-0',
            lazy: false //shows placeholder
        };
        var mask = IMask(element, maskOptions)

        $('#movementType').val(container.movements[movementID].movement)
        $('#movementDate').val(moment(container.movements[movementID].datetime).format('YYYY-MM-DD'))
        $('#movementTime').val(moment(container.movements[movementID].datetime).format('HH:mm'))
        
        $('#movementContainerNumber').val(container.containerNumber)
        $('#movementContainerType').val(container.containertypes)
        if(container.containerTexture==''){
            container.containerTexture = 'cai'
        }
        $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
        $('#imgTexture').val(container.containerTexture)
        $('#movementContainerLarge').val(container.containerLarge)
        
        if(container.movements[movementID].cranes){
            $('#movementCrane').val(container.movements[movementID].cranes)
        }

        if(!container.movements[movementID].cranes){
            $('#movementStacker').prop('checked',true)
            $('.classStacker').attr('disabled',true)
        }

        $('#movementDriverForeigner').prop('checked',container.movements[movementID].driverForeigner)
        $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
        $('#movementDriverName').val(container.movements[movementID].driverName)
        $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
        $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
        $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
        $('#movementDriverOutForeigner').prop('checked',container.movements[movementID].driverOutForeigner)
        $('#movementDriverOutRUT').val(container.movements[movementID].driverOutRUT)
        $('#movementDriverOutName').val(container.movements[movementID].driverOutName)
        $('#movementDriverOutPlate').val(container.movements[movementID].driverOutPlate)
        $('#movementDriverOutGuide').val(container.movements[movementID].driverOutGuide)

        /////////SERVICIOS/////////

        setServiceList('TRASPASO', container.services)
        setPayments(container.payments)
        if(container.paymentCredit){
            $('#chkCredit').prop('checked',true)
        }

        $('#movementObservation').val(container.movements[movementID].observation)


        $('#movementDriverForeigner').change(function () {
            if(!$(this).prop('checked')){
                let rut = validateRut($('#movementDriverRUT').val())
                if(rut){
                    $('#movementDriverRUT').val(rut)
                    getDriver(rut)
                }
            }else{
                getDriver($('#movementDriverRUT').val())
            }
        })

        $('#movementDriverOutForeigner').change(function () {
            if(!$(this).prop('checked')){
                let rut = validateRut($('#movementDriverOutRUT').val())
                if(rut){
                    $('#movementDriverOutRUT').val(rut)
                    getDriver(rut,true)
                }
            }else{
                getDriver($('#movementDriverOutRUT').val(),true)
            }
        })

        $('#movementDriverRUT').on('keyup', function () {
            if(!$('#movementDriverForeigner').prop('checked')){
                let rut = validateRut($(this).val())
                if(rut){
                    $(this).val(rut)
                    getDriver(rut)
                }
            }else{
                getDriver($('#movementDriverRUT').val())
            }
        })

        $('#movementDriverOutRUT').on('keyup', function () {
            if(!$('#movementDriverOutForeigner').prop('checked')){
                let rut = validateRut($(this).val())
                if(rut){
                    $(this).val(rut)
                    getDriver(rut,true)
                }
            }else{
                getDriver($('#movementDriverOutRUT').val(),true)
            }
        })

        
        $('#saveMovement').on('click', async function () {

            //Servicios
            let services = []
            let errorNet = false, errorIVA = false
            $("#tableServicesBody > tr").each(function() {
                let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                //let iva = Math.round(net * 0.19)
                let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))

                let total = parseInt(net) + parseInt(iva)
                 
                if(!$.isNumeric(net)){
                    errorNet = true
                }
                if(!$.isNumeric(iva)){
                    errorIVA = true
                }else{
                    if(iva!=0){
                        if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                            errorIVA = true
                        }
                    }
                }
 
                services.push({
                    services: $($($(this).children()[0]).children()[0]).val(),
                    paymentNet: net,
                    paymentIVA: iva,
                    paymentTotal: total
                })
            })

            
            //Pagos
            let payments = []
            let errorAmount = false
            $("#tablePaymentBody > tr").each(function() {
                let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
                
                if(!$.isNumeric(amount)){
                    errorAmount = true
                }else if(amount<=0){
                    errorAmount = true
                }

                payments.push({
                    paymentType: $($($(this).children()[0]).children()[0]).val(),
                    paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                    date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                    paymentAmount: amount
                })
            })    

            if(errorNet){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
                $('#modal').modal('show')
                return
            }
    
            if(errorIVA){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
                $('#modal').modal('show')
                return
            }

            if(errorAmount){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
                $('#modal').modal('show')
                return
            }

            let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
            if(totalBalance<0){
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
                $('#modal').modal('show')
                return
            }

            let movementData = {
                id: internals.dataRowSelected.id,
                movementID: movementID,
                movement: $('#movementType').val(),
                datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
                client: $('#movementClient').val(),
                containerNumber: $('#movementContainerNumber').val(),
                containerType: $('#movementContainerType').val(),
                containerTexture: $('#imgTexture').val(),
                containerLarge: $('#movementContainerLarge').val(),
                cranes: $('#movementCrane').val(),
                driverForeigner: $('#movementDriverForeigner').prop('checked'),
                driverRUT: $('#movementDriverRUT').val(),
                driverName: $('#movementDriverName').val(),
                driverPlate: $('#movementDriverPlate').val(),
                driverGuide: $('#movementDriverGuide').val(),
                driverSeal: $('#movementDriverSeal').val(),
                driverOutForeigner: $('#movementDriverOutForeigner').prop('checked'),
                driverOutRUT: $('#movementDriverOutRUT').val(),
                driverOutName: $('#movementDriverOutName').val(),
                driverOutPlate: $('#movementDriverOutPlate').val(),
                driverOutGuide: $('#movementDriverOutGuide').val(),
                services: services,
                payments: payments,
                paymentCredit: $('#chkCredit').prop('checked'),
                observation: $('#movementObservation').val()
            }

            const res = validateMovementData(movementData)
            if(res.ok){
                let saveMovement = await axios.post('/api/movementUpdateTransfer', res.ok)
                if(saveMovement.data){
                    if(saveMovement.data._id){
                        $('#movementsModal').modal('hide')

                        $('#modal_title').html(`Almacenado`)
                        $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                        loadMovementTable()
                    }else{
                        $('#modal_title').html(`Error`)
                        $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                    }
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
                $('#modal').modal('show')
            }
        })
        
    }
    loadingHandler('stop')
})

$('#optionCloseMovement').on('click', async function () {
    loadingHandler('start')

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show')
    $('#modalMov_title').html(`Dar Salida`)
    $('#modalMov_body').html(createModalBody('POR SALIR'))
    $('#imgTexture').val('cai')

    setServiceList('ALL', container.services)
    setPayments(container.payments)
    if(container.paymentCredit){
        $('#chkCredit').prop('checked',true)
    }

    $('#movementClient').val(container.clients._id)
    setClientRUT()
    setClientRates()

    /////CÁLCULO DE DÍAS EXTRAS SEGÚN SERVICIOS/////
    extraDays = 0
    deconExtraDays = 0 //Por si aplican días extras después de desconsolidado
    let serviceType = 'normal'
    let momentEndDate = moment()
    
    if(container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)){
        let serviceName = container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0).services.name
        let deconDate = container.movements.find(x => x.movement==='DESCONSOLIDADO').datetime
        //Días Extras posteriores a Desconsolidado
        deconExtraDays = momentEndDate.diff(moment(deconDate).format('YYYY-MM-DD'), 'days')
        let serviceDays = container.services.find(x => x.services.name===serviceName).services.days
        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name===serviceName).services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(deconExtraDays<=serviceDays){
            deconExtraDays = 0
        }else{
            deconExtraDays -= serviceDays
        }

        extraDays = moment(deconDate).diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days') //Se toma como último día el del desconsolidado
    }else{
        extraDays = momentEndDate.diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days')
    }

    if(container.services.find(x => x.services.name==='Almacenamiento IMO')){
        serviceType = 'imo'
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento IMO').services.days
        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento IMO').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else if(container.services.find(x => x.services.name==='Almacenamiento Full')){
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Full').services.days
        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento Full').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else if(container.services.find(x => x.services.name==='Almacenamiento Vacío')){
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Vacío').services.days
        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento Vacío').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else{
        if(extraDays<=5){
            extraDays = 0
        }else{
            extraDays -= 5
        }
    }

    //extraDays += deconExtraDays
    setExtraDays(extraDays,deconExtraDays,serviceType)

    
    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementType').val('POR SALIR')
    $('#movementType').prop('disabled',true)
    //$('#movementType option[value="INGRESADO"]').prop('disabled',true)
    $('#movementDate').val(moment(container.movements[0].datetime).format('YYYY-MM-DD'))
    $('#movementTime').val(moment(container.movements[0].datetime).format('HH:mm'))
    $('#movementOutDate').val(moment().format('YYYY-MM-DD'))
    $('#movementOutTime').val(moment().format('HH:mm'))

    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
    if(container.containerTexture==''){
        container.containerTexture = 'cai'
    }
    $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
    $('#imgTexture').val(container.containerTexture)
    $('#movementContainerLarge').val(container.containerLarge)
    $('#movementCrane').val(container.movements[movementID].cranes)
    $('#movementSite').val(container.movements[movementID].sites)
    setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)
    //$('#movementPositionRow').val(container.movements[movementID].position.row)
    //$('#movementPositionPosition').val(container.movements[movementID].position.position)
    //$('#movementPositionLevel').val(container.movements[movementID].position.level)
    $('#movementDriverForeigner').prop('checked',container.movements[movementID].driverForeigner)
    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
    $('.classDriverIn').prop('disabled',true)
    
    $('#movementObservation').val(container.movements[movementID].observation)

    $(".classOut").prop('disabled',true)

    $('#movementDriverOutForeigner').change(function () {
        if(!$(this).prop('checked')){
            let rut = validateRut($('#movementDriverOutRUT').val())
            if(rut){
                $('#movementDriverOutRUT').val(rut)
                getDriver(rut,true)
            }
        }else{
            getDriver($('#movementDriverOutRUT').val(),true)
        }
    })

    $('#movementDriverOutRUT').on('keyup', function () {
        if(!$('#movementDriverOutForeigner').prop('checked')){
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut,true)
            }
        }else{
            getDriver($('#movementDriverOutRUT').val(),true)
        }
    })

    let paymentType, paymentNumber, date
    
    $('#saveMovement').on('click', async function () {
        //Servicios
        let services = []
        let errorNet = false, errorIVA = false
        $("#tableServicesBody > tr").each(function() {
            let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            //let iva = Math.round(net * 0.19)
            let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            let total = parseInt(net) + parseInt(iva)
            
            if(!$.isNumeric(net)){
                errorNet = true
            }
            if(!$.isNumeric(iva)){
                errorIVA = true
            }else{
                if(iva!=0){
                    if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                        errorIVA = true
                    }
                }
            }

            services.push({
                services: $($($(this).children()[0]).children()[0]).val(),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total
            })
        })
        

        $("#tableServicesExtraBody > tr").each(function() {
            let extraDays = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace(' ', ''))
            let net = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            //let iva = Math.round(net * 0.19)
            let iva = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            let total = parseInt(net) + parseInt(iva)
            
            if(!$.isNumeric(net)){
                errorNet = true
            }
            if(!$.isNumeric(iva)){
                errorIVA = true
            }else{
                if(iva!=0){
                    if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                        errorIVA = true
                    }
                }
            }

            services.push({
                services: $($($(this).children()[1]).children()[1]).val(),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total,
                extraDays: extraDays
            })
        })

        
        //Pagos
        let payments = []
        let errorAmount = false
        $("#tablePaymentBody > tr").each(function() {
            let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            
            if(!$.isNumeric(amount)){
                errorAmount = true
            }else if(amount<=0){
                errorAmount = true
            }

            payments.push({
                paymentType: $($($(this).children()[0]).children()[0]).val(),
                paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                paymentAmount: amount
            })
        })    

        if(errorNet){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorIVA){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorAmount){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
            $('#modal').modal('show')
            return
        }

        let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
        if(totalBalance<0){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
            $('#modal').modal('show')
            return
        }

        let movementData = {
            id: internals.dataRowSelected.id,
            movement: $('#movementType').val(),
            datetime: $('#movementOutDate').val() + ' ' + $('#movementOutTime').val(),
            client: $('#movementClient').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            driverForeigner: $('#movementDriverOutForeigner').prop('checked'),
            driverRUT: $('#movementDriverOutRUT').val(),
            driverName: $('#movementDriverOutName').val(),
            driverPlate: $('#movementDriverOutPlate').val(),
            driverGuide: $('#movementDriverOutGuide').val(),
            driverSeal: $('#movementDriverOutSeal').val(),
            services: services,
            payments: payments,
            paymentCredit: $('#chkCredit').prop('checked'),
            observation: $('#movementObservation').val()
        }

        //return
//FALTA AGREGAR ALGÚN INDICAR DE ASOCIACIÓN (PRINCIPALMENTE INGRESOS-MOVIMIENTOS)
        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementUpdate', res.ok)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')
                    printVoucher('out',saveMovement.data._id, true)

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                    loadMovementTable()
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show')
        }
    })
    loadingHandler('stop')
})


$('#optionMovMovement').on('click', async function () {
    loadingHandler('start')

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show')
    $('#modalMov_title').html(`Movimiento interno Container`)
    $('#modalMov_body').html(createModalBody('TRASLADO'))
    $('#imgTexture').val('cai')
    setServiceList('ALL', container.services)
    setPayments(container.payments)
    if(container.paymentCredit){
        $('#chkCredit').prop('checked',true)
    }

    $('#movementClient').val(container.clients._id)
    setClientRUT()
    setClientRates()

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    var element = document.getElementById('movementContainerNumber')
    var maskOptions = {
        mask: 'aaaa-000000-0',
        lazy: false //shows placeholder
    };
    var mask = IMask(element, maskOptions)

    $('#movementType').val('TRASLADO')
    $('#movementDate').val(moment().format('YYYY-MM-DD'))
    $('#movementTime').val(moment().format('HH:mm'))

    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
    if(container.containerTexture==''){
        container.containerTexture = 'cai'
    }
    $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
    $('#imgTexture').val(container.containerTexture)
    $('#movementContainerLarge').val(container.containerLarge)
    $('#movementCrane').val(container.movements[movementID].cranes)

    $('#movementSiteOld').val(container.movements[movementID].sites)
    $('#movementPositionRowOld').val(container.movements[movementID].position.row)
    $('#movementPositionPositionOld').val(container.movements[movementID].position.position)
    $('#movementPositionLevelOld').val(container.movements[movementID].position.level)
    $('#movementSite').val(container.movements[movementID].sites)
    $('#movementPositionRow').val(container.movements[movementID].position.row)
    $('#movementPositionPosition').val(container.movements[movementID].position.position)
    $('#movementPositionLevel').val(container.movements[movementID].position.level)

    setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)

    $('#movementDriverForeigner').prop('checked',container.movements[movementID].driverForeigner)
    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
   
    $('#movementObservation').val(container.movements[movementID].observation)

    $(".classMove").prop('disabled',true)
    $(".classPayment").prop('disabled',true)
    
    $('#saveMovement').on('click', async function () {

        let movementData = {
            id: internals.dataRowSelected.id,
            movement: 'TRASLADO',
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            observation: $('#movementObservation').val()
        }

        
        let saveMovement = await axios.post('/api/movementUpdatePosition', movementData)
        if(saveMovement.data){
            if(saveMovement.data._id){
                $('#movementsModal').modal('hide')

                $('#modal_title').html(`Almacenado`)
                $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                loadMovementTable()
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
        }else{
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
        }
        $('#modal').modal('show')
    })
    loadingHandler('stop')
})


$('#optionDeconsolidatedMovement').on('click', async function () {
    loadingHandler('start')

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show')
    $('#modalMov_title').html(`Desconsolidado`)
    $('#modalMov_body').html(createModalBody('DESCONSOLIDADO'))
    $('#imgTexture').val('cai')
    setServiceList('DESCONSOLIDADO', container.services, container.containerLarge)
    setPayments(container.payments)
    if(container.paymentCredit){
        $('#chkCredit').prop('checked',true)
    }

    $('#movementClient').val(container.clients._id)
    setClientRUT()
    setClientRates()
    
    /////CÁLCULO DE DÍAS EXTRAS SEGÚN SERVICIOS/////
    extraDays = 0
    deconExtraDays = 0 //Por si aplican días extras después de desconsolidado
    let serviceType = 'normal'
    let momentEndDate = moment()

    if(container.movements[movementID].movement=='POR INGRESAR' || container.movements[movementID].movement=='INGRESADO' || container.movements[movementID].movement=='TRASLADO' || container.movements[movementID].movement=='DESCONSOLIDADO'){
        $('#modalMov_title').html(`Modifica Registro`)

    }else if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
        $('#modalMov_title').html(`Modifica Salida`)

        momentEndDate = moment(container.movements[movementID].datetime)
    }

    if(container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0)){
        let serviceName = container.services.find(x => x.services.name.indexOf('Desconsolidado') >= 0).services.name
        let deconDate = container.movements.find(x => x.movement==='DESCONSOLIDADO').datetime
        //Días Extras posteriores a Desconsolidado
        deconExtraDays = momentEndDate.diff(moment(deconDate).format('YYYY-MM-DD'), 'days')


        let serviceDays = container.services.find(x => x.services.name===serviceName).services.days
        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name===serviceName).services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        
        if(deconExtraDays<=serviceDays){
            deconExtraDays = 0
        }else{
            deconExtraDays -= serviceDays
        }

        extraDays = moment(deconDate).diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days') //Se toma como último día el del desconsolidado
    }else{
        extraDays = momentEndDate.diff(moment(container.movements[0].datetime).format('YYYY-MM-DD'), 'days')
    }

    if(container.services.find(x => x.services.name==='Almacenamiento IMO')){
        serviceType = 'imo'
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento IMO').services.days

        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento IMO').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////

        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else if(container.services.find(x => x.services.name==='Almacenamiento Full')){
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Full').services.days

        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento Full').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else if(container.services.find(x => x.services.name==='Almacenamiento Vacío')){
        let serviceDays = container.services.find(x => x.services.name==='Almacenamiento Vacío').services.days

        //////Verificación de días especiales de cliente////
        if(container.clients.rates){
            let serviceID = container.services.find(x => x.services.name==='Almacenamiento Vacío').services._id
            let clientService = container.clients.rates.find(x => x.services==serviceID)
            if(clientService){
                serviceDays = clientService.days
            }
        }
        /////////////////////////////////////////////////
        if(extraDays<=serviceDays){
            extraDays = 0
        }else{
            extraDays -= serviceDays
        }
    }else{
        if(extraDays<=5){
            extraDays = 0
        }else{
            extraDays -= 5
        }
    }
    setExtraDays(extraDays,deconExtraDays,serviceType)


    setPositionList()

    $("#btnMap").css('display','none')
    $("#btnHistory").css('display','none')

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)
    $('#movementType').val('DESCONSOLIDADO')
    $('#movementDate').val(moment().format('YYYY-MM-DD'))
    $('#movementTime').val(moment().format('HH:mm'))

    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
    if(container.containerTexture==''){
        container.containerTexture = 'cai'
    }
    $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
    $('#imgTexture').val(container.containerTexture)
    $('#movementContainerLarge').val(container.containerLarge)
    $('#movementCrane').val(container.movements[movementID].cranes)

    $('#movementSiteOld').val(container.movements[movementID].sites)
    $('#movementPositionRowOld').val(container.movements[movementID].position.row)
    $('#movementPositionPositionOld').val(container.movements[movementID].position.position)
    $('#movementPositionLevelOld').val(container.movements[movementID].position.level)
    $('#movementSite').val(container.movements[movementID].sites)
    setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)
    //$('#movementPositionRow').val(container.movements[movementID].position.row)
    //$('#movementPositionPosition').val(container.movements[movementID].position.position)
    //$('#movementPositionLevel').val(container.movements[movementID].position.level)
    $('#movementDriverForeigner').prop('checked',container.movements[movementID].driverForeigner)
    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)

    $('#movementObservation').val(container.movements[movementID].observation)

    updatePayment($($($('#tableServicesBody').children().last()).children()[0]).children()[0]) //Obtiene valor por defecto de desconsolidado

    $(".classMove").prop('disabled',true)
    $(".classPayment").prop('disabled',false)
    $(".classDeconsolidated").prop('disabled',false)
    
    $('#saveMovement').on('click', async function () {

        //Servicios
        let services = []
        let errorNet = false, errorIVA = false
        $("#tableServicesBody > tr").each(function() {
            let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            //let iva = Math.round(net * 0.19)
            let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            let total = parseInt(net) + parseInt(iva)
            
            if(!$.isNumeric(net)){
                errorNet = true
            }
            if(!$.isNumeric(iva)){
                errorIVA = true
            }else{
                if(iva!=0){
                    if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                        errorIVA = true
                    }
                }
            }

            services.push({
                services: $($($(this).children()[0]).children()[0]).val(),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total
            })
        })

        
        //Pagos
        let payments = []
        let errorAmount = false
        $("#tablePaymentBody > tr").each(function() {
            let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            
            if(!$.isNumeric(amount)){
                errorAmount = true
            }else if(amount<=0){
                errorAmount = true
            }

            payments.push({
                paymentType: $($($(this).children()[0]).children()[0]).val(),
                paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                paymentAmount: amount
            })
        })    

        if(errorNet){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorIVA){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorAmount){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
            $('#modal').modal('show')
            return
        }

        let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
        if(totalBalance<0){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
            $('#modal').modal('show')
            return
        }

        let movementData = {
            id: internals.dataRowSelected.id,
            movement: 'DESCONSOLIDADO',
            //datetime: $('#movementOutDate').val() + ' ' + $('#movementOutTime').val(),
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            driverForeigner: $('#movementDriverForeigner').prop('checked'),
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            services: services,
            payments: payments,
            paymentCredit: $('#chkCredit').prop('checked'),
            observation: $('#movementObservation').val()
        }
        
        //let saveMovement = await axios.post('/api/movementSaveDeconsolidated', movementData)
        let saveMovement = await axios.post('/api/movementUpdate', movementData)
        if(saveMovement.data){
            if(saveMovement.data._id){
                $('#movementsModal').modal('hide')
                printVoucher('decon',saveMovement.data._id, true)

                $('#modal_title').html(`Almacenado`)
                $('#modal_body').html(`<h5 class="alert-heading">Datos almacenados correctamente</h5>`)
                loadMovementTable()
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
        }else{
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
        }
        $('#modal').modal('show')
    })
    loadingHandler('stop')
})

$('#optionTransferMovement').on('click', function () { // TRASPASO MOVIMIENTO
    loadingHandler('start')
    $('#movementsModal').modal('show')
    $('#modalMov_title').html(`Ingreso de Traspaso`)
    $('#modalMov_body').html(createModalBody('TRASPASO'))
    $('#imgTexture').val('cai')
    setServiceList('TRASPASO')

    $('#modalMov_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementType').val('TRASPASO')
    $('#movementType').prop('disabled',true)

    var element = document.getElementById('movementContainerNumber')
    var maskOptions = {
        mask: 'aaaa-000000-0',
        lazy: false //shows placeholder
    };
    var mask = IMask(element, maskOptions)

    $('#movementDriverForeigner').change(function () {
        if(!$(this).prop('checked')){
            let rut = validateRut($('#movementDriverRUT').val())
            if(rut){
                $('#movementDriverRUT').val(rut)
                getDriver(rut)
            }
        }else{
            getDriver($('#movementDriverRUT').val())
        }
    })

    $('#movementDriverOutForeigner').change(function () {
        if(!$(this).prop('checked')){
            let rut = validateRut($('#movementDriverOutRUT').val())
            if(rut){
                $('#movementDriverOutRUT').val(rut)
                getDriver(rut,true)
            }
        }else{
            getDriver($('#movementDriverOutRUT').val(),true)
        }
    })

    $('#movementDriverRUT').on('keyup', function () {
        if(!$('#movementDriverForeigner').prop('checked')){
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut)
            }
        }else{
            getDriver($('#movementDriverRUT').val())
        }
    })

    $('#movementDriverOutRUT').on('keyup', function () {
        if(!$('#movementDriverOutForeigner').prop('checked')){
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut,true)
            }
        }else{
            getDriver($('#movementDriverOutRUT').val(),true)
        }
    })
    updatePayment($($($('#tableServicesBody').children().last()).children()[0]).children()[0]) //Obtiene valor por defecto de desconsolidado

    

    $('.classStacker').attr('disabled',true)
    $('#movementStacker').prop('checked',true)

    $('#movementStacker').change(function () {
        if($(this).prop('checked')){
            $('.classStacker').attr('disabled',true)
        }else{
            $('.classStacker').removeAttr('disabled')
        }
    })

    $('#saveMovement').on('click', async function () {

        let movement = $('#movementType').val()

        //Servicios
        let services = []
        let errorNet = false, errorIVA = false
        $("#tableServicesBody > tr").each(function() {
            let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            //let iva = Math.round(net * 0.19)
            let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            let total = parseInt(net) + parseInt(iva)
            
            if(!$.isNumeric(net)){
                errorNet = true
            }
            if(!$.isNumeric(iva)){
                errorIVA = true
            }else{
                if(iva!=0){
                    if(iva<Math.round(net * 0.19)-2 || iva>Math.round(net * 0.19)+2){
                        errorIVA = true
                    }
                }
            }

            services.push({
                services: $($($(this).children()[0]).children()[0]).val(),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total
            })
        })

        
        //Pagos
        let payments = []
        let errorAmount = false
        $("#tablePaymentBody > tr").each(function() {
            let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
            
            if(!$.isNumeric(amount)){
                errorAmount = true
            }else if(amount<=0){
                errorAmount = true
            }

            payments.push({
                paymentType: $($($(this).children()[0]).children()[0]).val(),
                paymentNumber: $($($(this).children()[1]).children()[0]).val(),
                date: $($($(this).children()[2]).children()[0]).data('daterangepicker').startDate.format('YYYY-MM-DD'),
                paymentAmount: amount
            })
        })

        if(errorNet){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor neto no válido</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorIVA){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor de IVA no válido (puede dejar en 0 si es exento)</h6>`)
            $('#modal').modal('show')
            return
        }

        if(errorAmount){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Valor(es) de Pago no válidos</h6>`)
            $('#modal').modal('show')
            return
        }

        let totalBalance = parseInt(replaceAll($("#movementPaymentBalance").val(), '.', '').replace('$', '').replace(' ', ''))
        if(totalBalance<0){
            $('#modal_title').html(`Error`)
            $('#modal_body').html(`<h6 class="alert-heading">Saldo a pago no puede ser negativo</h6>`)
            $('#modal').modal('show')
            return
        }

        let movementData = {
            movement: movement,
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            client: $('#movementClient').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            driverForeigner: $('#movementDriverForeigner').prop('checked'),
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            driverOutForeigner: $('#movementDriverOutForeigner').prop('checked'),
            driverOutRUT: $('#movementDriverOutRUT').val(),
            driverOutName: $('#movementDriverOutName').val(),
            driverOutPlate: $('#movementDriverOutPlate').val(),
            driverOutGuide: $('#movementDriverOutGuide').val(),
            services: services,
            payments: payments,
            paymentCredit: $('#chkCredit').prop('checked'),
            observation: $('#movementObservation').val()
        }

        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementSaveTransfer', res.ok)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')
                    printVoucher('transferOut',saveMovement.data._id, true)
                    printVoucher('transferIn',saveMovement.data._id)

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Traspaso almacenado correctamente</h5>`)
                    loadMovementTable()
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show')
        }

    })
    loadingHandler('stop')
})

function validateMovementData(movementData) {
    let errorMessage = ''

    //return new Promise(resolve => {

        if(movementData.client==0){
            errorMessage += '<br> Cliente'
            $('#movementClient').css('border', '1px solid #E74C3C')
        }else{
            $('#movementClient').css('border', '1px solid #CED4DA')
        }
        if(movementData.containerNumber.includes('_')){
            errorMessage += '<br>Número Container'
            $('#movementContainerNumber').css('border', '1px solid #E74C3C')
        }else{
            $('#movementContainerNumber').css('border', '1px solid #CED4DA')
        }
        /*if(movementData.cranes==0){
            errorMessage += '<br>Grúa'
            $('#movementCrane').css('border', '1px solid #E74C3C')
        }else{
            $('#movementCrane').css('border', '1px solid #CED4DA')
        }
        if(movementData.sites==0){
            errorMessage += '<br>Sitio'
            $('#movementSite').css('border', '1px solid #E74C3C')
        }else{
            $('#movementSite').css('border', '1px solid #CED4DA')
        }*/

        if(movementData.movement=='POR SALIR' || movementData.movement=='SALIDA'){
           
            if(movementData.driverForeigner){
                if(movementData.driverRUT==''){
                    errorMessage += '<br>RUT Chofer'
                    $('#movementDriverOutRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverOutRUT').css('border', '1px solid #CED4DA')
                }
            }else{
                if(!validateRut(movementData.driverRUT)){
                    errorMessage += '<br>RUT Chofer Válido'

                    $('#movementDriverOutRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverOutRUT').css('border', '1px solid #CED4DA')
                }
            }

            if(movementData.driverName==''){
                errorMessage += '<br>Nombre Chofer'
                $('#movementDriverOutName').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverOutName').css('border', '1px solid #CED4DA')
            }
            if(movementData.driverPlate==''){
                errorMessage += '<br>Patente Camión'
                $('#movementDriverOutPlate').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverOutPlate').css('border', '1px solid #CED4DA')
            }

        }else if(movementData.movement=='TRASPASO'){

            if(movementData.driverForeigner){
                if(movementData.driverRUT==''){
                    errorMessage += '<br>RUT Chofer Entrada'
                    $('#movementDriverRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverRUT').css('border', '1px solid #CED4DA')
                }
            }else{
                if(!validateRut(movementData.driverRUT)){
                    errorMessage += '<br>RUT Chofer Entrada Válido'

                    $('#movementDriverRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverRUT').css('border', '1px solid #CED4DA')
                }
            }

            if(movementData.driverName==''){
                errorMessage += '<br>Nombre Chofer Entrada'
                $('#movementDriverName').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverName').css('border', '1px solid #CED4DA')
            }
            if(movementData.driverPlate==''){
                errorMessage += '<br>Patente Camión Entrada'
                $('#movementDriverPlate').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverPlate').css('border', '1px solid #CED4DA')
            }
           

            if(movementData.driverOutForeigner){
                if(movementData.driverOutRUT==''){
                    errorMessage += '<br>RUT Chofer Salida'
                    $('#movementDriverOutRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverOutRUT').css('border', '1px solid #CED4DA')
                }
            }else{
                if(!validateRut(movementData.driverOutRUT)){
                    errorMessage += '<br>RUT Chofer Salida Válido'

                    $('#movementDriverOutRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverOutRUT').css('border', '1px solid #CED4DA')
                }
            }

            if(movementData.driverOutName==''){
                errorMessage += '<br>Nombre Chofer Salida'
                $('#movementDriverOutName').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverOutName').css('border', '1px solid #CED4DA')
            }
            if(movementData.driverOutPlate==''){
                errorMessage += '<br>Patente Camión Salida'
                $('#movementDriverOutPlate').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverOutPlate').css('border', '1px solid #CED4DA')
            }

        }else{

            if(movementData.driverForeigner){
                if(movementData.driverRUT==''){
                    errorMessage += '<br>RUT Chofer'
                    $('#movementDriverRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverRUT').css('border', '1px solid #CED4DA')
                }
            }else{
                if(!validateRut(movementData.driverRUT)){
                    errorMessage += '<br>RUT Chofer Válido'

                    $('#movementDriverRUT').css('border', '1px solid #E74C3C')
                }else{
                    $('#movementDriverRUT').css('border', '1px solid #CED4DA')
                }
            }

            if(movementData.driverName==''){
                errorMessage += '<br>Nombre Chofer'
                $('#movementDriverName').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverName').css('border', '1px solid #CED4DA')
            }
            if(movementData.driverPlate==''){
                errorMessage += '<br>Patente Camión'
                $('#movementDriverPlate').css('border', '1px solid #E74C3C')
            }else{
                $('#movementDriverPlate').css('border', '1px solid #CED4DA')
            }

        }
        
        if(movementData.services.find(x => x.services === '0')){
            errorMessage += '<br>Servicio'
            $('#movementService').css('border', '1px solid #E74C3C')
        }else{
            $('#movementService').css('border', '1px solid #CED4DA')
        }

        /*if(movementData.services.find(x => x.paymentType === '0')){
            errorMessage += '<br>Medio de Pago'
            $('#movementPaymentType').css('border', '1px solid #E74C3C')
        }else{
            $('#movementPaymentType').css('border', '1px solid #CED4DA')
        }*/

        if (errorMessage.length===0) {
            return { ok: movementData }
            //resolve({ ok: movementData })
        } else {
            $(document).on('hidden.bs.modal', '.modal', function () { //Soluciona problema de scroll
                $('.modal:visible').length && $(document.body).addClass('modal-open')
           })

            $('#modal').modal('show')
            $('#modal_title').html(`Error al almacenar Ingreso`)
            $('#modal_body').html(`<h5 class="alert-heading">Falta ingresar los siguientes datos:</h5>
                                        <p class="mb-0">${errorMessage}</p>`)

            //resolve({ err: movementData })
            return { err: movementData }
        }
    //})
}

function createModalBody(type){

    /*<div class="col-md-5">
        ${(type=='POR SALIR' || type=='SALIDA') ? 'Fecha Ingreso':'Fecha'}
        <input id="movementDate" type="date" class="form-control border-input" value="${moment().format('YYYY-MM-DD')}" ${(type=='POR SALIR' || type=='SALIDA') ? 'disabled':''}>
    </div>
    <div class="col-md-3">
        ${(type=='POR SALIR' || type=='SALIDA') ? 'Hora Ingreso':'Hora'}
        <input id="movementTime" type="text" class="form-control border-input" value="${moment().format('HH:mm')}"  ${(type=='POR SALIR' || type=='SALIDA') ? 'disabled':''}>
    </div>*/

    let body = `
    <div class="row">

        <div class="col-md-2" style="display: none;">
            Movimiento
            <select id="movementType" class="custom-select custom-select-sm classMove">
                <option value="POR INGRESAR">POR INGRESAR</option>
                <option value="INGRESADO">INGRESADO</option>
                <option value="TRASLADO">TRASLADO</option>
                <option value="POR SALIR">POR SALIR</option>
                <option value="SALIDA">SALIDA</option>
                <option value="TRASPASO">TRASPASO</option>
                <option value="DESCONSOLIDADO">DESCONSOLIDADO</option>
            </select>
        </div>


        <div class="col-md-4">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>DATOS GENERALES</h6>
                        </div>`
                /*body += `<div class="col-md-6">
                            <button class="btn btn-primary btn-sm" onclick="testing()">Rellenar</button>
                        </div>`*/

                body += `<div class="col-md-7">
                            ${(type=='POR SALIR' || type=='SALIDA') ? 'Fecha Ingreso':'Fecha'}
                            <input id="movementDate" type="date" class="form-control form-control-sm border-input" value="${moment().format('YYYY-MM-DD')}" disabled>
                        </div>
                        <div class="col-md-5">
                            ${(type=='POR SALIR' || type=='SALIDA') ? 'Hora Ingreso':'Hora'}
                            <input id="movementTime" type="text" class="form-control form-control-sm border-input" value="${moment().format('HH:mm')}" disabled>
                        </div>
                        <div class="col-md-10">
                            Cliente&nbsp;&nbsp;&nbsp;<span id="movementClientRUT"></span>
                            <select id="movementClient" class="custom-select custom-select-sm classOut classMove" onchange="setClientRates()">
                                <option value="0">SELECCIONE...</option>
                                ${
                                    clients.reduce((acc,el)=>{
                                        acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                        return acc
                                    },'')
                                }
                            </select>
                        </div>
                        <div class="col-md-2">
                            <br/>
                            <button class="btn btn-sm btn-dark classOut classMove" onclick="selectClient('modal')" title="Buscar Cliente"><i class="fas fa-search"></i></button>
                        </div>
                        ${(type=='POR SALIR' || type=='SALIDA') ?
                            `<div class="col-md-7">
                                Fecha Salida
                                <input id="movementOutDate" type="date" class="form-control form-control-sm border-input" value="${moment().format('YYYY-MM-DD')}" disabled>
                            </div>
                            <div class="col-md-5">
                                Hora Salida
                                <input id="movementOutTime" type="text" class="form-control form-control-sm border-input" value="${moment().format('HH:mm')}" disabled>
                            </div>` : ''}
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-8">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">`
                    if(type=='TRASPASO' || type=='POR SALIR' || type=='SALIDA'){
                        body += `<div class="col-md-12">
                                    <h6>DATOS DE CONDUCTORES</h6>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-primary">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-12">
                                                    Conductor Entrada
                                                </div>
                                                <div class="col-md-5" style="text-align: center">
                                                    RUT - Marcar si es extranjero: <input class="classMove" type="checkbox" value="" id="movementDriverForeigner">
                                                    <input id="movementDriverRUT" type="text" placeholder="11.111.111-0" class="form-control form-control-sm border-input classMove classDriverIn">
                                                </div>
                                                <div class="col-md-7" style="text-align: center">
                                                    Nombre
                                                    <input id="movementDriverName" type="text" class="form-control form-control-sm border-input classMove classDriverIn">
                                                </div>
                                                <div class="col-md-4" style="text-align: center">
                                                    Placa Patente
                                                    <input id="movementDriverPlate" type="text" class="form-control form-control-sm border-input classMove classDriverIn" onkeyup="toUpper(this)">
                                                </div>
                                                <div class="col-md-4" style="text-align: center">
                                                    Guía Despacho
                                                    <input id="movementDriverGuide" type="text" class="form-control form-control-sm border-input classMove classDriverIn">
                                                </div>
                                                <div class="col-md-4">
                                                    Sello Container
                                                    <input id="movementDriverSeal" type="text" class="form-control form-control-sm border-input classMove classDriverIn">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-primary">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-12">
                                                    Conductor Salida
                                                </div>
                                                <div class="col-md-5" style="text-align: center">
                                                    RUT - Marcar si es extranjero: <input class="classMove" type="checkbox" value="" id="movementDriverOutForeigner">
                                                    <input id="movementDriverOutRUT" type="text" placeholder="11.111.111-0" class="form-control form-control-sm border-input classMove">
                                                </div>
                                                <div class="col-md-7" style="text-align: center">
                                                    Nombre
                                                    <input id="movementDriverOutName" type="text" class="form-control form-control-sm border-input classMove">
                                                </div>
                                                <div class="col-md-4" style="text-align: center">
                                                    Placa Patente
                                                    <input id="movementDriverOutPlate" type="text" class="form-control form-control-sm border-input classMove" onkeyup="toUpper(this)">
                                                </div>
                                                <div class="col-md-4" style="text-align: center">
                                                    Guía Despacho
                                                    <input id="movementDriverOutGuide" type="text" class="form-control form-control-sm border-input classMove">
                                                </div>`
                                                if(type=='POR SALIR' || type=='SALIDA'){
                                                    body += `
                                                            <div class="col-md-4">
                                                                Sello Container
                                                                <input id="movementDriverOutSeal" type="text" class="form-control form-control-sm border-input classMove classDriverIn">
                                                            </div>`
                                                }
                                    body += `</div>
                                        </div>
                                    </div>
                                </div>`
                        
                    }else{
                        body += `<div class="col-md-12">
                                    <h6>DATOS DE CONDUCTOR</h6>
                                </div>
                                <div class="col-md-5">
                                    RUT - Marcar si es extranjero: <input class="classMove" type="checkbox" value="" id="movementDriverForeigner">
                                    <input id="movementDriverRUT" type="text" placeholder="11.111.111-0" class="form-control form-control-sm border-input classMove classDeconsolidated">
                                </div>
                                <div class="col-md-7">
                                    Nombre
                                    <input id="movementDriverName" type="text" class="form-control form-control-sm border-input classMove classDeconsolidated">
                                </div>
                                <div class="col-md-4">
                                    Placa Patente
                                    <input id="movementDriverPlate" type="text" class="form-control form-control-sm border-input classMove classDeconsolidated" onkeyup="toUpper(this)">
                                </div>
                                <div class="col-md-4">
                                    Guía Despacho
                                    <input id="movementDriverGuide" type="text" class="form-control form-control-sm border-input classMove classDeconsolidated">
                                </div>
                                <div class="col-md-4">
                                    Sello Container
                                    <input id="movementDriverSeal" type="text" class="form-control form-control-sm border-input classMove classDeconsolidated">
                                </div>`
                    }

        body += `   </div>
                </div>
            </div>
        </div>


        <div class="col-md-12">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-12">
                            <h6>DATOS CONTAINER</h6>
                        </div>

                        <div class="col-md-9">
                            <div class="row">
                                <div class="col-md-7">
                                    Número Container
                                    <input id="movementContainerNumber" type="text" placeholder="Ej: 126170-0" class="form-control form-control-sm border-input classOut classMove" onkeyup="toUpper(this)">
                                </div>
                                <div class="col-md-2">
                                    Largo
                                    <select id="movementContainerLarge" class="custom-select custom-select-sm classOut classMove">
                                        <option value="20">20</option>
                                        <option value="40">40</option>
                                        <option value="40H">40H</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    Tipo
                                    <select id="movementContainerType" class="custom-select custom-select-sm classOut classMove" onchange="changeTexture('type')">
                                        <option value="61d70f00f5ffd3251426d0a5" data-texture="cai">GENÉRICO</option>
                                        ${
                                            containerTypes.reduce((acc,el)=>{
                                                acc += '<option value="'+el._id+'" data-texture="'+el.texture+'">'+el.name+'</option>'
                                                return acc
                                            },'')
                                        }
                                    </select>
                                </div>`
            if(type!='TRASPASO'){

                body += `<div class="form-check col-md-2" style="text-align: center;">
                            <br/>
                            <input class="form-check-input classMove" type="checkbox" value="" id="movementStacker">
                            <label class="form-check-label" for="flexCheckDefault">
                                Ingresa Stacker
                            </label>
                        </div>
                        <div class="col-md-2">
                            Grúa
                            <select id="movementCrane" class="custom-select custom-select-sm classStacker">
                                <option value="0">SELECCIONE...</option>
                                ${                      
                                    cranes.reduce((acc,el)=>{
                                        acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                        return acc
                                    },'')
                                }
                            </select>
                        </div>`
                if(type=='TRASLADO' || type=='DESCONSOLIDADO'){
                    body += `<div class="col-md-2" style="text-align: center">
                                Paño
                                <select id="movementSiteOld" class="custom-select custom-select-sm classMove">
                                    <option value="0">SELECCIONE...</option>
                                    ${                      
                                        sites.reduce((acc,el)=>{
                                            acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                            return acc
                                        },'')
                                    }
                                </select>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="col-md-2" style="text-align: center">
                                Fila
                                <select id="movementPositionRowOld" class="custom-select custom-select-sm classMove">
                                    <option value="0">SEL</option>
                                </select>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="col-md-2" style="text-align: center">
                                Posición
                                <select id="movementPositionPositionOld" class="custom-select custom-select-sm classMove">
                                    <option value="0">SEL</option>   
                                </select>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="col-md-2" style="text-align: center">
                                Altura
                                <select id="movementPositionLevelOld" class="custom-select custom-select-sm classMove">
                                    <option value="0">SEL</option>  
                                </select>
                                <i class="fas fa-chevron-down"></i>
                            </div>

                            <div class="col-md-4">
                            </div>
                            <div class="col-md-2">
                                <select id="movementSite" class="custom-select custom-select-sm classOut">
                                    <option value="0">SELECCIONE...</option>
                                    ${                      
                                        sites.reduce((acc,el)=>{
                                            acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                            return acc
                                        },'')
                                    }
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select id="movementPositionRow" class="custom-select custom-select-sm classOut">
                                    <option value="0">SEL</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select id="movementPositionPosition" class="custom-select custom-select-sm classOut">
                                    <option value="0">SEL</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select id="movementPositionLevel" class="custom-select custom-select-sm classOut">
                                    <option value="0">SEL</option>
                                </select>
                            </div>`

                }else{
                    body += `<div class="col-md-2">
                                Paño
                                <select id="movementSite" class="custom-select custom-select-sm classOut classStacker">
                                    <option value="0">SELECCIONE...</option>
                                    ${                      
                                        sites.reduce((acc,el)=>{
                                            acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                            return acc
                                        },'')
                                    }
                                </select>
                            </div>
                            <div class="col-md-2">
                                Fila
                                <select id="movementPositionRow" class="custom-select custom-select-sm classOut classStacker">
                                    <option value="0">SEL</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                Posición
                                <select id="movementPositionPosition" class="custom-select custom-select-sm classOut classStacker">
                                    <option value="0">SEL</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                Altura
                                <select id="movementPositionLevel" class="custom-select custom-select-sm classOut classStacker">
                                    <option value="0">SEL</option>
                                </select>
                            </div>`
                
                }
            
                
            }else{
                body += `<div class="form-check col-md-2" style="text-align: center;">
                            <br/>
                            <input class="form-check-input classMove" type="checkbox" value="" id="movementStacker">
                            <label class="form-check-label" for="flexCheckDefault">
                                Ingresa Stacker
                            </label>
                        </div>
                        <div class="col-md-3">
                            Grúa
                            <select id="movementCrane" class="custom-select custom-select-sm classStacker">
                                <option value="0">SELECCIONE...</option>
                                ${                      
                                    cranes.reduce((acc,el)=>{
                                        acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                        return acc
                                    },'')
                                }
                            </select>
                        </div>
                        <div class="form-check col-md-7">
                        </div>`
            }

                body += `</div>
                    </div>`

                body += `<div class="col-md-3">
                        Color
                        <br/>
                        <button class="btn btn-sm btn-dark classOut classMove" data-toggle="collapse" data-target="#tableTextures">Cambiar&nbsp;<i class="fas fa-caret-down"></i></button>
                        <img id="imgTexture" src="/public/img/textures/cai.jpg" style="width: 50px; border: 3px solid #AAB3B4;" value="cai">

                        ${ getTextureTable(containerTypes)}
                    
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-12">
        </div>


        <div class="col-md-6">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h6>DATOS DE SERVICIOS</h6>
                        </div>
                        <div class="col-md-3">
                            ${ (type!='TRASPASO' && type!='POR SALIR' && type!='SALIDA' /*&& type!='TRASLADO'*/ && type!='DESCONSOLIDADO') ? '<button id="btnServicePortage" class="btn btn-sm btn-info" onclick="addService(this,\'PORTEO\')"><i class="fas fa-plus"></i> Porteo <i class="fas fa-trailer"></i></button>' : '' }
                        </div>
                        <div class="col-md-3">
                            ${ (type!='TRASPASO' && type!='POR SALIR' && type!='SALIDA' /*&& type!='TRASLADO'*/ && type!='DESCONSOLIDADO') ? '<button id="btnServiceTransport" class="btn btn-sm btn-info" onclick="addService(this,\'TRANSPORTE\')"><i class="fas fa-plus"></i> Transporte <i class="fas fa-truck-moving"></i></button>' : '' }
                        </div>
                        <div class="col-md-1">
                        </div>
                        <div class="col-md-1">
                            <button id="btnUpdateRates" class="btn btn-sm btn-danger" title="Las tarifas del cliente han sido modificadas" onclick="showUpdateRates()" style="display: none;"><i class="fas fa-exclamation"></i></button>
                        </div>

                        <div class="form-check col-md-12 table-responsive">
                            <table id="tableServices" class="display nowrap table table-condensed" cellspacing="0" width="100%">
                                <thead>
                                    <tr>
                                        <th style="width: 30%">Servicio</th>
                                        <th>Neto</th>
                                        <th>IVA</th>
                                        <th>TOTAL</th>
                                        <th>Quitar</th>
                                    </tr>
                                </thead>
                                <tbody id="tableServicesBody">
                                    
                                </tbody>
                            </table>
                            
                            <table id="tableServicesExtra" class="display nowrap table table-condensed" cellspacing="0" width="100%" style="display: none;">
                                <thead>
                                    <tr>
                                        <th>Ítem</th>
                                        <th>Días Extra</th>
                                        <th>Neto</th>
                                        <th>IVA</th>
                                        <th>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody id="tableServicesExtraBody">
                                    
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Total Neto
                        </div>
                        <div class="col-md-3">
                            <input id="movementTotalNet" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Total IVA
                        </div>
                        <div class="col-md-3">
                            <input id="movementTotalIVA" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Total Final
                        </div>
                        <div class="col-md-3">
                            <input id="movementTotalTotal" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h6>DATOS DE PAGO</h6>
                        </div>
                        <div class="col-md-4">
                            <button id="btnAddPayment" class="btn btn-sm btn-info classPayment" onclick="addPayment()"><i class="fas fa-plus"></i> Agregar Pago <i class="fas fa-hand-holding-usd"></i></button>
                        </div>
                        <div class="col-md-4">
                            <input type="checkbox" id="chkCredit">&nbsp;Pago a Crédito
                        </div>

                        <div class="form-check col-md-12 table-responsive">
                            <table id="tablePayment" class="display nowrap table table-condensed" cellspacing="0" width="100%">
                                <thead>
                                    <tr>
                                        <th>Forma de Pago</th>
                                        <th>N° Voucher</th>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Quitar</th>
                                    </tr>
                                </thead>
                                <tbody id="tablePaymentBody">
                                    
                                </tbody>
                            </table>
                            
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Neto
                        </div>
                        <div class="col-md-3">
                            <input id="movementPaymentNet" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            IVA
                        </div>
                        <div class="col-md-3">
                            <input id="movementPaymentIVA" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Total
                        </div>
                        <div class="col-md-3">
                            <input id="movementPaymentTotal" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                        <div class="col-md-6">
                        </div>
                        <div class="col-md-3" style="text-align: right">
                            Saldo por pagar
                        </div>
                        <div class="col-md-3">
                            <input id="movementPaymentBalance" type="text" value="$ 0" style="text-align: right; font-weight: bold" class="form-control form-control-sm border-input classMove" disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
        <div class="form-group col-md-12">
            <h4 class="card-title">&nbsp;Observaciones</h4>
            <textarea id="movementObservation" placeholder="EJEMPLO: CONTENEDOR DAÑADO" class="form-control form-control-sm" rows="5"></textarea>
        </div>

    </div>
`
    return body
}

function setServiceList(type,array,containerLarge){

    let firstSelect = ''
    if(type!='TRASPASO'){
        firstSelect = '<option value="0" data-net="0">SELECCIONAR</option>'
    }

    $("#tableServicesBody").append(`
        <tr>
            <td>
                <select class="custom-select custom-select-sm classMove" onchange="updatePayment(this)">
                    ${firstSelect}
                    ${
                        services.reduce((acc,el)=>{
                            if(type=='ALL' || type=='DESCONSOLIDADO'){
                                if(el.name!='Traspaso' && el.name.indexOf('Desconsolidado') == -1 && el.name.indexOf("Almacenamiento") >= 0){
                                    acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                }
                            }else if(type=='TRASPASO'){
                                if(el.name=='Traspaso'){
                                    acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                }
                            }
                            return acc
                        },'')
                    }
                </select>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this)" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" disabled>
            </td>
            <td>
            </td>
        </tr>
    `)

    if(array){
        if(array.length>1){
            for(let i=1; i<array.length;i++){
                let trClass = '', btnDelete = ''
                if(array[i].services.name=='Porteo'){
                    $("#btnServicePortage").prop('disabled', true)
                    trClass = 'table-primarySoft'
                    btnDelete = `<button class="btn btn-sm btn-danger classOut classMove" onclick="deleteService(this, 'btnServicePortage')" title="Quitar Servicio"><i class="fas fa-times"></i></button>`
                }else if(array[i].services.name=='Transporte'){
                    $("#btnServiceTransport").prop('disabled', true)
                    trClass = 'table-infoSoft'
                    btnDelete = `<button class="btn btn-sm btn-danger classOut classMove" onclick="deleteService(this, 'btnServiceTransport')" title="Quitar Servicio"><i class="fas fa-times"></i></button>`
                }else if(array[i].services.name.indexOf('Desconsolidado') >= 0){
                    btnDelete = `<button class="btn btn-sm btn-danger classOut classMove" onclick="deleteService(this, 'btnServiceDeconsolidated')" title="Quitar Servicio"><i class="fas fa-times"></i></button>`
                }
                
                let listService = ''

                if(array[i].services.name!='Día(s) Extra' && array[i].services.name.indexOf('Desconsolidado') ==-1 ){
                    services.reduce((acc,el)=>{
                        if(el._id==array[i].services._id){
                            listService += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                        }
                    },'')
                }else if(array[i].services.name.indexOf('Desconsolidado') >= 0){
                    services.reduce((acc,el)=>{
                        if(el.name.indexOf('Desconsolidado') >= 0){
                            
                            if(el._id==array[i].services._id){
                                listService += '<option value="'+el._id+'" data-net="'+el.net+'" selected>'+el.name+'</option>'
                            }else{
                                listService += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                            }
                        }
                    },'')
                }
                if(array[i].services.name!='Día(s) Extra'){
                    $("#tableServicesBody").append(`
                        <tr class="${trClass}">
                            <td>
                                <select class="custom-select custom-select-sm classMove" onchange="updatePayment(this)">
                                    ${listService}
                                </select>
                            </td>
                            <td>
                                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this)" disabled>
                            </td>
                            <td>
                                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
                            </td>
                            <td>
                                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" disabled>
                            </td>
                            <td>
                                ${btnDelete}
                            </td>
                        </tr>
                    `)
                }
            }
        }
    }

    if(type=='DESCONSOLIDADO'){
        $("#tableServicesBody").append(`
            <tr>
                <td>
                    <select class="custom-select custom-select-sm classMove classDeconsolidated" onchange="updatePayment(this)">
                        ${
                            services.reduce((acc,el)=>{
                                if(el.name.indexOf('Desconsolidado') >= 0){
                                    if(el.name.indexOf(containerLarge) >= 0){
                                        acc += '<option value="'+el._id+'" data-net="'+el.net+'" selected>'+el.name+'</option>'
                                    }/*else{
                                        acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                    }*/
                                }
                                return acc
                            },'')
                        }
                    </select>
                </td>
                <td>
                    <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this)" disabled>
                </td>
                <td>
                    <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
                </td>
                <td>
                    <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" disabled>
                </td>
                <td>
                </td>
            </tr>
        `)
    }

    
    $('.classServiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    if(array){
        for(let j=0; j<array.length;j++){
            let row = $('#tableServicesBody').children()[j]
            $($($(row).children()[0]).children()[0]).val(array[j].services._id)
            $($($(row).children()[1]).children()[0]).val(`$ ${dot_separators(array[j].paymentNet)}`)
            $($($(row).children()[2]).children()[0]).val(`$ ${dot_separators(array[j].paymentIVA)}`)
            $($($(row).children()[3]).children()[0]).val(`$ ${dot_separators(array[j].paymentTotal)}`)

        }
    }

    calculateTotal()
}

function setExtraDays(quantity,quantityDecon,serviceType){

    let net = 0, iva = 0, total = 0

    let extraType = 'Día(s) Extra', name = 'Almacenamiento'
    if(serviceType=='imo'){
        extraType = 'Día(s) Extra IMO'
        name = 'Almacenamiento IMO'
    }

    $("#tableServicesExtra").css('display','table')
    
    let extraRow = `<tr class="table-dangerSoft">
            <td>
                Almacenamiento
            </td>
            <td style="text-align: center;">
                <input type="text" style="text-align: center" value="${quantity}" class="form-control border-input classMove classPayment" disabled>
            
                <select class="custom-select classMove" onchange="updatePayment(this)" style="display: none;">
                    ${
                        services.reduce((acc,el)=>{
                            //console.log(el.name, extraType)
                            if(el.name==extraType){
                                net = el.net
                                acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                            }
                            return acc
                        },'')
                    }
                </select>
            </td>`

    net = net*quantity
    iva = Math.round(net * 0.19)
    total = parseInt(net) + parseInt(iva)
    
    extraRow += `<td>
                <input type="text" style="text-align: right" value="$ ${dot_separators(net)}" class="form-control border-input classMove" onkeyup="updatePayment(this)" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ ${dot_separators(iva)}" class="form-control border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ ${dot_separators(total)}" class="form-control border-input classMove" disabled>
            </td>

        </tr>`

    if(quantityDecon>0){
        extraRow += `<tr class="table-dangerSoft">
                <td>
                    Post Desconsolidado
                </td>
                <td style="text-align: center;">
                    <input type="text" style="text-align: center" value="${quantityDecon}" class="form-control border-input classMove classPayment" disabled>
                
                    <select class="custom-select classMove" onchange="updatePayment(this)" style="display: none;">
                        ${
                            services.reduce((acc,el)=>{
                                if(el.name==extraType){
                                    net = el.net
                                    acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                }
                                return acc
                            },'')
                        }
                    </select>
                </td>`

        net = net*quantityDecon
        iva = Math.round(net * 0.19)
        total = parseInt(net) + parseInt(iva)
        
        extraRow += `<td>
                    <input type="text" style="text-align: right" value="$ ${dot_separators(net)}" class="form-control border-input classMove" onkeyup="updatePayment(this)" disabled>
                </td>
                <td>
                    <input type="text" style="text-align: right" value="$ ${dot_separators(iva)}" class="form-control border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
                </td>
                <td>
                    <input type="text" style="text-align: right" value="$ ${dot_separators(total)}" class="form-control border-input classMove" disabled>
                </td>

            </tr>`
    }

    $("#tableServicesExtraBody").html(extraRow)

    $('#chkExtra').change(function () {
        if($(this).prop('checked')){
            $('.classExtra').css('display','table-cell')
        }else{
            $('.classExtra').css('display','none')
        }
    })

    $('.classServiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })

    calculateTotal()

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

async function updatePayment(input,special) {

    if($($(input).children()[0]).html()){//Si se selecciona un servicio

        let extraDays = 0
        let deconExtraDays = 0
        let serviceType = 'normal'

        if($("#tableServicesExtraBody > tr").length>0){
            $("#tableServicesExtraBody > tr").each(function() {
                if($($(this).children()[0]).text().trim()=='Almacenamiento' || $($(this).children()[0]).text().trim()=='Almacenamiento IMO'){
                    extraDays = $($($(this).children()[1]).children()[0]).val()
                }else if($($(this).children()[0]).text().trim()=='Post Desconsolidado'){
                    deconExtraDays = $($($(this).children()[1]).children()[0]).val()
                }
            })    
        }

        if($(input).find(":selected").text()=='Almacenamiento IMO' || $(input).find(":selected").text()=='Día(s) Extra IMO'){
            serviceType = 'imo'
        }

        setExtraDays(extraDays,deconExtraDays,serviceType)

        //setClientRates()
    }

    if(!special){
        if($($(input).children()[0]).html()){//Si se selecciona un servicio
            $($($(input).parent().parent().children()[1]).children()[0]).val($(input).find(":selected").attr('data-net'))
        }
    
        new Cleave($($(input).parent().parent().children()[1]).children()[0], {
            prefix: '$ ',
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            numeralDecimalScale: 0,
            numeralPositiveOnly: true,
            numeralDecimalMark: ",",
            delimiter: "."
        })
        let net = replaceAll($($($(input).parent().parent().children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', '')
        let iva = Math.round(net * 0.19)
        let total = parseInt(net) + parseInt(iva)

        $($($(input).parent().parent().children()[2]).children()[0]).val(`$ ${dot_separators(iva)}`)
        $($($(input).parent().parent().children()[3]).children()[0]).val(`$ ${dot_separators(total)}`)

    }else if(special=='extra'){
        if($($(input).children()[0]).html()){//Si se selecciona un servicio
            $($($(input).parent().parent().children()[2]).children()[0]).val('$'+dot_separators($($(input).children()[0]).attr('data-net')))
        }
    
        let net = replaceAll($($($(input).parent().parent().children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', '')
        let iva = Math.round(net * 0.19)
        let total = parseInt(net) + parseInt(iva)

        $($($(input).parent().parent().children()[3]).children()[0]).val(`$ ${dot_separators(iva)}`)
        $($($(input).parent().parent().children()[4]).children()[0]).val(`$ ${dot_separators(total)}`)

    }else if(special=='iva'){
        if($($(input).children()[0]).html()){//Si se selecciona un servicio
            $($($(input).parent().parent().children()[1]).children()[0]).val($(input).find(":selected").attr('data-net'))
        }
    
        new Cleave($($(input).parent().parent().children()[1]).children()[0], {
            prefix: '$ ',
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            numeralDecimalScale: 0,
            numeralPositiveOnly: true,
            numeralDecimalMark: ",",
            delimiter: "."
        })
        let net = replaceAll($($($(input).parent().parent().children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', '')
        let iva = replaceAll($($($(input).parent().parent().children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', '')
        let total = parseInt(net) + parseInt(iva)

        $($($(input).parent().parent().children()[2]).children()[0]).val(`$ ${dot_separators(iva)}`)
        $($($(input).parent().parent().children()[3]).children()[0]).val(`$ ${dot_separators(total)}`)
    }

    calculateTotal()
}

async function updatePaymentPay(input) {

    new Cleave($(input), {
        prefix: '$ ',
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        numeralDecimalScale: 0,
        numeralPositiveOnly: true,
        numeralDecimalMark: ",",
        delimiter: "."
    })

    calculateTotal()
}

async function calculateTotal(){
    let totalNet = 0, totalIVA = 0, totalTotal = 0
    $("#tableServicesBody > tr").each(function() {
        let net = parseInt(replaceAll($($($(this).children()[1]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        let iva = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        let total = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        
        if(!$.isNumeric(net)){
            net = 0
            iva = 0
            total = 0
        }

        totalNet += net
        totalIVA += iva
        totalTotal += total
    })

    $("#tableServicesExtraBody > tr").each(function() {
        let net = parseInt(replaceAll($($($(this).children()[2]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        let iva = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        let total = parseInt(replaceAll($($($(this).children()[4]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        
        if(!$.isNumeric(net)){
            net = 0
            iva = 0
            total = 0
        }

        totalNet += net
        totalIVA += iva
        totalTotal += total
       
    })

    $("#movementTotalNet").val(`$ ${dot_separators(totalNet)}`)
    $("#movementTotalIVA").val(`$ ${dot_separators(totalIVA)}`)
    $("#movementTotalTotal").val(`$ ${dot_separators(totalTotal)}`)


    let totalPayment = 0
    $("#tablePaymentBody > tr").each(function() {
        let amount = parseInt(replaceAll($($($(this).children()[3]).children()[0]).val(), '.', '').replace('$', '').replace(' ', ''))
        
        if(!$.isNumeric(amount)){
            amount = 0
        }
        totalPayment += amount
    })

    let netPayment = 0, ivaPayment = 0

    if(totalPayment>0){
        netPayment = Math.round(totalPayment / 1.19)
        ivaPayment = totalPayment - netPayment
    }

    $("#movementPaymentNet").val(`$ ${dot_separators(netPayment)}`)
    $("#movementPaymentIVA").val(`$ ${dot_separators(ivaPayment)}`)
    $("#movementPaymentTotal").val(`$ ${dot_separators(totalPayment)}`)
    $("#movementPaymentBalance").val(`$ ${dot_separators(totalTotal-totalPayment)}`)

}

async function selectClientSearch(from) {
    
    let clientSelectedData = await Swal.fire({
        title: 'Seleccione Cliente',
        customClass: 'swal-wide',
        html: `
            <div style="max-height: 400px !important; overflow-y: scroll; font-size: 14px">
                <table id="tableSearchClients" class="display nowrap table table-condensed" cellspacing="0">
                    <thead>
                        <tr class="table-dark">
                            <th>RUT</th>
                            <th>NOMBRE</th>
                            <th>ESTADO</th>
                            <th>CRÉDITO DISPONIBLE</th>
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
                        { data: 'status' },
                        { data: 'creditLeft' }
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
        if(from=='search'){
            $('#searchClient').val(clientSelectedData.value._id)
        }else{
            $('#movementClient').val(clientSelectedData.value._id)
        }
    }
}

async function selectClient(btn) {
    
    let clientSelectedData = await Swal.fire({
        title: 'Seleccione Cliente',
        customClass: 'swal-wide',
        html: `
            <button class="btn btn-success btn-block" id="createClient" style="max-width: 200px">
                <i class="fas fa-user-plus"></i> NUEVO CLIENTE
            </button>
            <div style="max-height: 400px !important; overflow-y: scroll; font-size: 14px">
                <table id="tableSearchClients" class="display nowrap table table-condensed" cellspacing="0">
                    <thead>
                        <tr class="table-dark">
                            <th>RUT</th>
                            <th>NOMBRE</th>
                            <th>ESTADO</th>
                            <th>CRÉDITO DISPONIBLE</th>
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
                        { data: 'status' },
                        { data: 'creditLeft' }
                    ],
                    initComplete: function (settings, json) {
                        getClients()
                    }
                })
        
                $('#createClient').on('click', function () {
                    createClient()
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
        $('#movementClient').val(clientSelectedData.value._id)
        setClientRates()
    }
}

async function createClient() {
    
    $('#modalClient').modal('show')
    $('#modalClient_body').html(setModalClient())

    $('#clientRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
        }
    })

    setTimeout(() => {
        $('#clientRUT').focus()
    }, 500)

    $('#saveClient').unbind('click')

    $('#saveClient').on('click', async function () {
        let clientData = {
            rut: $('#clientRUT').val(),
            name: $('#clientName').val(),
            nameFull: $('#clientNameFull').val(),
            email: $('#clientEmail').val(),
            contact: $('#clientContact').val(),
            contactPhone: $('#clientContactPhone').val(),
            status: $('#clientStatus').val(),
            credit: $('#clientCredit').is(":checked"),
            services: {
                storage: $('#serviceStorage').is(":checked"),
                deconsolidated: $('#serviceDeconsolidated').is(":checked"),
                portage: $('#servicePortage').is(":checked"),
                transport: $('#serviceTransport').is(":checked"),
            }
        }

        const res = validateClientData(clientData)
        if (res.ok) {
            let saveClient = await axios.post('/api/clientSave', clientData)
            if(saveClient.data){
                if(saveClient.data._id){
                    $('#modalClient').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Cliente almacenado correctamente</h5>`)
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
                            { data: 'status' },
                            { data: 'creditLeft' }
                        ],
                        initComplete: async function (settings, json) {
                            getClients()
                            internals.clients.table.search( clientData.rut ).draw()

                            let clientsData = await axios.get('api/clients')
                            clients = clientsData.data

                            $("#searchClient").html('<option value="">TODOS</option>')
                            $("#movementClient").html('<option value="">SELECCIONE...</option>')
                            for(let i=0; i < clients.length; i++){
                                $("#movementClient").append('<option value="'+clients[i]._id+'">'+clients[i].name+'</option>')
                                $("#searchClient").append('<option value="'+clients[i]._id+'">'+clients[i].name+'</option>')
                            }
                        }
                    })
                
                }else if(saveClient.data=='created'){
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">RUT ya registrado, favor corroborar</h5>`)
                
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show')

        }

    })
}

function setModalClient(){

    return `
            <div class="row">
                <div class="col-md-4" style="margin-top:10px;">
                    RUT
                    <input id="clientRUT" type="text" class="form-control border-input">
                </div>
                <div class="col-md-8" style="margin-top:10px;">
                    Nombre (o nombre de fantasía SII)
                    <input id="clientName" type="text" class="form-control border-input">
                </div>

                <div class="col-md-12" style="margin-top:10px;">
                    <br/>
                    Nombre Facturación (nombre completo SII)
                    <input id="clientNameFull" type="text" class="form-control border-input">
                </div>
                <div class="col-md-4" style="margin-top:10px;">
                    Correo Electrónico
                    <input id="clientEmail" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" style="margin-top:10px;">
                    Nombre Contacto
                    <input id="clientContact" type="text" class="form-control border-input">
                </div>
                <div class="col-md-4" style="margin-top:10px;">
                    Teléfono Contacto
                    <input id="clientContactPhone" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" style="margin-top:10px;">
                    Estado
                    <select id="clientStatus" class="custom-select">
                        <option value="enabled">HABILITADO</option>
                        <option value="disabled">DESHABILITADO</option>
                    </select>
                </div>

                <div class="col-md-4" style="margin-top:10px;">
                    <br/>
                    Cliente con Crédito
                    <input type="checkbox" id="clientCredit">
                </div>
                <div class="col-md-4" style="margin-top:10px;">
                    <br/>
                    Servicios
                    <br/><input type="checkbox" id="serviceStorage" checked> Almacenamiento
                    <br/><input type="checkbox" id="serviceDeconsolidated"> Desconsolidado
                    <br/><input type="checkbox" id="servicePortage"> Porteo
                    <br/><input type="checkbox" id="serviceTransport"> Transporte
                </div>

            </div>
        `
}

function validateClientData(clientData) {

    let validationCounter = 0
    let errorMessage = ''


    if(validateRut(clientData.rut)){
        validationCounter++
        $('#clientRUT').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>RUT incorrecto`
        $('#clientRUT').css('border', '1px solid #e74c3c')
    }

    if (clientData.name.length > 1) {
        validationCounter++
        $('#clientName').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>Nombre</b>`
        $('#clientName').css('border', '1px solid #e74c3c')
    }
    

    /*if (isEmail(clientData.email)) {
        validationCounter++
        $('#clientEmail').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>E-Mail`
        $('#clientEmail').css('border', '1px solid #e74c3c')
    }*/

    if (clientData.services.storage || clientData.services.deconsolidated || clientData.services.portage || clientData.services.transport) {
        validationCounter++
    } else {
        errorMessage += `<br>Seleccionar Servicio(s)`
    }

    if (validationCounter >= 3) {
        return { ok: clientData }
    } else {
        toastr.warning('Faltan datos:<br>'+errorMessage)
        return { err: clientData }
    }

}

async function getClients(){
    let clientData = await axios.get('api/clients')
    if (clientData.data.length > 0) {
        let formatData= clientData.data.map(el => {
            el.creditLeft = 'SIN CRÉDITO'

            if(el.credit){
                if(el.creditLimit){
                    el.creditLeft = '$ '+dot_separators(el.creditLimit)
                }else{
                    el.creditLeft = '$ 0'
                }
            }
            return el
        })
        internals.clients.table.rows.add(formatData).draw()
    }
}

async function getDriver(rut,out){

    if(rut.length>0){
        let driver = await axios.post('api/driverSingle', {rut: rut})
        if (driver.data.length > 0) {
            if(out){
                $('#movementDriverOutName').val(driver.data[0].name)
                $('#movementDriverOutPlate').val(driver.data[0].lastPlate)
            }else{
                $('#movementDriverName').val(driver.data[0].name)
                $('#movementDriverPlate').val(driver.data[0].lastPlate)
            }
        }
    }
}

async function showHistory(){

    let containerFullData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let containerFull = containerFullData.data
    let movementActualID = internals.dataRowSelected.movementID

    $('#extraModal').modal('show')
    $('#modalExtra_title').html(`Historial de Container`)

    let history = ''

    for(i=0;i<containerFull.movements.length;i++){

        let colorClass = 'movOtro'
        let colorClassContent = 'contOtro'
        if(containerFull.movements[i].movement=='POR INGRESAR' || containerFull.movements[i].movement=='INGRESADO'){
            colorClass = 'movIn'
            colorClassContent = 'contIn'
        }else if(containerFull.movements[i].movement=='TRASLADO'){
            colorClass = 'movMov'
            colorClassContent = 'contMov'
        }else if(containerFull.movements[i].movement=='POR SALIR' || containerFull.movements[i].movement=='SALIDA'){
            colorClass = 'movOut'
            colorClassContent = 'contOut'
        }else if(containerFull.movements[i].movement=='DESCONSOLIDADO'){
            colorClass = 'movDeco'
            colorClassContent = 'contDeco'
        }else if(containerFull.movements[i].movement=='TRASPASO'){
            colorClass = 'movTrans'
            colorClassContent = 'contTrans'
        }

        if(i%2==0){
            history += `<div class="containerTime ${colorClass} leftTime">`
        }else{
            history += `<div class="containerTime ${colorClass} rightTime">`
        }

        history += `<div class="contentTime ${colorClassContent}">
                        <h5>${moment(containerFull.movements[i].datetime).format('DD/MM/YYYY HH:mm')}</h5>
                        <p>${containerFull.movements[i].movement}</p>
                    </div>
                </div>`
    }

    $('#modalExtra_body').html(`
        <div class="timeline">
            ${history}
        </div>
    `)

    $('#modalExtra_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>
    `)
    
}


async function showMap(){
    
    await getMap(selectedSiteMap)

    $('#modalMap').modal('show')
    $('#modalMap_title').html(`Ubicación de Container`)

    $('#modalExtra_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>
    `)
    
}

async function printVoucher(type,id,sendEmail) {

    let indexPages = 2
    let typeMail = ''

    let movement = await axios.post('api/movementVoucher', {id: id, type: type})
    let voucher = movement.data
    //TESTING//
    if(!voucher.driverGuide) voucher.driverGuide='0'
    if(!voucher.driverSeal) voucher.driverSeal='0'
    
    //let doc = new jsPDF('p', 'pt', 'letter')
    let doc = new jsPDF('p', 'pt', [302, 451])
    
    for(let i=0; i<indexPages; i++){
    
        let pdfX = 20
        let pdfY = 20

        doc.setFontSize(10)

        doc.addImage(logoImg, 'PNG', 90, pdfY, 120, 60, 'center')
        pdfY += 60
        doc.text(`DEPÓSITO CONTENEDORES DDMC LTDA.`, doc.internal.pageSize.width/2, pdfY + 20, 'center')
        doc.text(`Los Aromos 451 Aguas Buenas - San Antonio`, doc.internal.pageSize.width/2, pdfY + 30, 'center')

        doc.setFontSize(12)
        doc.setFontType('bold')

        if(type=="in"){
            typeMail = 'INGRESO'
            doc.text(`INGRESO N°: ${(voucher.numberIn) ? (voucher.numberIn) : '-----'}`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
        }else if(type=="out"){
            typeMail = 'SALIDA'
            doc.text(`SALIDA N°: ${(voucher.numberOut) ? (voucher.numberOut) : '-----'}`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
        }else if(type=="transferIn"){
            typeMail = 'TRASPASO'
            doc.text(`ENTRADA TRASPASO N°: ${(voucher.transferIn) ? (voucher.transferIn) : '-----'}`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
        }else if(type=="transferOut"){
            typeMail = 'TRASPASO'
            doc.text(`SALIDA TRASPASO N°: ${(voucher.transferOut) ? (voucher.transferOut) : '-----'}`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
        }else if(type=="decon"){
            typeMail = 'DESCONSOLIDADO'
            doc.text(`DESCONSOLIDADO N°: ${(voucher.numberDecon) ? (voucher.numberDecon) : '-----'}`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
        }

        pdfY += 72

        doc.text(voucher.containerNumber, pdfX + 90, pdfY + 2)

        doc.setFontSize(10)
        doc.setFontType('normal')
        doc.text(`Contenedor`, pdfX, pdfY)
        doc.text(`Tipo`, pdfX, pdfY + 15)
        doc.text(`Llegada`, pdfX, pdfY + 27)
        doc.text(`Salida`, pdfX, pdfY + 39)
        doc.text(`Tracto`, pdfX, pdfY + 51)
        doc.text(`Guía`, pdfX, pdfY + 63)
        doc.text(`Sello`, pdfX, pdfY + 75)
        doc.text(`RUT Conductor`, pdfX, pdfY + 87)
        doc.text(`Nombre Conductor`, pdfX, pdfY + 99)
        doc.text(`RUT Cliente`, pdfX, pdfY + 111)
        //doc.text(`Cliente`, pdfX, pdfY + 95)
        doc.setFontType('bold')
        //doc.text(voucher.clientName.toUpperCase(), pdfX, pdfY + 127)
        doc.text(voucher.clientName.toUpperCase(), doc.internal.pageSize.width/2, pdfY + 127, 'center')
        doc.setFontType('normal')
        //doc.text(`Ubicación`, pdfX, pdfY + 105)

        doc.text(voucher.containerLarge, pdfX + 90, pdfY + 15)

        voucher.datetimeInMail = '-'
        voucher.datetimeOutMail = '-'

        if(type=="transferIn" || type=="transferOut"){
            doc.text(moment(voucher.datetimeOut).format('DD/MM/YYYY HH:mm'), pdfX + 90, pdfY + 27)
            voucher.datetimeOutMail = moment(voucher.datetimeOut).format('DD/MM/YYYY HH:mm')
        }else{
            doc.text(moment(voucher.datetimeIn).format('DD/MM/YYYY HH:mm'), pdfX + 90, pdfY + 27)
            voucher.datetimeInMail = moment(voucher.datetimeIn).format('DD/MM/YYYY HH:mm')
        }

        if(type=="in"){
            doc.text('-', pdfX + 90, pdfY + 35)
        }else{
            doc.text(moment(voucher.datetimeOut).format('DD/MM/YYYY HH:mm'), pdfX + 90, pdfY + 39)
            voucher.datetimeOutMail = moment(voucher.datetimeOut).format('DD/MM/YYYY HH:mm')
        }
        
        
        doc.text(voucher.driverPlate, pdfX + 90, pdfY + 51)
        doc.text(voucher.driverGuide, pdfX + 90, pdfY + 63)
        doc.text(voucher.driverSeal, pdfX + 90, pdfY + 75)
        doc.text(voucher.driverRUT, pdfX + 90, pdfY + 87)
        doc.text(voucher.driverName, pdfX + 90, pdfY + 99)
        doc.text(voucher.clientRUT, pdfX + 90, pdfY + 111)

        
        //doc.text(voucher.clientName.toUpperCase(), pdfX + 90, pdfY + 95)
        //doc.text('', pdfX + 90, pdfY + 105)


        //doc.text(pdfX + 230, pdfY + 30, `Estado: ${internals.newSale.status}`, { align: 'center' }) // status right
        //doc.text(pdfX + 230, pdfY + 45, `Fecha: ${moment(auxHourPdf).format('DD/MM/YYYY HH:mm')}`, { align: 'center' }) // creationDate right
        pdfY += 139

        doc.setLineWidth(0.5)
        doc.line(pdfX, pdfY, pdfX + 220, pdfY)

        if(type=="in" || type=='decon' || !voucher.extraDayNet){
            doc.text(`NETO`, pdfX, pdfY + 22)
            doc.text(`IVA (19%)`, pdfX, pdfY + 34)
            doc.setFontType('bold')
            doc.text(`TOTAL`, pdfX, pdfY + 46)
            doc.setFontType('normal')

            doc.text(`$`, pdfX + 150, pdfY + 22)
            doc.text(`$`, pdfX + 150, pdfY + 34)
            doc.setFontType('bold')
            doc.text(`$`, pdfX + 150, pdfY + 46)
            doc.setFontType('normal')

            doc.text(voucher.service, pdfX, pdfY + 10)
            doc.text(dot_separators(voucher.net), pdfX + 210, pdfY + 22, 'right')
            doc.text(dot_separators(voucher.iva), pdfX + 210, pdfY + 34, 'right')
            doc.setFontType('bold')
            doc.text(dot_separators(voucher.total), pdfX + 210, pdfY + 46, 'right')
            doc.setFontType('normal')
            pdfY += 53

        }else{
        ////////REVISAR!!!!!!///////
            //let extraDays = moment(voucher.datetimeOut).diff(moment(voucher.datetimeIn).format('YYYY-MM-DD'), 'days')-5

            doc.text(`NETO`, pdfX, pdfY + 22)
            doc.text(`IVA (19%)`, pdfX, pdfY + 34)
            doc.setFontType('bold')
            doc.text(`SUBTOTAL`, pdfX, pdfY + 46)
            doc.setLineWidth(0.5)
            doc.line(pdfX, pdfY + 50, pdfX + 220, pdfY + 50)
            doc.setFontType('normal')
            doc.text(`NETO (${voucher.extraDays} x $${dot_separators(voucher.extraDayServiceNet)})`, pdfX, pdfY + 72)
            doc.text(`IVA (19%)`, pdfX, pdfY + 84)
            doc.setFontType('bold')
            doc.text(`SUBTOTAL`, pdfX, pdfY + 96)
            doc.setLineWidth(0.5)
            doc.line(pdfX, pdfY + 100, pdfX + 220, pdfY + 100)
            doc.text(`TOTAL`, pdfX, pdfY + 112)

            doc.setFontType('normal')
            doc.text(`$`, pdfX + 150, pdfY + 22)
            doc.text(`$`, pdfX + 150, pdfY + 34)
            doc.setFontType('bold')
            doc.text(`$`, pdfX + 150, pdfY + 46)

            doc.setFontType('normal')
            doc.text(`$`, pdfX + 150, pdfY + 72)
            doc.text(`$`, pdfX + 150, pdfY + 84)
            doc.setFontType('bold')
            doc.text(`$`, pdfX + 150, pdfY + 96)
            doc.text(`$`, pdfX + 150, pdfY + 112)


            doc.setFontType('normal')
            doc.text(voucher.service, pdfX, pdfY + 10)
            doc.text(dot_separators(voucher.net), pdfX + 210, pdfY + 22, 'right')
            doc.text(dot_separators(voucher.iva), pdfX + 210, pdfY + 34, 'right')
            doc.setFontType('bold')
            doc.text(dot_separators(voucher.total), pdfX + 210, pdfY + 46, 'right')
            doc.setFontType('normal')

            doc.text(`Días Extra`, pdfX, pdfY + 60)
            doc.text(dot_separators(voucher.extraDayNet), pdfX + 210, pdfY + 72, 'right')
            doc.text(dot_separators(voucher.extraDayIva), pdfX + 210, pdfY + 84, 'right')
            doc.setFontType('bold')
            doc.text(dot_separators(voucher.extraDayTotal), pdfX + 210, pdfY + 96, 'right')
            doc.text(dot_separators(voucher.total+voucher.extraDayTotal), pdfX + 210, pdfY + 112, 'right')

            pdfY += 118
        }

        doc.setLineWidth(0.5)
        doc.line(pdfX, pdfY, pdfX + 220, pdfY)

        if(i+1!=indexPages){
            doc.addPage()
        }

        /*if(i==0 && sendEmail){
            //let pdf = btoa(doc.output())
            let pdf = ''
            let email = await axios.post('api/sendMail',
                {
                    id: id, 
                    type: typeMail, 
                    driverName: voucher.driverName, 
                    logoImg: logoImg, 
                    pdf: pdf,
                    voucher: voucher
                }
            )
            console.log(email)
        }*/
    }

    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
    //doc.save(`Nota de venta ${internals.newSale.number}.pdf`)

    if(sendEmail){
        //ENVÍO DE EMAIL A CLIENTE
        let pdf = ''
        let email = await axios.post('api/sendMail',
            {
                id: id, 
                type: typeMail,
                pdf: pdf,
                voucher: voucher
            }
        )

        //OK accepted.length>0 OK
        //SIN CORREO 'No Email'
        //ERROR

        if(email.data=='No Email'){
            toastr.warning('Cliente sin correo asociado, no se ha enviado ningún aviso')
        }else if(email.data.accepted.length>0){
            toastr.success('Correo enviado a cliente correctamente')
        }else{
            toastr.danger('Ha ocurrido un error al enviar correo a cliente')
        }
    }
}

function addService(btn,type){

    let trClass = ''
    let btnService = $(btn).attr('id')
    $(btn).attr('disabled',true)
    if(type=='PORTEO'){
        //trClass = 'table-primary'
        trClass = 'table-primarySoft'
    }else if(type=='TRANSPORTE'){
        //trClass = 'table-info'
        trClass = 'table-infoSoft'
    }

    $("#tableServicesBody").append(`
        <tr class="${trClass}">
            <td>
                <select class="custom-select custom-select-sm classMove" onchange="updatePayment(this)">
                    ${
                        services.reduce((acc,el)=>{
                            if(type=='PORTEO'){
                                if(el.name=='Porteo'){
                                    acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                }
                            }else if(type=='TRANSPORTE'){
                                if(el.name=='Transporte'){
                                    acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                                }
                            }
                            return acc
                        },'')
                    }
                </select>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this)" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" onkeyup="updatePayment(this,'iva')" disabled>
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classMove" disabled>
            </td>
            <td>
                <button class="btn btn-sm btn-danger classOut classMove" onclick="deleteService(this, '${btnService}')" title="Quitar Servicio"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `)


    $('.classServiceDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })
}

async function deleteService(btnRow, btn){
    if(btn!='btnServiceDeconsolidated'){
        $(btnRow).parent().parent().remove()
        $('#'+btn).removeAttr('disabled')
        calculateTotal()
    }else{
        let deleteDeconsolidated = await Swal.fire({
            title: '¿Está seguro de eliminar el servicio de desconsolidado?',
            customClass: 'swal-wide',
            html: ` `,
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: true,
            focusConfirm: false,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        })
        if (deleteDeconsolidated.value) {
            $(btnRow).parent().parent().remove()
            calculateTotal()
        }
    }

    
    
}

function addPayment(){

    $("#tablePaymentBody").append(`
        <tr>
            <td>
                <select class="custom-select classPayment">
                    <option value="0">SELECCIONAR</option>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    <option value="TRANSBANK">TRANSBANK</option>
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm border-input classPayment" placeholder="N° Transacción">
            </td>
            <td>
                <input type="text" class="form-control form-control-sm border-input classPayment classPaymentDate" value="${moment().format('DD-MM-YYYY')}">
            </td>
            <td>
                <input type="text" style="text-align: right" value="$ 0" class="form-control form-control-sm border-input classPayment" onkeyup="updatePaymentPay(this)">
            </td>
            <td>
                <button class="btn btn-sm btn-danger classOut" onclick="deletePayment(this)" title="Quitar Pago"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `)


    $('.classPaymentDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })
}

function deletePayment(btnRow){
    $(btnRow).parent().parent().remove()
    calculateTotal()
}

function setPayments(array){

    for(let i=0; i<array.length; i++){

        $("#tablePaymentBody").append(`
            <tr>
                <td>
                    <select class="custom-select classPayment">
                        <option value="0">SELECCIONAR</option>
                        <option value="EFECTIVO" ${(array[i].paymentType=='EFECTIVO') ? 'selected' : ''}>EFECTIVO</option>
                        <option value="TRANSFERENCIA" ${(array[i].paymentType=='TRANSFERENCIA') ? 'selected' : ''}>TRANSFERENCIA</option>
                        <option value="TRANSBANK" ${(array[i].paymentType=='TRANSBANK') ? 'selected' : ''}>TRANSBANK</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm border-input classPayment" placeholder="N° Transacción" value="${array[i].paymentNumber}">
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm border-input classPayment classPaymentDate" value="${moment(array[i].date).utc().format('DD-MM-YYYY')}">
                </td>
                <td>
                    <input type="text" style="text-align: right" class="form-control form-control-sm border-input classPayment" onkeyup="updatePaymentPay(this)" value="$ ${dot_separators(array[i].paymentAmount)}">
                </td>
                <td>
                    <button class="btn btn-sm btn-danger classPayment" onclick="deletePayment(this)" title="Quitar Pago"><i class="fas fa-times"></i></button>
                </td>
            </tr>
        `)
    }


    $('.classPaymentDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        singleDatePicker: true,
        autoApply: true
    }, function(start, end, label) {
        //internals.initDate = start.format('YYYY-MM-DD')
        //internals.endDate = end.format('YYYY-MM-DD')
    })
}

async function setClientRates(){

    if($('#movementClient').val()!=0){

        let clientRateData = await axios.post('/api/clientSingle', {id: $('#movementClient').val()})
        let clientRates = clientRateData.data
        
        if(clientRates.credit){
            $("#chkCredit").prop('checked',true)
        }

        $("#movementClientRUT").text('RUT: '+clientRates.rut)

        if(clientRates.rates.length>0){

            $("#tableServicesBody > tr").each(function() {
                
                $($($($(this).children()[0]).children()[0]).children()).each(function() {
                    let serviceRate = clientRates.rates.find(x => x.services === $(this).val())
                    if(serviceRate){//Si el cliente tiene la tarifa especial asignada, se asignarán los valores
                        $(this).attr('data-net',serviceRate.net)
                    }else{
                        if(services.find(x => x._id === $(this).val())){
                            $(this).attr('data-net',services.find(x => x._id === $(this).val()).net)
                        }
                    }
                })

                updatePayment($($($(this).children()[0]).children()[0]))
            })

            $("#tableServicesExtraBody > tr").each(function() {
                $($($($(this).children()[1]).children()[1]).children()).each(function() {
                    let serviceRate = clientRates.rates.find(x => x.services === $(this).val())
                    if(serviceRate){
                        $(this).attr('data-net',serviceRate.net)
                    }else{
                        if(services.find(x => x._id === $(this).val())){
                            $(this).attr('data-net',services.find(x => x._id === $(this).val()).net)
                        }
                    }
                })

                updatePayment($($($(this).children()[1]).children()[1]), 'extra')
            })


        }else{
            $("#tableServicesBody > tr").each(function() {
                $($($($(this).children()[0]).children()[0]).children()).each(function() {
                    if(services.find(x => x._id === $(this).val())){
                        $(this).attr('data-net',services.find(x => x._id === $(this).val()).net)
                    }
                })

                updatePayment($($($(this).children()[0]).children()[0]))
            })

            $("#tableServicesExtraBody > tr").each(function() {
                $($($($(this).children()[1]).children()[1]).children()).each(function() {
                    if(services.find(x => x._id === $(this).val())){
                        $(this).attr('data-net',services.find(x => x._id === $(this).val()).net)
                    }
                })

                updatePayment($($($(this).children()[1]).children()[1]), 'extra')
            })
        }
    
    }else{
        $("#movementClientRUT").text('')

    }
}

async function getClientRates(){

    let setAlert = false

    if($('#movementClient').val()!=0){

        let clientRateData = await axios.post('/api/clientSingle', {id: $('#movementClient').val()})
        let clientRates = clientRateData.data
        
        if(clientRates.rates.length>0){

            $("#tableServicesBody > tr").each(function() {
                
                $($($($(this).children()[0]).children()[0]).children()).each(function() {
                    let serviceRate = clientRates.rates.find(x => x.services === $(this).val())
                    if($(this).attr('data-net')!=serviceRate){
                        setAlert = true
                    }
                })

            })

            $("#tableServicesExtraBody > tr").each(function() {
                $($($($(this).children()[1]).children()[1]).children()).each(function() {
                    let serviceRate = clientRates.rates.find(x => x.services === $(this).val())

                    if($(this).attr('data-net')!=serviceRate){
                        setAlert = true
                    }
                })

            })

        }

        /*if(setAlert){
            $("#btnUpdateRates").css('display','block')
        }else{
            $("#btnUpdateRates").css('display','none')
        }*/
    }
}

async function showUpdateRates() {
    
    //let clientSelectedData = await Swal.fire({
    await Swal.fire({
        title: 'Actualización de tarifas',
        customClass: 'swal-wide',
        html: `
            <div style="max-height: 400px !important; overflow-y: scroll; font-size: 14px">
                Las siguientes tarifas han sido modificadas, presione "Actualizar" si desea realizar una actualización de los valores
                <br/>
                <table id="tableUpdateRates" class="display nowrap table table-condensed" cellspacing="0">
                    
                </table>
            </div>
        `,
        onBeforeOpen: async () => {
            try {
                let clientRateData = await axios.post('/api/clientSingle', {id: $('#movementClient').val()})
                let clientRates = clientRateData.data
                
                if(clientRates.rates.length>0){
        
                    $("#tableServicesBody > tr").each(function() {
                        
                        $($($($(this).children()[0]).children()[0]).children()).each(function() {
                            let serviceRate = clientRates.rates.find(x => x.services === $(this).val())
                            if(serviceRate){
                                
                                if($(this).attr('data-net')!=serviceRate.net){
                                    $("#tableUpdateRates").append(`
                                        <tr>
                                            <td>${dot_separators($(this).text())}</td>
                                            <td>$ ${dot_separators($(this).attr('data-net'))}</td>
                                            <td>=></td>
                                            <td>$ ${dot_separators(serviceRate.net)}</td>
                                            <td>
                                                <button class="btn btn-danger" onclick="updateRate('normal','${$(this).val()}',${serviceRate.net})">
                                                    Actualizar
                                                </button>
                                            </td>
                                        </tr>`
                                    )
                                }
                            }
                        })
        
                    })
        
                    $("#tableServicesExtraBody > tr").each(function() {
                        $($($($(this).children()[1]).children()[1]).children()).each(function() {
                            let serviceRate = clientRates.rates.find(x => x.services === $(this).val())
                            if(serviceRate){
                                if($(this).attr('data-net')!=serviceRate.net){
                                    $("#tableUpdateRates").append(`
                                        <tr>
                                            <td>${dot_separators($(this).text())}</td>
                                            <td>$ ${dot_separators($(this).attr('data-net'))}</td>
                                            <td>=></td>
                                            <td>$ ${dot_separators(serviceRate.net)}</td>
                                            <td>
                                                <button class="btn btn-danger" onclick="updateRate('extra','${$(this).val()}',${serviceRate.net})">
                                                    Actualizar
                                                </button>
                                            </td>
                                        </tr>`
                                    )
                                }
                            }
                        })
        
                    })
        
                }

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
        showConfirmButton: false,
        focusConfirm: false,
        confirmButtonText: 'Seleccionar',
        cancelButtonText: 'Cerrar'
    })

    /*if (clientSelectedData.value) {
        if(from=='search'){
            $('#searchClient').val(clientSelectedData.value._id)
        }else{
            $('#movementClient').val(clientSelectedData.value._id)
        }
    }*/
}

async function updateRate(type, serviceID, serviceRate){
    
    if(type=='normal'){
        $("#tableServicesBody > tr").each(function() {
            $($($($(this).children()[0]).children()[0]).children()).each(function() {
                if($(this).val()==serviceID){
                    $(this).attr('data-net',serviceRate)
                }
            })
            updatePayment($($($(this).children()[0]).children()[0]))
        })

    }else if(type=='extra'){
        $("#tableServicesExtraBody > tr").each(function() {
            $($($($(this).children()[1]).children()[1]).children()).each(function() {
                
                if($(this).val()==serviceID){
                    $(this).attr('data-net',serviceRate)
                }
            })
            //updatePayment($($($(this).children()[1]).children()[1]),'extra')
        })
    }
}

async function setClientRUT(){

    if($('#movementClient').val()!=0){
        let clientRUT = await axios.post('/api/clientSingle', {id: $('#movementClient').val()})

        $("#movementClientRUT").text('RUT: '+clientRUT.data.rut)
    
    }else{
        $("#movementClientRUT").text('')

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

function toUpper(input){
    $(input).val($(input).val().toUpperCase())
}

function testing(){
    //let arrClient = ['61b88ccdeb77f0bf62cb74b3','61d5af56986222a3aedcf652','61e8356c6d5f012fc4920b58','61e83634605fed158ca1721a','62265580be54f73ba4a3a2ca','62265f305d41216a90857de5']
    let arrClient = ['61b88ccdeb77f0bf62cb74b3']
    $('#movementClient').val(arrClient[Math.floor(Math.random() * arrClient.length)])
    //$('#movementContainerNumber').val('HASU-751000-1123')
    let arr = ['MSFU','HASU','BCLU','EUXU','PXCU','TORU']
    $('#movementContainerNumber').val(arr[Math.floor(Math.random() * arr.length)]+'-'+Math.floor(Math.random() * 1000000)+'-'+Math.floor(Math.random() * 10))

    let arrContainerType = ['61d70f00f5ffd3251426d0a5','61d5b2df986222a3aedcf657','61d5b339986222a3aedcf659','61d5b33e986222a3aedcf65a','61d5b341986222a3aedcf65b','61d5b37d986222a3aedcf65c']
    $('#movementContainerType').val(arrContainerType[Math.floor(Math.random() * arrContainerType.length)])

    let arrTexture = ['cai','hp','ma','blu','gre','blu']
    let texture = arrTexture[Math.floor(Math.random() * arrTexture.length)]
    $('#imgTexture').prop('src','/public/img/textures/'+texture+'.jpg')
    $('#imgTexture').val(texture)
    //$('#movementCrane').val('61d5e3abf5ffd3251426d08e')
    //$('#movementSite').val('61d5e360f5ffd3251426d08a')
    //$('#movementPositionRow').val('B')
    //$('#movementPositionPosition').val('4')
    //$('#movementPositionLevel').val('1')
    $('#movementDriverRUT').val('6-K')
    $('#movementDriverName').val('KEN BLOCK')
    $('#movementDriverPlate').val('FJDJ67')
    $('#movementDriverGuide').val(Math.floor(Math.random() * 1000))
    $('#movementDriverSeal').val(Math.floor(Math.random() * 10000))
    $('#movementPaymentType').val('TRANSBANK')
    $('#movementPaymentNumber').val('AAA111')
    $('#movementService').val('61d867aaf5ffd3251426d0cb')
}