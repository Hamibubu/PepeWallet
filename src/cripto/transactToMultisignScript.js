const bsv = require('bsv');

// La clave privada para firmar la transacción, asegúrate de que controle el UTXO
const privateKey = bsv.PrivateKey.fromWIF('tu_clave_privada_WIF');

// Crear una nueva transacción
let tx = new bsv.Transaction();

// Añadir el UTXO como entrada. Supongamos que esta es la información de tu UTXO
let utxo = {
    "txId" : "32b3e4be4ca77bcf65dfa041ebcfe4a1dcca949fbcb3f42d1058dfb4447cafda",
    "outputIndex" : 0,
    "address" : "la_dirección_asociada_al_UTXO",
    "script" : new bsv.Script.buildPublicKeyHashOut("la_dirección_asociada_al_UTXO"), // Esto construye el script de bloqueo
    "satoshis" : 103206
};

// Añadir el UTXO a la transacción
tx.from(utxo);

// Añadir el destino de los fondos. Supongamos que 'scriptMultifirma' es tu script de destino
const scriptMultifirma = "tu_script_multifirma"; // Debe estar en formato crudo o construido con bsv.Script
tx.addOutput(new bsv.Transaction.Output({
    script: bsv.Script.fromHex(scriptMultifirma),
    satoshis: 100000 // La cantidad que deseas enviar, asegúrate de dejar suficiente para la tasa de minería
}));

// Especificar el cambio, si es necesario
tx.change('tu_dirección_de_cambio');

// Firmar la transacción
tx.sign(privateKey);

// La transacción está lista para ser transmitida
console.log("Transacción en crudo:", tx.serialize(true)); // `true` para deshabilitar la verificación de la transacción, si es necesario
