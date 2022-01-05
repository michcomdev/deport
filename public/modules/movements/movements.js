let internals = {
    movements: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

let clients = {}
let containerTypes = {}

$(document).ready(async function () {
    chargeMovementTable()
    getClients()
    getContainerTypes()
})

async function getClients() {
    let clientsData = await axios.get('api/clients')
    clients = clientsData.data
}
async function getContainerTypes() {
    let containerTypesData = await axios.get('api/containerTypes')
    console.log(containerTypesData)
    containerTypes = containerTypesData.data
    console.log(containerTypes)
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
            { data: 'cod' },
            { data: 'createdAt' },
            { data: 'mov' },
            { data: 'container' },
            { data: 'large' },
            { data: 'plate' },
            { data: 'position' },
            { data: 'driver' },
            { data: 'enterprise' }
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
            } else {
                internals.movements.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#optionModMovement').prop('disabled', false)
                $('#optionDeleteMovement').prop('disabled', false)
                //internals.movements.data = internals.movements.table.row($(this)).data()
                internals.dataRowSelected = internals.movements.table.row($(this)).data()
            }
        })
      } catch (error) {
        console.log(error)
      }

}

async function getMovementsEnabled() {
    let movementData = await axios.get('api/movements')

    if (movementData.data.length > 0) {
        let formatData= movementData.data.map(el => {
            el.createdAt = moment(el.createdAt).format('DD/MM/YYYY hh:mm:ss')

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
    $('#modal_title').html(`Nuevo Ingreso`)
    $('#modal_body').html(`
        <div class="row">

            <div class="col-md-12">
                <h5>DATOS GENERALES</h5>
            </div>

            <div class="col-md-2">
                Movimiento
                <select id="movementRole" class="custom-select">
                    <option value="in">INGRESO</option>
                    <option value="out">SALIDA</option>
                    <option value="to_in">POR INGRESAR</option>
                    <option value="to_out">POR SALIR</option>
                </select>
            </div>
            <div class="col-md-2">
                Fecha
                <input id="movementDate" type="date" class="form-control border-input" value="${moment().format('YYYY-MM-DD')}">
            </div>
            <div class="col-md-2">
                Hora
                <input id="movementTime" type="text" class="form-control border-input" value="${moment().format('hh:mm')}">
            </div>
            <div class="col-md-4">
                Cliente
                <select id="movementClient" class="custom-select">
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
            <div class="col-md-3">
                Sigla / Marca
                <input id="movementContainerInitials" type="text" placeholder="HASU-126" class="form-control border-input">
            </div>
            <div class="col-md-3">
                Número Container
                <input id="movementContainerNumber" type="text" placeholder="ABCD-1234-0" class="form-control border-input">
            </div>
            <div class="col-md-3">
                Tipo
                <select id="movementContainerType" class="custom-select">
                    <option value="1">DRY VAN</option>
                    <option value="2">OPEN TOP</option>
                    <option value="3">REEFER</option>
                    <option value="4">TANK</option>
                    <option value="5">HIGH CUBE</option>
                    <option value="6">OPEN SIDE</option>
                    <option value="7">FLAT RACK</option>
                    <option value="8">PLATFORM</option>
                </select>
            </div>
            <div class="col-md-2">
                Largo
                <select id="movementContainerLarge" class="custom-select">
                    <option value="20">20</option>
                    <option value="40">40</option>
                    <option value="40H">40H</option>
                    <option value="101">101</option>
                    <option value="105">105</option>
                </select>
            </div>
            
            <div class="col-md-3">
                Grúa
                <select id="movementCrane" class="custom-select">
                    <option value="1">GRUA 1</option>
                    <option value="2">GRUA 2</option>
                </select>
            </div>
            <div class="col-md-3">
                Sitio
                <select id="movementSite" class="custom-select">
                    <option value="1">SITIO 1</option>
                    <option value="2">SITIO 2</option>
                    <option value="3">SITIO 3</option>
                </select>
            </div>
            <div class="col-md-3">
                Ubicación
                <select id="movementPosition" class="custom-select">
                    <option value="A1_1">A1_1</option>
                    <option value="A1_2">A1_2</option>
                    <option value="A1_3">A1_3</option>
                    <option value="A2_1">A2_1</option>
                    <option value="A2_2">A2_2</option>
                    <option value="A2_3">A2_3</option>
                </select>
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
                <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                <label class="form-check-label" for="flexCheckDefault">
                    PAGO ANTICIPADO
                </label>
            </div>
            <div class="col-md-6">
                VALOR
                <input id="movementCharge" type="text" placeholder="$22.000" class="form-control border-input">
            </div>
            <br/ >


            
            <div class="form-group col-md-12">
                <h4 class="card-title">&nbsp;Observaciones</h4>
                <textarea id="movementObservation" placeholder="EJEMPLO: CONTENEDOR DAÑADO" class="form-control" rows="5"></textarea>
            </div>

        </div>
    `)

    $('#modal_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> CERRAR
        </button>

        <button class="btn btn-dark" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)

    $('#movementRut').on('keyup', function () {
        let rut = $('#movementRut').val();
        if (isRut(rut) && rut.length >= 7) {
            $('#movementRut').val(rutFunc($('#movementRut').val()))
        }
    })

    setTimeout(() => {
        $('#movementRut').focus()
    }, 500)

    $('#saveMovement').on('click', function () {
        let movementData = {
            rut: removeExtraSpaces($('#movementRut').val()),
            name: $('#movementName').val(),
            lastname: $('#movementLastname').val(),
            password: $('#movementPassword').val(),
            role: $('#movementRole').val(),
            charge: $('#movementCharge').val(),
            phone: $('#movementPhone').val(),
            email: removeExtraSpaces($('#movementEmail').val()),
            emailPassword: $('#movementEmailPassword').val()
        }

        movementData.checkPer = []

        if ($('#checkDisOrders').is(":checked")) {
            movementData.checkPer.push('disOrders')
        }

        if ($('#checkMobile').is(":checked")) {
            movementData.checkPer.push('mobile')
        }

        if (movementData.checkPer == []) {
            delete movementData.checkPer
        }

        validateMovementData(movementData).then(res => {
            if (res.ok) {
                ajax({
                    url: 'api/movement',
                    type: 'POST',
                    data: {
                        rut: movementData.rut,
                        name: movementData.name,
                        lastname: movementData.lastname,
                        password: movementData.password,
                        role: movementData.role,
                        charge: movementData.charge,
                        phone: movementData.phone,
                        email: movementData.email,
                        emailPassword: movementData.emailPassword,
                        checkPer: movementData.checkPer
                    }
                }).then(res => {
                    if (res.err) {
                        toastr.warning(res.err)
                    } else if (res.ok) {
                        toastr.success('{{ lang.createMovement.saveMovementToastrOK }}')

                        if (isRut(res.ok._id)) {
                            res.ok.rut = `${rutFunc(res.ok._id)}`
                        } else {
                            res.ok.rut = res.ok._id
                        }

                        let movementAdded = datatableMovements
                            .row.add(res.ok)
                            .draw()
                            .node();

                        $(movementAdded).css('color', '#1abc9c');
                        setTimeout(() => {
                            $(movementAdded).css('color', '#484848');
                        }, 5000);

                        $('#movementsModal').modal('hide')
                    }
                })
            }

        });

    });

});

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

$('#optionModMovement').on('click', function () {
    console.log('rowselected',internals.dataRowSelected)

    $('#movementsModal').modal('show');
    $('#modal_title').html(`{{ lang.modMovement.modalTitle }} ${capitalizeAll(internals.dataRowSelected.name)} ${capitalizeAll(internals.dataRowSelected.lastname)}`)
    $('#modal_body').html(`
        <div class="row">
            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.dniTitle }}
                <input disabled value="${rutFunc(internals.dataRowSelected._id)}" id="modMovementRut" type="text" placeholder="{{ lang.modMovement.dniTitle }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.nameTitle }}
                <input value="${internals.dataRowSelected.name}" id="modMovementName" type="text" placeholder="{{ lang.modMovement.nameTitle }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.lastnameTitle }}
                <input value="${internals.dataRowSelected.lastname}" id="modMovementLastname" type="text" placeholder="{{ lang.modMovement.lastnameTitle }}" class="form-control border-input">
            </div>


            <div class="col-md-4" style="margin-top:10px;">
                <div class="form-group">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="changePassword" >
                        <label class="custom-control-label" for="changePassword">{{ lang.modMovement.systemPasswordTitle }}</label>
                    </div>
                </div>

                <input disabled id="modMovementPassword" type="password" placeholder="{{ lang.modMovement.systemPasswordTitle }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.roleTitle }}
                <select id="modMovementRole" class="custom-select">
                    <option value="commercial">{{ lang.modMovement.roles.commercial }} </option>
                    <option value="production">{{ lang.modMovement.roles.production }} </option>
                    <option value="samples">Muestras</option>
                    <option value="sa">{{ lang.modMovement.roles.sa }} </option>
                </select>
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.chargeTitle }}
                <input value="${internals.dataRowSelected.position}" id="modMovementCharge" type="text" placeholder="{{ lang.modMovement.chargeTitle }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.phone }}
                <input value="${internals.dataRowSelected.phone}" id="modMovementPhone" type="text" placeholder="{{ lang.modMovement.phone }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                {{ lang.modMovement.email }}
                <input value="${internals.dataRowSelected.email}" id="modMovementEmail" type="text" placeholder="{{ lang.modMovement.email }}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                <div class="form-group">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="changeEmailPassword" >
                        <label class="custom-control-label" for="changeEmailPassword">{{ lang.modMovement.emailPasswordTitle }}</label>
                    </div>
                </div>
                <input disabled id="modMovementEmailPassword" type="password" placeholder="{{ lang.modMovement.emailPasswordTitle }}" class="form-control border-input">
            </div>

            <div class="col-md-12 form-group">
                <fieldset class="form-group">
                    <legend class="mt-4">Permisos</legend>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="checkDisOrders">
                            Ordenes de despacho
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="checkMobile">
                            Acceso mobile
                        </label>
                    </div>

                </fieldset>
            </div>

            <div class="col-md-12" id="movementErrorMessage"></div>

            <div class="alert alert-dismissible alert-primary">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                {{{ lang.modMovement.alertMessage }}}
            </div>
        </div>
    `)

    $('#modal_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> {{ lang.modMovement.cancelButton }}
        </button>

        <button class="btn btn-dark" id="saveMovement">
            <i ="color:#3498db;" class="fas fa-check"></i> {{ lang.modMovement.saveButton }}
        </button>
    `)

    $('#modMovementRole').val(internals.dataRowSelected.role)

    if (internals.dataRowSelected.checkPer && internals.dataRowSelected.checkPer.includes("disOrders")) {
        $('#checkDisOrders').attr('checked', true);
    } else {
        $('#checkDisOrders').attr('checked', false);
    }

    if (internals.dataRowSelected.checkPer && internals.dataRowSelected.checkPer.includes("mobile")) {
        $('#checkMobile').attr('checked', true);
    } else {
        $('#checkMobile').attr('checked', false);
    }

    $('#changePassword').on('change', function () {
        if ($(this).is(':checked')) {
            $('#modMovementPassword').attr('disabled', false)
        } else {
            $('#modMovementPassword').val('')
            $('#modMovementPassword').attr('disabled', true)
        }
    })

    $('#changeEmailPassword').on('change', function () {
        if ($(this).is(':checked')) {
            $('#modMovementEmailPassword').attr('disabled', false)
        } else {
            $('#modMovementEmailPassword').val('')
            $('#modMovementEmailPassword').attr('disabled', true)
        }
    })

    $('#saveMovement').on('click', function () {
        let movementData = {
            status: 'mod',
            rut: removeExtraSpaces($('#modMovementRut').val()),
            name: $('#modMovementName').val(),
            lastname: $('#modMovementLastname').val(),
            changePassword: $('#changePassword').is(':checked'),
            password: $('#modMovementPassword').val(),
            role: $('#modMovementRole').val(),
            charge: $('#modMovementCharge').val(),
            phone: $('#modMovementPhone').val(),
            email: removeExtraSpaces($('#modMovementEmail').val()),
            changeEmailPassword: $('#changeEmailPassword').is(':checked'),
            emailPassword: $('#modMovementEmailPassword').val()
        }

        validateMovementData(movementData).then(res => {
            if (res.ok) {

                let changePassword = ''
                let changeEmailPassword = ''

                if ($('#changePassword').is(':checked')) {
                    changePassword = 'yes'
                } else {
                    changePassword = 'no'
                }

                if ($('#changeEmailPassword').is(':checked')) {
                    changeEmailPassword = 'yes'
                } else {
                    changeEmailPassword = 'no'
                }

                movementData.checkPer = []

                if ($('#checkDisOrders').is(":checked")) {
                    movementData.checkPer.push('disOrders')
                }

                if ($('#checkMobile').is(":checked")) {
                    movementData.checkPer.push('mobile')
                }

                if (movementData.checkPer == []) {
                    delete movementData.checkPer
                }


                ajax({
                    url: 'api/modMovement',
                    type: 'POST',
                    data: {
                        rut: movementData.rut,
                        name: movementData.name,
                        lastname: movementData.lastname,
                        changePassword: changePassword,
                        changeEmailPassword: changeEmailPassword,
                        password: movementData.password,
                        emailPassword: movementData.emailPassword,
                        role: movementData.role,
                        charge: movementData.charge,
                        phone: movementData.phone,
                        email: movementData.email,
                        checkPer: JSON.stringify(movementData.checkPer)
                    }
                }).then(res => {
                    if (res.err) {
                        toastr.warning(res.err)
                    } else if (res.ok) {
                        toastr.success('{{ lang.modMovement.saveMovementToastrOK }}')

                        if (isRut(res.ok._id)) {
                            res.ok.rut = `${rutFunc(res.ok._id)}`
                        } else {
                            res.ok.rut = res.ok._id
                        }

                        $('#optionModMovement').prop('disabled', true)
                        $('#optionDeleteMovement').prop('disabled', true)

                        datatableMovements
                            .row(movementRowSelected)
                            .remove()
                            .draw()

                        let modMovementAdded = datatableMovements
                            .row.add(res.ok)
                            .draw()
                            .node();

                        //datatableMovements.search('').draw();

                        $(modMovementAdded).css('color', '#1abc9c')
                        setTimeout(() => {
                            $(modMovementAdded).css('color', '#484848')
                        }, 5000);

                        $('#movementsModal').modal('hide')
                    }
                })
            }
        })
    })
})

function validateMovementData(movementData) { // VOY AQUI EN LA TRADUCCIÓN
    // console.log(movementData)
    let validationCounter = 0
    let errorMessage = ''

    return new Promise(resolve => {
        // 7 puntos

        if (movementData.rut.length >= 6/*isRut(movementData.rut)*/) { // 1
            validationCounter++
            $('#movementRut').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.dni }}}`
            $('#movementRut').css('border', '1px solid #e74c3c')
        }

        if (movementData.name.length > 1) { // 2
            validationCounter++
            $('#movementName').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.name }}}</b>`
            $('#movementName').css('border', '1px solid #e74c3c')
        }

        if (movementData.lastname.length > 1) { // 3
            validationCounter++
            $('#movementLastname').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.lastname }}}`
            $('#movementLastname').css('border', '1px solid #e74c3c')
        }

        if (movementData.charge.length > 1) { // 5
            validationCounter++
            $('#movementCharge').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.charge }}}`
            $('#movementCharge').css('border', '1px solid #e74c3c')
        }

        if (movementData.phone.length > 1) { // 6
            validationCounter++
            $('#movementPhone').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.phone }}}`
            $('#movementPhone').css('border', '1px solid #e74c3c')
        }

        if (isEmail(movementData.email)) { // 7
            validationCounter++
            $('#movementEmail').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>{{{ lang.validateMovementData.email }}}`
            $('#movementEmail').css('border', '1px solid #e74c3c')
        }

        if (movementData.status == 'mod') {
            if (movementData.changePassword) {
                if (movementData.password.length > 1) { // 4
                    validationCounter++
                    $('#modMovementPassword').css('border', '1px solid #3498db')
                } else {
                    errorMessage += `<br>{{{ lang.validateMovementData.systemPassword }}}`
                    $('#modMovementPassword').css('border', '1px solid #e74c3c')
                }
            } else {
                validationCounter++
            }

            if (movementData.changeEmailPassword) {
                if (movementData.emailPassword.length > 1) { // 9
                    validationCounter++
                    $('#modMovementEmailPassword').css('border', '1px solid #3498db')
                } else {
                    errorMessage += `<br>{{{ lang.validateMovementData.modEmailPassword }}}`
                    $('#modMovementEmailPassword').css('border', '1px solid #e74c3c')
                }
            } else {
                validationCounter++
            }

        } else {
            if (movementData.password.length > 1) { // 4
                validationCounter++
                $('#movementPassword').css('border', '1px solid #3498db')
            } else {
                errorMessage += `<br>{{{ lang.validateMovementData.systemPassword }}}`
                $('#movementPassword').css('border', '1px solid #e74c3c')
            }

            if (movementData.emailPassword) { // 8
                validationCounter++
                $('#movementEmailPassword').css('border', '1px solid #3498db')
            } else {
                errorMessage += `<br>{{{ lang.validateMovementData.createEmailPassword }}}`
                $('#movementEmailPassword').css('border', '1px solid #e74c3c')
            }
        }
        // console.log('validation', validationCounter)
        if (validationCounter == 8) {
            $('#movementErrorMessage').empty()
            resolve({ ok: movementData })
        } else {
            $('#movementErrorMessage').html(`
            <div class="alert alert-dismissible alert-warning">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                <h4 class="alert-heading">{{{ lang.validateMovementData.messageTitle }}}</h4>
                <p class="mb-0">${errorMessage}</p>
            </div>
            `)
            resolve({ err: movementData })
        }
    })
}