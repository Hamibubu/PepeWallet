const forosEnTendencia = document.querySelector('#forosEnTendencia');
const forosQueTePodrianInteresar = document.querySelector('#forosQueTePodrianInteresar');
var logged = false;

document.addEventListener('DOMContentLoaded', function () {
    welcome();
    mostrarForos();
});

function acceptTransaction(transactionID) {
    $.ajax({
        type: "GET",
        url: `/api/transactions/accept/${transactionID}`,
        contentType: false,
        success: function (datos) {
            $(`#${transactionID}`).remove();
        },
        error: function (error) {
            alertaPersonalizada('error', error.responseText);
            console.error('Error:', error);
        }
    });
}

function declineTransaction(transactionID) {
    $.ajax({
        type: "GET",
        url: `/api/transactions/decline/${transactionID}`,
        contentType: false,
        success: function (datos) {
            $(`#${transactionID}`).remove();
        },
        error: function (error) {
            alertaPersonalizada('error', error.responseText);
            console.error('Error:', error);
        }
    });
}

function mostrarForos() {
    $.ajax({
        type: "GET",
        url: '/api/transactions',
        contentType: false,
        success: function (datos) {
            for (let i = 0; i < datos.length; i++) {
                const transaccion = datos[i];

                const colDiv = document.createElement("div");
                colDiv.className = "col-md-4 mb-3";
                colDiv.id = `${transaccion.id}`
                
                const cardDiv = document.createElement("div");
                cardDiv.className = "card";
                
                const img = document.createElement("img");
                img.src = `${transaccion.img}`;
                img.className = "card-img-top";
                img.alt = "Imagen de la transacción";
                
                const cardBody = document.createElement("div");
                cardBody.className = "card-body";
                
                const h5 = document.createElement("h5");
                h5.className = "card-title";
                h5.textContent = `${transaccion.item}`;
                
                const p = document.createElement("p");
                p.className = "card-text";
                p.textContent =`${transaccion.description}`;
                
                const btnAutorizar = document.createElement("button");
                btnAutorizar.className = "btn btn-custom";
                btnAutorizar.textContent = "Autorizar";
                btnAutorizar.addEventListener('click', () => acceptTransaction(transaccion.id));

                const btnDenegar = document.createElement("button");
                btnDenegar.className = "btn btn-danger";
                btnDenegar.textContent = "Denegar";
                btnDenegar.addEventListener('click', () => declineTransaction(transaccion.id));

                cardBody.appendChild(h5);
                cardBody.appendChild(p);
                cardBody.appendChild(btnAutorizar);
                cardBody.appendChild(btnDenegar);
                
                cardDiv.appendChild(img);
                cardDiv.appendChild(cardBody);
                
                colDiv.appendChild(cardDiv);
                
                forosEnTendencia.appendChild(colDiv);
            }
        },
        error: function (error) {
            alertaPersonalizada('error', error.responseText);
            console.error('Error:', error);
        }
    })
}

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

function welcome() {
    $.ajax({
        type: "GET",
        url: "/api/welcome",
        success: function(response) {
            if(!response.includes("Buyer")){
                $('#compra').remove();
            }
            if(!response.includes("Signer")){
                $('#pendientes').remove();
            }
            if (!response.includes("Signer")){
                window.location.href = "/";
            }
            const perfilDropdown = $('.btn-group .dropdown-menu');
            const loginItem = perfilDropdown.find('li:nth-child(1)');
            const registroItem = perfilDropdown.find('li:nth-child(2)');
            loginItem.remove();
            registroItem.remove();
            const verPerfilLi = $('<li><a class="dropdown-item" href="./../../../views/perfil/profile.html">Ver perfil</a></li>');
            const cerrarSesionLi = $('<li><button id="logout-button" class="dropdown-item" onclick="logout()">Cerrar Sesión</button></li>');
            perfilDropdown.append(verPerfilLi);
            perfilDropdown.append(cerrarSesionLi);
            logged=true;
        },
        error: function(xhr, textStatus, errorThrown) {
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