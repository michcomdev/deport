let internals = {
    movements: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

let clients = {}
let containerTypes = {}
let sites = {}
let cranes = {}

$(document).ready(async function () {
    chargeMovementTable()
    getParameters()
})

async function getParameters() {
    let clientsData = await axios.get('api/clients')
    clients = clientsData.data

    let containerTypesData = await axios.get('api/containerTypes')
    containerTypes = containerTypesData.data
    
    let sitesData = await axios.get('api/sites')
    sites = sitesData.data

    let cranesData = await axios.get('api/cranes')
    cranes = cranesData.data

    let mapsData = await axios.get('api/maps')
    maps = mapsData.data
    console.log(maps)
}

function chargeMovementTable() {
    try {
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
            { data: 'client' },
            { data: 'containerInitials' },
            { data: 'containerNumber' },
            { data: 'containerType' },
            { data: 'containerLarge' },
            { data: 'position' },
            { data: 'driverName' },
            { data: 'driverPlate' }
          ],
          initComplete: function (settings, json) {
            getMovementsEnabled()
          }
        })

        $('#tableMovements tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModMovement').prop('disabled', true)
                $('#optionDeleteMovement').prop('disabled', true)
                $('#optionCloseMovement').prop('disabled', true)
            } else {
                console.log(internals.movements.table.row($(this)).data())
                internals.movements.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#optionModMovement').prop('disabled', false)
                $('#optionDeleteMovement').prop('disabled', false)
                //internals.movements.data = internals.movements.table.row($(this)).data()
                internals.dataRowSelected = internals.movements.table.row($(this)).data()
                if(internals.dataRowSelected.movement=='INGRESO'){
                    $('#optionCloseMovement').prop('disabled', false)
                }else{
                    $('#optionCloseMovement').prop('disabled', true)
                }
            }
        })
      } catch (error) {
        console.log(error)
      }

}

async function getMovementsEnabled() {
    let movementData = await axios.get('api/movementsTable')

    if (movementData.data.length > 0) {
        let formatData= movementData.data.map(el => {
            el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')

            return el
        })

        internals.movements.table.rows.add(formatData).draw()
        $('#loadingMovements').empty()
    } else {
        console.log('vacio', movementData);
        toastr.warning('No se han encontrado datos de usuarios')
        $('#loadingMovements').empty()
    }
}

$('#optionCreateMovement').on('click', function () { // CREAR MOVIMIENTO
    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Nuevo Ingreso`)
    $('#modalMov_body').html(createModalBody())

    $('#modalMov_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    
    $('#movementDriverRUT').on('keyup', function () {
        return
        let rut = $('#movementDriverRUT').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#movementDriverRUT').val(rutFunc($('#movementDriverRUT').val()))
        }
    })

    $('#saveMovement').on('click', async function () {
        let movementData = {
            movement: $('#movementType').val(),
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            client: $('#movementClient').val(),
            code: $('#movementCode').val(),
            containerInitials: $('#movementContainerInitials').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: $('#movementPositionPosition').val(),
                level: $('#movementPositionLevel').val(),
            },
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentValue: $('#movementPaymentValue').val(),
            observation: $('#movementObservation').val()
        }

        const res = validateMovementData(movementData)
        if(res.ok){
            let saveMovement = await axios.post('/api/movementSave', res.ok)
            console.log(saveMovement)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Contenedor almacenado correctamente</h5>`)
                    //chargeMovementTable()
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
    console.log('rowselected',internals.dataRowSelected)
    console.log('id',internals.dataRowSelected.id)

    let movementData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let movement = movementData.data
    console.log(movement)

    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Modifica Ingreso`)
    $('#modalMov_body').html(createModalBody())

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementType').val(movement.movement)
    $('#movementDate').val(moment(movement.datetime).format('YYYY-MM-DD'))
    $('#movementTime').val(moment(movement.datetime).format('HH:mm'))
    $('#movementClient').val(movement.clients)
    $('#movementCode').val(movement.code)
    $('#movementContainerInitials').val(movement.containerInitials)
    $('#movementContainerNumber').val(movement.containerNumber)
    $('#movementContainerType').val(movement.containertypes)
    $('#imgTexture').prop('src','/public/img/textures/'+movement.containerTexture+'.jpg')
    $('#imgTexture').val(movement.containerTexture)
    $('#movementContainerLarge').val(movement.containerLarge)
    $('#movementCrane').val(movement.cranes)
    $('#movementSite').val(movement.sites)
    $('#movementPositionRow').val(movement.position.row)
    $('#movementPositionPosition').val(movement.position.position)
    $('#movementPositionLevel').val(movement.position.level)
    $('#movementDriverRUT').val(movement.driverRUT)
    $('#movementDriverName').val(movement.driverName)
    $('#movementDriverPlate').val(movement.driverPlate)
    $('#movementPaymentAdvance').prop('checked',movement.paymentValue)
    $('#movementPaymentValue').val(movement.paymentValue)
    $('#movementObservation').val(movement.observation)

    
    $('#saveMovement').on('click', async function () {
        let movementData = {
            id: internals.dataRowSelected.id,
            movement: $('#movementType').val(),
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            client: $('#movementClient').val(),
            code: $('#movementCode').val(),
            containerInitials: $('#movementContainerInitials').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: $('#movementPositionPosition').val(),
                level: $('#movementPositionLevel').val(),
            },
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentValue: $('#movementPaymentValue').val(),
            observation: $('#movementObservation').val()
        }

        console.log(movementData)

        const res = validateMovementData(movementData)
        if(res.ok){
            console.log(res.ok)
            let saveMovement = await axios.post('/api/movementUpdate', res.ok)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                    //chargeMovementTable()
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

$('#optionCloseMovement').on('click', async function () {
    console.log('rowselected',internals.dataRowSelected)
    console.log('id',internals.dataRowSelected.id)

    let movementData = await axios.post('/api/movementSingle', {id: internals.dataRowSelected.id})
    let movement = movementData.data
    console.log(movement)

    $('#movementsModal').modal('show');
    $('#modalMov_title').html(`Dar Salida`)
    $('#modalMov_body').html(createModalBody())

    $('#modalMov_footer').html(`
         <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#E74C3C;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementType').val('SALIDA')
    $('#movementType option[value="INGRESO"]').prop('disabled',true)
    $('#movementType option[value="POR INGRESAR"]').prop('disabled',true)
    $('#movementDate').val(moment().format('YYYY-MM-DD'))
    $('#movementTime').val(moment().format('HH:mm'))
    $('#movementClient').val(movement.clients)
    $('#movementCode').val(movement.code)
    $('#movementContainerInitials').val(movement.containerInitials)
    $('#movementContainerNumber').val(movement.containerNumber)
    $('#movementContainerType').val(movement.containertypes)
    $('#imgTexture').prop('src','/public/img/textures/'+movement.containerTexture+'.jpg')
    $('#imgTexture').val(movement.containerTexture)
    $('#movementContainerLarge').val(movement.containerLarge)
    $('#movementCrane').val(movement.cranes)
    $('#movementSite').val(movement.sites)
    $('#movementPositionRow').val(movement.position.row)
    $('#movementPositionPosition').val(movement.position.position)
    $('#movementPositionLevel').val(movement.position.level)
    $('#movementDriverRUT').val(movement.driverRUT)
    $('#movementDriverName').val(movement.driverName)
    $('#movementDriverPlate').val(movement.driverPlate)
    $('#movementPaymentAdvance').prop('checked',movement.paymentValue)
    $('#movementPaymentValue').val(movement.paymentValue)
    $('#movementObservation').val(movement.observation)

    $(".classOut").prop('disabled',true)

    
    $('#saveMovement').on('click', async function () {
        let movementData = {
            //id: internals.dataRowSelected.id,
            movement: $('#movementType').val(),
            datetime: $('#movementDate').val() + ' ' + $('#movementTime').val(),
            client: $('#movementClient').val(),
            code: $('#movementCode').val(),
            containerInitials: $('#movementContainerInitials').val(),
            containerNumber: $('#movementContainerNumber').val(),
            containerType: $('#movementContainerType').val(),
            containerTexture: $('#imgTexture').val(),
            containerLarge: $('#movementContainerLarge').val(),
            cranes: $('#movementCrane').val(),
            sites: $('#movementSite').val(),
            position: {
                row: $('#movementPositionRow').val(),
                position: $('#movementPositionPosition').val(),
                level: $('#movementPositionLevel').val(),
            },
            driverRUT: $('#movementDriverRUT').val(),
            driverName: $('#movementDriverName').val(),
            driverPlate: $('#movementDriverPlate').val(),
            paymentAdvance: $('#movementPaymentAdvance').is(":checked"),
            paymentValue: $('#movementPaymentValue').val(),
            observation: $('#movementObservation').val()
        }

        console.log(movementData)
//FALTA AGREGAR ALGÚN INDICAR DE ASOCIACIÓN (PRINCIPALMENTE INGRESOS-MOVIMIENTOS)
        const res = validateMovementData(movementData)
        if(res.ok){
            console.log(res.ok)
            let saveMovement = await axios.post('/api/movementSave', res.ok)
            if(saveMovement.data){
                if(saveMovement.data._id){
                    $('#movementsModal').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Datos actualizados correctamente</h5>`)
                    //chargeMovementTable()
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
        if(movementData.containerInitials==0){
            errorMessage += '<br>Código Propietario'
            $('#movementContainerInitials').css('border', '1px solid #E74C3C')
        }else{
            $('#movementContainerInitials').css('border', '1px solid #CED4DA')
        }
        if(movementData.containerNumber==0){
            errorMessage += '<br>Número Container'
            $('#movementContainerNumber').css('border', '1px solid #E74C3C')
        }else{
            $('#movementContainerNumber').css('border', '1px solid #CED4DA')
        }
        if(movementData.cranes==0){
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
        }
        
        if(movementData.driverRUT==0){
            errorMessage += '<br>RUT Chofer'
            $('#movementDriverRUT').css('border', '1px solid #E74C3C')
        }else{
            $('#movementDriverRUT').css('border', '1px solid #CED4DA')
        }
        if(movementData.driverName==0){
            errorMessage += '<br>Nombre Chofer'
            $('#movementDriverName').css('border', '1px solid #E74C3C')
        }else{
            $('#movementDriverName').css('border', '1px solid #CED4DA')
        }
        if(movementData.driverPlate==0){
            errorMessage += '<br>Patente Camión'
            $('#movementDriverPlate').css('border', '1px solid #E74C3C')
        }else{
            $('#movementDriverPlate').css('border', '1px solid #CED4DA')
        }
        if(movementData.driverPlate){
            if(!$.isNumeric(movementData.driverPlate)){
                movementData.paymentValue = 0
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

function createModalBody(){
    let body = `
    <div class="row">

        <div class="col-md-12">
            <h5>DATOS GENERALES</h5>
            <button class="btn btn-primary" onclick="testing()">Rellenar</button>
        </div>

        <div class="col-md-2">
            Movimiento
            <select id="movementType" class="custom-select">
                <option value="INGRESO">INGRESO</option>
                <option value="SALIDA">SALIDA</option>
                <option value="POR INGRESAR">POR INGRESAR</option>
                <option value="POR SALIR">POR SALIR</option>
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
        <div class="col-md-4">
            Cliente
            <select id="movementClient" class="custom-select classOut">
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
            Código
            <input id="movementCode" type="text" placeholder="ABC123" class="form-control border-input">
        </div>


        <div class="col-md-12">
            <br/>
            <h5>DATOS CONTAINER</h5>
        </div>

        <div class="col-md-9">
            <div class="row">
                <div class="col-md-3">
                    Código propietario
                    <input id="movementContainerInitials" type="text" placeholder="Ej: HASU" class="form-control border-input classOut">
                </div>
                <div class="col-md-4">
                    Número Container
                    <input id="movementContainerNumber" type="text" placeholder="Ej: 126170-0" class="form-control border-input classOut">
                </div>
                <div class="col-md-2">
                    Largo
                    <select id="movementContainerLarge" class="custom-select classOut">
                        <option value="20">20</option>
                        <option value="40">40</option>
                        <option value="40H">40H</option>
                        <option value="101">101</option>
                        <option value="105">105</option>
                    </select>
                </div>
                <div class="col-md-3">
                    Tipo
                    <select id="movementContainerType" class="custom-select classOut" onchange="changeTexture('type')">
                        <option value="61d70f00f5ffd3251426d0a5" data-texture="cai">GENÉRICO</option>
                        ${                      
                            containerTypes.reduce((acc,el)=>{
                                acc += '<option value="'+el._id+'" data-texture="'+el.texture+'">'+el.name+'</option>'
                                return acc
                            },'')
                        }
                    </select>
                </div>

                <div class="col-md-3">
                    Grúa
                    <select id="movementCrane" class="custom-select">
                        <option value="0">SELECCIONE...</option>
                        ${                      
                            cranes.reduce((acc,el)=>{
                                acc += '<option value="'+el._id+'">'+el.name+'</option>'
                                return acc
                            },'')
                        }
                    </select>
                </div>
                <div class="col-md-3">
                    Sitio
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
                    Fila
                    <select id="movementPositionRow" class="custom-select classOut">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                    </select>
                </div>
                <div class="col-md-2">
                    Posición
                    <select id="movementPositionPosition" class="custom-select classOut">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                    </select>
                </div>
                <div class="col-md-2">
                    Altura
                    <select id="movementPositionLevel" class="custom-select classOut">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            Color
            <br/>
            <button class="btn btn-dark classOut" data-toggle="collapse" data-target="#tableTextures">Cambiar&nbsp;<i class="fas fa-caret-down"></i></button>
            <img id="imgTexture" src="/public/img/textures/cai.jpg" style="width: 50px; border: 3px solid #AAB3B4;" value="${containerTypes[0].texture}">

            ${ getTextureTable(containerTypes)}
            
        </div>
        
        
        
        

        <div class="col-md-12">
            <br/ >
            <h5>DATOS DE CONDUCTOR</h5>
        </div>
        <div class="col-md-3">
            RUT
            <input id="movementDriverRUT" type="text" placeholder="11.111.111-0" class="form-control border-input">
        </div>
        <div class="col-md-4">
            Nombre
            <input id="movementDriverName" type="text" placeholder="JUANITO PEREZ" class="form-control border-input">
        </div>
        <div class="col-md-4">
            Placa Patente
            <input id="movementDriverPlate" type="text" placeholder="ABCD12" class="form-control border-input">
        </div>
        

        <div class="col-md-12">
            <br/ >
            <h5>DATOS DE PAGO</h5>
        </div>
        <div class="form-check col-md-6">
            <input class="form-check-input" type="checkbox" value="" id="movementPaymentAdvance">
            <label class="form-check-label" for="flexCheckDefault">
                PAGO ANTICIPADO
            </label>
        </div>
        <div class="col-md-6">
            VALOR
            <input id="movementPaymentValue" type="text" placeholder="$22.000" class="form-control border-input">
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


function testing(){
    $('#movementClient').val('61b88ccdeb77f0bf62cb74b3')
    $('#movementContainerInitials').val('ASD')
    $('#movementContainerNumber').val('QWE')
    $('#movementCrane').val('61d5e3abf5ffd3251426d08e')
    $('#movementSite').val('61d5e360f5ffd3251426d08a')
    $('#movementPositionRow').val('B')
    $('#movementPositionPosition').val('4')
    $('#movementPositionLevel').val('1')
    $('#movementDriverRUT').val('6-K')
    $('#movementDriverName').val('KEN BLOCK')
    $('#movementDriverPlate').val('FJDJ67')
}