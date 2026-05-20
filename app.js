// 1. VARIABLES GLOBALES (Siempre al principio)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 2. FUNCIÓN PARA EL CATÁLOGO
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return; // Si no existe el contenedor (ej. estás en carrito.html), no hace nada

    contenedor.innerHTML = "";
    
    // Verificamos que el array 'productos' exista (viene de productos.js)
    if (typeof productos !== 'undefined') {
        productos.forEach(producto => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('producto-tarjeta');
            tarjeta.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p class="descripcion">${producto.descripcion}</p>
                <p class="precio">$${producto.precio}</p>
                <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
            `;
            contenedor.appendChild(tarjeta);
        });
    }
}

// 3. FUNCIÓN PARA LA PÁGINA DEL CARRITO (carrito.html)
function renderizarListaCarrito() {
   const contenedorLista = document.getElementById('lista-carrito');
    const contenedorTotal = document.getElementById('precio-total');
    
    if (!contenedorLista) return; 

    if (carrito.length === 0) {
        contenedorLista.innerHTML = "<p style='text-align:center; padding:2rem; color:#64748b;'>Tu carrito está vacío.</p>";
        if (contenedorTotal) contenedorTotal.innerText = "$0";
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
                <p>Precio: $${item.precio} x ${item.cantidad}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-weight: bold;">$${subtotal}</span>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">❌</button>
            </div>
        `;
        contenedorLista.appendChild(elemento);
    });

    if (contenedorTotal) contenedorTotal.innerText = `$${totalGeneral}`;
}

// 4. LÓGICA DE AGREGAR Y ELIMINAR
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.nombre} agregado con éxito ✅`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarListaCarrito(); // Recargamos la lista visualmente
}

// 5. FUNCIÓN PARA EL MODAL (Botón "Finalizar Pedido")
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return alert("Agrega productos antes de finalizar.");
    const modal = document.getElementById('modalCRM');
    if (modal) modal.style.display = 'flex';
}

// 6. EVENTOS DE CARGA Y CRM (AL FINAL)
document.addEventListener('DOMContentLoaded', () => {
    // Ejecutamos las funciones según la página
    renderizarProductos();
    renderizarListaCarrito();

    const botonConfirmar = document.getElementById('btnConfirmarCRM');
    if (botonConfirmar) {
        botonConfirmar.addEventListener('click', async () => {
            const nombre = document.getElementById('nombreCliente').value;
            const whatsapp = document.getElementById('telCliente').value;
            const scriptURL = 'https://script.google.com/macros/s/AKfycbzI2_1quYoA9UT0ISASTw3nhQEg2uvkxXDRIX4jHIH17ayl2nyP1i8o6edbuzROY2EZ/exec'; 

            if (!nombre || !whatsapp) return alert("Por favor, ingresa tu nombre y teléfono.");

            botonConfirmar.innerText = "Procesando...";
            botonConfirmar.disabled = true;

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

                const modalDiv = document.querySelector('#modalCRM > div');
                if (modalDiv) {
                    modalDiv.innerHTML = `
                        <div style="text-align:center;">
                            <h2 style="color:#00d1b2;">¡Orden Recibida! ✅</h2>
                            <p>Hola <b>${nombre}</b>, procesaremos tu pedido pronto.</p>
                            <button onclick="location.reload()" style="width:100%; padding:10px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; margin-top:15px;">Regresar</button>
                        </div>
                    `;
                }
                localStorage.removeItem('carrito');
            } catch (error) {
                alert("Error de conexión. Intenta de nuevo.");
                botonConfirmar.disabled = false;
                botonConfirmar.innerText = "CONFIRMAR COMPRA";
            }
        });
    }
});
