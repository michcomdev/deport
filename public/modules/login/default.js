const rutSelector = document.querySelector('#rut')

rutSelector.addEventListener('keyup', function () {
    validateRut(this.value)
})

function validateRut(userRut) {
    let rut = new Rut(userRut)

    if ( rut.isValid ) {
        rutSelector.value = rut.getNiceRut()
    }
}