let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// =========================================================================
// 1. CONFIGURACIÓN ÚNICA Y CENTRALIZADA DE FIREBASE
// =========================================================================
var firebaseConfig = {
  apiKey: "AIzaSyBEOSg4lTMfczh1nWnhp7YD1JePH6usOHA", 
  authDomain: "hardware-express-ve.firebaseapp.com",
  projectId: "hardware-express-ve",
  storageBucket: "hardware-express-ve.firebasestorage.app",
  messagingSenderId: "551081609311",
  appId: "1:551081609311:web:6eed5549a701db6fe033ea",
  measurementId: "G-Z81Z0YC2CC"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var auth = firebase.auth();

// =========================================================================
// 2. FUNCIONES DE RENDERIZADO (PRODUCTOS Y CARRITO)
// =========================================================================
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = "";
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
        const subtotal = item.precio * (item.cantidad || 1);
        totalGeneral += subtotal;
        const elemento = document.createElement('div');
        elemento.classList.add('item-carrito');
        elemento.innerHTML = `
            <div class="item-detalles">
                <h4>${item.nombre}</h4>
                <p>Precio: $${item.precio} x ${item.cantidad || 1}</p>
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

// =========================================================================
// 3. LÓGICA INTERNA DEL CARRITO
// =========================================================================
function agregarAlCarrito(id) {
    if (typeof productos === 'undefined') return;
    const producto = productos.find(p => p.id === id);

    const itemExistente = carrito.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ ...producto, bandwidth: 1, cantidad: 1 }); 
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`${producto.nombre} agregado ✅`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarListaCarrito();
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        contador.innerText = totalItems;
    }
}

// =========================================================================
// 4. CAPTURA DE EVENTOS (DOM)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    renderizarListaCarrito();
    actualizarContadorCarrito();

    const btnGoogle = document.getElementById('btn-google'); 
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                await auth.signInWithPopup(provider);
                alert("¡Sesión iniciada con Google con éxito! 🚀");
                window.location.href = "index.html"; 
            } catch (error) {
                console.error("Error con Google Auth:", error);
                alert("No se pudo iniciar sesión con Google: " + error.message);
            }
        });
    }

    // INTEGRACIÓN CON TU CRM (GOOGLE SHEETS)
    const botonConfirmar = document.getElementById('btnConfirmarCRM');
    if (botonConfirmar) {
        botonConfirmar.addEventListener('click', async () => {
            const nombreEl = document.getElementById('nombreCliente');
            const whatsappEl = document.getElementById('telCliente');
            const fileInput = document.getElementById('pago-comprobante'); // 👈 CORREGIDO EL ID AQUÍ

            if (!nombreEl || !whatsappEl || !fileInput) {
                return alert("Error interno: No se encontraron los campos en el HTML.");
            }

            const nombre = nombreEl.value;
            const whatsapp = whatsappEl.value;
            
            // Tu URL real extraída de la Screenshot_960
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwJ0koWk6FwizzJKliANY0LVV8bHCdzYHxWFq47igHUCrgJ1PbIYgt4C4oyZB564D58/exec'; 

            if (!nombre || !whatsapp || !fileInput.files[0]) {
                return alert("Por favor, llena tus datos completos y sube la captura del Pago Móvil.");
            }

            botonConfirmar.innerText = "Enviando... ⏳";
            botonConfirmar.disabled = true;

            const reader = new FileReader();
            reader.readAsDataURL(fileInput.files[0]);
            reader.onload = async () => {
                const fotoBase64 = reader.result.split(',')[1];
                const productosTexto = carrito.map(item => `${item.nombre} (x${item.cantidad || 1})`).join(', ');
                const totalGeneral = carrito.reduce((t, item) => t + (item.precio * (item.cantidad || 1)), 0);

               try {
                    // Usamos 'no-cors' porque Google Apps Script lo requiere para recibir los datos de forma segura
                    await fetch(scriptURL, {
                        method: 'POST',
                        mode: 'no-cors', 
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
    fecha: new Date().toLocaleString("es-VE", {timeZone: "America/Caracas"}), 
    cliente: nombre,     
    whatsapp: whatsapp,
    productos: productosTexto,
    total: totalGeneral,
    fotos: fotoBase64
                        })
                    });
                    
                    // Como 'no-cors' no devuelve una respuesta legible, asumimos éxito si la red no falló
                    const modalCuerpo = document.getElementById('modal-checkout-body');
                    if(modalCuerpo) {
                        modalCuerpo.innerHTML = `
                            <div style="text-align:center; padding:20px; font-family: sans-serif;">
                                <h2 style="color:#00d1b2;">¡Orden Recibida! ✅</h2>
                                <p>Procesaremos tu pedido pronto en Hardware Express.</p>
                                <button onclick="location.href='index.html'" style="width:100%; padding:10px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; margin-top:15px;">Regresar al Inicio</button>
                            </div>
                        `;
                    } else {
                        alert("¡Pedido enviado con éxito! ✅");
                    }
                    localStorage.removeItem('carrito');
                } catch (error) {
                    console.error("Error en la línea 169:", error);
                    alert("Error al enviar al servidor. Intenta de nuevo.");
                    botonConfirmar.disabled = false;
                    botonConfirmar.innerText = "CONFIRMAR COMPRA";
                }
            };
        });
    }
});

// =========================================================================
// 5. ESCUCHADOR DE ESTADO DE SESIÓN
// =========================================================================
auth.onAuthStateChanged((user) => {
    const btnGoogleView = document.getElementById('btn-google');
    const perfilUser = document.getElementById('perfil-usuario');
    const userEmailSpan = document.getElementById('user-email');

    if (user) {
        if(btnGoogleView) btnGoogleView.style.display = 'none';
        if(perfilUser) perfilUser.style.display = 'flex';
        if(userEmailSpan) userEmailSpan.innerText = user.email; 
    } else {
        if(btnGoogleView) btnGoogleView.style.display = 'block';
        if(perfilUser) perfilUser.style.display = 'none';
    }
});

// =========================================================================
// 6. CONTROL SEGURO DE CERRAR SESIÓN
// =========================================================================
document.addEventListener('click', function(evento) {
    if (evento.target && evento.target.id === 'btn-logout') {
        evento.preventDefault();
        
        auth.signOut()
            .then(() => {
                alert("Sesión cerrada correctamente. ¡Vuelve pronto! 👋");
                window.location.href = "index.html"; 
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Hubo un problema al cerrar sesión.");
            });
    }
});
