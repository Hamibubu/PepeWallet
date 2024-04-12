$.ajax({
    type: "GET",
    url: "/api/history",
    success: function(datos) {
        for (let i = 0; i < datos.length; i++) {
            const transaccion = datos[i];
            const colDiv = document.createElement("div");
            colDiv.className = "col-md-3 mb-4";

            const cardDiv = document.createElement("div");
            cardDiv.className = "card h-100";
            colDiv.appendChild(cardDiv);

            const imageContainer = document.createElement("div");
            imageContainer.className = "artist-image-container";
            cardDiv.appendChild(imageContainer);

            const artistImage = document.createElement("img");
            artistImage.src = `${transaccion.img}`;
            artistImage.className = "card-img-top artist-image p-3 mt-4 img-fluid";
            artistImage.alt = "Artista 1";
            imageContainer.appendChild(artistImage);

            const cardBody = document.createElement("div");
            cardBody.className = "card-body d-flex flex-column";
            cardDiv.appendChild(cardBody);

            const cardTitle = document.createElement("h2");
            cardTitle.className = "card-title text-center";
            cardTitle.textContent = `${transaccion.item}`;
            cardBody.appendChild(cardTitle);

            const cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.textContent = `${transaccion.description}`; 
            cardBody.appendChild(cardText);

            document.getElementById('trnd').appendChild(colDiv);
        }
    },
    error: function(xhr, textStatus, errorThrown) {

    }
});