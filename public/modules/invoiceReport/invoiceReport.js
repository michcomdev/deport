let internals = {
    to: {
        table: {},
        data: []
    },
    done: {
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
        locale: dateRangePickerDefaultLocale
        //startDate: moment().add(-1,'months')
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
        loadTo($("#searchClient").val())
        loadDone($("#searchClient").val())
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
                    loadIn($("#searchClient").val())
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

async function loadTo(id){
    
    let query = {
        client: $("#searchClient").val(),
        type: 'TO',
        startDate: $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        serviceSelect: $("#searchService").val()
    }

    let movementTo = await axios.post('api/reportDaily',query)

    $("#badgeTo").text(movementTo.data.length)
    
    if($.fn.DataTable.isDataTable('#tableTo')){
        internals.to.table.clear().destroy()
    }
    $.fn.dataTable.moment('DD/MM/YYYY HH:mm')

    try {
        internals.to.table = $('#tableTo')
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
            columnDefs: [{targets: [0,1,2,3,4,5], className: 'dt-center'},
                         {targets: [8], className: 'dt-right'}],
            //order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'numberIn' },
            { data: 'datetime' },
            { data: 'containerNumber' },
            { data: 'containerLarge' },
            { data: 'driverPlate' },
            { data: 'driverGuide' },
            { data: 'client' },
            { data: 'service' },
            { data: 'serviceValue' }
          ],
          initComplete: function (settings, json) {

                let formatData = movementTo.data.map(el => {
                    el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')
                    el.serviceValue = dot_separators(el.serviceValue)
                    return el
                })

                internals.in.table.rows.add(formatData).draw()
          }
        })

        /*$('#tableIn tbody').off("click")

        $('#tableIn tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
                $("#tableBodyContainers").html('')

            } else {
                internals.in.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                
                //internals.dataRowSelected = internals.clientsInvoice.table.row($(this)).data()
                internals.dataRowSelectedInvoice = internals.in.table.row($(this)).data()
                loadContainers($("#searchClient").val(), internals.dataRowSelectedInvoice._id)
                //loadIn(internals.dataRowSelected._id)
                //loadSingleContainer(internals.dataRowSelected.id)
            }
        })*/
    } catch (error) {
        console.log(error)
    }
}

async function loadDone(id){
    
    let query = {
        client: $("#searchClient").val(),
        type: 'DONE',
        startDate: $("#searchDate").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        endDate: $("#searchDate").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        serviceSelect: $("#searchService").val()
    }

    let movementDone = await axios.post('api/reportDaily',query)

    $("#badgeDone").text(movementDone.data.length)
    
    if($.fn.DataTable.isDataTable('#tableDone')){
        internals.done.table.clear().destroy()
    }
    $.fn.dataTable.moment('DD/MM/YYYY HH:mm')

    try {
        internals.done.table = $('#tableDone')
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
            columnDefs: [{targets: [0,1,2,3,4,5], className: 'dt-center'},
                         {targets: [8], className: 'dt-right'}],
            //order: [[ 0, 'desc' ]],
            ordering: true,
            rowCallback: function( row, data ) {
          },
          columns: [
            { data: 'numberOut' },
            { data: 'datetime' },
            { data: 'containerNumber' },
            { data: 'containerLarge' },
            { data: 'driverPlate' },
            { data: 'driverGuide' },
            { data: 'client' },
            { data: 'service' },
            { data: 'serviceValue' },
            { data: 'payment' },
            { data: 'paymentType' },
            { data: 'paymentDate' }
          ],
          initComplete: function (settings, json) {

                let formatData = movementDone.data.map(el => {
                    el.datetime = moment(el.datetime).format('DD/MM/YYYY HH:mm')
                    el.serviceValue = dot_separators(el.serviceValue)
                    el.paymentDate = moment(el.paymentDate).format('DD/MM/YYYY')
                    return el
                })

                internals.done.table.rows.add(formatData).draw()
          }
        })

    } catch (error) {
        console.log(error)
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

function changeTabs(to){
    if(to=='to'){
        $("#linkTo").addClass('active')
        $("#linkDone").removeClass('active')

        $("#badgeTo").removeClass('badge-success').addClass('badge-secondary')
        $("#badgeDone").removeClass('badge-secondary').addClass('badge-success')

        $("#divTo").css('display','block')
        $("#divDone").css('display','none')

    }else if(to=='done'){
        $("#linkTo").removeClass('active')
        $("#linkDone").addClass('active')

        $("#badgeTo").removeClass('badge-secondary').addClass('badge-success')
        $("#badgeDone").removeClass('badge-success').addClass('badge-secondary')

        $("#divTo").css('display','none')
        $("#divDone").css('display','block')

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