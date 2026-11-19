document.addEventListener("DOMContentLoaded", () => {
    const usuario = obtenerSesion();
    if (!usuario) return;

    const iniciales = `${usuario.nombre[0] || ""}${usuario.apellido[0] || ""}`.toUpperCase();
    document.getElementById("avatar-iniciales").textContent = iniciales || "LH";
    document.getElementById("cuenta-nombre").textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById("cuenta-rol").textContent =
        usuario.perfil === "admin" ? "Administrador" : "Usuario";
    document.getElementById("cuenta-email").textContent = usuario.email;

    const contenedorFavoritos = document.getElementById("contenedor-favoritos");
    const contenedorInscripciones = document.getElementById("contenedor-inscripciones-cuenta");

    const renderizarFavoritosCuenta = () => {
        const uActual = obtenerSesion();
        const torneos = obtenerTorneos();
        const favoritos = uActual.favoritos
            .map((id) => torneos.find((t) => t.id === id))
            .filter(Boolean);

        document.getElementById("stat-favoritos").textContent = favoritos.length;

        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = `<p class="texto_vacio">Todavía no marcaste ningún torneo como favorito.</p>`;
            return;
        }

        contenedorFavoritos.innerHTML = favoritos
            .map(
                (t) => `
                <article class="tarjeta_torneo">
                    <div class="torneo_imagen">
                        <img src="${t.imagen}" alt="${t.titulo}" loading="lazy">
                        <span class="etiqueta_imagen">${t.estado}</span>
                        <button
                            type="button"
                            class="btn_favorito activo"
                            data-quitar-fav="${t.id}"
                            title="Quitar de favoritos"
                        >
                            ★
                        </button>
                    </div>
                    <div class="torneo_contenido">
                        <p class="torneo_categoria">${t.deporte} · ${t.categoria}</p>
                        <h3>${t.titulo}</h3>
                        <p class="torneo_detalle"><span>></span> ${t.fecha} <span>-</span> ${t.sede}</p>
                        <div class="acciones_tarjeta">
                            <a href="torneos.html#torneos" class="boton boton_ancho">Ver en catálogo</a>
                        </div>
                    </div>
                </article>
            `
            )
            .join("");
    };

    contenedorFavoritos.addEventListener("click", (e) => {
        const btnQuitarFav = e.target.closest("[data-quitar-fav]");
        if (!btnQuitarFav) return;

        const id = btnQuitarFav.dataset.quitarFav;
        const uActual = obtenerSesion();
        uActual.favoritos = uActual.favoritos.filter((favId) => favId !== id);
        actualizarUsuarioActivo(uActual);
        renderizarFavoritosCuenta();
    });

    const inscripciones = usuario.inscripciones || [];
    document.getElementById("stat-inscripciones").textContent = inscripciones.length;

    if (inscripciones.length > 0) {
        contenedorInscripciones.innerHTML = inscripciones
            .map(
                (ins) => `
                <div class="card_inscripcion">
                    <h3>${ins.torneoTitulo} (${ins.categoria})</h3>
                    <p>Equipo inscrito: <strong>${ins.equipo}</strong> · Fecha del torneo: ${ins.fechaTorneo} · Confirmado el ${ins.fechaRegistro}</p>
                </div>
            `
            )
            .join("");
    }
    else {
    contenedorInscripciones.innerHTML = "<p>Todavía no tenés inscripciones.</p>";
    }

    document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.SESION);
        window.location.href = "index.html";
    });

    renderizarFavoritosCuenta();
});
