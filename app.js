const contenedorProductos = document.getElementById('contenedor-productos');

// Función para mostrar los productos en el catálogo
function renderizarProductos() {
    // Limpiamos el contenedor por si acaso
    contenedorProductos.innerHTML = "";

    // Recorremos el array de productos (que viene de productos.js)
    productos.forEach(producto => {
        // Creamos el elemento de la tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('producto-tarjeta');

        // Metemos el HTML interno de la tarjeta con los datos del producto
        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p class="precio">$${producto.precio}</p>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
        `;

        // Añadimos la tarjeta al contenedor principal
        contenedorProductos.appendChild(tarjeta);
    });
}

// Esta función se ejecutará por ahora cuando el cliente haga clic en "Agregar"
function agregarAlCarrito(id) {
    alert(`¡Producto con ID ${id} agregado! (Pronto programaremos la lógica real del carrito)`);
}

// Ejecutamos la función al cargar la página
renderizarProductos();// 7. Renderizar la lista detallada dentro de carrito.html
function renderizarListaCarrito() {
    const contenedorLista = document.getElementById('lista-carrito');
    const contenedorTotal = document.getElementById('precio-total');
    
    if (!contenedorLista) return; // Si no estamos en carrito.html, no hace nada

    if (carrito.length === 0) {
        contenedorLista.innerHTML = "<p style='text-align:center; padding:2rem; color:#64748b;'>Tu carrito está vacío. ¡Vuelve al catálogo para agregar productos!</p>";
        contenedorTotal.innerText = "$0";
        return;
    }

    contenedorLista.innerHTML = "";
    let totalGeneral = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;

        const elemento = document.createElement('div');
        elemento.classList.add('item-carrito');
        elemento.innerHTML = `
            <div class="item-detalles">
                <h4>${item.nombre}</h4>
                <p>Precio: $${item.precio} x Unidades: ${item.cantidad}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <span style="font-weight: bold; font-size: 1.1rem;">$${subtotal}</span>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">❌</button>
            </div>
        `;
        contenedorLista.appendChild(elemento);
    });

    contenedorTotal.innerText = `$${totalGeneral}`;
}

// 8. Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
    // Filtramos el array dejando fuera el ID que queremos borrar
    carrito = carrito.filter(item => item.id !== id);
    // Guardamos en localStorage y actualizamos la interfaz de la página actual
    actualizarInterfaz();
    renderizarListaCarrito();
}

// 9. FUNCIÓN PARA MOSTRAR EL FORMULARIO
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");
    document.getElementById('modalCRM').style.display = 'flex';
}

// 10. LÓGICA DE ENVÍO AL CRM (GOOGLE SHEETS)
document.getElementById('btnConfirmarCRM').addEventListener('click', async () => {
    const nombre = document.getElementById('nombreCliente').value;
    const whatsapp = document.getElementById('telCliente').value;
    
    // ⚠️ AQUÍ PEGAS TU URL DE GOOGLE (la que termina en /exec)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzI2_1quYoA9UT0ISASTw3nhQEg2uvxkXDRlX4jHIH17ayl2nyP1i8o6edbuzROY2EZ/exec'; 

    if (!nombre || !whatsapp) {
        return alert("Por favor, completa los datos.");
    }

    const btn = document.getElementById('btnConfirmarCRM');
    btn.innerText = "Procesando...";
    btn.disabled = true;

    let productosTexto = "";
    let totalGeneral = 0;
    carrito.forEach(item => {
        productosTexto += `${item.nombre} (x${item.cantidad}), `;
        totalGeneral += item.precio * item.cantidad;
    });

    try {
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                whatsapp: whatsapp,
                productos: productosTexto,
                total: totalGeneral
            })
        });

        // Pantalla de éxito
        const modalDiv = document.querySelector('#modalCRM > div');
        modalDiv.innerHTML = `
            <div style="text-align:center;">
                <h2 style="color:#00d1b2;">¡Orden Lista! ✅</h2>
                <p>Hola <b>${nombre}</b>, hemos recibido tu pedido.</p>
                <p>Te contactaremos pronto al <b>${whatsapp}</b> para la entrega.</p>
                <button onclick="location.reload()" style="width:100%; padding:10px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; margin-top:15px;">Volver a la tienda</button>
            </div>
        `;
        localStorage.removeItem('carrito');

    } catch (error) {
        alert("Error al conectar con el servidor.");
        btn.disabled = false;
        btn.innerText = "CONFIRMAR COMPRA";
    }
});
