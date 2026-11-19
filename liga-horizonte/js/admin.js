document.addEventListener("DOMContentLoaded", () => {
    const formAlta = document.getElementById("form-alta-torneo");
    const listaAdmin = document.getElementById("lista-torneos-admin");
    const totalEl = document.getElementById("total-torneos-admin");
    const mensajeAdmin = document.getElementById("mensaje-admin");

    const renderizarListaAdmin = () => {
        const torneos = obtenerTorneos();
        totalEl.textContent = torneos.length;

        if (torneos.length === 0) {
            listaAdmin.innerHTML = `<p class="texto_vacio">No hay torneos activos.</p>`;
            return;
        }

        listaAdmin.innerHTML = torneos
            .map(
                (t) => `
                <div class="item_admin">
                    <div>
                        <h3>${t.titulo} <small>(${t.deporte})</small></h3>
                        <p>${t.categoria} · ${t.fecha} · ${t.sede}</p>
                        <p><strong>$${Number(t.precio).toLocaleString("es-AR")}</strong> · ${t.cupos} cupos</p>
                    </div>
                    <button type="button" class="boton_secundario" data-eliminar-torneo="${t.id}">
                        Eliminar
                    </button>
                </div>
            `
            )
            .join("");
    };

    formAlta.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevoTorneo = {
            id: `t-${Date.now()}`,
            titulo: document.getElementById("torneo-titulo").value.trim(),
            deporte: document.getElementById("torneo-deporte").value,
            categoria: document.getElementById("torneo-categoria").value.trim().toUpperCase(),
            fecha: document.getElementById("torneo-fecha").value.trim(),
            sede: document.getElementById("torneo-sede").value.trim(),
            precio: Number(document.getElementById("torneo-precio").value),
            cupos: Number(document.getElementById("torneo-cupos").value),
            estado: document.getElementById("torneo-estado").value,
            imagen: document.getElementById("torneo-imagen-preset").value
        };

        const torneos = [nuevoTorneo, ...obtenerTorneos()];
        guardarStorage(STORAGE_KEYS.TORNEOS, torneos);

        formAlta.reset();
        mensajeAdmin.textContent = `¡Torneo "${nuevoTorneo.titulo}" publicado correctamente!`;
        renderizarListaAdmin();
    });

    listaAdmin.addEventListener("click", (e) => {
        const btnEliminar = e.target.closest("[data-eliminar-torneo]");
        if (!btnEliminar) return;

        const idEliminar = btnEliminar.dataset.eliminarTorneo;
        const torneosFiltrados = obtenerTorneos().filter((t) => t.id !== idEliminar);
        guardarStorage(STORAGE_KEYS.TORNEOS, torneosFiltrados);
        renderizarListaAdmin();
    });

    renderizarListaAdmin();
});