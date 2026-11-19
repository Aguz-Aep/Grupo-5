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

        const total = itemsSeleccionados.reduce((acumulado, item) => acumulado + Number(item.precio), 0);
        totalEl.textContent = `$${total.toLocaleString("es-AR")}`;

        listaCarrito.querySelectorAll("[data-quitar-carrito]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const idQuitar = boton.getAttribute("data-quitar-carrito");
                const uActual = obtenerSesion();
                uActual.carrito = uActual.carrito.filter((id) => id !== idQuitar);
                actualizarUsuarioActivo(uActual);
                renderizarFavoritosCuenta();
                renderizarCarrito();
            });
        });
    };

    btnAbrirCarrito.addEventListener("click", abrirCarrito);
    btnCerrarCarrito.addEventListener("click", cerrarCarrito);

    overlayCarrito.addEventListener("click", (e) => {
        if (e.target === overlayCarrito) cerrarCarrito();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlayCarrito.classList.contains("oculto")) {
            cerrarCarrito();
        }
    });

    btnConfirmarInscripcion.addEventListener("click", () => {
        const usuarioActual = obtenerSesion();
        if (usuarioActual.carrito.length === 0) return;

        const nombreEquipo = inputEquipo.value.trim() || `Equipo de ${usuarioActual.nombre}`;
        const cantidadSeleccionada = usuarioActual.carrito.length;
        const torneos = obtenerTorneos();
        const inscripcionesActuales = usuarioActual.inscripciones || [];

        const torneosDisponibles = torneos.filter((torneo) => {
            const estaEnCarrito = usuarioActual.carrito.includes(torneo.id);
            const tieneCupos = Number(torneo.cupos) > 0;
            const yaInscripto = inscripcionesActuales.find((ins) => ins.torneoId === torneo.id) !== undefined;
            return estaEnCarrito && tieneCupos && !yaInscripto;
        });

        if (torneosDisponibles.length === 0) {
            usuarioActual.carrito = [];
            actualizarUsuarioActivo(usuarioActual);
            renderizarFavoritosCuenta();
            renderizarCarrito();
            alert("No se pudo confirmar ninguna inscripción: los torneos seleccionados ya no tienen cupos o ya estabas inscripto.");
            return;
        }

        const idsDisponibles = torneosDisponibles.map((torneo) => torneo.id);
        const torneosActualizados = torneos.map((torneo) => {
            if (idsDisponibles.includes(torneo.id)) {
                return { ...torneo, cupos: Number(torneo.cupos) - 1 };
            }
            return torneo;
        });

        const fechaHoy = new Date().toLocaleDateString("es-AR");
        const nuevasInscripciones = torneosDisponibles.map((torneo) => ({
            torneoId: torneo.id,
            torneoTitulo: torneo.titulo,
            categoria: torneo.categoria,
            fechaTorneo: torneo.fecha,
            equipo: nombreEquipo,
            fechaRegistro: fechaHoy
        }));

        usuarioActual.inscripciones = inscripcionesActuales.concat(nuevasInscripciones);
        usuarioActual.carrito = [];
        inputEquipo.value = "";

        guardarStorage(STORAGE_KEYS.TORNEOS, torneosActualizados);
        actualizarUsuarioActivo(usuarioActual);
        renderizarFavoritosCuenta();
        renderizarInscripciones();
        renderizarCarrito();
        cerrarCarrito();

        if (torneosDisponibles.length < cantidadSeleccionada) {
            alert(`Se confirmaron ${nuevasInscripciones.length} inscripción/es. Algunos torneos seleccionados ya no tenían cupos y no se incluyeron.`);
        } else {
            alert(`¡Inscripción confirmada para "${nombreEquipo}"!`);
        }
    });

    overlayCarrito.setAttribute("aria-hidden", "true");
    renderizarFavoritosCuenta();
    renderizarInscripciones();
    renderizarCarrito();
});