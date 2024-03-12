var logged = false;

document.addEventListener('DOMContentLoaded', function() {
    welcome();
});

function welcome() {
    $.ajax({
        type: "GET",
        url: "/api/welcome",
        success: function(response) {
            Swal.fire({
                title: escapeHtml(response),
                text: 'PepeWallet te da la bienvenida',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'bienvenidap',
                    title: 'bienvenidat',
                    content: 'bienvenidac'
                },
                timer: 10000
            })
            const perfilDropdown = $('.btn-group .dropdown-menu');
            const loginItem = perfilDropdown.find('li:nth-child(1)');
            const registroItem = perfilDropdown.find('li:nth-child(2)');
            loginItem.remove();
            registroItem.remove();
            if(!response.includes("Buyer")){
                $('#compra').remove();
            }
            const cerrarSesionLi = $('<li><button id="logout-button" class="dropdown-item" onclick="logout()">Cerrar Sesión</button></li>');
            perfilDropdown.append(cerrarSesionLi);
            logged = true;
        },
        error: function(xhr, textStatus, errorThrown) {
            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'info',
                title: 'Bienvenido, parece que no has iniciado sesión',
                showConfirmButton: false,
                timer: 3000
            })
        }
      });
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function logout() {
    deleteCookie("authToken");
    window.location.href = "./../../views/index/index.html";
}

function escapeHtml(unsafe) {
    return unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}