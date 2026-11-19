window.addEventListener("load", () => {
    const usuarioInicial = obtenerSesion();
    if (!usuarioInicial) return;

    const contenedorTorneos = document.getElementById("contenedor-torneos");
    const btnTarjetas = document.getElementById("btn-vista-tarjetas");
    const btnLista = document.getElementById("btn-vista-lista");
    const overlayCarrito = document.getElementById("overlay-carrito");
    const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const btnConfirmarInscripcion = document.getElementById("btn-confirmar-inscripcion");
    const inputEquipo = document.getElementById("nombre-equipo-carrito");

    /** Cambia entre la vista en tarjetas y la vista en lista. */
    const aplicarVista = (modo) => {
        const esLista = modo === "lista";
        contenedorTorneos.classList.toggle("vista_lista", esLista);
        btnTarjetas.classList.toggle("activo", !esLista);
        btnLista.classList.toggle("activo", esLista);
        localStorage.setItem(STORAGE_KEYS.VISTA, modo);
    };

    /** Abre el carrito y actualiza su estado accesible. */
    const abrirCarrito = () => {
        overlayCarrito.classList.remove("oculto");
        overlayCarrito.setAttribute("aria-hidden", "false");
    };

    /** Cierra el carrito y actualiza su estado accesible. */
    const cerrarCarrito = () => {
        overlayCarrito.classList.add("oculto");
        overlayCarrito.setAttribute("aria-hidden", "true");
    };

    /** Muestra los torneos, calculando favoritos, carrito y disponibilidad de cada uno. */
    const renderizarTorneos = () => {
        const torneos = obtenerTorneos();
        const usuario = obtenerSesion();

        if (torneos.length === 0) {
            contenedorTorneos.innerHTML = '<p class="texto_vacio">No hay torneos cargados por el momento.</p>';
            return;
        }

        contenedorTorneos.innerHTML = torneos.map((torneo) => {
            const esFavorito = usuario.favoritos.includes(torneo.id);
            const enCarrito = usuario.carrito.includes(torneo.id);
            const inscripcionExistente = usuario.inscripciones.find((inscripcion) => inscripcion.torneoId === torneo.id);
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
                            class="btn_favorito ${esFavorito ? "activo" : ""}"
                            data-accion="favorito"
                            data-id="${escaparHTML(torneo.id)}"
                            aria-label="${esFavorito ? "Quitar de favoritos" : "Marcar como favorito"}"
                            title="${esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
                        >
                            ${esFavorito ? "★" : "☆"}
                        </button>
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
                                data-accion="carrito"
                                data-id="${escaparHTML(torneo.id)}"
                                ${(sinCupos && !enCarrito) || yaInscripto ? "disabled" : ""}
                            >
                                ${textoBoton}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        // Los eventos se agregan después de crear las tarjetas.
        contenedorTorneos.querySelectorAll("button[data-accion]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const accion = boton.getAttribute("data-accion");
                const id = boton.getAttribute("data-id");
                const usuario = obtenerSesion();
                const torneoSeleccionado = obtenerTorneos().find((torneo) => torneo.id === id);
                if (!torneoSeleccionado) return;

                if (accion === "favorito") {
                    const yaExiste = usuario.favoritos.includes(id);
                    usuario.favoritos = yaExiste
                        ? usuario.favoritos.filter((favoritoId) => favoritoId !== id)
                        : [...usuario.favoritos, id];
                }

                if (accion === "carrito") {
                    // Evita volver a inscribir el mismo equipo en un torneo ya confirmado.
                    const inscripcionExistente = usuario.inscripciones.find((inscripcion) => inscripcion.torneoId === id);
                    if (inscripcionExistente) {
                        alert("Tu equipo ya está inscripto en este torneo.");
                        return;
                    }

                    const yaEnCarrito = usuario.carrito.includes(id);
                    if (yaEnCarrito) {
                        usuario.carrito = usuario.carrito.filter((idCarrito) => idCarrito !== id);
                    } else if (Number(torneoSeleccionado.cupos) > 0) {
                        usuario.carrito.push(id);
                    } else {
                        alert("Este torneo ya no tiene cupos disponibles.");
                        return;
                    }
                }

                actualizarUsuarioActivo(usuario);
                renderizarTorneos();
                renderizarCarrito();
            });
        });
    };

    /** Dibuja el contenido del carrito y calcula el total de inscripción. */
    const renderizarCarrito = () => {
        const usuario = obtenerSesion();
        const torneos = obtenerTorneos();
        const contador = document.getElementById("contador-carrito");
        const listaCarrito = document.getElementById("lista-items-carrito");
        const totalEl = document.getElementById("total-carrito");

        const itemsSeleccionados = usuario.carrito
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
                const usuarioActual = obtenerSesion();
                usuarioActual.carrito = usuarioActual.carrito.filter((id) => id !== idQuitar);
                actualizarUsuarioActivo(usuarioActual);
                renderizarTorneos();
                renderizarCarrito();
            });
        });
    };

    aplicarVista(localStorage.getItem(STORAGE_KEYS.VISTA) || "tarjetas");
    btnTarjetas.addEventListener("click", () => aplicarVista("tarjetas"));
    btnLista.addEventListener("click", () => aplicarVista("lista"));

    btnAbrirCarrito.addEventListener("click", abrirCarrito);
    btnCerrarCarrito.addEventListener("click", cerrarCarrito);

    overlayCarrito.addEventListener("click", (e) => {
        // Solo se cierra al tocar el fondo; los clics dentro del panel no lo cierran.
        if (e.target === overlayCarrito) cerrarCarrito();
    });

    // También se puede cerrar el panel con Escape.
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlayCarrito.classList.contains("oculto")) {
            cerrarCarrito();
        }
    });

    btnConfirmarInscripcion.addEventListener("click", () => {
        const usuario = obtenerSesion();
        if (usuario.carrito.length === 0) return;

        const nombreEquipo = inputEquipo.value.trim() || `Equipo de ${usuario.nombre}`;
        const cantidadSeleccionada = usuario.carrito.length;
        const torneos = obtenerTorneos();
        const inscripcionesActuales = usuario.inscripciones || [];

        // Primero filtramos los torneos que todavía tienen cupos y no estaban inscriptos.
        // La misma lista se usa para crear inscripciones y descontar cupos: así ambas acciones coinciden.
        const torneosDisponibles = torneos.filter((torneo) => {
            const estaEnCarrito = usuario.carrito.includes(torneo.id);
            const tieneCupos = Number(torneo.cupos) > 0;
            const yaInscripto = inscripcionesActuales.find((inscripcion) => inscripcion.torneoId === torneo.id) !== undefined;
            return estaEnCarrito && tieneCupos && !yaInscripto;
        });

        if (torneosDisponibles.length === 0) {
            usuario.carrito = [];
            actualizarUsuarioActivo(usuario);
            renderizarTorneos();
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

        usuario.inscripciones = inscripcionesActuales.concat(nuevasInscripciones);
        // El carrito se vacía para que no se pueda volver a confirmar la misma selección.
        usuario.carrito = [];
        inputEquipo.value = "";

        guardarStorage(STORAGE_KEYS.TORNEOS, torneosActualizados);
        actualizarUsuarioActivo(usuario);
        renderizarTorneos();
        renderizarCarrito();
        cerrarCarrito();

        if (torneosDisponibles.length < cantidadSeleccionada) {
            alert(`Se confirmaron ${nuevasInscripciones.length} inscripción/es. Algunos torneos seleccionados ya no tenían cupos y no se incluyeron.`);
        } else {
            alert(`¡Inscripción confirmada para "${nombreEquipo}"! Podés verla en Mi Cuenta.`);
        }
    });

    const formContacto = document.getElementById("form-contacto");
    if (formContacto) {
        formContacto.addEventListener("submit", (e) => {
            e.preventDefault();
            const feedback = document.getElementById("feedback-contacto");
            feedback.textContent = "¡Consulta enviada! Nos pondremos en contacto pronto.";
            feedback.classList.add("mensaje_exito");
            formContacto.reset();
        });
    }

    // Garantiza que el atributo accesible coincida con el estado inicial cerrado.
    overlayCarrito.setAttribute("aria-hidden", "true");
    renderizarTorneos();
    renderizarCarrito();
});
