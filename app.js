// LÍNEA 1: Pegar esto arriba de todo
const firebaseConfig = {
  apiKey: "AIzaSyBE0Sg4lTMfczh1nWnhp7YD1JePH6usOHA",
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
const auth = firebase.auth();
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 2. FUNCIÓN PARA EL CATÁLOGO (index.html)
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
    if (typeof productos === 'undefined') return;
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, quantity: 1 }); // Usamos spread para no afectar el original
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`${producto.nombre} agregado con éxito ✅`);
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

// 5. EVENTOS PRINCIPALES (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    // Renderizado inicial
    renderizarProductos();
    renderizarListaCarrito();
    actualizarContadorCarrito();

    // --- LÓGICA DE LOGIN ---
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;

            if (!email || !pass) {
                alert("Por favor, llena todos los campos");
                return;
            }

            try {
                await auth.signInWithEmailAndPassword(email, pass);
                alert("¡Bienvenido de nuevo a Hardware Express!");
                window.location.href = "index.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // --- LÓGICA DE CRM / PEDIDOS ---
    const botonConfirmar = document.getElementById('btnConfirmarCRM');
if (botonConfirmar) {
    botonConfirmar.addEventListener('click', async () => {
        const nombre = document.getElementById('nombreCliente').value;
        const whatsapp = document.getElementById('telCliente').value;
        const fileInput = document.getElementById('archivoPago'); // Captura el nuevo input
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzI2_1quYoA9UT0ISASTw3nhQEg2uvkxXDRIX4jHIH17ayl2nyP1i8o6edbuzROY2EZ/exec'; 

        if (!nombre || !whatsapp || !fileInput.files[0]) {
            return alert("Por favor, llena tus datos y adjunta la captura del pago.");
        }

        botonConfirmar.innerText = "Procesando...";
        botonConfirmar.disabled = true;

        // Leer la imagen y convertirla a texto para el Excel
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]);
        reader.onload = async () => {
            const fotoBase64 = reader.result.split(',')[1];
            const productosTexto = carrito.map(item => `${item.nombre} (x${item.cantidad || 1})`).join(', ');
            const totalGeneral = carrito.reduce((t, item) => t + (item.precio * (item.cantidad || 1)), 0);

            try {
                await fetch(scriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({
                        nombre: nombre,
                        whatsapp: whatsapp,
                        productos: productosTexto,
                        total: totalGeneral,
                        foto: fotoBase64 // Se envía a la columna "foto" de tu Excel
                    })
                });

                // Mensaje de éxito
                const modalDiv = document.querySelector('#modalCRM > div');
                modalDiv.innerHTML = `
                    <div style="text-align:center; color:white; padding:20px;">
                        <h2 style="color:#00d1b2;">¡Orden Enviada! ✅</h2>
                        <p>Verificaremos tu pago móvil pronto.</p>
                        <button onclick="location.href='index.html'" style="width:100%; padding:10px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; margin-top:15px;">Regresar al Inicio</button>
                    </div>
                `;
                localStorage.removeItem('carrito');
            } catch (error) {
                alert("Error de conexión. Intenta de nuevo.");
                botonConfirmar.disabled = false;
                botonConfirmar.innerText = "CONFIRMAR COMPRA";
            }
        };
    });
}
// Detectar si el usuario está logueado
auth.onAuthStateChanged((user) => {
    const btnLogin = document.getElementById('btn-login-view');
    const perfilUser = document.getElementById('perfil-usuario');
    const userEmailSpan = document.getElementById('user-email');

    if (user) {
        // Usuario inició sesión
        if(btnLogin) btnLogin.style.display = 'none';
        if(perfilUser) perfilUser.style.display = 'flex';
        if(userEmailSpan) userEmailSpan.innerText = user.email;
    } else {
        // No hay usuario
        if(btnLogin) btnLogin.style.display = 'block';
        if(perfilUser) perfilUser.style.display = 'none';
    }
});

// Función para Cerrar Sesión
document.getElementById('btn-logout')?.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.reload(); // Recarga para limpiar la vista
    });
});
