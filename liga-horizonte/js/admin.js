window.addEventListener("load", () => {
    const formAlta = document.getElementById("form-alta-torneo");
    const listaAdmin = document.getElementById("lista-torneos-admin");
    const totalEl = document.getElementById("total-torneos-admin");
    const mensajeAdmin = document.getElementById("mensaje-admin");
    const listaUsuariosAdmin = document.getElementById("lista-usuarios-admin");
    const formAltaUsuarioAdmin = document.getElementById("form-alta-usuario-admin");
    const mensajeUsuarioAdmin = document.getElementById("mensaje-usuario-admin");

    /** Muestra los torneos y asigna acciones a sus botones. */
    const renderizarListaAdmin = () => {
        const torneos = obtenerTorneos();
        totalEl.textContent = torneos.length;

        if (torneos.length === 0) {
            listaAdmin.innerHTML = '<p class="texto_vacio">No hay torneos activos.</p>';
            return;
        }

        listaAdmin.innerHTML = torneos.map((torneo) => `
            <div class="item_admin">
                <div>
                    <h3>${escaparHTML(torneo.titulo)} <small>(${escaparHTML(torneo.deporte)})</small></h3>
                    <p>${escaparHTML(torneo.categoria)} · ${escaparHTML(formatearFecha(torneo.fecha))} · ${escaparHTML(torneo.sede)}</p>
                    <p><strong>$${Number(torneo.precio).toLocaleString("es-AR")}</strong> · ${Number(torneo.cupos)} cupos · ${escaparHTML(obtenerEstadoCupos(torneo))}</p>
                </div>
                <button type="button" class="boton_secundario" data-eliminar-torneo="${escaparHTML(torneo.id)}">
                    Eliminar
                </button>
            </div>
        `).join("");

        // Se asigna el evento a cada botón nuevo, sin depender de closest() ni dataset.
        listaAdmin.querySelectorAll("[data-eliminar-torneo]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const idEliminar = boton.getAttribute("data-eliminar-torneo");
                const confirmar = confirm("¿Querés eliminar este torneo? Esta acción no se puede deshacer.");
                if (!confirmar) return;

                const torneosFiltrados = obtenerTorneos().filter((torneo) => torneo.id !== idEliminar);
                guardarStorage(STORAGE_KEYS.TORNEOS, torneosFiltrados);
                renderizarListaAdmin();
            });
        });
    };

    /** Permite al administrador cambiar el rol de una cuenta registrada. */
    const renderizarUsuariosAdmin = () => {
        const usuarios = obtenerUsuarios();
        const usuarioActivo = obtenerSesion();

        if (usuarios.length === 0) {
            listaUsuariosAdmin.innerHTML = '<p class="texto_vacio">Todavía no hay cuentas registradas.</p>';
            return;
        }

        listaUsuariosAdmin.innerHTML = usuarios.map((usuario) => `
            <div class="item_admin">
                <div>
                    <h3>${escaparHTML(usuario.nombre)} ${escaparHTML(usuario.apellido)}</h3>
                    <p>${escaparHTML(usuario.email)} · ${usuario.perfil === "admin" ? "Administrador" : "Usuario"}</p>
                </div>
                <button
                    type="button"
                    class="boton_secundario"
                    data-cambiar-rol="${escaparHTML(usuario.email)}"
                    ${usuario.email === usuarioActivo.email ? "disabled" : ""}
                >
                    ${usuario.perfil === "admin" ? "Quitar Admin" : "Hacer Admin"}
                </button>
            </div>
        `).join("");

        listaUsuariosAdmin.querySelectorAll("[data-cambiar-rol]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const emailObjetivo = boton.getAttribute("data-cambiar-rol");
                const usuariosActuales = obtenerUsuarios();
                const usuarioObjetivo = usuariosActuales.find((usuario) => usuario.email === emailObjetivo);
                if (!usuarioObjetivo) return;

                // No permitimos que el único administrador se quede sin acceso al panel.
                const cantidadAdmins = usuariosActuales.filter((usuario) => usuario.perfil === "admin").length;
                if (usuarioObjetivo.perfil === "admin" && cantidadAdmins <= 1) {
                    alert("La plataforma debe conservar al menos un administrador.");
                    return;
                }

                const nuevoRol = usuarioObjetivo.perfil === "admin" ? "usuario" : "admin";
                const accion = nuevoRol === "admin" ? "dar permisos de administrador a" : "quitar los permisos de administrador de";
                if (!confirm(`¿Querés ${accion} ${usuarioObjetivo.nombre} ${usuarioObjetivo.apellido}?`)) return;

                usuarioObjetivo.perfil = nuevoRol;
                guardarStorage(STORAGE_KEYS.USUARIOS, usuariosActuales);
                renderizarUsuariosAdmin();
            });
        });
    };

    formAlta.addEventListener("submit", (e) => {
        e.preventDefault();

        const titulo = document.getElementById("torneo-titulo").value.trim();
        const deporte = document.getElementById("torneo-deporte").value;
        const categoria = document.getElementById("torneo-categoria").value.trim().toUpperCase();
        const fecha = document.getElementById("torneo-fecha").value;
        const sede = document.getElementById("torneo-sede").value.trim();
        const precio = Number(document.getElementById("torneo-precio").value);
        const cupos = Number(document.getElementById("torneo-cupos").value);

        mensajeAdmin.classList.remove("mensaje_exito");
        mensajeAdmin.classList.add("mensaje_error");

        // La validación en JavaScript da mensajes concretos antes de guardar el torneo.
        if (titulo.length < 3) {
            mensajeAdmin.textContent = "El nombre del torneo debe tener al menos 3 caracteres.";
            return;
        }
        if (categoria.length < 2 || sede.length < 3 || fecha === "") {
            mensajeAdmin.textContent = "Completá la categoría, la fecha y la sede del torneo.";
            return;
        }
        if (document.getElementById("torneo-precio").value === "" || precio < 0) {
            mensajeAdmin.textContent = "Ingresá un precio válido, igual o mayor que cero.";
            return;
        }
        if (document.getElementById("torneo-cupos").value === "" || cupos < 1 || cupos > 64) {
            mensajeAdmin.textContent = "Los cupos deben estar entre 1 y 64.";
            return;
        }

        const nuevoTorneo = {
            id: `t-${Date.now()}`,
            titulo,
            deporte,
            categoria,
            fecha,
            sede,
            precio,
            cupos,
            estado: document.getElementById("torneo-estado").value,
            imagen: document.getElementById("torneo-imagen-preset").value
        };

        guardarStorage(STORAGE_KEYS.TORNEOS, [nuevoTorneo, ...obtenerTorneos()]);
        formAlta.reset();
        document.getElementById("torneo-cupos").value = 8;

        mensajeAdmin.classList.remove("mensaje_error");
        mensajeAdmin.classList.add("mensaje_exito");
        mensajeAdmin.textContent = `¡Torneo "${nuevoTorneo.titulo}" publicado correctamente!`;

        renderizarListaAdmin();
    });


    formAltaUsuarioAdmin.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("admin-usuario-nombre").value.trim();
        const apellido = document.getElementById("admin-usuario-apellido").value.trim();
        const email = document.getElementById("admin-usuario-email").value.trim().toLowerCase();
        const password = document.getElementById("admin-usuario-password").value;
        const perfil = document.getElementById("admin-usuario-perfil").value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        mensajeUsuarioAdmin.classList.remove("mensaje_exito");
        mensajeUsuarioAdmin.classList.add("mensaje_error");

        if (nombre.length < 2 || apellido.length < 2) {
            mensajeUsuarioAdmin.textContent = "El nombre y el apellido deben tener al menos 2 caracteres.";
            return;
        }
        if (!emailRegex.test(email)) {
            mensajeUsuarioAdmin.textContent = "Ingresá un correo electrónico válido.";
            return;
        }
        if (!passwordRegex.test(password)) {
            mensajeUsuarioAdmin.textContent = "La contraseña necesita 8 caracteres, mayúscula, minúscula y número.";
            return;
        }

        const usuariosActuales = obtenerUsuarios();
        const emailExistente = usuariosActuales.find((usuario) => usuario.email === email);
        if (emailExistente) {
            mensajeUsuarioAdmin.textContent = "Ya existe una cuenta registrada con ese correo.";
            return;
        }

        usuariosActuales.push({
            nombre,
            apellido,
            email,
            password,
            perfil,
            favoritos: [],
            carrito: [],
            inscripciones: []
        });
        guardarStorage(STORAGE_KEYS.USUARIOS, usuariosActuales);
        formAltaUsuarioAdmin.reset();

        mensajeUsuarioAdmin.classList.remove("mensaje_error");
        mensajeUsuarioAdmin.classList.add("mensaje_exito");
        mensajeUsuarioAdmin.textContent = `La cuenta de ${nombre} ${apellido} se creó correctamente.`;
        renderizarUsuariosAdmin();
    });

    renderizarListaAdmin();
    renderizarUsuariosAdmin();
});
