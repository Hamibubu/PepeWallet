var logged = false;


welcome();
getMoney();


function getMoney(){
    $.ajax({
        type: "GET",
        url: "/api/money",
        success: function(response) {
            $('#dlls strong').text("$ " + response.dollars + " DLLs");
            $('#btc strong').text(response.currentBTC + " BTC");
        },
        error: function(xhr, textStatus, errorThrown) {
            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'info',
                title: 'Error obteniendo tu dinero!',
                showConfirmButton: false,
                timer: 3000
            })
        }
      });
}

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
            if(!response.includes("Signer")){
                $('#pendientes').remove();
            }
            const cerrarSesionLi = $('<li><button id="logout-button" class="dropdown-item" onclick="logout()">Cerrar Sesión</button></li>');
            perfilDropdown.append(cerrarSesionLi);
            logged = true;
        },
        error: function(xhr, textStatus, errorThrown) {
            window.location.href = "./../../views/contacto/contactanos.html"
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