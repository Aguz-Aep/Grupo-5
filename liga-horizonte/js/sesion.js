window.addEventListener("load", () => {
    const paginaActual = document.body.getAttribute("data-pagina");
    const sesion = obtenerSesion();

    // Si ya hay una sesión, evitamos que vuelva a la pantalla de ingreso.
    if (paginaActual === "login") {
        if (sesion) {
            window.location.href = sesion.perfil === "admin" ? "admin.html" : "torneos.html";
        }
        return;
    }

    if (!sesion) {
        window.location.href = "index.html";
        return;
    }

    // La protección por rol evita que una cuenta común abra el panel administrativo.
    if (paginaActual === "admin" && sesion.perfil !== "admin") {
        window.location.href = "torneos.html";
        return;
    }

    const btnCambiarAdmin = document.getElementById("btn-cambiar-admin");
    if (btnCambiarAdmin && sesion.perfil === "admin") {
        btnCambiarAdmin.classList.remove("oculto");
    }

    const indicadorModo = document.getElementById("indicador-modo");
    if (indicadorModo) {
        indicadorModo.textContent = paginaActual === "admin" ? "Modo Admin" : "Modo Usuario";
    }

    // El cierre de sesión está en el encabezado de todas las páginas privadas.
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEYS.SESION);
            window.location.href = "index.html";
        });
    }
});
