let internals = {
    clients: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

$(document).ready(async function () {
    chargeClientsTable()
})

function chargeClientsTable() {
    try {

        if($.fn.DataTable.isDataTable('#tableClients')){
            internals.clients.table.clear().destroy()
        }

        internals.clients.table = $('#tableClients')
        .DataTable( {
            dom: 'Bfrtip',
            buttons: [
              'excel'
            ],
            iDisplayLength: 50,
            oLanguage: {
              sSearch: 'Buscar: '
            },
            responsive: false,
            order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'rut' },
            { data: 'name' },
            { data: 'email' },
            { data: 'status' },
            { data: 'debt' }
          ],
          initComplete: function (settings, json) {
            getClientsEnabled()
          }
        })

        $('#tableClients tbody').off("click")

        $('#tableClients tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModClient').prop('disabled', true)
                $('#optionDeleteClient').prop('disabled', true)
            } else {
                internals.clients.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#optionModClient').prop('disabled', false)
                $('#optionDeleteClient').prop('disabled', false)
                internals.clients.data = internals.clients.table.row($(this)).data()
                internals.dataRowSelected = internals.clients.table.row($(this)).data()
            }
        })
      } catch (error) {
        console.log(error)
      }

}

// function cleanData(data) {
//     data.rut = ktoK(cleanRut(data.rut))

//     return data
// }

async function getClientsEnabled() {
    let clientData = await axios.get('api/clients')
    
    if (clientData.data.length > 0) {
        let formatData= clientData.data.map(el => {
            el.rut = el.rut

            if (el.status == 'enabled') {
                el.status = 'Activo'
            } else {
                el.status = 'Desactivado'
            }

            return el
        })

        internals.clients.table.rows.add(formatData).draw()
        $('#loadingClients').empty()
    } else {
        toastr.warning('No se han encontrado datos de clientes')
        $('#loadingClients').empty()
    }
}

$('#optionCreateClient').on('click', function () { // CREAR CLIENTE

    $('#modalClient').modal('show');
    $('#modalClient_title').html(`Nuevo Cliente`)
    $('#modalClient_body').html(setModal())

    $('#modalClient_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-primary" id="saveClient">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    $('#clientRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
        }
    })

    setTimeout(() => {
        $('#clientRUT').focus()
    }, 500)

    $('#saveClient').on('click', async function () {
        let clientData = {
            //rut: removeExtraSpaces($('#clientRUT').val()),
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
                    chargeClientsTable()
                
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
            $('#modal').modal('show');

        }

    });

});

$('#optionDeleteClient').on('click', function () {
    swal.fire({
        title: '{{ lang.deleteClient.swalDeleteTitle }}',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        confirmButtonText: '{{ lang.deleteClient.swalConfirmButtonText }}',
        cancelButtonText: '{{ lang.deleteClient.swalCancelButtonText }}',
    }).then((result) => {
        if (result.value) {
            ajax({
                url: 'api/client',
                type: 'DELETE',
                data: {
                    _id: internals.dataRowSelected._id
                }
            }).then(res => {
                if (res.err) {
                    toastr.warning(res.err)
                } else if (res.ok) {
                    $('#optionModClient').prop('disabled', true)
                    $('#optionDeleteClient').prop('disabled', true)

                    toastr.success('{{ lang.deleteClient.swalToastrOK }}')

                    datatableClients
                        .row(clientRowSelected)
                        .remove()
                        .draw()

                }
            })
        }
    })
})

$('#optionModClient').on('click', async function () { // CREAR CLIENTE

    let clientData = await axios.post('/api/clientSingle', {id: internals.dataRowSelected._id})
    let client = clientData.data
    $('#modalClient').modal('show');
    $('#modalClient_title').html(`Modifica Cliente`)
    $('#modalClient_body').html(setModal())

    $('#modalClient_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-primary" id="saveClient">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    $('#clientRUT').on('keyup', function () {
        let rut = validateRut($(this).val())
        if(rut){
            $(this).val(rut)
        }
    })

    $('#clientRUT').val(client.rut)
    $('#clientName').val(client.name)
    $('#clientNameFull').val(client.nameFull)
    $('#clientEmail').val(client.email)
    $('#clientContact').val(client.contact)
    $('#clientContactPhone').val(client.contactPhone)
    $('#clientStatus').val(client.status)
    $('#clientCredit').prop('checked',client.credit)
    $('#serviceStorage').prop('checked',client.services.storage)
    $('#serviceDeconsolidated').prop('checked',client.services.deconsolidated)
    $('#servicePortage').prop('checked',client.services.portage)
    $('#serviceTransport').prop('checked',client.services.transport)

    setTimeout(() => {
        $('#clientRUT').focus()
    }, 500)

    $('#saveClient').on('click', async function () {
        let clientData = {
            id: internals.dataRowSelected._id,
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
            let saveClient = await axios.post('/api/clientUpdate', clientData)

            if(saveClient.data){
                if(saveClient.data._id){
                    $('#modalClient').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Cliente almacenado correctamente</h5>`)
                    chargeClientsTable()

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
            $('#modal').modal('show');

        }

    });

});

function validateClientData(clientData) {
    let validationCounter = 0
    let errorMessage = ''


    if(validateRut(clientData.rut)){
        validationCounter++
        $('#clientRUT').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>RUT`
        $('#clientRUT').css('border', '1px solid #e74c3c')
    }

    if (clientData.name.length > 1) {
        validationCounter++
        $('#clientName').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>Nombre</b>`
        $('#clientName').css('border', '1px solid #e74c3c')
    }
    

    if (isEmail(clientData.email)) {
        validationCounter++
        $('#clientEmail').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>E-Mail`
        $('#clientEmail').css('border', '1px solid #e74c3c')
    }

    if (clientData.services.storage || clientData.services.deconsolidated || clientData.services.portage || clientData.services.transport) {
        validationCounter++
    } else {
        errorMessage += `<br>Seleccionar Servicio(s)`
    }

    if (validationCounter == 4) {
        return { ok: clientData }
    } else {
        toastr.warning('Falta datos:<br>'+errorMessage)
        return { err: clientData }
    }

}

function setModal(){

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



                <div class="col-md-8" style="margin-top:10px;">
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