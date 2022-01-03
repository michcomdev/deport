let userCredentials

ready(async ()=> {
    let sessionResult = await axios('api/session')
    userCredentials = sessionResult.data

    document.querySelector('#userCredentials').innerHTML = sessionResult.data.name+' '+sessionResult.data.lastname/*.split(' ')[0].toUpperCase()*/

    setInterval(()=> {
        checkSession()
    }, 60000)
})

function loadingHandler(status) {
    let loadingSelector = querySelector('#loadingScreen')
    let closeLoadingScreenContainerSelector = querySelector('#closeLoadingScreenContainer')
    let closeLoadingScreenSelector = querySelector('#closeLoadingScreen')

    closeLoadingScreenSelector.addEventListener('click', ()=> {
        loadingSelector.style.display = 'none'
    })

    let closeLoadingTimeout = setTimeout(() => {
        closeLoadingScreenContainerSelector.style.display = 'block'
    }, 6000)

    if (!status != status === 'stop') {
        loadingSelector.style.display = 'none'
        clearTimeout(closeLoadingTimeout)

        console.log('LOADING STOPPED')
    } else if (status === 'start') {
        closeLoadingScreenContainerSelector.style.display = 'none'

        loadingSelector.style.display = 'flex'
        loadingSelector.style.position = 'fixed'
    } else {
        loadingSelector.style.display = 'none'
        console.log('LOADING STOPPED')
    }
}