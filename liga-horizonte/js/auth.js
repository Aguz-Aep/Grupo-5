window.addEventListener("load", () => {
    const usuarios = obtenerUsuarios();
    const existeAdmin = usuarios.find((usuario) => usuario.perfil === "admin") !== undefined;

    const alertaPrimerAdmin = document.getElementById("alerta-primer-admin");
    const tabsAuth = document.getElementById("tabs-auth");
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro");
    const tituloAuth = document.getElementById("titulo_auth");
    const subtituloAuth = document.getElementById("subtitulo-auth");

    /** Cambia la pestaña visible del formulario de acceso. */
    const activarTab = (tab) => {
        document.querySelectorAll(".tab_btn").forEach((boton) => {
            boton.classList.toggle("activo", boton.getAttribute("data-tab") === tab);
        });

        formLogin.classList.toggle("oculto", tab !== "login");
        formRegistro.classList.toggle("oculto", tab !== "registro");
    };

    // La primera cuenta se crea como administrador para configurar la plataforma.
    // Una vez que existe uno, el registro público siempre crea cuentas de usuario.
    if (!existeAdmin) {
        alertaPrimerAdmin.classList.remove("oculto");
        tabsAuth.classList.add("oculto");
        activarTab("registro");
        tituloAuth.textContent = "Crear primer Administrador";
        subtituloAuth.textContent = "Registrá la cuenta principal que administrará los torneos de la liga.";
    } else {
        document.querySelectorAll(".tab_btn").forEach((boton) => {
            boton.addEventListener("click", () => activarTab(boton.getAttribute("data-tab")));
        });
    }

    const validarEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Se utiliza el mismo criterio del apunte: 8 caracteres, mayúscula, minúscula y número.
    const validarPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();

        const errorRegistro = document.getElementById("error-registro");
        const errorNombre = document.getElementById("error-reg-nombre");
        const errorApellido = document.getElementById("error-reg-apellido");
        const errorEmail = document.getElementById("error-reg-email");
        const errorPassword = document.getElementById("error-reg-password");

        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const email = document.getElementById("reg-email").value.trim().toLowerCase();
        const password = document.getElementById("reg-password").value;
        let datosValidos = true;

        // Limpiamos los mensajes anteriores para no mostrar errores que ya se corrigieron.
        errorRegistro.textContent = "";
        errorNombre.textContent = "";
        errorApellido.textContent = "";
        errorEmail.textContent = "";
        errorPassword.textContent = "";

        if (nombre.length < 2) {
            errorNombre.textContent = "Ingresá un nombre de al menos 2 caracteres.";
            datosValidos = false;
        }

        if (apellido.length < 2) {
            errorApellido.textContent = "Ingresá un apellido de al menos 2 caracteres.";
            datosValidos = false;
        }

        if (!validarEmail(email)) {
            errorEmail.textContent = "Ingresá un correo con un formato válido.";
            datosValidos = false;
        }

        if (!validarPassword(password)) {
            errorPassword.textContent = "Usá 8 caracteres como mínimo, con mayúscula, minúscula y número.";
            datosValidos = false;
        }

        const listaActual = obtenerUsuarios();
        const emailExistente = listaActual.find((usuario) => usuario.email === email);

        if (emailExistente) {
            errorEmail.textContent = "Ya existe una cuenta registrada con ese correo.";
            datosValidos = false;
        }

        if (!datosValidos) return;

        // Volvemos a comprobar el rol al enviar para evitar usar un estado antiguo si la página se restauró.
        // El rol no se recibe desde el formulario: lo define el estado de la plataforma.
        const adminActual = listaActual.find((usuario) => usuario.perfil === "admin");
        const perfil = adminActual ? "usuario" : "admin";
        const nuevoUsuario = {
            nombre,
            apellido,
            email,
            password,
            perfil,
            favoritos: [],
            carrito: [],
            inscripciones: []
        };

        listaActual.push(nuevoUsuario);
        guardarStorage(STORAGE_KEYS.USUARIOS, listaActual);
        guardarStorage(STORAGE_KEYS.SESION, nuevoUsuario.email);

        window.location.href = perfil === "admin" ? "admin.html" : "torneos.html";
    });

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();

        const errorLogin = document.getElementById("error-login");
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;

        errorLogin.textContent = "";

        const usuarioEncontrado = obtenerUsuarios().find(
            (usuario) => usuario.email === email && usuario.password === password
        );

        if (!usuarioEncontrado) {
            errorLogin.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        // Guardamos solo el correo. El perfil y los datos se vuelven a consultar en lh_usuarios.
        guardarStorage(STORAGE_KEYS.SESION, usuarioEncontrado.email);
        window.location.href = usuarioEncontrado.perfil === "admin" ? "admin.html" : "torneos.html";
    });
});
