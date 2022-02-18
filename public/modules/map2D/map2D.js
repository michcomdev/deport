var ctx, offsetX, offsetY, WIDTH, HEIGHT, dragok, startX, startY, shapes=[]
var listSites = []

var meterX, meterY
var maxX, maxY
var edgeX, edgeY

var cubePixels = 5
var colors = ['#FFF','#DAF7A6','#FFC300','#FF5733','#C70039','#900C3E']
var colorsLetter = ['#000','#000','#000','#000','#FFF','#FFF']
var listContainers = []
var listInventory

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

$('#listSites').on('change', async function () {
    $(".alertRows").remove()

    if(!$(this).val()==0){

        let siteData = await axios.post('/api/siteSingle', {id: $(this).val()})
        let site = siteData.data

        $("#siteName").val(site.name)
        meterX = site.meterX
        meterY = site.meterY

        await createMap()
        await getContainerList($(this).val())

        for(let i=0; i<site.rows.length; i++){

            shapes.push({
                containers: site.rows[i].map2D.containers,
                x: site.rows[i].map2D.x,
                y: site.rows[i].map2D.y,
                width: site.rows[i].map2D.width,
                height: site.rows[i].map2D.height,
                orientation: site.rows[i].orientation,
                isDragging: false,
                name: site.rows[i].row
            })
            
            if(i+1==site.rows.length){
                containerView()
            }
        }

    }else{
        $("#wallCanvas").attr('width', 0)
        $("#wallCanvas").attr('height', 0)
        $("#myCanvas").attr('width', 0)
        $("#myCanvas").attr('height', 0)
        shapes = []
    }

})

async function getContainerList(id){
	let containerData = await axios.post('api/inventorySiteMap',{id: id})
    listInventory = containerData.data
}

async function createMap(){
    shapes = []

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
    canvas.onclick = selectPosition
    //canvas.onmousedown = myDown
    //canvas.onmouseup = myUp
    //canvas.onmousemove = myMove

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

function selectPosition(e){

    // tell the browser we're handling this mouse event
    e.preventDefault()
    e.stopPropagation()

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX)
    var my=parseInt(e.clientY-offsetY)

    $("#sideViewText").text('Seleccione una ubicación')
    $(".trSide").css('cursor','not-allowed')
    $(".trSide").unbind()
    $(".txtSide").text('')
    $(".txtDetail").text('')
    $(".imgSide").prop('src','/public/img/textures/transparent.jpg')
    // test each shape to see if mouse is inside
    for(var i=0;i<listContainers.length;i++){
        var s=listContainers[i]
        // test if the mouse is inside this rect
        if(mx>s.x1 && mx<s.x2 && my>s.y1 && my<s.y2){
           
            //ctx.strokeRect(contX, contY, contWidth, contHeight)
            
            $("#txtSide5").text(s.row+'_5')
            $("#txtSide4").text(s.row+'_4')
            $("#txtSide3").text(s.row+'_3')
            $("#txtSide2").text(s.row+'_2')
            $("#txtSide1").text(s.row+'_1')

7
            console.log(mx,my,s)
            if(s.containers.length>0){
                if(s.containers[0].container.containerLarge=='20'){
                    $("#sideViewText").html(`<b>UBICACIÓN ${s.row}</b> - Contenedores de 20'`)
                    $(".imgSide").css('width','50%')
                }else{
                    $("#sideViewText").html(`<b>UBICACIÓN ${s.row}</b> - Contenedores de 40'`)
                    $(".imgSide").css('width','100%')
                }

                for(var j=0; j<s.containers.length; j++){
                    let container = s.containers[j]
                    $("#trSide"+container.movement.position.level).css('cursor','pointer')
                    //$("#txtSide"+container.movement.position.level).text(s.row+'_'+container.movement.position.level)
                    $("#imgSide"+container.movement.position.level).prop('src','/public/img/textures/'+container.container.containerTexture+'5.jpg')
                    
                    //$("#trSide"+container.movement.position.level).attr('onclick',`showContainer(${i},${j})`)
                    $("#trSide"+container.movement.position.level).attr('data_i',i)
                    $("#trSide"+container.movement.position.level).attr('data_j',j)
                    

                    $("#trSide"+container.movement.position.level).on('click', function () {
                        showContainer($(this).attr('data_i'),$(this).attr('data_j'))
                    })
                    //showContainer(i,j)
                }
            }else{
                $("#sideViewText").html(`<b>UBICACIÓN ${s.row}</b> - Ubicación sin Contenedores`)

            }
        }
    }
    // save the current mouse position
    startX=mx
    startY=my
}

function showContainer(i,j){
    let data = listContainers[i].containers[j]

    console.log(data)
    $("#txtDetailClient").text(data.container.clients.name)
    $("#txtDetailNumber").text(data.container.containerNumber)
    $("#txtDetailType").text(data.container.containertypes.name)
    $("#txtDetailPosition").text(data.movement.position.row+data.movement.position.position+'_'+data.movement.position.level)
    $("#txtDetailDate").text(moment(data.container.movements.reverse().find(x => x.movement === 'INGRESADO').datetime).format('DD/MM/YYYY HH:mm'))
    
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


function containerView(){
    var canvas=document.getElementById("myCanvas")

    clear()
    
    listContainers = []
    for(let i=0;i<shapes.length;i++){

        let k = shapes[i].containers
        for(let j=0; j<shapes[i].containers; j++){

            let containers = listInventory.filter(x => x.movement.position.row === shapes[i].name && x.movement.position.position === k)
            console.log(shapes[i].name + k)

            if(containers.length==0 || containers[0].container.containerLarge=='20'){

                ctx.fillStyle = colors[containers.length]
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
                ctx.fillRect(contX, contY, contWidth, contHeight)
                ctx.strokeRect(contX, contY, contWidth, contHeight)
                //ctx.fillRect(shapes[i].x, shapes[i].y + ( j * shapes[i].height), shapes[i].width, shapes[i].height/shapes[i].containers)
                
                ctx.font = cubePixels+"px Arial"
                ctx.textAlign = "center" 
                ctx.textBaseline = "middle"
                ctx.fillStyle = colorsLetter[containers.length]
                ctx.fillText(name, contX+(contWidth/2) , contY  + (contHeight/2))
                k--

                listContainers.push({
                    row: name,
                    x1: contX,
                    x2: contX+contWidth, 
                    y1: contY,  
                    y2: contY+contHeight,
                    containers: containers
                })

            }else{

                ctx.fillStyle = colors[containers.length]
                let contX = shapes[i].x * cubePixels
                let contY = shapes[i].y * cubePixels
                let contWidth = shapes[i].width * cubePixels
                let contHeight = shapes[i].height * cubePixels
                let name = shapes[i].name + k

                if(shapes[i].orientation=='vertical'){
                    contY +=  (j * (contHeight/shapes[i].containers)) - contHeight/shapes[i].containers
                    contHeight = contHeight/shapes[i].containers * 2
                }else{
                    contX +=  (j * (contWidth/shapes[i].containers)) -  contWidth/shapes[i].containers
                    contWidth = contWidth/shapes[i].containers * 2
                }
                console.log(contX, contY, contWidth, contHeight)
                ctx.fillRect(contX, contY, contWidth, contHeight)
                ctx.strokeRect(contX, contY, contWidth, contHeight)
                //ctx.fillRect(shapes[i].x, shapes[i].y + ( j * shapes[i].height), shapes[i].width, shapes[i].height/shapes[i].containers)
                
                ctx.font = cubePixels+"px Arial"
                ctx.textAlign = "center" 
                ctx.textBaseline = "middle"
                ctx.fillStyle = colorsLetter[containers.length]
                ctx.fillText(name, contX+(contWidth/2) , contY  + (contHeight/2))
                k--

                listContainers.push({
                    row: name,
                    x1: contX,
                    x2: contX+contWidth, 
                    y1: contY,  
                    y2: contY+contHeight,
                    containers: containers
                })
            }
        }
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