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

// 9. FUNCIÓN MÁGICA: Enviar el pedido estructurado a WhatsApp
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");

    const tuTelefono = "584120000000"; // ⚠️ REMPLAZA CON TU NÚMERO DE WHATSAPP REAL (Usa el código 58 de Venezuela sin el +)
    
    let mensaje = "🛒 *NUEVO PEDIDO - HARDWARE EXPRESS* 🇻🇪\n\n";
    mensaje += "Hola, me gustaría comprar los siguientes productos:\n";
    mensaje += "---------------------------------------\n";

    let totalGeneral = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;
        mensaje += `▪️ *${item.nombre}*\n   Cantidad: ${item.cantidad} x $${item.precio} = *$${subtotal}*\n\n`;
    });

    mensaje += "---------------------------------------\n";
    mensaje += `💵 *TOTAL A PAGAR:* $${totalGeneral}\n\n`;
    mensaje += "Por favor, indícame tus datos para concretar el Pago Móvil, Zelle o Binance Pay y coordinar la entrega. ¡Gracias!";

    // Codificamos el texto para que WhatsApp lo reciba con espacios y negritas intactas
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${tuTelefono}&text=${encodeURIComponent(mensaje)}`;
    
    // Abrimos el chat de WhatsApp en una pestaña nueva
    window.open(urlWhatsApp, '_blank');}
