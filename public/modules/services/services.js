let internals = {
    services: {
        table: {},
        data: []
    },
    dataRowSelected: {}
}

$(document).ready(async function () {
    chargeServicesTable()
})

function chargeServicesTable() {
    try {

        if($.fn.DataTable.isDataTable('#tableServices')){
            internals.services.table.clear().destroy()
        }

        internals.services.table = $('#tableServices')
        .DataTable( {
            dom: 'Bfrtip',
            buttons: [
              'excel'
            ],
            iDisplayLength: 50,
            language: {
                url: spanishDataTableLang
            },
            oLanguage: {
              sSearch: 'Buscar: '
            },
            responsive: false,
            order: [[ 0, 'asc' ]],
            columnDefs: [{targets: [1,2], className: 'dt-right'}],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'name' },
            { data: 'net' },
            { data: 'days' }
          ],
          initComplete: function (settings, json) {
            getServicesEnabled()
          }
        })

        $('#tableServices tbody').off("click")

        $('#tableServices tbody').on('click', 'tr', function () {
            console.log($(this).hasClass('selected'))
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $('#optionModService').prop('disabled', true)
            } else {
                internals.services.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#optionModService').prop('disabled', false)
                internals.services.data = internals.services.table.row($(this)).data()
                internals.dataRowSelected = internals.services.table.row($(this)).data()
            }
        })
      } catch (error) {
        console.log(error)
      }

}


async function getServicesEnabled() {
    let serviceData = await axios.get('api/services')
    
    if (serviceData.data.length > 0) {
        let formatData= serviceData.data.map(el => {
            el.net = dot_separators(el.net)
            el.days = dot_separators(el.days)

            return el
        })

        internals.services.table.rows.add(formatData).draw()
        $('#loadingServices').empty()
    } else {
        toastr.warning('No se han encontrado datos de servicios')
        $('#loadingServices').empty()
    }
}

$('#optionCreateService').on('click', function () { // CREAR SERVICIO

    $('#modalService').modal('show');
    $('#modalService_title').html(`Nuevo Servicio`)
    $('#modalService_body').html(setModal())

    $('#modalService_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-primary" id="saveService">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    $('#saveService').on('click', async function () {
        let serviceData = {
            name: $('#serviceName').val(),
            net: $('#serviceNet').val(),
            days: $('#serviceDays').val()
        }

        const res = validateServiceData(serviceData)
        if (res.ok) {
            let saveService = await axios.post('/api/serviceSave', serviceData)
            if(saveService.data){
                if(saveService.data._id){
                    $('#modalService').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Servicio almacenado correctamente</h5>`)
                    chargeServicesTable()
                
                }else if(saveService.data=='created'){
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Servicio ya registrado, favor corroborar</h5>`)
                
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show');

        }else{

        }

    });

});


$('#optionModService').on('click', async function () { // MODIFICA SERVICIO

    let serviceData = await axios.post('/api/serviceSingle', {id: internals.dataRowSelected._id})
    let service = serviceData.data
    $('#modalService').modal('show');
    $('#modalService_title').html(`Modifica Servicio`)
    $('#modalService_body').html(setModal())

    $('#modalService_footer').html(`
        <button class="btn btn-dark" data-dismiss="modal">
            <i ="color:#e74c3c;" class="fas fa-times"></i> Cancelar
        </button>

        <button class="btn btn-primary" id="saveService">
            <i ="color:#3498db;" class="fas fa-check"></i> Almacenar
        </button>
    `)

    $('#serviceName').val(service.name)
    $('#serviceNet').val(service.net)
    $('#serviceDays').val(service.days)
    
    $('#saveService').on('click', async function () {
        let serviceData = {
            id: internals.dataRowSelected._id,
            name: $('#serviceName').val(),
            net: $('#serviceNet').val(),
            days: $('#serviceDays').val()
        }
        
        const res = validateServiceData(serviceData)
        
        if (res.ok) {
            let saveService = await axios.post('/api/serviceUpdate', serviceData)

            if(saveService.data){
                if(saveService.data._id){
                    $('#modalService').modal('hide')

                    $('#modal_title').html(`Almacenado`)
                    $('#modal_body').html(`<h5 class="alert-heading">Servicio almacenado correctamente</h5>`)
                    chargeServicesTable()

                }else if(saveService.data=='created'){
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Servicio ya registrado, favor corroborar</h5>`)
                
                }else{
                    $('#modal_title').html(`Error`)
                    $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
                }
            }else{
                $('#modal_title').html(`Error`)
                $('#modal_body').html(`<h5 class="alert-heading">Error al almacenar, favor reintente</h5>`)
            }
            $('#modal').modal('show');

        }else{

        }

    });

});

function validateServiceData(serviceData) {
    let validationCounter = 0
    let errorMessage = ''

    if (serviceData.name.length > 1) {
        validationCounter++
        $('#serviceName').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>Nombre</b>`
        $('#serviceName').css('border', '1px solid #e74c3c')
    }

    if ($.isNumeric(serviceData.net)) {
        validationCounter++
        $('#serviceNet').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>E-Mail`
        $('#serviceNet').css('border', '1px solid #e74c3c')
    }

    if ($.isNumeric(serviceData.days)) {
        validationCounter++
        $('#serviceDays').css('border', '1px solid #3498db')
    } else {
        errorMessage += `<br>Días`
        $('#serviceDays').css('border', '1px solid #e74c3c')
    }


    if (validationCounter >= 2) {
        return { ok: serviceData }
    } else {
        toastr.warning('Falta datos:<br>'+errorMessage)
        return { err: serviceData }
    }

}

function setModal(){

    return `
            <div class="row">
                <div class="col-md-4" style="margin-top:10px;">
                    Nombre
                    <input id="serviceName" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" style="margin-top:10px;">
                    Valor Neto
                    <input id="serviceNet" type="text" class="form-control border-input">
                </div>

                <div class="col-md-4" style="margin-top:10px;">
                    Días libres (0 si no aplica)
                    <input id="serviceDays" type="text" class="form-control border-input">
                </div>
           </div>
        `
}