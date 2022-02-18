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

let siteMap = {}

$(document).ready(async function () {
    $('#searchDate').daterangepicker({
        opens: 'left',
        locale: dateRangePickerDefaultLocale,
        startDate: moment().add(-1,'weeks')
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

    loadMovementTable()
    getParameters()

    $("#search").on('click', function(){
        loadMovementTable()
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
}

async function setPositionList(editSite, editRow, editPosition, editLevel) {

    if(editSite){ //CASO DE CARGA DE DATOS
        $("#movementPositionRow").html('<option value="0">SEL</option>')
        $("#movementPositionPosition").html('<option value="0">SEL</option>')
        $("#movementPositionLevel").html('<option value="0">SEL</option>')
        $("#movementPositionRowOld").html('<option value="0">SEL</option>')
        $("#movementPositionPositionOld").html('<option value="0">SEL</option>')
        $("#movementPositionLevelOld").html('<option value="0">SEL</option>')

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
                $("#movementPositionPosition").append(`<option value="${positions[i].position}">${positions[i].position}</option>`)
            }

            //Se toma como referencia las alturas del primer container
            for(let j=0; j<positions[0].levels.length; j++){
                $("#movementPositionLevel").append(`<option value="${positions[0].levels[j]}">${positions[0].levels[j]}</option>`)
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
            console.log("positions",positions)
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
        internals.movements.table = $('#tableMovements')
        .DataTable( {
            dom: 'Bfrtip',
            buttons: [
              'excel'
            ],
            iDisplayLength: 50,
            oLanguage: {
              sSearch: 'buscar: '
            },
            responsive: false,
            order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'datetime' },
            { data: 'movement' },
            { data: 'status' },
            { data: 'client' },
            { data: 'containerNumber' },
            { data: 'containerType' },
            { data: 'containerLarge' },
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
                internals.movements.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected')
                internals.dataRowSelected = internals.movements.table.row($(this)).data()
                $('#optionModMovement').prop('disabled', false)

                let movementType = internals.dataRowSelected.movement

                if(movementType=='POR INGRESAR' || movementType=='INGRESADO' || movementType=='TRASLADO'){
                    $('#optionModMovement').addClass('btn-outline-success')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR')
                }else if(movementType=='SALIDA'){
                    $('#optionModMovement').addClass('btn-outline-primary')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR SALIDA')
                }else if(movementType=='DESCONSOLIDADO'){
                    $('#optionModMovement').addClass('btn-outline-warning')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR DESCONSOLIDADO')
                }else if(movementType=='TRASPASO'){
                    $('#optionModMovement').addClass('btn-outline-primary')
                    $('#optionModMovement').html('<i class="fas fa-edit"></i> MODIFICAR TRASPASO')
                }

                $('#optionCloseMovement').prop('disabled', false)
                if(movementType=='INGRESADO' || movementType=='TRASLADO' || movementType=='DESCONSOLIDADO'){
                    $('#optionCloseMovement').prop('disabled', false)
                    $('#optionMovMovement').prop('disabled', false)
                    $('#optionDeconsolidatedMovement').prop('disabled', false)
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
    let movementData
    let query = {
        table: true,
        containerNumber: $("#searchNumber").val(),
        client: $("#searchClient").val(),
        status: $("#searchStatus").val(),
        startDate: $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        onlyInventory: $("#searchInventory").prop('checked')
    }

    movementData = await axios.post('api/movementsByFilter',query)
    
    if (movementData.data.length > 0) {
        let formatData= movementData.data.map(el => {
            el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')
            el.status = 'EN SITIO'
            if(el.movement=='SALIDA' || el.movement=='TRASPASO'){
                el.status = 'RETIRADO'
            }

            return el
        })

        internals.movements.table.rows.add(formatData).draw()
        $('#loadingMovements').empty()
    } else {
        toastr.warning('No se han encontrado movimientos en base a filtrado')
        $('#loadingMovements').empty()
    }
}

$('#optionCreateMovement').on('click', function () { // CREAR MOVIMIENTO
    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Nuevo Ingreso`)
    $('#modalMov_body').html(createModalBody())
    setPositionList()

    $('#modalMov_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)
    $("#btnHistory").css('display','none')

    $('#movementType').val('POR INGRESAR')
    $('#movementType').prop('disabled',true)

    var element = document.getElementById('movementContainerNumber');
    var maskOptions = {
        mask: 'aaaa-000000-00',
        lazy: false //shows placeholder
    };
    var mask = IMask(element, maskOptions);

    $('#movementDriverRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
            getDriver(rut)
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

        let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
        let iva = Math.round(net * 0.19)
        let total = parseInt(net) + parseInt(iva)

        let movement = $('#movementType').val()

        if($('#movementCrane').val()!=0 && $('#movementCrane').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0){
            movement = 'INGRESADO'
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
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            services: $('#movementService').val(),
            paymentType: $('#movementPaymentType').val(),
            paymentNumber: $('#movementPaymentNumber').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentNet: net,
            paymentIVA: iva,
            paymentTotal: total,
            observation: $('#movementObservation').val()
        }

        console.log(movementData)

        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementSave', res.ok)
            console.log(saveMovement)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')

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
            $('#modal').modal('show');
        }

    })

})

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

                    datatableMovements
                        .row(movementRowSelected)
                        .remove()
                        .draw()

                    // console.log(res.ok)
                }
            })
        }
    })
})

$('#optionModMovement').on('click', async function () {

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID


    if(container.movements[movementID].movement=='POR INGRESAR' || container.movements[movementID].movement=='INGRESADO' || container.movements[movementID].movement=='TRASLADO' || container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA' || container.movements[movementID].movement=='DESCONSOLIDADO'){

        $('#movementsModal').modal('show');
        $('#modalMov_title').html(`Modifica Ingreso`)
        $('#modalMov_body').html(createModalBody())

        $('#modalMov_footer').html(`
            <button class="btn btn-dark" data-dismiss="modal">
                <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
            </button>

            <button class="btn btn-primary" id="saveMovement">
                <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
            </button>
            
            <button class="btn btn-info" id="printMovementIn" onclick="printVoucher('in','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER INGRESO
            </button>
            <button class="btn btn-info" id="printMovementOut" onclick="printVoucher('out','${internals.dataRowSelected.id}')" disabled>
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER SALIDA
            </button>
        `)

        $('#movementType').prop('disabled',true)

        if(container.movements[movementID].movement=='POR SALIR' || container.movements[movementID].movement=='SALIDA'){
            $('#printMovementOut').removeAttr('disabled')
            $(".classOut").prop('disabled',true)
        }

        $('#movementStacker').change(function () {
            if($(this).prop('checked')){
                $('.classStacker').attr('disabled',true)
            }else{
                $('.classStacker').removeAttr('disabled')
            }
        })

        $('#movementType').val(container.movements[movementID].movement)
        $('#movementDate').val(moment(container.movements[movementID].datetime).format('YYYY-MM-DD'))
        $('#movementTime').val(moment(container.movements[movementID].datetime).format('HH:mm'))
        $('#movementClient').val(container.clients)
        $('#movementContainerNumber').val(container.containerNumber)
        $('#movementContainerType').val(container.containertypes)
        $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
        $('#imgTexture').val(container.containerTexture)
        $('#movementContainerLarge').val(container.containerLarge)
        
        if(container.movements[movementID].cranes){
            $('#movementCrane').val(container.movements[movementID].cranes)
        }
        if(container.movements[movementID].sites){
            $('#movementSite').val(container.movements[movementID].sites)
            setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)
        }


        //$('#movementPositionRow').val(container.movements[movementID].position.row)
        //$('#movementPositionPosition').val(container.movements[movementID].position.position)
        //$('#movementPositionLevel').val(container.movements[movementID].position.level)

        if(!container.movements[movementID].cranes && !container.movements[movementID].sites && container.movements[movementID].position.row==0 && container.movements[movementID].position.position==0 && container.movements[movementID].position.level==0){
            $('#movementStacker').prop('checked',true)
            $('.classStacker').attr('disabled',true)
        }

        
        $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
        $('#movementDriverName').val(container.movements[movementID].driverName)
        $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
        $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
        $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
        $('#movementService').val(container.services[container.services.length-1].services)//MODIFICAR, NO ASOCIADO A MOVIMIENTO
        $('#movementPaymentType').val(container.services[container.services.length-1].paymentType),
        $('#movementPaymentNumber').val(container.services[container.services.length-1].paymentNumber),
        $('#movementPaymentAdvance').prop('checked',container.movements[movementID].paymentAdvance)
        $('#movementPaymentNet').val(`$ ${dot_separators(container.movements[movementID].paymentNet)}`)
        $('#movementPaymentIVA').val(`$ ${dot_separators(container.movements[movementID].paymentIVA)}`)
        $('#movementPaymentTotal').val(`$ ${dot_separators(container.movements[movementID].paymentTotal)}`)
        $('#movementObservation').val(container.movements[movementID].observation)

        $('#movementDriverRUT').on('keyup', function () {
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut)
            }
        })

        
        $('#saveMovement').on('click', async function () {

            let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
            let iva = Math.round(net * 0.19)
            let total = parseInt(net) + parseInt(iva)

            let movement = $('#movementType').val()

            if($('#movementCrane').val()!=0 && $('#movementCrane').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0 && $('#movementPositionRow').val()!=0){
                movement = 'INGRESADO'
            }

            let movementData = {
                id: internals.dataRowSelected.id,
                movementID: movementID,
                movement: movement,
                datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
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
                driverRUT: $('#movementDriverRUT').val(),
                driverName: $('#movementDriverName').val(),
                driverPlate: $('#movementDriverPlate').val(),
                driverGuide: $('#movementDriverGuide').val(),
                driverSeal: $('#movementDriverSeal').val(),
                services: $('#movementService').val(),
                paymentType: $('#movementPaymentType').val(),
                paymentNumber: $('#movementPaymentNumber').val(),
                paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total,
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
                $('#modal').modal('show');
            }
        })

    }else if(container.movements[movementID].movement=='TRASPASO'){

        $('#movementsModal').modal('show');
        $('#modalMov_title').html(`Modifica Traspaso`)
        $('#modalMov_body').html(createModalBody('TRASPASO'))

        $('#modalMov_footer').html(`
            <button class="btn btn-dark" data-dismiss="modal">
                <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
            </button>

            <button class="btn btn-primary" id="saveMovement">
                <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
            </button>
            
            <button class="btn btn-info" id="printMovementTransfer" onclick="printVoucher('transferIn','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER ENTRADA
            </button>
            <button class="btn btn-info" id="printMovementTransfer" onclick="printVoucher('transferOut','${internals.dataRowSelected.id}')">
                <i ="color:#3498db;" class="fas fa-print"></i> VOUCHER SALIDA
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

        $('#movementType').val(container.movements[movementID].movement)
        $('#movementDate').val(moment(container.movements[movementID].datetime).format('YYYY-MM-DD'))
        $('#movementTime').val(moment(container.movements[movementID].datetime).format('HH:mm'))
        $('#movementClient').val(container.clients)
        $('#movementContainerNumber').val(container.containerNumber)
        $('#movementContainerType').val(container.containertypes)
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

        $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
        $('#movementDriverName').val(container.movements[movementID].driverName)
        $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
        $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
        $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
        $('#movementDriverOutRUT').val(container.movements[movementID].driverOutRUT)
        $('#movementDriverOutName').val(container.movements[movementID].driverOutName)
        $('#movementDriverOutPlate').val(container.movements[movementID].driverOutPlate)
        $('#movementDriverOutGuide').val(container.movements[movementID].driverOutGuide)
        $('#movementService').val(container.services[container.services.length-1].services)//MODIFICAR, NO ASOCIADO A MOVIMIENTO
        $('#movementPaymentType').val(container.services[container.services.length-1].paymentType),
        $('#movementPaymentNumber').val(container.services[container.services.length-1].paymentNumber),
        $('#movementPaymentAdvance').prop('checked',container.movements[movementID].paymentAdvance)
        $('#movementPaymentNet').val(`$ ${dot_separators(container.movements[movementID].paymentNet)}`)
        $('#movementPaymentIVA').val(`$ ${dot_separators(container.movements[movementID].paymentIVA)}`)
        $('#movementPaymentTotal').val(`$ ${dot_separators(container.movements[movementID].paymentTotal)}`)
        $('#movementObservation').val(container.movements[movementID].observation)

        $('#movementDriverRUT').on('keyup', function () {
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut)
            }
        })

        $('#movementDriverOutRUT').on('keyup', function () {
            let rut = validateRut($(this).val())
            if(rut){
                $(this).val(rut)
                getDriver(rut)
            }
        })

        
        $('#saveMovement').on('click', async function () {

            let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
            let iva = Math.round(net * 0.19)
            let total = parseInt(net) + parseInt(iva)

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
                driverRUT: $('#movementDriverRUT').val(),
                driverName: $('#movementDriverName').val(),
                driverPlate: $('#movementDriverPlate').val(),
                driverGuide: $('#movementDriverGuide').val(),
                driverSeal: $('#movementDriverSeal').val(),
                driverOutRUT: $('#movementDriverOutRUT').val(),
                driverOutName: $('#movementDriverOutName').val(),
                driverOutPlate: $('#movementDriverOutPlate').val(),
                driverOutGuide: $('#movementDriverOutGuide').val(),
                services: $('#movementService').val(),
                paymentType: $('#movementPaymentType').val(),
                paymentNumber: $('#movementPaymentNumber').val(),
                paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
                paymentNet: net,
                paymentIVA: iva,
                paymentTotal: total,
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
                $('#modal').modal('show');
            }
        })
        
    }
})

$('#optionCloseMovement').on('click', async function () {

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Dar Salida`)
    $('#modalMov_body').html(createModalBody())

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementType').val('SALIDA')
    $('#movementType').prop('disabled',true)
    //$('#movementType option[value="INGRESADO"]').prop('disabled',true)
    $('#movementDate').val(moment().format('YYYY-MM-DD'))
    $('#movementTime').val(moment().format('HH:mm'))
    $('#movementClient').val(container.clients)
    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
    $('#imgTexture').prop('src','/public/img/textures/'+container.containerTexture+'.jpg')
    $('#imgTexture').val(container.containerTexture)
    $('#movementContainerLarge').val(container.containerLarge)
    $('#movementCrane').val(container.movements[movementID].cranes)
    $('#movementSite').val(container.movements[movementID].sites)
    setPositionList(container.movements[movementID].sites,container.movements[movementID].position.row,container.movements[movementID].position.position,container.movements[movementID].position.level)
    //$('#movementPositionRow').val(container.movements[movementID].position.row)
    //$('#movementPositionPosition').val(container.movements[movementID].position.position)
    //$('#movementPositionLevel').val(container.movements[movementID].position.level)
    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
    $('#movementService').val(container.services[container.services.length-1].services) //MODIFICAR, NO ASOCIADO A MOVIMIENTO
    $('#movementPaymentType').val(container.services[container.services.length-1].paymentType),
    $('#movementPaymentNumber').val(container.services[container.services.length-1].paymentNumber),
    $('#movementPaymentAdvance').prop('checked',container.movements[movementID].paymentAdvance)
    $('#movementPaymentNet').val(`$ ${dot_separators(container.movements[movementID].paymentNet)}`)
    $('#movementPaymentIVA').val(`$ ${dot_separators(container.movements[movementID].paymentIVA)}`)
    $('#movementPaymentTotal').val(`$ ${dot_separators(container.movements[movementID].paymentTotal)}`)
    $('#movementObservation').val(container.movements[movementID].observation)

    $(".classOut").prop('disabled',true)

    
    $('#saveMovement').on('click', async function () {
        let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
        let iva = Math.round(net * 0.19)
        let total = parseInt(net) + parseInt(iva)

        let movementData = {
            id: internals.dataRowSelected.id,
            movement: $('#movementType').val(),
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
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
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            //services: $('#movementService').val(),
            //paymentType: $('#movementPaymentType').val(),
            //paymentNumber: $('#movementPaymentNumber').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentNet: net,
            paymentIVA: iva,
            paymentTotal: total,
            observation: $('#movementObservation').val()
        }

//FALTA AGREGAR ALGÚN INDICAR DE ASOCIACIÓN (PRINCIPALMENTE INGRESOS-MOVIMIENTOS)
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
            $('#modal').modal('show');
        }
    })
})


$('#optionMovMovement').on('click', async function () {

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Traslado de Container`)
    $('#modalMov_body').html(createModalBody('TRASLADO'))

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-primary" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)
    $('#movementType').val('TRASLADO')
    $('#movementDate').val(moment().format('YYYY-MM-DD'))
    $('#movementTime').val(moment().format('HH:mm'))
    $('#movementClient').val(container.clients)
    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
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


    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
    $('#movementService').val(container.services[container.services.length-1].services) //MODIFICAR, NO ASOCIADO A MOVIMIENTO
    $('#movementPaymentType').val(container.services[container.services.length-1].paymentType),
    $('#movementPaymentNumber').val(container.services[container.services.length-1].paymentNumber),
    $('#movementPaymentAdvance').prop('checked',container.movements[movementID].paymentAdvance)
    $('#movementPaymentNet').val(`$ ${dot_separators(container.movements[movementID].paymentNet)}`)
    $('#movementPaymentIVA').val(`$ ${dot_separators(container.movements[movementID].paymentIVA)}`)
    $('#movementPaymentTotal').val(`$ ${dot_separators(container.movements[movementID].paymentTotal)}`)
    $('#movementObservation').val(container.movements[movementID].observation)

    $(".classMove").prop('disabled',true)
    
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
        $('#modal').modal('show');
    })
})


$('#optionDeconsolidatedMovement').on('click', async function () {

    let containerData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let container = containerData.data
    let movementID = internals.dataRowSelected.movementID

    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Desconsolidado de Container`)
    $('#modalMov_body').html(createModalBody('DESCONSOLIDADO'))
    setPositionList()

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
    $('#movementClient').val(container.clients)
    $('#movementContainerNumber').val(container.containerNumber)
    $('#movementContainerType').val(container.containertypes)
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
    $('#movementDriverRUT').val(container.movements[movementID].driverRUT)
    $('#movementDriverName').val(container.movements[movementID].driverName)
    $('#movementDriverPlate').val(container.movements[movementID].driverPlate)
    $('#movementDriverGuide').val(container.movements[movementID].driverGuide)
    $('#movementDriverSeal').val(container.movements[movementID].driverSeal)
    //$('#movementService').val(container.services[container.services.length-1].services) //MODIFICAR, NO ASOCIADO A MOVIMIENTO
    $('#movementPaymentType').val(container.services[container.services.length-1].paymentType),
    $('#movementPaymentNumber').val(container.services[container.services.length-1].paymentNumber),
    $('#movementPaymentAdvance').prop('checked',container.movements[movementID].paymentAdvance)
    $('#movementPaymentNet').val(`$ ${dot_separators(container.movements[movementID].paymentNet)}`)
    $('#movementPaymentIVA').val(`$ ${dot_separators(container.movements[movementID].paymentIVA)}`)
    $('#movementPaymentTotal').val(`$ ${dot_separators(container.movements[movementID].paymentTotal)}`)
    $('#movementObservation').val(container.movements[movementID].observation)

    updatePayment($('#movementService')) //Obtiene valor por defecto de traspaso

    $(".classMove").prop('disabled',true)
    $(".classPayment").prop('disabled',false)
    
    $('#saveMovement').on('click', async function () {

        let movementData = {
            id: internals.dataRowSelected.id,
            movement: 'DESCONSOLIDADO',
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },
            services: $('#movementService').val(),
            paymentType: $('#movementPaymentType').val(),
            paymentNumber: $('#movementPaymentNumber').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentNet: net,
            paymentIVA: iva,
            paymentTotal: total,
            observation: $('#movementObservation').val()
        }

        console.log(movementData)
        return

        
        let saveMovement = await axios.post('/api/movementSaveDeconsolidated', movementData)
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
        $('#modal').modal('show');
    })
})

$('#optionTransferMovement').on('click', function () { // TRASPASO MOVIMIENTO
    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Ingreso de Traspaso`)
    $('#modalMov_body').html(createModalBody('TRASPASO'))
    
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

    var element = document.getElementById('movementContainerNumber');
    var maskOptions = {
        mask: 'aaaa-000000-00',
        lazy: false //shows placeholder
    };
    var mask = IMask(element, maskOptions);

    $('#movementDriverRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
            getDriver(rut)
        }
    })

    $('#movementDriverOutRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
            getDriver(rut,true)
        }
    })
    updatePayment($('#movementService')) //Obtiene valor por defecto de traspaso
    

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

        let net = parseInt(replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', ''))
        let iva = Math.round(net * 0.19)
        let total = parseInt(net) + parseInt(iva)

        let movement = $('#movementType').val()
    
        let movementData = {
            movement: movement,
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            client: $('#movementClient').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            /*sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: parseInt($('#movementPositionPosition').val()),
                level: parseInt($('#movementPositionLevel').val())
            },*/
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            driverGuide: $('#movementDriverGuide').val(),
            driverSeal: $('#movementDriverSeal').val(),
            driverOutRUT: $('#movementDriverOutRUT').val(),
            driverOutName: $('#movementDriverOutName').val(),
            driverOutPlate: $('#movementDriverOutPlate').val(),
            driverOutGuide: $('#movementDriverOutGuide').val(),
            services: $('#movementService').val(),
            paymentType: $('#movementPaymentType').val(),
            paymentNumber: $('#movementPaymentNumber').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentNet: net,
            paymentIVA: iva,
            paymentTotal: total,
            observation: $('#movementObservation').val()
        }

        console.log(movementData)

        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementSaveTransfer', res.ok)
            console.log(saveMovement)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')

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
            $('#modal').modal('show');
        }

    })

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
        if(movementData.containerNumber==0){
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
        
        if(!validateRut(movementData.driverRUT)){
            errorMessage += '<br>RUT Chofer'
            $('#movementDriverRUT').css('border', '1px solid #E74C3C')
        }else{
            $('#movementDriverRUT').css('border', '1px solid #CED4DA')
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
        if(movementData.paymentNet){
            if(!$.isNumeric(movementData.paymentNet)){
                movementData.paymentNet = 0
                movementData.paymentIVA = 0
                movementData.paymentTotal = 0
            }
        }

        if (errorMessage.length===0) {
            return { ok: movementData }
            //resolve({ ok: movementData })
        } else {
            $(document).on('hidden.bs.modal', '.modal', function () { //Soluciona problema de scroll
                $('.modal:visible').length && $(document.body).addClass('modal-open');
           });

            $('#modal').modal('show');
            $('#modal_title').html(`Error al almacenar Ingreso`)
            $('#modal_body').html(`<h5 class="alert-heading">Falta ingresar los siguientes datos:</h5>
                                        <p class="mb-0">${errorMessage}</p>`)

            //resolve({ err: movementData })
            return { err: movementData }
        }
    //})
}

function createModalBody(type){
    let body = `
    <div class="row">

        <div class="col-md-10">
            <h5>DATOS GENERALES</h5>
            <button class="btn btn-primary" onclick="testing()">Rellenar</button>
        </div>

        <div class="col-md-2">
            <button id="btnHistory" class="btn btn-primary" onclick="showHistory()">Historial Mov.</button>
        </div>
        <div class="col-md-2">
            Movimiento
            <select id="movementType" class="custom-select classMove">
                <option value="POR INGRESAR">POR INGRESAR</option>
                <option value="INGRESADO">INGRESADO</option>
                <option value="TRASLADO">TRASLADO</option>
                <option value="POR SALIR">POR SALIR</option>
                <option value="SALIDA">SALIDA</option>
                <option value="TRASPASO">TRASPASO</option>
                <option value="DESCONSOLIDADO">DESCONSOLIDADO</option>
            </select>
        </div>
        <div class="col-md-2">
            Fecha
            <input id="movementDate" type="date" class="form-control border-input" value="${moment().format('YYYY-MM-DD')}">
        </div>
        <div class="col-md-2">
            Hora
            <input id="movementTime" type="text" class="form-control border-input" value="${moment().format('HH:mm')}">
        </div>
        <div class="col-md-5">
            Cliente
            <select id="movementClient" class="custom-select classOut classMove">
                <option value="0">SELECCIONE...</option>
                ${                      
                    clients.reduce((acc,el)=>{
                        acc += '<option value="'+el._id+'">'+el.name+'</option>'
                        return acc
                    },'')
                }
            </select>
        </div>
        <div class="col-md-1">
            <br/>
            <button class="btn btn-dark classOut classMove" onclick="selectClient()" title="Buscar Cliente"><i class="fas fa-search"></i></button>
        </div>

        <div class="col-md-12">
            <br/>
            <h5>DATOS CONTAINER</h5>
        </div>

        <div class="col-md-9">
            <div class="row">
                <div class="col-md-7">
                    Número Container
                    <input id="movementContainerNumber" type="text" placeholder="Ej: 126170-0" class="form-control border-input classOut classMove">
                </div>
                <div class="col-md-2">
                    Largo
                    <select id="movementContainerLarge" class="custom-select classOut classMove">
                        <option value="20">20</option>
                        <option value="40">40</option>
                        <option value="40H">40H</option>
                        <option value="101">101</option>
                        <option value="105">105</option>
                    </select>
                </div>
                <div class="col-md-3">
                    Tipo
                    <select id="movementContainerType" class="custom-select classOut classMove" onchange="changeTexture('type')">
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

        body += `<div class="form-check col-md-2">
                    <br/>
                    <input class="form-check-input classMove" type="checkbox" value="" id="movementStacker">
                    <label class="form-check-label" for="flexCheckDefault">
                        Ingresa Stacker
                    </label>
                </div>
                <div class="col-md-2">
                    Grúa
                    <select id="movementCrane" class="custom-select classStacker">
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
                        <select id="movementSiteOld" class="custom-select classMove">
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
                        <select id="movementPositionRowOld" class="custom-select classMove">
                            <option value="0">SEL</option>
                        </select>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="col-md-2" style="text-align: center">
                        Posición
                        <select id="movementPositionPositionOld" class="custom-select classMove">
                            <option value="0">SEL</option>   
                        </select>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="col-md-2" style="text-align: center">
                        Altura
                        <select id="movementPositionLevelOld" class="custom-select classMove" style="text-align: center">
                            <option value="0">SEL</option>  
                        </select>
                        <i class="fas fa-chevron-down"></i>
                    </div>

                    <div class="col-md-4">
                    </div>
                    <div class="col-md-2">
                        <select id="movementSite" class="custom-select classOut">
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
                        <select id="movementPositionRow" class="custom-select classOut">
                            <option value="0">SEL</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select id="movementPositionPosition" class="custom-select classOut">
                            <option value="0">SEL</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select id="movementPositionLevel" class="custom-select classOut">
                            <option value="0">SEL</option>
                        </select>
                    </div>`

        }else{
            body += `<div class="col-md-2">
                        Paño
                        <select id="movementSite" class="custom-select classOut classStacker">
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
                        <select id="movementPositionRow" class="custom-select classOut classStacker">
                            <option value="0">SEL</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        Posición
                        <select id="movementPositionPosition" class="custom-select classOut classStacker">
                            <option value="0">SEL</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        Altura
                        <select id="movementPositionLevel" class="custom-select classOut classStacker">
                            <option value="0">SEL</option>
                        </select>
                    </div>`
        
        }
    
        
    }else{
        body += `<div class="form-check col-md-2">
                    <br/>
                    <input class="form-check-input classMove" type="checkbox" value="" id="movementStacker">
                    <label class="form-check-label" for="flexCheckDefault">
                        Ingresa Stacker
                    </label>
                </div>
                <div class="col-md-3">
                    Grúa
                    <select id="movementCrane" class="custom-select classStacker">
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
            <button class="btn btn-dark classOut classMove" data-toggle="collapse" data-target="#tableTextures">Cambiar&nbsp;<i class="fas fa-caret-down"></i></button>
            <img id="imgTexture" src="/public/img/textures/cai.jpg" style="width: 50px; border: 3px solid #AAB3B4;" value="${containerTypes[0].texture}">

            ${ getTextureTable(containerTypes)}
            
        </div>`
        
    if(type=='TRASPASO'){
        body += `<div class="col-md-12">
                    <br/ >
                    <h5>DATOS DE CONDUCTORES</h5>
                </div>
                <div class="col-md-1">
                    Conductor Entrada
                </div>
                <div class="col-md-2" style="text-align: center">
                    RUT
                    <input id="movementDriverRUT" type="text" placeholder="11.111.111-0" class="form-control border-input classMove">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="col-md-3" style="text-align: center">
                    Nombre
                    <input id="movementDriverName" type="text" placeholder="JUANITO PEREZ" class="form-control border-input classMove">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="col-md-2" style="text-align: center">
                    Placa Patente
                    <input id="movementDriverPlate" type="text" placeholder="ABCD12" class="form-control border-input classMove">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="col-md-2" style="text-align: center">
                    Guía Despacho
                    <input id="movementDriverGuide" type="text" placeholder="N°" class="form-control border-input classMove">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="col-md-2">
                    Sello Container
                    <input id="movementDriverSeal" type="text" placeholder="N°" class="form-control border-input classMove">
                </div>

                <div class="col-md-1">
                    Conductor Salida
                </div>
                <div class="col-md-2" style="text-align: center">
                    <input id="movementDriverOutRUT" type="text" placeholder="11.111.111-0" class="form-control border-input classMove">
                </div>
                <div class="col-md-3" style="text-align: center">
                    <input id="movementDriverOutName" type="text" placeholder="JUANITO PEREZ" class="form-control border-input classMove">
                </div>
                <div class="col-md-2" style="text-align: center">
                    <input id="movementDriverOutPlate" type="text" placeholder="ABCD12" class="form-control border-input classMove">
                </div>
                <div class="col-md-2" style="text-align: center">
                    <input id="movementDriverOutGuide" type="text" placeholder="N°" class="form-control border-input classMove">
                </div>`
    }else{
        body += `<div class="col-md-12">
                    <br/ >
                    <h5>DATOS DE CONDUCTOR</h5>
                </div>
                <div class="col-md-2">
                    RUT
                    <input id="movementDriverRUT" type="text" placeholder="11.111.111-0" class="form-control border-input classMove">
                </div>
                <div class="col-md-3">
                    Nombre
                    <input id="movementDriverName" type="text" placeholder="JUANITO PEREZ" class="form-control border-input classMove">
                </div>
                <div class="col-md-2">
                    Placa Patente
                    <input id="movementDriverPlate" type="text" placeholder="ABCD12" class="form-control border-input classMove">
                </div>
                <div class="col-md-2">
                    Guía Despacho
                    <input id="movementDriverGuide" type="text" placeholder="N°" class="form-control border-input classMove">
                </div>
                <div class="col-md-2">
                    Sello Container
                    <input id="movementDriverSeal" type="text" placeholder="N°" class="form-control border-input classMove">
                </div>`
    }

    body += `<div class="col-md-12">
            <br/ >
            <h5>DATOS DE PAGO</h5>
        </div>
        <div class="form-check col-md-3">
            <input class="form-check-input classMove" type="checkbox" value="" id="movementPaymentAdvance">
            <label class="form-check-label" for="flexCheckDefault">
                PAGO ANTICIPADO
            </label>
        </div>
        <div class="col-md-3">
            Tipo de Pago
            <select id="movementPaymentType" class="custom-select classMove classPayment">
                <option value="0">SELECCIONAR</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="REDCOMPRA">REDCOMPRA</option>
            </select>
            <input id="movementPaymentNumber" type="text" class="form-control border-input classMove classPayment" placeholder="N° Transacción">

        </div>
        <div class="col-md-3">
            Servicio`
            if(type=='TRASPASO'){
                body += `<select id="movementService" class="custom-select classMove" onchange="updatePayment(this)" disabled>
                    ${                      
                        services.reduce((acc,el)=>{
                            if(el.name=='Traspaso'){
                                acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                            }
                            return acc
                        },'')
                    }
                </select>`
            }else if(type=='DESCONSOLIDADO'){
                console.log('here')
                body += `<select id="movementService" class="custom-select classMove" onchange="updatePayment(this)" disabled>
                    ${                      
                        services.reduce((acc,el)=>{
                            if(el.name=='Desconsolidado'){
                                acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                            }
                            return acc
                        },'')
                    }
                </select>`
            }else{
                body += `<select id="movementService" class="custom-select classMove" onchange="updatePayment(this)">
                    <option value="0" data-net="0">SELECCIONAR</option>
                    ${                      
                        services.reduce((acc,el)=>{
                            if(el.name!='Traspaso'){
                                acc += '<option value="'+el._id+'" data-net="'+el.net+'">'+el.name+'</option>'
                            }
                            return acc
                        },'')
                    }
                </select>`
            }
        body += `</div>
        <div class="col-md-3">
            VALOR
            <input id="movementPaymentNet" type="text" style="text-align: right" value="$ 0" class="form-control border-input classMove classPayment" onkeyup="updatePayment()">
            <input id="movementPaymentIVA" type="text" style="text-align: right" value="$ 0" class="form-control border-input classMove classPayment">
            <input id="movementPaymentTotal" type="text" style="text-align: right" value="$ 0" class="form-control border-input classMove classPayment">
        </div>
        <br/ >


        
        <div class="form-group col-md-12">
            <h4 class="card-title">&nbsp;Observaciones</h4>
            <textarea id="movementObservation" placeholder="EJEMPLO: CONTENEDOR DAÑADO" class="form-control" rows="5"></textarea>
        </div>

    </div>
`
    return body
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

async function updatePayment(service) {

    if(service){
        $('#movementPaymentNet').val($(service).find(":selected").attr('data-net'))
    }

    new Cleave('#movementPaymentNet', {
        prefix: '$ ',
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        numeralDecimalScale: 0,
        numeralPositiveOnly: true,
        numeralDecimalMark: ",",
        delimiter: "."
    })

    let net = replaceAll($('#movementPaymentNet').val(), '.', '').replace('$', '').replace(' ', '')
    let iva = Math.round(net * 0.19)
    let total = parseInt(net) + parseInt(iva)

    $('#movementPaymentIVA').val(`$ ${dot_separators(iva)}`)
    $('#movementPaymentTotal').val(`$ ${dot_separators(total)}`)
}


async function selectClient(btn) {
    
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
                        sSearch: 'buscar: '
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
                        //$(row).find('td:eq(1)').html(dot_separators(data.value));
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
                        internals.clients.table.$('tr.selected').removeClass('selected');
                        $(this).addClass('selected');
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

                console.log("selected", clientSelected)
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
    }
}

async function getClients(){
    let clientData = await axios.get('api/clients')
    if (clientData.data.length > 0) {
        internals.clients.table.rows.add(clientData.data).draw()
    }
}

async function getDriver(rut,out){
    console.log(rut)
    let driver = await axios.post('api/driverSingle', {rut: rut})
    console.log(driver.data)
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

async function showHistory(){

    let containerFullData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let containerFull = containerFullData.data
    let movementActualID = internals.dataRowSelected.movementID

    console.log(containerFull)


    $('#extraModal').modal('show');
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

async function printVoucher(type,id) {


    let movement = await axios.post('api/movementVoucher', {id: id, type: type})
    let voucher = movement.data

    console.log(voucher)

    //TESTING//
    if(!voucher.driverGuide) voucher.driverGuide='0'
    if(!voucher.driverSeal) voucher.driverSeal='0'

    //let doc = new jsPDF('p', 'pt', 'letter')
    let doc = new jsPDF('p', 'pt', [302, 451])

    let pdfX = 20
    let pdfY = 20

    doc.setFontSize(10)

    doc.addImage(logoImg, 'PNG', pdfX, pdfY, 120, 60)
    pdfY += 60
    doc.text(`DEPÓSITO CONTENEDORES DDMC LTDA.`, pdfX, pdfY + 20)
    doc.text(`Los Aromos 451 Aguas Buenas - San Antonio`, pdfX, pdfY + 30)

    doc.setFontSize(12)
    doc.setFontType('bold')
    if(type=="in"){
        doc.text(`INGRESO N°: ------`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
    }else if(type=="out"){
        doc.text(`SALIDA N°: ------`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
    }else if(type=="transferIn"){
        doc.text(`ENTRADA TRASPASO N°: ------`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
    }else if(type=="transferOut"){
        doc.text(`SALIDA TRASPASO N°: ------`, doc.internal.pageSize.width/2, pdfY + 45, 'center')
    }

    pdfY += 65

    doc.text(voucher.containerNumber, pdfX + 75, pdfY + 2)

    doc.setFontSize(10)
    doc.setFontType('normal')
    doc.text(`Contenedor`, pdfX, pdfY)
    doc.text(`Tipo`, pdfX, pdfY + 15)
    doc.text(`Llegada`, pdfX, pdfY + 25)
    doc.text(`Salida`, pdfX, pdfY + 35)
    doc.text(`Tracto`, pdfX, pdfY + 45)
    doc.text(`Guía`, pdfX, pdfY + 55)
    doc.text(`Sello`, pdfX, pdfY + 65)
    doc.text(`Conductor`, pdfX, pdfY + 75)
    doc.text(`RUT`, pdfX, pdfY + 85)
    doc.text(voucher.clientName.toUpperCase(), pdfX, pdfY + 95)
    doc.text(`Ubicación`, pdfX, pdfY + 105)

    doc.text(voucher.containerLarge, pdfX + 75, pdfY + 15)
    doc.text(moment(voucher.datetimeIn).format('DD/MM/YYYY HH:mm'), pdfX + 75, pdfY + 25)
    if(type=="in"){
        doc.text('-', pdfX + 75, pdfY + 35)
    }else{
        doc.text(moment(voucher.datetimeOut).format('DD/MM/YYYY HH:mm'), pdfX + 75, pdfY + 35)
    }
    
    doc.text(voucher.driverPlate, pdfX + 75, pdfY + 45)
    doc.text(voucher.driverGuide, pdfX + 75, pdfY + 55)
    doc.text(voucher.driverSeal, pdfX + 75, pdfY + 65)
    doc.text(voucher.clientRUT, pdfX + 75, pdfY + 75)
    doc.text(voucher.clientName, pdfX + 75, pdfY + 85)
    doc.text('', pdfX + 75, pdfY + 105)


    //doc.text(pdfX + 230, pdfY + 30, `Estado: ${internals.newSale.status}`, { align: 'center' }) // status right
    //doc.text(pdfX + 230, pdfY + 45, `Fecha: ${moment(auxHourPdf).format('DD/MM/YYYY HH:mm')}`, { align: 'center' }) // creationDate right
    pdfY += 115

    doc.setLineWidth(0.5)
    doc.line(pdfX, pdfY, pdfX + 220, pdfY)

    
    doc.text(`NETO`, pdfX, pdfY + 25)
    doc.text(`IVA`, pdfX, pdfY + 35)
    doc.text(`TOTAL`, pdfX, pdfY + 45)

    doc.text(voucher.service, pdfX, pdfY + 15)
    doc.text(dot_separators(voucher.net), pdfX + 150, pdfY + 25, 'right')
    doc.text(dot_separators(voucher.iva), pdfX + 150, pdfY + 35, 'right')
    //doc.text(pdfX + 100, pdfY + 45, dot_separators(voucher.total), 'right')
    doc.text(dot_separators(voucher.total), pdfX + 150, pdfY + 45, 'right')

    pdfY += 55

    doc.setLineWidth(0.5)
    doc.line(pdfX, pdfY, pdfX + 220, pdfY)


    /*doc.setFontType('normal')
    doc.text(pdfX + 380, pdfY + 60, 'TOTAL:')
    doc.text(pdfX + 450, pdfY + 60, '$')
    doc.setFontType('bold')
    doc.setFontSize(12)
    //doc.text(pdfX + 470, pdfY + 60, dot_separators(internals.newSale.total))
    var subtotalvar =  dot_separators(internals.newSale.total) 
    var textWidth = doc.getStringUnitWidth(subtotalvar) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = doc.internal.pageSize.width - textWidth - 50;
    doc.text(textOffset, pdfY + 60, subtotalvar);
*/

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    //doc.save(`Nota de venta ${internals.newSale.number}.pdf`)
}

function testing(){
    $('#movementClient').val('61b88ccdeb77f0bf62cb74b3')
    $('#movementContainerNumber').val('HASU-751000-1')
    $('#imgTexture').prop('src','/public/img/textures/cai.jpg')
    $('#imgTexture').val('cai')
    //$('#movementCrane').val('61d5e3abf5ffd3251426d08e')
    //$('#movementSite').val('61d5e360f5ffd3251426d08a')
    //$('#movementPositionRow').val('B')
    //$('#movementPositionPosition').val('4')
    //$('#movementPositionLevel').val('1')
    $('#movementDriverRUT').val('6-K')
    $('#movementDriverName').val('KEN BLOCK')
    $('#movementDriverPlate').val('FJDJ67')
    $('#movementDriverGuide').val('0')
    $('#movementDriverSeal').val('0')
    $('#movementPaymentType').val('REDCOMPRA')
    $('#movementPaymentNumber').val('AAA111')
    //$('#movementService').val('61d867aaf5ffd3251426d0cb')
}