$.ajax({
    type: "GET",
    url: "/api/welcome",
    success: function(response) {
        console.log(response)
        if(!response.includes("Buyer")){
            $('#compra').remove();
        }
        if(!response.includes("Signer")){
            $('#pendientes').remove();
        }
        const perfilDropdown = $('.btn-group .dropdown-menu');
        const loginItem = perfilDropdown.find('li:nth-child(1)');
        const registroItem = perfilDropdown.find('li:nth-child(2)');
        loginItem.remove();
        registroItem.remove();
        const cerrarSesionLi = $('<li><button id="logout-button" class="dropdown-item" onclick="logout()">Cerrar Sesión</button></li>');
        if(!response.includes("Buyer")){
            $('#compra').remove();
        }
        perfilDropdown.append(cerrarSesionLi);
    },
    error: function(xhr, textStatus, errorThrown) {
        $('#compra').remove();
        $('#pendientes').remove();
        $('#index').remove();
        $('#historial').remove();
    }
    });

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function logout() {
    deleteCookie("authToken");
    window.location.href = "./../../../../views/index/index.html";
}