import { MapControls } from '../../js/three/OrbitControls.js'
import { FontLoader } from '../../js/three/FontLoader.js'
import { TextGeometry } from '../../js/three/TextGeometry.js'


//Definición de escena
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xf0f0f0 );
const renderer = new THREE.WebGLRenderer()
renderer.setSize(document.querySelector('#map').offsetWidth, document.querySelector('#map').offsetHeight)
document.querySelector('#map').appendChild( renderer.domElement )

//Creación de objeto de carga de texturas
const loader = new THREE.TextureLoader()

//SUELO
const geometryFloor = new THREE.PlaneGeometry( 35, 35 )

const materialFloor = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/floor.jpg'), side: THREE.DoubleSide})
const floor = new THREE.Mesh( geometryFloor, materialFloor )
floor.position.y = -0.435
floor.rotation.x = Math.PI / 2;
scene.add(floor)


const loaderText = new FontLoader()

const mapRows = getMap()
//Set row letters

loaderText.load( '/public/js/three/fonts/helvetiker_regular.typeface.json', function ( font ) {
    
    for(let j=0;j<mapRows.length;j++){

        //console.log(font)
        const geometryText = new TextGeometry( mapRows[j].row, {
            font: font,
            size: 0.4,
            height: 0.1
        })

        const textMesh = new THREE.Mesh(geometryText,[
            new THREE.MeshPhongMaterial({ color: 0x00c0ff}), //front
            new THREE.MeshPhongMaterial({ color: 0x0085b1}) //side
        ])

        textMesh.position.y = -0.3
        if(mapRows[j].orientation=='vertical'){
            textMesh.position.z = mapRows[j].positionZ + 1.5
            textMesh.position.x = mapRows[j].positionX - 0.2
        }else{
            textMesh.position.z = mapRows[j].positionZ
            textMesh.position.x = mapRows[j].positionX + 1.5
        }
        scene.add(textMesh)
    }

})



const containerList = setPositions(scene)

//Cámara
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 15

//Controles de cámara
const controls = new MapControls( camera, renderer.domElement )
controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 1
controls.maxDistance = 100
controls.maxPolarAngle = Math.PI / 2



// lights

/*const dirLight1 = new THREE.DirectionalLight( 0xffffff )
dirLight1.position.set( -1, 1, 1 ) //x,y,z
scene.add( dirLight1 )

const dirLight2 = new THREE.DirectionalLight( 0x002288 )
dirLight2.position.set( - 1, - 1, - 1 )
scene.add( dirLight2 )*/

const ambientLight = new THREE.AmbientLight( 0xffffff )
scene.add( ambientLight )

//Renderización de imagen
function animate() {
    requestAnimationFrame( animate ) //Similar a setinterval, se pausa automáticamente si la pestaña no está en foco
    //cube.rotation.x += 0.001
    //cube.rotation.y += 0.001
    renderer.render( scene, camera )
    TWEEN.update()

}
animate()



document.querySelector('#btnForward').addEventListener('mousedown', () => {
moveStart('forward')
})
document.querySelector('#btnForward').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnBackwards').addEventListener('mousedown', () => {
moveStart('backwards')
})
document.querySelector('#btnBackwards').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnLeft').addEventListener('mousedown', () => {
moveStart('left')
})
document.querySelector('#btnLeft').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnRight').addEventListener('mousedown', () => {
moveStart('right')
})
document.querySelector('#btnRight').addEventListener('mouseup', () => {
moveEnd()
})



document.querySelector('#btnUp').addEventListener('mousedown', () => {
moveStart('up')
})
document.querySelector('#btnUp').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnDown').addEventListener('mousedown', () => {
moveStart('down')
})
document.querySelector('#btnDown').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnLeftSide').addEventListener('mousedown', () => {
moveStart('leftSide')
})
document.querySelector('#btnLeftSide').addEventListener('mouseup', () => {
moveEnd()
})

document.querySelector('#btnRightSide').addEventListener('mousedown', () => {
moveStart('rightSide')
})
document.querySelector('#btnRightSide').addEventListener('mouseup', () => {
moveEnd()
})


document.querySelector('#btnReset').addEventListener('mouseup', () => {

    for(let i=0;i<containerList.length;i++){ //Se restaura el coloreado de los container no seleccionados
        containerList[i].mesh.material[0].color.setHex(0xffffff)
        containerList[i].mesh.material[1].color.setHex(0xffffff)
        containerList[i].mesh.material[2].color.setHex(0xffffff)
        containerList[i].mesh.material[3].color.setHex(0xffffff)
        containerList[i].mesh.material[4].color.setHex(0xffffff)
        containerList[i].mesh.material[5].color.setHex(0xffffff)

        containerList[i].mesh.material[0].transparent = false
        containerList[i].mesh.material[1].transparent = false
        containerList[i].mesh.material[2].transparent = false
        containerList[i].mesh.material[3].transparent = false
        containerList[i].mesh.material[4].transparent = false
        containerList[i].mesh.material[5].transparent = false

        containerList[i].mesh.material[0].opacity = 1
        containerList[i].mesh.material[1].opacity = 1
        containerList[i].mesh.material[2].opacity = 1
        containerList[i].mesh.material[3].opacity = 1
        containerList[i].mesh.material[4].opacity = 1
        containerList[i].mesh.material[5].opacity = 1
    }
    clearInterval(interval)
    controls.reset();
})

document.querySelector('#btnChange').addEventListener('mouseup', () => {
    const coords = { x: camera.position.x, y: camera.position.y };
    console.log(coords)
    new TWEEN.Tween(coords)
        .to({ x: 0, y: 10 })
        .onUpdate(() =>
            camera.position.set(coords.x, coords.y, camera.position.z)
        )
        .start();

    /*const edges = new THREE.EdgesGeometry( geometry20 );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    scene.add( line );*/
})



var counter
var interval

function moveStart(toPosition) {
    counter = setInterval(function() {

        if(toPosition=='forward'){
            controls.object.position.z -= 0.1
        }else if(toPosition=='left'){
            controls.object.position.x -= 0.1
        }else if(toPosition=='right'){
            controls.object.position.x += 0.1
        }else if(toPosition=='backwards'){
            controls.object.position.z += 0.1

        }else if(toPosition=='up'){
            //camera.rotation.x += 10
            let x = camera.position.x
            let y = camera.position.y + 0.05
            let z = camera.position.z

            camera.position.set(x, y, z);
            controls.update()

        }else if(toPosition=='leftSide'){
            
            let x = camera.position.x
            let z = camera.position.z
            if(camera.position.x <= 0 && camera.position.z >= -15){
                if(camera.position.z >= 0){
                    x -= 0.1
                }else{
                    x += 0.1
                }
                z -= 0.1
            }else{
                if(camera.position.z < 0){
                    x += 0.1
                    console.log('here1')
                }else{
                    x -= 0.1
                    console.log('here2')
                }
                z += 0.1
            }
            camera.position.set(x, 0, z);
            controls.update()

        }else if(toPosition=='rightSide'){
            let x = camera.position.x
            let z = camera.position.z

            if(camera.position.x >= 0 && camera.position.z >= -15){
                if(camera.position.z >= 0){
                    x += 0.1
                }else{
                    x -= 0.1
                }
                z -= 0.1
            }else{
                if(camera.position.z < 0){
                    x -= 0.1
                }else{
                    x += 0.1
                }
                z += 0.1
            }
            camera.position.set(x, 0, z);
            controls.update()

        }else if(toPosition=='down'){
            camera.rotation.x -= 0.3
            let x = camera.position.x
            let y = camera.position.y - 0.05
            let z = camera.position.z

            camera.position.set(x, y, z);
            controls.update()
        }

    }, 20)
}

function moveEnd() {
    clearInterval(counter)
}


function loadContainer(){
    let list = '<option value="0">Seleccione Container</option>'

    for(let i=0;i<containerList.length;i++){
        list += '<option value="'+containerList[i].id+'">'+containerList[i].row+containerList[i].position+'_'+containerList[i].level+'</option>'
    }

    document.querySelector('#listContainer').innerHTML = list
}

loadContainer()


function setBlink(container){
    //let container = containerList.find(ar => ar.id == document.querySelector('#listContainer').value).mesh
    //let container = container1
    if(interval){
        clearInterval(interval)
    }

    //console.log(containerList)

    for(let i=0;i<containerList.length;i++){ //Se restaura el coloreado de los container no seleccionados
        containerList[i].mesh.material[0].color.setHex(0xffffff)
        containerList[i].mesh.material[1].color.setHex(0xffffff)
        containerList[i].mesh.material[2].color.setHex(0xffffff)
        containerList[i].mesh.material[3].color.setHex(0xffffff)
        containerList[i].mesh.material[4].color.setHex(0xffffff)
        containerList[i].mesh.material[5].color.setHex(0xffffff)

        containerList[i].mesh.material[0].transparent = true
        containerList[i].mesh.material[1].transparent = true
        containerList[i].mesh.material[2].transparent = true
        containerList[i].mesh.material[3].transparent = true
        containerList[i].mesh.material[4].transparent = true
        containerList[i].mesh.material[5].transparent = true

        containerList[i].mesh.material[0].opacity = 0.3
        containerList[i].mesh.material[1].opacity = 0.3
        containerList[i].mesh.material[2].opacity = 0.3
        containerList[i].mesh.material[3].opacity = 0.3
        containerList[i].mesh.material[4].opacity = 0.3
        containerList[i].mesh.material[5].opacity = 0.3

    }

    container = container.mesh

    container.material[0].color.setHex(0x1bff00)
    container.material[1].color.setHex(0x1bff00)
    container.material[2].color.setHex(0x1bff00)
    container.material[3].color.setHex(0x1bff00)
    container.material[4].color.setHex(0x1bff00)
    container.material[5].color.setHex(0x1bff00)

    container.material[0].transparent = false
    container.material[1].transparent = false
    container.material[2].transparent = false
    container.material[3].transparent = false
    container.material[4].transparent = false
    container.material[5].transparent = false

    container.material[0].opacity = 1
    container.material[1].opacity = 1
    container.material[2].opacity = 1
    container.material[3].opacity = 1
    container.material[4].opacity = 1
    container.material[5].opacity = 1

    interval = setInterval(function() {

        let color = (container.material[0].color.getHex()==0x1bff00) ? 0xffffff : 0x1bff00

        container.material[0].color.setHex(color)
        container.material[1].color.setHex(color)
        container.material[2].color.setHex(color)
        container.material[3].color.setHex(color)
        container.material[4].color.setHex(color)
        container.material[5].color.setHex(color)
    }, 650)
}


document.querySelector("#listContainer").onchange = function (e) {

    let container = containerList.find(ar => ar.id == this.value)

    let x = container.positions.x
    let y = container.positions.y
    let z = container.positions.z

    controls.target.set(x, y, z)
    if(container.rotation.y==0){
        z += 4
    }else{
        x -= 4
    }

    //////TWEEN, animación de cámara//////
    const coords = { x: camera.position.x, y: camera.position.y, z: camera.position.z}
    console.log(coords)
    //.to({ x: x, y: y, z: z })
    new TWEEN.Tween(coords)
        .to({ x: x, y: y, z: z})
        .onUpdate(() =>
            camera.position.set(coords.x, coords.y, coords.z)
        )
        .start()

    camera.position.set(x, y, z)
    controls.update();

    setBlink(container)
}

////////////////////////////POSICIONES/////////////////////////////

function setPositions(scene){
	
	const geometryBasic = new THREE.BoxGeometry(2,0.86,0.8)
	const geometryContainer20 = new THREE.BoxGeometry(2,0.86,0.8)
	const geometryContainer40 = new THREE.BoxGeometry(4,0.86,0.8)
	//const materialBasic1 = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
	//const materialBasic2 = new THREE.MeshPhongMaterial({ color: 0x00ff4d, flatShading: true })

	const loader = new THREE.TextureLoader()

	const materials = [
		{
			id: 1,
			material: [
				'cai1.jpg',//Derecha
				'cai2.jpg',//Izquierda
				'cai3.jpg',//Arriba
				'cai4.jpg',//Abajo
				'cai5.jpg',//Frente
				'cai6.jpg',//Atrás
			]
		},
		{
			id: 2,
			material: [
				'hp1.jpg',//Derecha
				'hp2.jpg',//Izquierda
				'hp3.jpg',//Arriba
				'hp4.jpg',//Abajo
				'hp5.jpg',//Frente
				'hp6.jpg',//Atrás
			]
		},
		{
			id: 3,
			material: [
				'ma1.jpg',//Derecha
				'ma2.jpg',//Izquierda
				'ma3.jpg',//Arriba
				'ma4.jpg',//Abajo
				'ma5.jpg',//Frente
				'ma6.jpg',//Atrás
			]
		},
		{
			id: 4,
			material: [
				'blu1.jpg',//Derecha
				'blu2.jpg',//Izquierda
				'blu3.jpg',//Arriba
				'blu4.jpg',//Abajo
				'blu5.jpg',//Frente
				'blu6.jpg',//Atrás
			]
		},
		{
			id: 5,
			material: [
				'gre1.jpg',//Derecha
				'gre2.jpg',//Izquierda
				'gre3.jpg',//Arriba
				'gre4.jpg',//Abajo
				'gre5.jpg',//Frente
				'gre6.jpg',//Atrás
			]
		},
		{
			id: 6,
			material: [
				'mh1.jpg',//Derecha
				'mh2.jpg',//Izquierda
				'mh3.jpg',//Arriba
				'mh4.jpg',//Abajo
				'mh5.jpg',//Frente
				'mh6.jpg',//Atrás
			]
		},
		{
			id: 7,
			material: [
				'mv1.jpeg',//Derecha
				'mv2.jpeg',//Izquierda
				'mv3.jpeg',//Arriba
				'mv4.jpeg',//Abajo
				'mv5.jpeg',//Frente
				'mv6.jpeg',//Atrás
			]
		},
		{
			id: 8,
			material: [
				'mb1.jpeg',//Derecha
				'mb2.jpeg',//Izquierda
				'mb3.jpeg',//Arriba
				'mb4.jpeg',//Abajo
				'mb5.jpeg',//Frente
				'mb6.jpeg',//Atrás
			]
		}
	]
	//Nomenclatura: A5_2 = Fila A, posición 5, nivel 2 

	const rows = getMap()

	//let materialIndex = 1
	//let material = materialBasic2


	const containerList = [
							{id: 0, row: 'A', position: 1, level: 2, large: 20, type: 1},
							//Ejemplo: Posición A1_2
							//Fila A, posición 1, nivel (altura) 2, largo de container 20, tipo = textura
							{id: 0, row: 'A', position: 2, level: 1, large: 20, type: 2},
							{id: 0, row: 'A', position: 3, level: 1, large: 20, type: 3},
							{id: 0, row: 'A', position: 4, level: 1, large: 20, type: 4},
							{id: 0, row: 'A', position: 5, level: 1, large: 20, type: 5},
							{id: 0, row: 'A', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'A', position: 7, level: 1, large: 20, type: 4},
							{id: 0, row: 'A', position: 8, level: 1, large: 20, type: 3},
							{id: 0, row: 'A', position: 9, level: 1, large: 20, type: 3},
							
							{id: 0, row: 'B', position: 1, level: 1, large: 40, type: 3},
							{id: 0, row: 'B', position: 1, level: 2, large: 40, type: 1},
							{id: 0, row: 'B', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'B', position: 4, level: 1, large: 40, type: 3},
							{id: 0, row: 'B', position: 4, level: 2, large: 40, type: 3},
							{id: 0, row: 'B', position: 4, level: 3, large: 40, type: 4},
							{id: 0, row: 'B', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'B', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'B', position: 7, level: 1, large: 40, type: 5},
							{id: 0, row: 'B', position: 7, level: 2, large: 40, type: 5},
							{id: 0, row: 'B', position: 7, level: 3, large: 40, type: 5},
							{id: 0, row: 'B', position: 9, level: 1, large: 20, type: 4},

							{id: 0, row: 'C', position: 3, level: 1, large: 20, type: 5},
							{id: 0, row: 'C', position: 4, level: 1, large: 20, type: 4},
							{id: 0, row: 'C', position: 3, level: 2, large: 40, type: 3},
							{id: 0, row: 'C', position: 3, level: 3, large: 20, type: 2},

							{id: 0, row: 'D', position: 1, level: 1, large: 20, type: 2},
							{id: 0, row: 'D', position: 2, level: 1, large: 20, type: 1},
							{id: 0, row: 'D', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'D', position: 4, level: 1, large: 40, type: 3},
							{id: 0, row: 'D', position: 4, level: 2, large: 40, type: 2},
							{id: 0, row: 'D', position: 4, level: 3, large: 40, type: 2},
							{id: 0, row: 'D', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'D', position: 7, level: 1, large: 20, type: 4},
							{id: 0, row: 'D', position: 9, level: 1, large: 20, type: 4},

							{id: 0, row: 'E', position: 1, level: 1, large: 40, type: 3},
							{id: 0, row: 'E', position: 1, level: 2, large: 40, type: 1},
							{id: 0, row: 'E', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'E', position: 4, level: 1, large: 40, type: 3},
							{id: 0, row: 'E', position: 4, level: 2, large: 40, type: 3},
							{id: 0, row: 'E', position: 4, level: 3, large: 40, type: 4},
							{id: 0, row: 'E', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'E', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'E', position: 7, level: 1, large: 40, type: 5},
							{id: 0, row: 'E', position: 7, level: 2, large: 40, type: 5},
							{id: 0, row: 'E', position: 7, level: 3, large: 40, type: 5},
							{id: 0, row: 'E', position: 9, level: 1, large: 20, type: 4},


							{id: 0, row: 'G', position: 3, level: 1, large: 20, type: 5},
							{id: 0, row: 'G', position: 4, level: 1, large: 20, type: 4},
							{id: 0, row: 'G', position: 3, level: 2, large: 40, type: 3},
							{id: 0, row: 'G', position: 3, level: 3, large: 20, type: 2},


							{id: 0, row: 'H', position: 1, level: 1, large: 20, type: 1},
							{id: 0, row: 'H', position: 1, level: 2, large: 20, type: 1},
							{id: 0, row: 'H', position: 2, level: 1, large: 20, type: 2},
							{id: 0, row: 'H', position: 3, level: 1, large: 20, type: 3},
							{id: 0, row: 'H', position: 4, level: 1, large: 20, type: 4},
							{id: 0, row: 'H', position: 5, level: 1, large: 20, type: 5},
							{id: 0, row: 'H', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'H', position: 7, level: 1, large: 20, type: 4},
							{id: 0, row: 'H', position: 8, level: 1, large: 20, type: 3},
							{id: 0, row: 'H', position: 9, level: 1, large: 20, type: 3},

							{id: 0, row: 'I', position: 1, level: 1, large: 40, type: 3},
							{id: 0, row: 'I', position: 1, level: 2, large: 40, type: 1},
							{id: 0, row: 'I', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'I', position: 4, level: 1, large: 40, type: 3},
							{id: 0, row: 'I', position: 4, level: 2, large: 40, type: 3},
							{id: 0, row: 'I', position: 4, level: 3, large: 40, type: 4},
							{id: 0, row: 'I', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'I', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'I', position: 7, level: 1, large: 40, type: 5},
							{id: 0, row: 'I', position: 7, level: 2, large: 40, type: 5},
							{id: 0, row: 'I', position: 7, level: 3, large: 40, type: 5},
							{id: 0, row: 'I', position: 9, level: 1, large: 20, type: 4},

							
							

						

							{id: 0, row: 'J', position: 1, level: 1, large: 40, type: 3},
							{id: 0, row: 'J', position: 1, level: 2, large: 40, type: 1},
							{id: 0, row: 'J', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'J', position: 4, level: 1, large: 40, type: 3},
							{id: 0, row: 'J', position: 4, level: 2, large: 40, type: 3},
							{id: 0, row: 'J', position: 4, level: 3, large: 40, type: 4},
							{id: 0, row: 'J', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'J', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'J', position: 7, level: 1, large: 20, type: 5},
							{id: 0, row: 'J', position: 7, level: 2, large: 20, type: 3},
							{id: 0, row: 'J', position: 7, level: 3, large: 20, type: 3},
							{id: 0, row: 'J', position: 8, level: 1, large: 20, type: 5},
							{id: 0, row: 'J', position: 8, level: 2, large: 20, type: 5},
							{id: 0, row: 'J', position: 9, level: 1, large: 20, type: 4},

							{id: 0, row: 'K', position: 1, level: 1, large: 20, type: 3},
							{id: 0, row: 'K', position: 1, level: 2, large: 20, type: 4},
							{id: 0, row: 'K', position: 2, level: 1, large: 20, type: 5},
							{id: 0, row: 'K', position: 2, level: 2, large: 20, type: 5},
							{id: 0, row: 'K', position: 3, level: 1, large: 20, type: 1},
							{id: 0, row: 'K', position: 4, level: 1, large: 40, type: 1},
							{id: 0, row: 'K', position: 4, level: 2, large: 40, type: 4},
							{id: 0, row: 'K', position: 4, level: 3, large: 40, type: 4},
							{id: 0, row: 'K', position: 6, level: 1, large: 20, type: 5},
							{id: 0, row: 'K', position: 6, level: 2, large: 20, type: 2},
							{id: 0, row: 'K', position: 7, level: 1, large: 20, type: 2},
							{id: 0, row: 'K', position: 7, level: 2, large: 20, type: 1},
							{id: 0, row: 'K', position: 7, level: 3, large: 20, type: 1},
							{id: 0, row: 'K', position: 8, level: 1, large: 20, type: 5},
							{id: 0, row: 'K', position: 8, level: 2, large: 20, type: 5},
							{id: 0, row: 'K', position: 9, level: 1, large: 20, type: 4},

							{id: 0, row: 'L', position: 9, level: 1, large: 20, type: 2},
							{id: 0, row: 'L', position: 7, level: 1, large: 40, type: 1},
							{id: 0, row: 'L', position: 4, level: 1, large: 20, type: 2},
							{id: 0, row: 'L', position: 3, level: 1, large: 20, type: 2}
						]

		
	for(let i=0;i<containerList.length;i++){

		let positionX = rows.find(x => x.row === containerList[i].row).positionX
		let positionZ = rows.find(x => x.row === containerList[i].row).positionZ
		let rotationY = rows.find(x => x.row === containerList[i].row).rotationY
		let orientation = rows.find(x => x.row === containerList[i].row).orientation
		let level = containerList[i].level
		let position = containerList[i].position
		let large = containerList[i].large
		let type = containerList[i].type
		//let material = materials.find(x => x.id === containerList[i].type).material
		let materialTextures = materials.find(x => x.id === containerList[i].type).material

		let material = [
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[0])}),//Derecha
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[1])}),//Izquierda
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[2])}),//Arriba
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[3])}),//Abajo
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[4])}),//Frente
			new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, map: loader.load('/public/img/textures/'+materialTextures[5])}),//Atrás
		]


		if(orientation == 'vertical'){
			positionZ = positionZ + ((position - 1) * - 2)
			if(large==40){
				positionZ -= 1
			}
		}else{
			positionX = positionX + ((position - 1) * - 2)
			if(large==40){
				positionX -= 1
			}
		}

		let geometry = geometryContainer20
		if(large==40){
			geometry = geometryContainer40
		}


		//const container = new THREE.Mesh( geometry, material )
		const container = new THREE.Mesh( geometry, material )


		container.position.x = positionX
		container.position.y = (level - 1) * 0.86 //Se suman 0.86 radianes por nivel, partiendo de 0
		container.position.z = positionZ
		container.rotation.y = rotationY

		containerList[i].id = i+1
		containerList[i].positions = container.position
		containerList[i].rotation = container.rotation
		containerList[i].mesh = container

		scene.add(container)
	}
    return containerList

}


function getMap(){
	const map = [
				{row: 'A',
					orientation: 'vertical',
					positionX: 10,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'B', 
					orientation: 'vertical',
					positionX: 9.1,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'C', 
					orientation: 'vertical',
					positionX: 8.2,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'D', 
					orientation: 'vertical',
					positionX: 0.9,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'E', 
					orientation: 'vertical',
					positionX: 0,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'F', 
					orientation: 'vertical',
					positionX: -0.9,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'G', 
					orientation: 'vertical',
					positionX: -8.2,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'H', 
					orientation: 'vertical',
					positionX: -9.1,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'I', 
					orientation: 'vertical',
					positionX: -10,
					positionZ: 8,
					rotationY: Math.PI / 2,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'J', 
					orientation: 'horizontal',
					positionX: 8,
					positionZ: -15,
					rotationY: 0,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'K', 
					orientation: 'horizontal',
					positionX: 8,
					positionZ: -14.1,
					rotationY: 0,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				},
				{row: 'L', 
					orientation: 'horizontal',
					positionX: 8,
					positionZ: -13.2,
					rotationY: 0,
					positions: [
						{position: 1, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 2, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 3, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 4, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 5, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 6, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 7, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 8, levels: [{level: 1},{level: 2},{level: 3}]},
						{position: 9, levels: [{level: 1},{level: 2},{level: 3}]}
					]
				}]
	return map
}