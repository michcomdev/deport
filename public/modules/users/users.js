let internals = {
    users: {
        table: {},
        data: []
    },
    rowSelected: {}
}

$(document).ready(async function () {
    chargeUsersTable()
})

function chargeUsersTable() {
    try {

        if($.fn.DataTable.isDataTable('#tableUsers')){
            internals.users.table.clear().destroy()
        }
        internals.users.table = $('#tableUsers')
            .DataTable({
                dom: 'Bfrtip',
                buttons: [
                    'excel'
                ],
                iDisplayLength: 50,
                language: {
                    url: spanishDataTableLang
                },
                responsive: false,
                order: [[0, 'desc']],
                ordering: true,
                rowCallback: function (row, data) {
                },
                columns: [
                    { data: 'rut' },
                    { data: 'name' },
                    { data: 'email' },
                    { data: 'scope' },
                    { data: 'status' }
                ],
                initComplete: function (settings, json) {
                    getUsersEnabled()
                }
            })
        
        $('#tableUsers tbody').off("click")

        $('#tableUsers tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModUser').prop('disabled', true)
                $('#optionDeleteUser').prop('disabled', true)
            } else {
                internals.users.table.$('tr.selected').removeClass('selected')
                $(this).addClass('selected')
                $('#optionModUser').prop('disabled', false)
                $('#optionDeleteUser').prop('disabled', false)
                internals.users.data = internals.users.table.row($(this)).data()
                internals.rowSelected = internals.users.table.row($(this))
            }
        })
    } catch (error) {
        console.log(error)
    }
}

async function getUsersEnabled() {
    let userData = await axios.get('api/users')

    if (userData.data.length > 0) {
        let formatData = userData.data.map(el => {
            if (validateRut(el.rut)) {
                el.rut = `${validateRut(el.rut)}`
            } else {
                el.rut = el.rut
            }

            if (el.scope == 'gate') {
                el.scope = 'Gate Control'
            }else if (el.scope == 'stacker') {
                el.scope = 'Stacker'
            }else if (el.scope == 'contab') {
                el.scope = 'Contabilidad'
            }else if (el.scope == 'admin') {
                el.scope = 'Administrador'
            } else {
                el.scope = '-'
            }

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
        toastr.warning('No se han encontrado datos de usuarios')
        $('#loadingUsers').empty()
    }
}

$('#optionCreateUser').on('click', async function () { // CREAR USUARIO
    handleModal()

    $('#userRut').on('keyup', function () {
        let rut = $('#userRut').val()
        if (validateRut(rut) && rut.length >= 6) {
            $('#userRut').val(validateRut($('#userRut').val()))
        }
    })

    setTimeout(() => {
        $('#userRut').focus()
    }, 500)

    $('#saveUser').on('click', async function () {
        let userData = {
            rut: removeSpecials($('#userRut').val()),
            name: $('#userName').val(),
            lastname: $('#userLastname').val(),
            password: $('#userPassword').val(),
            scope: $('#userRole').val(),
            email: ($('#userEmail').val()).trim()
        }

        let validate = await validateUserData(userData,'create')

        if (validate.ok) {
            let newUserData = await axios.post('api/users', validate.ok)
            if (newUserData.data.error) {
                toastr.warning(newUserData.data.error)
            } else {
                toastr.success('Usuario creado correctamente')

                chargeUsersTable()

                /*if (validateRut(newUserData.data.rut)) {
                    newUserData.data.rut = `${validateRut(newUserData.data.rut)}`
                } else {
                    newUserData.data.rut = newUserData.data.rut
                }

                if (newUserData.data.scope == 'user') {
                    newUserData.data.scope = 'Usuario'
                } else {
                    newUserData.data.scope = 'Administrador'
                }

                if (newUserData.data.status == 'enabled') {
                    newUserData.data.status = 'Activo'
                } else {
                    newUserData.data.status = 'Desactivado'
                }

                let userAdded = internals.users.table.row
                    .add(newUserData.data)
                    .draw()
                    .node()

                $(userAdded).css('color', '#1abc9c')
                setTimeout(() => {
                    $(userAdded).css('color', '#484848')
                }, 5000)*/

                $('#modal').modal('hide')
            }
        }
    })
})

$('#optionModUser').on('click', function () { //MODIFICAR USUARIO
    handleModal(internals.users.data)

    if (internals.users.data.scope == 'Gate Control') {
        internals.users.data.scope = 'gate'
    }else if (internals.users.data.scope == 'Stacker') {
            internals.users.data.scope = 'stacker'
    }else if (internals.users.data.scope == 'Contabilidad') {
        internals.users.data.scope = 'contab'
    }else if (internals.users.data.scope == 'Administrador') {
        internals.users.data.scope = 'admin'
    }

    $('#userRole').val(internals.users.data.scope)

    $('#saveUser').on('click', async function () {

        internals.users.data.rut = removeSpecials($('#userRut').val())
        internals.users.data.name = $('#userName').val().trim()
        internals.users.data.lastname = $('#userLastname').val().trim()
        internals.users.data.password = $('#userPassword').val().trim()
        internals.users.data.scope = $('#userRole').val()
        internals.users.data.email = ($('#userEmail').val()).trim()

        let validate = await validateUserData(internals.users.data,'update')

        if (validate.ok) {
            let newUserData = await axios.post('api/users', validate.ok)
            if (newUserData.data.error) {
                toastr.warning(newUserData.data.error)
            } else {
                toastr.success('Usuario modificado correctamente')

                chargeUsersTable()

                /*if (validateRut(newUserData.data.rut)) {
                    newUserData.data.rut = `${validateRut(newUserData.data.rut)}`
                } else {
                    newUserData.data.rut = newUserData.data.rut
                }

                if (newUserData.data.scope == 'user') {
                    newUserData.data.scope = 'Usuario'
                } else {
                    newUserData.data.scope = 'Administrador'
                }

                if (newUserData.data.status == 'enabled') {
                    newUserData.data.status = 'Activo'
                } else {
                    newUserData.data.status = 'Desactivado'
                }

                let userAdded = internals.users.table.row
                    .add(newUserData.data)
                    .draw()
                    .node()

                $(userAdded).css('color', '#1abc9c')
                setTimeout(() => {
                    $(userAdded).css('color', '#484848')
                }, 5000)*/

                $('#modal').modal('hide')
            }
        }
    })
















    /*$('#saveUser').on('click', function () {
        let userData = {
            status: 'mod',
            rut: $('#modUserRut').val(),
            name: $('#modUserName').val(),
            lastname: $('#modUserLastname').val(),
            changePassword: $('#changePassword').is(':checked'),
            password: $('#modUserPassword').val(),
            role: $('#modUserRole').val(),
            charge: $('#modUserCharge').val(),
            phone: $('#modUserPhone').val(),
            email: $('#modUserEmail').val(),
            changeEmailPassword: $('#changeEmailPassword').is(':checked'),
            emailPassword: $('#modUserEmailPassword').val()
        }

        validateUserData(userData).then(res => {
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

                ajax({
                    url: 'api/modUser',
                    type: 'POST',
                    data: {
                        rut: userData.rut,
                        name: userData.name,
                        lastname: userData.lastname,
                        changePassword: changePassword,
                        changeEmailPassword: changeEmailPassword,
                        password: userData.password,
                        emailPassword: userData.emailPassword,
                        role: userData.role,
                        charge: userData.charge,
                        phone: userData.phone,
                        email: userData.email,
                        checkPer: JSON.stringify(userData.checkPer)
                    }
                }).then(res => {
                    if (res.err) {
                        toastr.warning(res.err)
                    } else if (res.ok) {
                        toastr.success('{{ lang.modUser.saveUserToastrOK }}')

                        if (isRut(res.ok._id)) {
                            res.ok.rut = `${rutFunc(res.ok._id)}`
                        } else {
                            res.ok.rut = res.ok._id
                        }

                        $('#optionModUser').prop('disabled', true)
                        $('#optionDeleteUser').prop('disabled', true)

                        datatableUsers
                            .row(userRowSelected)
                            .remove()
                            .draw()

                        let modUserAdded = datatableUsers
                            .row.add(res.ok)
                            .draw()
                            .node()

                        //datatableUsers.search('').draw()

                        $(modUserAdded).css('color', '#1abc9c')
                        setTimeout(() => {
                            $(modUserAdded).css('color', '#484848')
                        }, 5000)

                        $('#modal').modal('hide')
                    }
                })
            }
        })
    })*/
})

$('#optionDeleteUser').on('click', function () { //ELIMINAR USUARIO
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
                    _id: internals.rowSelected._id
                }
            }).then(res => {
                if (res.err) {
                    toastr.warning(res.err)
                } else if (res.ok) {
                    $('#optionModUser').prop('disabled', true)
                    $('#optionDeleteUser').prop('disabled', true)

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

function handleModal(userSelected) {
    $('#modal').modal('show');
    $('#modal_title').html(`${(userSelected) ? 'Modificar usuario ' : 'Nuevo Usuario'}`)
    $('#modal_body').html(`
        <div class="row">
            <div class="col-md-4" style="margin-top:10px;">
                Rut
                <input id="userRut" type="text" placeholder="11.111.111-1" value="${(userSelected) ? userSelected.rut : ''}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                Nombre
                <input id="userName" type="text" value="${(userSelected) ? userSelected.name : ''}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                Apellido
                <input id="userLastname" type="text" value="${(userSelected) ? userSelected.lastname : ''}" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                Contrase??a
                <input id="userPassword" type="password" placeholder="******" class="form-control border-input">
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                Rol
                <select id="userRole" class="custom-select">
                    <option value="gate">Gate Control</option>
                    <option value="stacker">Stacker</option>
                    <option value="contab">Contabilidad</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>

            <div class="col-md-4" style="margin-top:10px;">
                Correo
                <input id="userEmail" type="text" placeholder="ejemplo@correo.cl" value="${(userSelected) ? userSelected.email : ''}" class="form-control border-input">
            </div>

            <!-- <div class="col-md-12 form-group">
                <fieldset class="form-group">
                    <legend class="mt-4">Permisos</legend>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="check1">
                            Permiso 1
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="check2">
                            Permiso 2
                        </label>
                    </div>

                </fieldset>
            </div> -->

            <div class="col-md-12" id="userErrorMessage"></div>

        </div>
    `)

    $('#modal_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i style="color:#e74c3c;" class="fas fa-times"></i> CANCELAR
        </button>

        <button class="btn btn-dark" id="saveUser">
            <i style="color:#3498db;" class="fas fa-check"></i> GUARDAR
        </button>
    `)
}

async function validateUserData(userData, type) { // VERIFICACION
    let validationCounter = 0
    let errorMessage = ''

    // 5 puntos
    if (userData.rut.length >= 6) { // 1
        validationCounter++
        $('#userRut').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>* Debe ingresar un <b>RUT v??lido`
        $('#userRut').css('border', '1px solid #e74c3c')
    }

    if (userData.name.length > 1) { // 2
        validationCounter++
        $('#userName').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>* Debe ingresar un <b>nombre de usuario</b></b>`
        $('#userName').css('border', '1px solid #e74c3c')
    }

    if (userData.lastname.length > 1) { // 3
        validationCounter++
        $('#userLastname').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>* Debe ingresar un <b>apellido de usuario</b>`
        $('#userLastname').css('border', '1px solid #e74c3c')
    }

    if (isEmail(userData.email)) { // 4
        validationCounter++
        $('#userEmail').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>* Debe ingresar un <b>Email v??lido</b>`
        $('#userEmail').css('border', '1px solid #e74c3c')
    }

    if (userData.password !== '') {
        if (userData.password.length >= 6) { // 5
            validationCounter++
            $('userPassword').css('border', '1px solid #3498db')
        } else if(userData.password.length <= 6 && userData.password.length > 0) {
            errorMessage += `<br>* Debe ingresar una <b>contrase??a de usuario al menos 6 caracteres</b>`
            $('#userPassword').css('border', '1px solid #e74c3c')
        } else {
            errorMessage += `<br>* Debe ingresar una <b>contrase??a de usuario v??lida</b>`
            $('#userPassword').css('border', '1px solid #e74c3c')
        }
    } else {
        if (type=='update') { // 5
            validationCounter++
            $('userPassword').css('border', '1px solid #3498db')
        } else {
            errorMessage += `<br>* Debe ingresar una <b>contrase??a de usuario v??lida</b>`
            $('#userPassword').css('border', '1px solid #e74c3c')
        }
    }

    if (validationCounter == 5) {
        $('#userErrorMessage').empty()
        return { ok: userData }
    } else {
        $('#userErrorMessage').html(`
            <div class="alert alert-dismissible alert-warning">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                <h4 class="alert-heading">Debe solucionar los siguientes errores</h4>
                <p class="mb-0">${errorMessage}</p>
            </div>
            `)
        return { err: userData }
    }
}