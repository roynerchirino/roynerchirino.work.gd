const firebaseConfig = {
  apiKey: "AIzaSyBE0Sg4lTMfczh1nWnhp7YD1JePH6usOHA",
  authDomain: "hardware-express-ve.firebaseapp.com",
  projectId: "hardware-express-ve",
  storageBucket: "hardware-express-ve.firebasestorage.app",
  messagingSenderId: "551081609311",
  appId: "1:551081609311:web:6eed5549a701db6fe033ea",
  measurementId: "G-Z81Z0YC2CC"
};

// Evita el error de "Already declared" al recargar
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 2. FUNCIONES DE RENDERIZADO
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

// 3. LÓGICA DE CARRITO
function agregarAlCarrito(id) {
    if (typeof productos === 'undefined') return;
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 }); 
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

// 4. EVENTOS (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    renderizarListaCarrito();
    actualizarContadorCarrito();

    // LÓGICA DE LOGIN (Para tu Screenshot_880)
    const btnEntrar = document.getElementById('btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;
            try {
                await auth.signInWithEmailAndPassword(email, pass);
                alert("¡Bienvenido! ✅");
                window.location.href = "index.html";
            } catch (e) { alert("Error: " + e.message); }
        });
    }

    // LÓGICA DE REGISTRO (Para tu Screenshot_880)
    const linkReg = document.getElementById('link-registro');
    if (linkReg) {
        linkReg.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = prompt("Introduce un correo para registrarte:");
            const pass = prompt("Crea una contraseña (mínimo 6 caracteres):");
            if (email && pass) {
                try {
                    await auth.createUserWithEmailAndPassword(email, pass);
                    alert("¡Cuenta creada exitosamente! 🎉");
                    window.location.reload();
                } catch (err) { alert("Error: " + err.message); }
            }
        });
    }
const btnGoogle = document.getElementById('btn-google'); // Asegúrate de que tu botón en el HTML tenga este ID
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        // Creamos la instancia del proveedor de Google
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            // Abre la ventanita flotante para elegir la cuenta de Google
            await auth.signInWithPopup(provider);
            alert("¡Sesión iniciada con Google con éxito! 🚀");
            window.location.href = "index.html"; // Redirige al inicio
        } catch (error) {
            console.error("Error con Google Auth:", error);
            alert("No se pudo iniciar sesión con Google: " + error.message);
        }
    });
}
    // CONFIRMAR COMPRA CRM
    const botonConfirmar = document.getElementById('btnConfirmarCRM');
    if (botonConfirmar) {
        botonConfirmar.addEventListener('click', async () => {
            const nombre = document.getElementById('nombreCliente').value;
            const whatsapp = document.getElementById('telCliente').value;
            const fileInput = document.getElementById('archivoPago');
            const scriptURL = 'https://script.google.com/macros/s/AKfycbzI2_1quYoA9UT0ISASTw3nhQEg2uvkxXDRIX4jHIH17ayl2nyP1i8o6edbuzROY2EZ/exec'; 

            if (!nombre || !whatsapp || (fileInput && !fileInput.files[0])) {
                return alert("Por favor, llena tus datos y sube el pago móvil.");
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
                    await fetch(scriptURL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify({
                            nombre: nombre,
                            whatsapp: whatsapp,
                            productos: productosTexto,
                            total: totalGeneral,
                            foto: fotoBase64
                        })
                    });
                    alert("¡Pedido enviado! ✅");
                    localStorage.removeItem('carrito');
                    window.location.href = "index.html";
                } catch (error) {
                    alert("Error al enviar.");
                    botonConfirmar.disabled = false;
                }
            };
        });
    }
});

// 5. SESIÓN
auth.onAuthStateChanged((user) => {
    const btnLogin = document.getElementById('btn-login-view');
    const perfilUser = document.getElementById('perfil-usuario');
    const userEmailSpan = document.getElementById('user-email');

    if (user) {
        if(btnLogin) btnLogin.style.display = 'none';
        if(perfilUser) perfilUser.style.display = 'flex';
        if(userEmailSpan) userEmailSpan.innerText = user.email;
    } else {
        if(btnLogin) btnLogin.style.display = 'block';
        if(perfilUser) perfilUser.style.display = 'none';
    }
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
    auth.signOut().then(() => { window.location.reload(); });
});
