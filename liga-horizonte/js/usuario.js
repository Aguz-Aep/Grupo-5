document.addEventListener("DOMContentLoaded", () => {
    if (!obtenerSesion()) return;

    const contenedorTorneos = document.getElementById("contenedor-torneos");
    const btnTarjetas = document.getElementById("btn-vista-tarjetas");
    const btnLista = document.getElementById("btn-vista-lista");
    const overlayCarrito = document.getElementById("overlay-carrito");
    const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const btnConfirmarInscripcion = document.getElementById("btn-confirmar-inscripcion");

    const aplicarVista = (modo) => {
        const esLista = modo === "lista";
        contenedorTorneos.classList.toggle("vista_lista", esLista);
        btnTarjetas.classList.toggle("activo", !esLista);
        btnLista.classList.toggle("activo", esLista);
        localStorage.setItem(STORAGE_KEYS.VISTA, modo);
    };

    aplicarVista(localStorage.getItem(STORAGE_KEYS.VISTA) || "tarjetas");
    btnTarjetas.addEventListener("click", () => aplicarVista("tarjetas"));
    btnLista.addEventListener("click", () => aplicarVista("lista"));

    const renderizarTorneos = () => {
        const torneos = obtenerTorneos();
        const usuario = obtenerSesion();

        if (torneos.length === 0) {
            contenedorTorneos.innerHTML = `<p class="texto_vacio">No hay torneos cargados por el momento.</p>`;
            return;
        }

        contenedorTorneos.innerHTML = torneos
            .map((t) => {
                const esFavorito = usuario.favoritos.includes(t.id);
                const enCarrito = usuario.carrito.includes(t.id);
                const sinCupos = t.cupos <= 0;

                return `
                    <article class="tarjeta_torneo">
                        <div class="torneo_imagen">
                            <img src="${t.imagen}" alt="${t.titulo}" loading="lazy">
                            <span class="etiqueta_imagen">${sinCupos ? "CUPOS AGOTADOS" : t.estado}</span>
                            <button
                                type="button"
                                class="btn_favorito ${esFavorito ? "activo" : ""}"
                                data-accion="favorito"
                                data-id="${t.id}"
                                aria-label="${esFavorito ? "Quitar de favoritos" : "Marcar como favorito"}"
                                title="${esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
                            >
                                ${esFavorito ? "★" : "☆"}
                            </button>
                        </div>
                        <div class="torneo_contenido">
                            <div>
                                <p class="torneo_categoria">${t.deporte} · ${t.categoria}</p>
                                <h3>${t.titulo}</h3>
                                <p class="torneo_detalle"><span>></span> ${t.fecha} <span>-</span> ${t.sede}</p>
                                <p class="torneo_precio">$${Number(t.precio).toLocaleString("es-AR")} por equipo · ${t.cupos} cupos</p>
                            </div>
                            <div class="acciones_tarjeta">
                                <button
                                    type="button"
                                    class="btn_inscribir ${enCarrito ? "en_carrito" : ""}"
                                    data-accion="carrito"
                                    data-id="${t.id}"
                                    ${sinCupos && !enCarrito ? "disabled" : ""}
                                >
                                    ${enCarrito ? "✓ En inscripciones" : sinCupos ? "Sin cupos" : "+ Anotar equipo"}
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");
    };

    const renderizarCarrito = () => {
        const usuario = obtenerSesion();
        const torneos = obtenerTorneos();
        const contador = document.getElementById("contador-carrito");
        const listaCarrito = document.getElementById("lista-items-carrito");
        const totalEl = document.getElementById("total-carrito");

        const itemsSeleccionados = usuario.carrito
            .map((id) => torneos.find((t) => t.id === id))
            .filter(Boolean);

        contador.textContent = itemsSeleccionados.length;

        if (itemsSeleccionados.length === 0) {
            listaCarrito.innerHTML = `<p class="texto_vacio">Todavía no agregaste torneos para inscribirte.</p>`;
            totalEl.textContent = "$0";
            return;
        }

        listaCarrito.innerHTML = itemsSeleccionados
            .map(
                (t) => `
                <div class="item_carrito">
                    <div>
                        <h4>${t.titulo}</h4>
                        <p>${t.categoria} · $${Number(t.precio).toLocaleString("es-AR")}</p>
                    </div>
                    <button type="button" class="btn_quitar" data-quitar-carrito="${t.id}" aria-label="Quitar torneo">
                        Quitar
                    </button>
                </div>
            `
            )
            .join("");

        const total = itemsSeleccionados.reduce((acc, item) => acc + Number(item.precio), 0);
        totalEl.textContent = `$${total.toLocaleString("es-AR")}`;
    };

    contenedorTorneos.addEventListener("click", (e) => {
        const boton = e.target.closest("button[data-accion]");
        if (!boton) return;

        const { accion, id } = boton.dataset;
        const usuario = obtenerSesion();

        if (accion === "favorito") {
            const yaExiste = usuario.favoritos.includes(id);
            usuario.favoritos = yaExiste
                ? usuario.favoritos.filter((favId) => favId !== id)
                : [...usuario.favoritos, id];
        }

        if (accion === "carrito") {
            const yaEnCarrito = usuario.carrito.includes(id);
            usuario.carrito = yaEnCarrito
                ? usuario.carrito.filter((cId) => cId !== id)
                : [...usuario.carrito, id];
        }

        actualizarUsuarioActivo(usuario);
        renderizarTorneos();
        renderizarCarrito();
    });

    btnAbrirCarrito.addEventListener("click", () => overlayCarrito.classList.remove("oculto"));
    btnCerrarCarrito.addEventListener("click", () => overlayCarrito.classList.add("oculto"));
    overlayCarrito.addEventListener("click", (e) => {
        if (e.target === overlayCarrito) overlayCarrito.classList.add("oculto");
    });

    document.getElementById("lista-items-carrito").addEventListener("click", (e) => {
        const btnQuitar = e.target.closest("[data-quitar-carrito]");
        if (!btnQuitar) return;

        const idQuitar = btnQuitar.dataset.quitarCarrito;
        const usuario = obtenerSesion();
        usuario.carrito = usuario.carrito.filter((id) => id !== idQuitar);
        actualizarUsuarioActivo(usuario);
        renderizarTorneos();
        renderizarCarrito();
    });

    btnConfirmarInscripcion.addEventListener("click", () => {
        const usuario = obtenerSesion();
        if (usuario.carrito.length === 0) return;
        const yaInscripto = usuario.carrito.some((id) =>
            usuario.inscripciones.some((inscripcion) => inscripcion.torneoId === id));
        
        if (yaInscripto) {
            alert("Ya estás inscripto en uno de los torneos seleccionados.");
            return;
        }

        const inputEquipo = document.getElementById("nombre-equipo-carrito");
        const nombreEquipo = inputEquipo.value.trim() || `Equipo de ${usuario.nombre}`;
        const torneos = obtenerTorneos();
        const torneosSinCupos = usuario.carrito.filter((id) => {
            const torneo = torneos.find((t) => t.id === id);
            return torneo && torneo.cupos <= 0;
        });
        
        if (torneosSinCupos.length > 0) {
            alert("Uno o más torneos ya no tienen cupos disponibles.");
            return;
        }
        
        const fechaHoy = new Date().toLocaleDateString("es-AR");

        const torneosActualizados = torneos.map((t) => {
            if (usuario.carrito.includes(t.id) && t.cupos > 0) {
                return { ...t, cupos: t.cupos - 1 };
            }
            return t;
        });

        const nuevasInscripciones = usuario.carrito
            .map((id) => torneos.find((t) => t.id === id))
            .filter(Boolean)
            .map((t) => ({
                torneoId: t.id,
                torneoTitulo: t.titulo,
                categoria: t.categoria,
                fechaTorneo: t.fecha,
                equipo: nombreEquipo,
                fechaRegistro: fechaHoy
            }));

        usuario.inscripciones = [...usuario.inscripciones, ...nuevasInscripciones];
        usuario.carrito = [];
        inputEquipo.value = "";

        guardarStorage(STORAGE_KEYS.TORNEOS, torneosActualizados);
        actualizarUsuarioActivo(usuario);
        renderizarTorneos();
        renderizarCarrito();
        overlayCarrito.classList.add("oculto");
        alert(`¡Inscripción confirmada para "${nombreEquipo}"! Podés verla en Mi Cuenta.`);
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

    renderizarTorneos();
    renderizarCarrito();
});
