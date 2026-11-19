document.addEventListener("DOMContentLoaded", () => {
    const usuarios = obtenerUsuarios();
    const existeAdmin = usuarios.some((u) => u.perfil === "admin");

    const alertaPrimerAdmin = document.getElementById("alerta-primer-admin");
    const tabsAuth = document.getElementById("tabs-auth");
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro");
    const selectPerfil = document.getElementById("reg-perfil");
    const tituloAuth = document.getElementById("titulo_auth");
    const subtituloAuth = document.getElementById("subtitulo-auth");

    const activarTab = (tab) => {
        document.querySelectorAll(".tab_btn").forEach((btn) => {
            btn.classList.toggle("activo", btn.dataset.tab === tab);
        });
        formLogin.classList.toggle("oculto", tab !== "login");
        formRegistro.classList.toggle("oculto", tab !== "registro");
    };

    if (!existeAdmin) {
        alertaPrimerAdmin.classList.remove("oculto");
        tabsAuth.classList.add("oculto");
        activarTab("registro");
        selectPerfil.value = "admin";
        selectPerfil.disabled = true;
        tituloAuth.textContent = "Crear primer Administrador";
        subtituloAuth.textContent = "Registrá la cuenta principal que administrará los torneos de la liga.";
    } else {
        document.querySelectorAll(".tab_btn").forEach((btn) => {
            btn.addEventListener("click", () => activarTab(btn.dataset.tab));
        });
    }

    formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        const errorRegistro = document.getElementById("error-registro");
        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const email = document.getElementById("reg-email").value.trim().toLowerCase();
        const password = document.getElementById("reg-password").value;
        const perfil = !existeAdmin ? "admin" : selectPerfil.value;

        const listaActual = obtenerUsuarios();
        if (listaActual.some((u) => u.email === email)) {
            errorRegistro.textContent = "Ya existe una cuenta registrada con ese correo.";
            return;
        }

        const nuevoUsuario = {
            nombre,
            apellido,
            email,
            password,
            perfil,
            favoritos: [],
            carrito: [],
            inscripciones: []
        };

        listaActual.push(nuevoUsuario);
        guardarStorage(STORAGE_KEYS.USUARIOS, listaActual);
        guardarStorage(STORAGE_KEYS.SESION, nuevoUsuario);

        window.location.href = perfil === "admin" ? "admin.html" : "torneos.html";
    });

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const errorLogin = document.getElementById("error-login");
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;

        const usuarioEncontrado = obtenerUsuarios().find(
            (u) => u.email === email && u.password === password
        );

        if (!usuarioEncontrado) {
            errorLogin.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        guardarStorage(STORAGE_KEYS.SESION, usuarioEncontrado);
        window.location.href = usuarioEncontrado.perfil === "admin" ? "admin.html" : "torneos.html";
    });
});