document.addEventListener("DOMContentLoaded", () => {
    const paginaActual = document.body.dataset.pagina;
    const sesion = obtenerSesion();

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

    if (paginaActual === "admin" && sesion.perfil !== "admin") {
        window.location.href = "torneos.html";
        return;
    }

    const btnCambiarAdmin = document.getElementById("btn-cambiar-admin");
    if (btnCambiarAdmin && sesion.perfil === "admin") {
        btnCambiarAdmin.classList.remove("oculto");
    }
});