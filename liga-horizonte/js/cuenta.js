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

    const overlayCarrito = document.getElementById("overlay-carrito");
    const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const btnConfirmarInscripcion = document.getElementById("btn-confirmar-inscripcion");
    const inputEquipo = document.getElementById("nombre-equipo-carrito");

    const abrirCarrito = () => {
        overlayCarrito.classList.remove("oculto");
        overlayCarrito.setAttribute("aria-hidden", "false");
    };

    const cerrarCarrito = () => {
        overlayCarrito.classList.add("oculto");
        overlayCarrito.setAttribute("aria-hidden", "true");
    };

    /** Muestra las tarjetas de los torneos favoritos con opción de inscripción directa. */
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
        contenedorFavoritos.innerHTML = favoritos.map((torneo) => {
            const enCarrito = usuarioActual.carrito.includes(torneo.id);
            const inscripcionExistente = usuarioActual.inscripciones.find((ins) => ins.torneoId === torneo.id);
            const sinCupos = Number(torneo.cupos) <= 0;
            const yaInscripto = inscripcionExistente !== undefined;
            const estado = obtenerEstadoCupos(torneo);

            let textoBoton = "+ Anotar equipo";
            if (yaInscripto) textoBoton = "Ya inscripto";
            else if (enCarrito) textoBoton = "✓ En inscripciones";
            else if (sinCupos) textoBoton = "Sin cupos";

            return `
                <article class="tarjeta_torneo">
                    <div class="torneo_imagen">
                        <img src="${escaparHTML(torneo.imagen)}" alt="${escaparHTML(torneo.titulo)}" loading="lazy">
                        <span class="etiqueta_imagen">${escaparHTML(estado)}</span>
                        <button
                            type="button"
                            class="btn_favorito activo"
                            data-quitar-fav="${escaparHTML(torneo.id)}"
                            title="Quitar de favoritos"
                            aria-label="Quitar de favoritos"
                        >★</button>
                    </div>
                    <div class="torneo_contenido">
                        <div>
                            <p class="torneo_categoria">${escaparHTML(torneo.deporte)} · ${escaparHTML(torneo.categoria)}</p>
                            <h3>${escaparHTML(torneo.titulo)}</h3>
                            <p class="torneo_detalle"><span>›</span> ${escaparHTML(formatearFecha(torneo.fecha))} <span>-</span> ${escaparHTML(torneo.sede)}</p>
                            <p class="torneo_precio">$${Number(torneo.precio).toLocaleString("es-AR")} por equipo · ${Number(torneo.cupos)} cupos</p>
                        </div>
                        <div class="acciones_tarjeta">
                            <button
                                type="button"
                                class="btn_inscribir ${enCarrito ? "en_carrito" : ""}"
                                data-anotar-torneo="${escaparHTML(torneo.id)}"
                                ${(sinCupos && !enCarrito) || yaInscripto ? "disabled" : ""}
                            >
                                ${textoBoton}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        contenedorFavoritos.querySelectorAll("[data-quitar-fav]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const id = boton.getAttribute("data-quitar-fav");
                const usuarioActualizado = obtenerSesion();
                usuarioActualizado.favoritos = usuarioActualizado.favoritos.filter((favoritoId) => favoritoId !== id);
                actualizarUsuarioActivo(usuarioActualizado);
                renderizarFavoritosCuenta();
            });
        });

        contenedorFavoritos.querySelectorAll("[data-anotar-torneo]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const id = boton.getAttribute("data-anotar-torneo");
                const usuarioActualizado = obtenerSesion();
                const torneoSeleccionado = obtenerTorneos().find((torneo) => torneo.id === id);
                if (!torneoSeleccionado) return;

                const inscripcionExistente = usuarioActualizado.inscripciones.find((ins) => ins.torneoId === id);
                if (inscripcionExistente) {
                    alert("Tu equipo ya está inscripto en este torneo.");
                    return;
                }

                const yaEnCarrito = usuarioActualizado.carrito.includes(id);
                if (yaEnCarrito) {
                    usuarioActualizado.carrito = usuarioActualizado.carrito.filter((idCarrito) => idCarrito !== id);
                } else if (Number(torneoSeleccionado.cupos) > 0) {
                    usuarioActualizado.carrito.push(id);
                } else {
                    alert("Este torneo ya no tiene cupos disponibles.");
                    return;
                }

                actualizarUsuarioActivo(usuarioActualizado);
                renderizarFavoritosCuenta();
                renderizarCarrito();
            });
        });
    };

    /** Muestra el historial de inscripciones confirmadas. */
    const renderizarInscripciones = () => {
        const usuarioActual = obtenerSesion();
        const inscripciones = usuarioActual.inscripciones || [];
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

    /** Dibuja el contenido del carrito y calcula el total de inscripción. */
    const renderizarCarrito = () => {
        const usuarioActual = obtenerSesion();
        const torneos = obtenerTorneos();
        const contador = document.getElementById("contador-carrito");
        const listaCarrito = document.getElementById("lista-items-carrito");
        const totalEl = document.getElementById("total-carrito");

        const itemsSeleccionados = usuarioActual.carrito
            .map((id) => torneos.find((torneo) => torneo.id === id))
            .filter((torneo) => torneo !== undefined);

        contador.textContent = itemsSeleccionados.length;

        if (itemsSeleccionados.length === 0) {
            listaCarrito.innerHTML = '<p class="texto_vacio">Todavía no agregaste torneos para inscribirte.</p>';
            totalEl.textContent = "$0";
            return;
        }

        listaCarrito.innerHTML = itemsSeleccionados.map((torneo) => `
            <div class="item_carrito">
                <div>
                    <h4>${escaparHTML(torneo.titulo)}</h4>
                    <p>${escaparHTML(torneo.categoria)} · $${Number(torneo.precio).toLocaleString("es-AR")} · ${Number(torneo.cupos)} cupos disponibles</p>
                </div>
                <button type="button" class="btn_quitar" data-quitar-carrito="${escaparHTML(torneo.id)}" aria-label="Quitar torneo">
                    Quitar
                </button>
            </div>
        `).join("");
    };

    renderizarFavoritosCuenta();
    renderizarInscripciones();
});