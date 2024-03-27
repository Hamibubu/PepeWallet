document.addEventListener('DOMContentLoaded', function () {
    foroForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!e.currentTarget.checkValidity()) {
            e.stopPropagation();
        }
        const formData = new FormData();
        formData.append('Item', $('#Item').val());
        formData.append('Descripcion', $('#Descripcion').val());
        formData.append('precio', $('#precio').val());
        const archivoInput = $('#imagen')[0];
        if (archivoInput.files.length > 0) {
            formData.append('img', archivoInput.files[0]);
        }
        $.ajax({
            type: "POST",
            url: '/api/buy',
            data: formData,
            contentType: false,
            processData: false,
            success: function (datos) {
                Swal.fire({
                    toast: true,
                    position: 'top-right',
                    icon: 'success',
                    title: 'Comprada creada exitosamente...',
                    showConfirmButton: false,
                    timer: 1000
                })
            },
            error: function (error) {
                alertaPersonalizada('error', error.responseText);
                console.error('Error:', error);
            }
        })
    })
})

function alertaPersonalizada(type, msg) {
    Swal.fire({
        toast: true,
        position: 'top-right',
        icon: type,
        title: msg,
        showConfirmButton: false,
        timer: 3000
    })
}