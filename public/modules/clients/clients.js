let internals = {
    users: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

$(document).ready(async function () {
    chargeUsersTable()
})

function chargeUsersTable() {
    try {

        if($.fn.DataTable.isDataTable('#tableUsers')){
            internals.movements.table.clear().destroy()
        }

        internals.users.table = $('#tableUsers')
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
            { data: 'rut' },
            { data: 'name' },
            { data: 'email' },
            { data: 'status' },
            { data: 'debt' }
          ],
          initComplete: function (settings, json) {
            getUsersEnabled()
          }
        })

        $('#tableUsers tbody').off("click")

        $('#tableUsers tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModClient').prop('disabled', true)
                $('#optionDeleteClient').prop('disabled', true)
            } else {
                internals.users.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#optionModClient').prop('disabled', false)
                $('#optionDeleteClient').prop('disabled', false)
                internals.users.data = internals.users.table.row($(this)).data()
                internals.dataRowSelected = internals.users.table.row($(this)).data()
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

async function getUsersEnabled() {
    let userData = await axios.get('api/clients')
    
    if (userData.data.length > 0) {
        let formatData= userData.data.map(el => {
            /*if (validateRut(el.rut)) {
                el.rut = `${validateRut(el.rut)}`;
            } else {
                el.rut = el.rut;
            }*/
            el.rut = el.rut

            if (el.status == 'enabled') {
                el.status = 'Activo'
            } else {
                el.status = 'Desactivado'
            }

            return el
        })

        internals.users.table.rows.add(formatData).draw()
        $('#loadingUsers').empty()
    } else {
        console.log('vacio', userData);
        toastr.warning('No se han encontrado datos de usuarios')
        $('#loadingUsers').empty()
    }
}

$('#optionCreateClient').on('click', function () { // CREAR CLIENTE

    $('#modalClient').modal('show');
    $('#modalClient_title').html(`Nuevo usuario`)
    $('#modalClient_body').html(setModal())

    $('#modalClient_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-dark" id="saveUser">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    /*$('#clientRUT').on('keyup', function () {
        let rut = $('#clientRUT').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#clientRUT').val(rutFunc($('#clientRUT').val()))
        }
    })*/

    setTimeout(() => {
        $('#clientRUT').focus()
    }, 500)

    $('#saveUser').on('click', async function () {
        let userData = {
            //rut: removeExtraSpaces($('#clientRUT').val()),
            rut: $('#clientRUT').val(),
            name: $('#clientName').val(),
            email: $('#clientEmail').val(),
            status: $('#clientStatus').val()
        }

        const res = validateUserData(userData)
        console.log(res)
        if (res.ok) {
            console.log(userData)
            let saveClient = await axios.post('/api/clientSave', userData)

            console.log("saveClient",saveClient)
            if(saveClient.data){
                if(saveClient.data._id){
                    $('#modalClient').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Cliente almacenado correctamente</h5>`)
                    chargeUsersTable()
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
        title: '{{ lang.deleteUser.swalDeleteTitle }}',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        confirmButtonText: '{{ lang.deleteUser.swalConfirmButtonText }}',
        cancelButtonText: '{{ lang.deleteUser.swalCancelButtonText }}',
    }).then((result) => {
        if (result.value) {
            ajax({
                url: 'api/user',
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

                    toastr.success('{{ lang.deleteUser.swalToastrOK }}')

                    datatableUsers
                        .row(userRowSelected)
                        .remove()
                        .draw()

                    // console.log(res.ok)
                }
            })
        }
    })
})

$('#optionModClient').on('click', async function () { // CREAR CLIENTE

    console.log(internals.dataRowSelected)
    let clientData = await axios.post('/api/clientSingle', {id: internals.dataRowSelected._id})
    let client = clientData.data

    console.log('data', client)
    $('#modalClient').modal('show');
    $('#modalClient_title').html(`Nuevo usuario`)
    $('#modalClient_body').html(setModal())

    $('#modalClient_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-dark" id="saveUser">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    /*$('#clientRUT').on('keyup', function () {
        let rut = $('#clientRUT').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#clientRUT').val(rutFunc($('#clientRUT').val()))
        }
    })*/

    $('#clientRUT').val(client.rut)
    $('#clientName').val(client.name)
    $('#clientEmail').val(client.email)
    $('#clientStatus').val(client.status)

    setTimeout(() => {
        $('#clientRUT').focus()
    }, 500)

    $('#saveUser').on('click', async function () {
        let userData = {
            id: internals.dataRowSelected._id,
            rut: $('#clientRUT').val(),
            name: $('#clientName').val(),
            email: $('#clientEmail').val(),
            status: $('#clientStatus').val()
        }

        const res = validateUserData(userData)
        console.log(res)
        if (res.ok) {
            console.log(userData)
            let saveClient = await axios.post('/api/clientUpdate', userData)

            console.log("saveClient",saveClient)
            if(saveClient.data){
                if(saveClient.data._id){
                    $('#modalClient').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Cliente almacenado correctamente</h5>`)
                    chargeUsersTable()
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

function validateUserData(userData) { // VOY AQUI EN LA TRADUCCIÓN
    console.log(userData)
    let validationCounter = 0
    let errorMessage = ''


    if (userData.rut.length >= 6/*isRut(userData.rut)*/) { // 1
        validationCounter++
        $('#clientRUT').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>RUT`
        $('#clientRUT').css('border', '1px solid #e74c3c')
    }

    if (userData.name.length > 1) { // 2
        validationCounter++
        $('#clientName').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>Nombre</b>`
        $('#clientName').css('border', '1px solid #e74c3c')
    }

    if (isEmail(userData.email)) { // 7
        validationCounter++
        $('#clientEmail').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>E-Mail`
        $('#clientEmail').css('border', '1px solid #e74c3c')
    }

    if (validationCounter == 3) {
        return { ok: userData }
    } else {
        toastr.warning('Falta datos:<br>'+errorMessage)
        return { err: userData }
    }

}

function setModal(){

    return `
            <div class="row">
                <div class="col-md-4" ="margin-top:10px;">
                    RUT
                    <input id="clientRUT" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" ="margin-top:10px;">
                    Nombre
                    <input id="clientName" type="text" class="form-control border-input">
                </div>
                <div class="col-md-4" ="margin-top:10px;">
                    Correo Electrónico
                    <input id="clientEmail" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" ="margin-top:10px;">
                    Estado
                    <select id="clientStatus" class="custom-select">
                        <option value="enabled">HABILITADO</option>
                        <option value="disabled">DESHABILITADO</option>
                    </select>
                </div>

            </div>
        `
}