window.addEventListener("load", () => {
    const usuario = obtenerSesion();
    if (!usuario) return;

    const iniciales = `${usuario.nombre[0] || ""}${usuario.apellido[0] || ""}`.toUpperCase();
    document.getElementById("avatar-iniciales").textContent = iniciales || "LH";
    document.getElementById("cuenta-nombre").textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById("cuenta-rol").textContent = usuario.perfil === "admin" ? "Administrador" : "Usuario";
    document.getElementById("cuenta-email").textContent = usuario.email;

    const contenedorFavoritos = document.getElementById("contenedor-favoritos");
    const contenedorInscripciones = document.getElementById("contenedor-inscripciones-cuenta");

    /** Muestra las tarjetas de los torneos que el usuario guardó como favoritos. */
    const renderizarFavoritosCuenta = () => {
        const usuarioActual = obtenerSesion();
        const torneos = obtenerTorneos();
        const favoritos = usuarioActual.favoritos
            .map((id) => torneos.find((torneo) => torneo.id === id))
            .filter((torneo) => torneo !== undefined);

        document.getElementById("stat-favoritos").textContent = favoritos.length;

        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = '<p class="texto_vacio">Todavía no marcaste ningún torneo como favorito.</p>';
            return;
        }

        contenedorFavoritos.innerHTML = favoritos.map((torneo) => `
            <article class="tarjeta_torneo">
                <div class="torneo_imagen">
                    <img src="${escaparHTML(torneo.imagen)}" alt="${escaparHTML(torneo.titulo)}" loading="lazy">
                    <span class="etiqueta_imagen">${escaparHTML(obtenerEstadoCupos(torneo))}</span>
                    <button
                        type="button"
                        class="btn_favorito activo"
                        data-quitar-fav="${escaparHTML(torneo.id)}"
                        title="Quitar de favoritos"
                        aria-label="Quitar de favoritos"
                    >★</button>
                </div>
                <div class="torneo_contenido">
                    <p class="torneo_categoria">${escaparHTML(torneo.deporte)} · ${escaparHTML(torneo.categoria)}</p>
                    <h3>${escaparHTML(torneo.titulo)}</h3>
                    <p class="torneo_detalle"><span>›</span> ${escaparHTML(formatearFecha(torneo.fecha))} <span>-</span> ${escaparHTML(torneo.sede)}</p>
                    <div class="acciones_tarjeta">
                        <a href="torneos.html#torneos" class="boton boton_ancho">Ver en catálogo</a>
                    </div>
                </div>
            </article>
        `).join("");

        // Se agrega el evento luego de crear los botones del listado.
        contenedorFavoritos.querySelectorAll("[data-quitar-fav]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const id = boton.getAttribute("data-quitar-fav");
                const usuarioActualizado = obtenerSesion();
                usuarioActualizado.favoritos = usuarioActualizado.favoritos.filter((favoritoId) => favoritoId !== id);
                actualizarUsuarioActivo(usuarioActualizado);
                renderizarFavoritosCuenta();
            });
        });
    };

    /** Muestra el historial de inscripciones confirmadas como texto seguro. */
    const renderizarInscripciones = () => {
        const usuarioActual = obtenerSesion();
        const inscripciones = usuarioActual.inscripciones || [];
        document.getElementById("stat-inscripciones").textContent = inscripciones.length;

        if (inscripciones.length === 0) {
            contenedorInscripciones.innerHTML = '<p class="texto_vacio">Aún no confirmaste inscripciones de equipo.</p>';
            return;
        }

        contenedorInscripciones.innerHTML = inscripciones.map((inscripcion) => `
            <div class="card_inscripcion">
                <h3>${escaparHTML(inscripcion.torneoTitulo)} (${escaparHTML(inscripcion.categoria)})</h3>
                <p>Equipo inscrito: <strong>${escaparHTML(inscripcion.equipo)}</strong> · Fecha del torneo: ${escaparHTML(formatearFecha(inscripcion.fechaTorneo))} · Confirmado el ${escaparHTML(inscripcion.fechaRegistro)}</p>
            </div>
        `).join("");
    };

    renderizarFavoritosCuenta();
    renderizarInscripciones();
});
