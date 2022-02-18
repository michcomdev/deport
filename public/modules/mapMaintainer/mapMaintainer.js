var ctx, offsetX, offsetY, WIDTH, HEIGHT, dragok, startX, startY, shapes=[]
var listSites = []

var maxX, maxY
var edgeX, edgeY

var cubePixels = 5
var colors = ['#18BC9C','#3498DB','#F39C12','#E74C3C','#2C3E50'], colorCount=0
var colorsSecondary = ['#3CE6C5','#77BAE7','#F7BB5D','#F08C82','#486583'], colorCount=0

getSites()
createMap()


async function getSites() {
    let sitesData = await axios.get('api/sites')
    let sites = sitesData.data

    for(let i=0; i < sites.length; i++){
        $("#listSites").append('<option value="'+sites[i]._id+'">'+sites[i].name+'</option>')
        listSites.push({
            id: sites[i]._id,
            name: sites[i].name
        })
    }
}

$('#btnLoad').on('click', function () {
    $("#divOptions").css('display','none')
    $("#divCancel").css('display','block')
    $("#divSites").css('display','block')
    $("#divPanel").css('display','block')
})

$('#btnNew').on('click', function () {
    $("#divOptions").css('display','none')
    $("#divCancel").css('display','block')
    $("#divPanel").css('display','block')
})

$('#btnCancel').on('click', function () {
    $("#divOptions").css('display','block')
    $("#divCancel").css('display','none')
    $("#divSites").css('display','none')
    $("#divPanel").css('display','none')
    $("#siteName").val('')
    $("#meterX").val(100)
    $("#meterY").val(50)
    $("#rowName").val('A')
    $("#containerLarge").val(1)
    $(".alertRows").remove()
    $("#listSites").val(0)

    $("#wallCanvas").attr('width', 0)
    $("#wallCanvas").attr('height', 0)
    $("#myCanvas").attr('width', 0)
    $("#myCanvas").attr('height', 0)
    shapes = []
})

$('#btnContainerView').on('click', function () {
    if(shapes.length==0){
        toastr.warning('No hay contenedores para mostrar')
        return
    }

    if($('#btnContainerView').hasClass('btn-success')){
        containerView(true)
        $(this).removeClass('btn-success')
        $(this).addClass('btn-danger')
        $(this).html('<i class="fas fa-cube"></i>&nbsp;Volver a Edición</button>')
    }else{
        containerView(false)
        $(this).removeClass('btn-danger')
        $(this).addClass('btn-success')
        $(this).html('<i class="fas fa-cube"></i>&nbsp;Vista Containers</button>')
    }
})


$('#listSites').on('change', async function () {
    $(".alertRows").remove()

    if(!$(this).val()==0){

        let siteData = await axios.post('/api/siteSingle', {id: $(this).val()})
        let site = siteData.data

        $("#siteName").val(site.name)
        $("#meterX").val(site.meterX)
        $("#meterY").val(site.meterY)

        await createMap()

        for(let i=0; i<site.rows.length; i++){
            addShape(site.rows[i].orientation, site.rows[i].map2D.containers, site.rows[i].row, site.rows[i].map2D.x, site.rows[i].map2D.y)
        }
    }else{
        $("#wallCanvas").attr('width', 0)
        $("#wallCanvas").attr('height', 0)
        $("#myCanvas").attr('width', 0)
        $("#myCanvas").attr('height', 0)
        shapes = []
    }

})

$("#btnCreate").on('click', function(){
    createMap()
})

$("#btnAddShape").on('click', function(){
    if(!$.isNumeric($("#containerLarge").val()) || $("#containerLarge").val()==0){
        toastr.warning('Debe ingresar un valores válidos')
        return
    }

    if(shapes.find(x => x.name === $("#rowName").val())){
        toastr.warning('Nombre de fila repetido')
        return
    }

    let orientation = 'vertical'
    if($("#btnVertical").hasClass('disabled')){
        orientation = 'horizontal'
    }

    addShape(orientation,$("#containerLarge").val(),$("#rowName").val(),0,0)
})

$("#btnVertical").on('click', function(){
    $("#btnVertical").removeClass('disabled')
    $("#btnHorizontal").addClass('disabled')
})

$("#btnHorizontal").on('click', function(){
    $("#btnHorizontal").removeClass('disabled')
    $("#btnVertical").addClass('disabled')
})

$("#btnSave").on('click', async function(){

    console.log("Nombre Sitio",$("#siteName").val())
    console.log("Dimensiones Mts",$("#meterX").val(),$("#meterY").val())
    console.log("Dimensiones Pies",edgeX,edgeY)
    console.log("Filas",shapes)

    if($("#siteName").val()==''){
        toastr.warning('Debe ingresar un nombre de paño válido')
        return
    }
    
    if(shapes.length==0){
        toastr.warning('Debe ingresar al menos 1 fila')
        return
    }


    let sites = {
        name: $("#siteName").val(),
        meterX: parseInt($("#meterX").val()),
        meterY: parseInt($("#meterY").val()),
        footX: edgeX,
        footY: edgeY,
        maps: shapes.reduce((acc,el)=>{
            acc.push({
                name: el.name,
                containers: el.containers,
                orientation: el.orientation,
                positionX: 0,
                positionY: 0,
                positionZ: 0,
                rotationY: 0,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
            })
            return acc
        }, [])
    }
    
    if($("#listSites").val()==0){

        if(listSites.find(x => x.name === $("#siteName").val())){
            toastr.warning('Nombre de Sitio repetido')
            return
        }
        

        let saveMap = await axios.post('/api/siteSave', sites)
        console.log(saveMap)
        if(saveMap){
            toastr.success('Almacenado correctamente')

            $("#listSites").append('<option value="'+saveMap.data._id+'">'+saveMap.data.name+'</option>')
            listSites.push({
                id: saveMap.data._id,
                name: saveMap.data.name
            })
            console.log(listSites)
        }
    }else{

        if(listSites.find(x => x.name === $("#siteName").val()) && listSites.find(x => x.name === $("#siteName").val()).id!=$("#listSites").val()){
            toastr.warning('Nombre de Sitio repetido')
            return
        }


        sites.id = $("#listSites").val()
        console.log(sites)
        let updateMap = await axios.post('/api/siteUpdate', sites)
        console.log(updateMap)
        if(updateMap){
            toastr.success('Almacenado correctamente')

            if(listSites.find(x => x.id === sites.id).name!=$("#siteName").val()){
                listSites.find(x => x.id === sites.id).name == $("#siteName").val()
            }
            console.log(listSites)
            $('#listSites option[value='+sites.id+']').text($("#siteName").val())
        }
    }
    
})

async function createMap(){

    shapes = []

    if(!$.isNumeric($("#meterX").val()) || !$.isNumeric($("#meterY").val()) || $("#meterX").val()==0 || $("#meterY").val()==0){
        toastr.warning('Debe ingresar un valores válidos')
        return
    }

    let meterX = $("#meterX").val()
    let meterY = $("#meterY").val()

    //metros * pie / arista
    edgeX = parseInt(meterX * 3.28084 / 4)
    edgeY = parseInt(meterY * 3.28084 / 4)

    if(edgeX>edgeY){
        cubePixels = parseInt($("#divMap").width() / edgeX)
    }else{
        cubePixels = parseInt($("#divMap").height() / edgeY)
    }

    maxX = edgeX * cubePixels
    maxY = edgeY * cubePixels

    $("#wallCanvas").attr('width', maxX)
    $("#wallCanvas").attr('height', maxY)
    $("#myCanvas").attr('width', maxX)
    $("#myCanvas").attr('height', maxY)

    wall()
    var canvas=document.getElementById("myCanvas")
    ctx=canvas.getContext("2d")
    var BB=canvas.getBoundingClientRect()
    offsetX=BB.left
    offsetY=BB.top
    WIDTH = canvas.width
    HEIGHT = canvas.height

    // drag related variables
    dragok = false
    //startX
    //startY

    // an array of objects that define different shapes
    //shapes=[]
    // define 2 rectangles
    //shapes.push({x:0,y:0,width:20,height:20,fill:"#444444",isDragging:false})
    //shapes.push({x:40,y:0,width:20,height:20,fill:"#ff550d",isDragging:false})
    // define 2 circles
    //shapes.push({x:150,y:100,r:10,fill:"#800080",isDragging:false})
    //shapes.push({x:200,y:100,r:10,fill:"#0c64e8",isDragging:false})

    // listen for mouse events
    canvas.onmousedown = myDown
    canvas.onmouseup = myUp
    canvas.onmousemove = myMove

    // call to draw the scene
    draw()
}

// draw a single rect
function rect(r) {

    let r_x = r.x * cubePixels
    let r_y = r.y * cubePixels
    let r_width = r.width * cubePixels
    let r_height = r.height * cubePixels

    ctx.fillStyle=r.fill
    ctx.fillRect(r_x,r_y,r_width,r_height)

    ctx.font= (cubePixels*1.5) +"px Arial";
    ctx.textAlign="center"; 
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFF";
    ctx.fillText(r.name, r_x+(r_width/2) ,r_y+(r_height/2))
}


// draw a single rect
function circle(c) {
    ctx.fillStyle=c.fill
    ctx.beginPath()
    ctx.arc(c.x,c.y,c.r,0,Math.PI*2)
    ctx.closePath()
    ctx.fill()
}

// clear the canvas
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
}

// redraw the scene
function draw() {
    clear()
    //wall()
    // redraw each shape in the shapes[] array
    for(var i=0;i<shapes.length;i++){
        // decide if the shape is a rect or circle
        // (it's a rect if it has a width property)
        if(shapes[i].width){
            rect(shapes[i])
        }/*else{
            circle(shapes[i])
        }*/
    }
}


// handle mousedown events
function myDown(e){

    // tell the browser we're handling this mouse event
    e.preventDefault()
    e.stopPropagation()

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX)
    var my=parseInt(e.clientY-offsetY)

    // test each shape to see if mouse is inside
    dragok=false
    for(var i=0;i<shapes.length;i++){
        var s=shapes[i]
        // decide if the shape is a rect or circle
        
        console.log(s)
        if(s.width * cubePixels){
            // test if the mouse is inside this rect
            if(mx>s.x * cubePixels && mx<s.x * cubePixels+s.width * cubePixels && my>s.y * cubePixels && my<s.y * cubePixels+s.height * cubePixels){
            // if yes, set that rects isDragging=true
            dragok=true
            s.isDragging=true
            }
        }else{
            var dx=s.x * cubePixels-mx
            var dy=s.y * cubePixels-my
            // test if the mouse is inside this circle
            if(dx*dx+dy*dy<s.r*s.r){
            dragok=true
            s.isDragging=true
            }
        }
    }
    // save the current mouse position
    startX=mx
    startY=my
}


// handle mouseup events
function myUp(e){
    // tell the browser we're handling this mouse event
    e.preventDefault()
    e.stopPropagation()

    // clear all the dragging flags
    dragok = false
    for(var i=0;i<shapes.length;i++){
        shapes[i].isDragging=false
    }
}


// handle mouse moves
function myMove(e){
  // if we're dragging anything...
  if (dragok){

        // tell the browser we're handling this mouse event
        e.preventDefault()
        e.stopPropagation()

        // get the current mouse position
        var mx=parseInt(e.clientX-offsetX)
        var my=parseInt(e.clientY-offsetY)

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx=mx-startX
        var dy=my-startY

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        
        //s.x = posición de la figura (x o y)
        //maxX = tamaño máximo del lienzo (x o y)
        //width = largo x - height = largo y
        for(var i=0;i<shapes.length;i++){
            var s=shapes[i]
            if(s.isDragging){
                //s.x+=dx
                //s.y+=dy
               /* if(dx<0){
                    s.x-=cubePixels
                }else if(dx>0){
                    s.x+=cubePixels
                }

                if(dy<0){
                    s.y-=cubePixels
                }else if(dy>0){
                    s.y+=cubePixels
                }*/

                //if(mx>s.x+(cubePixels - 1)){
                if(mx>s.x*cubePixels+(cubePixels - 1)){
                    if(s.x*cubePixels<maxX-s.width*cubePixels){ //if(s.x<maxX-20){
                        s.x+=1
                    }
                }else if(mx<s.x * cubePixels-(cubePixels - 1)){
                    s.x-=1
                }

                
                if(my>s.y * cubePixels+(cubePixels - 1)){
                    if(s.y * cubePixels<maxY-s.height * cubePixels){
                        s.y+=1
                    }
                }else if(my<s.y * cubePixels-(cubePixels - 1)){
                    s.y-=1                    
                }
                console.log(s.x,s.y)
            }
        }

        // redraw the scene with the new rect positions
        draw();

        // reset the starting mouse position for the next mousemove
        startX=mx;
        startY=my;

    }
}


function wall(){

    var c = document.getElementById("wallCanvas");
    var x = 0
    var y = 0

    var ctx = c.getContext("2d");
    ctx.beginPath();

    /*for(x=0;x<700;x+=7){
        for(y=0;y<700;y+=7){
            //ctx.rect(20, 20, 150, 100)
            ctx.rect(x, y, 7, 7)
            ctx.stroke();
        }
    }*/
    ctx.strokeStyle = "#D2D2D2";

    for(x=0;x<maxX;x+=cubePixels){
        ctx.moveTo(x, 0)
        ctx.lineTo(x, maxY)
        ctx.stroke()
    }

    for(y=0;y<maxY;y+=cubePixels){
        ctx.moveTo(0, y)
        ctx.lineTo(maxX, y)
        ctx.stroke()
    }
}


function addShape(orientation,containerLarge,name,x,y){

    let shapeWidth = 2
    let shapeHeight = 2
    if(orientation == 'vertical'){
        shapeHeight = containerLarge * 5
        
        if(containerLarge * 5 * cubePixels> maxY){
            toastr.warning('Cantidad de contenedores supera el ancho del lienzo')
            return
        }

    }else{
        shapeWidth = containerLarge * 5

        if(containerLarge * 5 * cubePixels> maxX){
            toastr.warning('Cantidad de contenedores supera el largo del lienzo')
            return
        }
    }

    shapes.push({
        containers: containerLarge,
        x: x,
        y: y,
        width: shapeWidth,
        height: shapeHeight,
        orientation: orientation.toLowerCase(),
        fill: colors[colorCount],
        fill2: colorsSecondary[colorCount],
        isDragging: false,
        name: name
    })

    console.log(cubePixels)
    console.log(shapes)


    let colorAlert = 'success'
    if(colorCount==0) colorAlert = 'success'
    if(colorCount==1) colorAlert = 'info'
    if(colorCount==2) colorAlert = 'warning'
    if(colorCount==3) colorAlert = 'danger'
    if(colorCount==4) colorAlert = 'primary'
    
    $("#listRows").append(`
        <div class="alertRows alert alert-${colorAlert} alert-dismissible fade show" role="alert">
            <strong>Fila: ${name}</strong> -
            Containers: ${containerLarge} -
            Orientación: ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            <button id="btnRow${name}" type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `)

    colorCount++
    if(colorCount>4) colorCount = 0

    draw()
    $("#btnRow"+name).on('click', function(){
        deleteRow($(this).attr('id').split('Row')[1])
    })
    
    $("#rowName").val(changeLetter(name))
}

function deleteRow(rowName){
    shapes.splice(shapes.findIndex(x => x.name === rowName),1)
    draw()
}

function changeLetter(lastLetter){
    let letter
    if(lastLetter=='A') letter='B'
    else if(lastLetter=='B') letter='C'
    else if(lastLetter=='C') letter='D'
    else if(lastLetter=='D') letter='E'
    else if(lastLetter=='E') letter='F'
    else if(lastLetter=='F') letter='G'
    else if(lastLetter=='G') letter='H'
    else if(lastLetter=='H') letter='I'
    else if(lastLetter=='I') letter='J'
    else if(lastLetter=='J') letter='K'
    else if(lastLetter=='K') letter='L'
    else if(lastLetter=='L') letter='M'
    else if(lastLetter=='M') letter='N'
    else if(lastLetter=='N') letter='O'
    else if(lastLetter=='O') letter='P'
    else if(lastLetter=='P') letter='Q'
    else if(lastLetter=='Q') letter='R'
    else if(lastLetter=='R') letter='S'
    else if(lastLetter=='S') letter='T'
    else if(lastLetter=='T') letter='U'
    else if(lastLetter=='U') letter='V'
    else if(lastLetter=='V') letter='W'
    else if(lastLetter=='W') letter='X'
    else if(lastLetter=='X') letter='Y'
    else if(lastLetter=='Y') letter='Z'
    else if(lastLetter=='Z') letter='AA'
    else if(lastLetter=='AA') letter='BB'
    else if(lastLetter=='BB') letter='CC'
    else if(lastLetter=='CC') letter='DD'
    else if(lastLetter=='DD') letter='EE'
    else if(lastLetter=='EE') letter='FF'
    else if(lastLetter=='FF') letter='GG'
    else if(lastLetter=='GG') letter='HH'
    else if(lastLetter=='HH') letter='II'
    else if(lastLetter=='II') letter='JJ'
    else if(lastLetter=='JJ') letter='KK'
    else if(lastLetter=='KK') letter='LL'
    else if(lastLetter=='LL') letter='MM'
    else if(lastLetter=='MM') letter='NN'
    else if(lastLetter=='NN') letter='OO'
    else if(lastLetter=='OO') letter='PP'
    else if(lastLetter=='PP') letter='QQ'
    else if(lastLetter=='QQ') letter='RR'
    else if(lastLetter=='RR') letter='SS'
    else if(lastLetter=='SS') letter='TT'
    else if(lastLetter=='TT') letter='UU'
    else if(lastLetter=='UU') letter='VV'
    else if(lastLetter=='VV') letter='WW'
    else if(lastLetter=='WW') letter='XX'
    else if(lastLetter=='XX') letter='YY'
    else if(lastLetter=='YY') letter='ZZ'

    return letter
}


function containerView(type){
    var canvas=document.getElementById("myCanvas")
    
    if(type){
        clear()
        console.log(shapes)
        for(let i=0;i<shapes.length;i++){

            let k = shapes[i].containers
            for(let j=0; j<shapes[i].containers; j++){
                
                if(i%2==0){
                    if(j%2==0){
                        ctx.fillStyle=shapes[i].fill
                    }else{
                        ctx.fillStyle=shapes[i].fill2
                    }
                }else{
                    if(j%2==0){
                        ctx.fillStyle=shapes[i].fill2
                    }else{
                        ctx.fillStyle=shapes[i].fill
                    }
                }
                let contX = shapes[i].x * cubePixels
                let contY = shapes[i].y * cubePixels
                let contWidth = shapes[i].width * cubePixels
                let contHeight = shapes[i].height * cubePixels
                let name = shapes[i].name + k

                if(shapes[i].orientation=='vertical'){
                    contY +=  (j * (contHeight/shapes[i].containers))
                    contHeight = contHeight/shapes[i].containers
                }else{
                    contX +=  (j * (contWidth/shapes[i].containers))
                    contWidth = contWidth/shapes[i].containers

                }
                console.log(name,contX, contY, contWidth, contHeight)
                ctx.fillRect(contX, contY, contWidth, contHeight)
                //ctx.fillRect(shapes[i].x, shapes[i].y + ( j * shapes[i].height), shapes[i].width, shapes[i].height/shapes[i].containers)
                
                ctx.font=cubePixels+"px Arial";
                ctx.textAlign="center"; 
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#FFF";
                ctx.fillText(name, contX+(contWidth/2) , contY  + (contHeight/2))
                k--
            }
        }

        canvas.onmousedown = false
        canvas.onmouseup = false
        canvas.onmousemove = false

    }else{
        draw()
        canvas.onmousedown = myDown
        canvas.onmouseup = myUp
        canvas.onmousemove = myMove
    }

}

//const mapRows = await getMap()

function loadContainer(){
    let list = '<option value="0">Seleccione Container</option>'

    for(let i=0;i<containerList.length;i++){
        list += '<option value="'+containerList[i].id+'">'+containerList[i].row+containerList[i].position+'_'+containerList[i].level+'</option>'
    }

    document.querySelector('#listContainer').innerHTML = list
}

//loadContainer()


async function getMap(){

	let mapsData = await axios.get('api/maps')
    let maps = mapsData.data

	return maps
}