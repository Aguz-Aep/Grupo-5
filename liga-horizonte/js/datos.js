/**
 * Datos compartidos de Liga Horizonte.
 *
 * Este archivo concentra las claves de almacenamiento, los datos iniciales y
 * las funciones que usan las demás páginas. Se carga antes que los otros
 * archivos JavaScript para que estas funciones estén disponibles.
 */

const STORAGE_KEYS = {
    USUARIOS: "lh_usuarios",
    SESION: "lh_sesion",
    TORNEOS: "lh_torneos",
    TEMA: "lh_tema",
    VISTA: "lh_vista_torneos"
};

// Las fechas se guardan en formato AAAA-MM-DD para poder usar un input type="date".
const TORNEOS_INICIALES = [
  {
    id: "t-1",
    titulo: "Copa Horizonte",
    deporte: "VÓLEY",
    categoria: "Mixto - Mayores",
    fecha: "2026-12-05",
    sede: "Sede central",
    precio: 25000,
    cupos: 8,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/EquipoEnCancha.avif"
  },
  {
    id: "t-2",
    titulo: "Liga de primavera",
    deporte: "VÓLEY",
    categoria: "Femenino - Sub 21",
    fecha: "2026-12-12",
    sede: "Sede central",
    precio: 22000,
    cupos: 4,
    estado: "ÚLTIMOS LUGARES",
    imagen: "./imgs/voleyfemenino.jpg"
  },
  {
    id: "t-3",
    titulo: "Liga de primavera",
    deporte: "VÓLEY",
    categoria: "Masculino - Sub 21",
    fecha: "2026-12-12",
    sede: "Sede central",
    precio: 22000,
    cupos: 4,
    estado: "ÚLTIMOS LUGARES",
    imagen: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "t-4",
    titulo: "Liga del Oeste",
    deporte: "VÓLEY",
    categoria: "Masculino - Mayores",
    fecha: "2026-12-10",
    sede: "Morón",
    precio: 30000,
    cupos: 8,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/voleymasculino.jpg"
  },
  {
    id: "t-5",
    titulo: "Circuito Arena Sur",
    deporte: "BEACH VOLEY",
    categoria: "Mixto - Mayores",
    fecha: "2026-12-14",
    sede: "Sede Central - Cancha Arena",
    precio: 24000,
    cupos: 6,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/Beach.avif"
  },
  {
    id: "t-6",
    titulo: "Open Verano Beach",
    deporte: "BEACH VOLEY",
    categoria: "Femenino - Sub 21",
    fecha: "2026-12-19",
    sede: "Complejo Parque Oeste",
    precio: 22000,
    cupos: 3,
    estado: "ÚLTIMOS LUGARES",
    imagen: "./imgs/RemateBeach.avif"
  },
  {
    id: "t-7",
    titulo: "Copa Relámpago Futsal",
    deporte: "FUTSAL",
    categoria: "Masculino - Mayores",
    fecha: "2026-12-08",
    sede: "Microestadio San Justo",
    precio: 35000,
    cupos: 10,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/futsalMasculino.avif"
  },
  {
    id: "t-8",
    titulo: "Torneo Clausura Femenino",
    deporte: "FUTSAL",
    categoria: "Femenino - Mayores",
    fecha: "2026-12-15",
    sede: "Sede Central - Cancha 2",
    precio: 32000,
    cupos: 4,
    estado: "ÚLTIMOS LUGARES",
    imagen: "./imgs/futsalFemenino.jpg"
  },
  {
    id: "t-9",
    titulo: "Desafío Juvenil Futsal",
    deporte: "FUTSAL",
    categoria: "Mixto - Sub 18",
    fecha: "2026-12-20",
    sede: "Polideportivo Ramos Mejía",
    precio: 26000,
    cupos: 8,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/canchaFutsal.jpg"
  },
  {
    id: "t-10",
    titulo: "Streetball 3x3 Nocturno",
    deporte: "BÁSQUET 3X3",
    categoria: "Masculino - Sub 21",
    fecha: "2026-12-11",
    sede: "Playón Sede Central",
    precio: 20000,
    cupos: 6,
    estado: "INSCRIPCIÓN ABIERTA",
    imagen: "./imgs/basquetMasculino.jpg"
  },
  {
    id: "t-11",
    titulo: "Copa Horizonte 3x3",
    deporte: "BÁSQUET 3X3",
    categoria: "Femenino - Sub 18",
    fecha: "2026-12-18",
    sede: "Cancha Exterior Morón",
    precio: 18000,
    cupos: 2,
    estado: "ÚLTIMOS LUGARES",
    imagen: "./imgs/basquetFemenino.jpeg"
  }
];

/**
 * Lee un valor guardado en localStorage y lo convierte desde JSON.
 * Si no existe o el JSON está dañado, devuelve el valor indicado por defecto.
 *
 * @param {string} clave Clave que se consulta en localStorage.
 * @param {*} valorPorDefecto Valor que se devuelve si no hay datos válidos.
 * @returns {*} El valor recuperado o el valor por defecto.
 */
const leerStorage = (clave, valorPorDefecto) => {
    try {
        const dato = localStorage.getItem(clave);
        return dato === null ? valorPorDefecto : JSON.parse(dato);
    } catch (error) {
        // Dejamos un registro en consola para poder detectar datos dañados.
        console.error(`No se pudieron leer los datos de "${clave}".`, error);
        return valorPorDefecto;
    }
};

/**
 * Guarda un dato convirtiéndolo primero a texto JSON, porque localStorage
 * únicamente almacena cadenas de texto.
 *
 * @param {string} clave Clave donde se guardará el dato.
 * @param {*} valor Objeto, arreglo o valor que se quiere guardar.
 */
const guardarStorage = (clave, valor) => {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        console.error(`No se pudieron guardar los datos de "${clave}".`, error);
    }
};

/** Inicializa las listas si todavía no existen en el navegador. */
const inicializarDatos = () => {
    if (localStorage.getItem(STORAGE_KEYS.TORNEOS) === null) {
        guardarStorage(STORAGE_KEYS.TORNEOS, TORNEOS_INICIALES);
    }

    if (localStorage.getItem(STORAGE_KEYS.USUARIOS) === null) {
        guardarStorage(STORAGE_KEYS.USUARIOS, []);
    }
};

/** @returns {Array} Todos los usuarios registrados. */
const obtenerUsuarios = () => leerStorage(STORAGE_KEYS.USUARIOS, []);

/** @returns {Array} Todos los torneos publicados. */
const obtenerTorneos = () => leerStorage(STORAGE_KEYS.TORNEOS, []);

/**
 * Recupera el usuario correspondiente a la sesión actual.
 * En lh_sesion se guarda solamente el correo, no una copia del usuario.
 * También migra automáticamente las sesiones antiguas que guardaban el objeto completo.
 *
 * @returns {Object|null} Usuario encontrado o null si no hay una sesión válida.
 */
const obtenerSesion = () => {
    const sesionGuardada = leerStorage(STORAGE_KEYS.SESION, null);

    if (!sesionGuardada) return null;

    // Esta condición permite que las sesiones creadas con la versión anterior sigan funcionando.
    const emailSesion = typeof sesionGuardada === "string"
        ? sesionGuardada
        : sesionGuardada.email;

    if (!emailSesion) return null;

    const usuario = obtenerUsuarios().find((u) => u.email === emailSesion);

    if (!usuario) {
        localStorage.removeItem(STORAGE_KEYS.SESION);
        return null;
    }

    // La cuenta puede venir de una versión anterior sin estas listas.
    if (!usuario.favoritos) usuario.favoritos = [];
    if (!usuario.carrito) usuario.carrito = [];
    if (!usuario.inscripciones) usuario.inscripciones = [];

    // Actualiza el formato viejo: desde ahora la sesión contiene solo el correo.
    if (typeof sesionGuardada !== "string") {
        guardarStorage(STORAGE_KEYS.SESION, emailSesion);
    }

    return usuario;
};

/**
 * Actualiza un usuario dentro de la lista y conserva en la sesión solamente su correo.
 *
 * @param {Object} usuarioActualizado Usuario con los cambios realizados.
 */
const actualizarUsuarioActivo = (usuarioActualizado) => {
    const usuariosActualizados = obtenerUsuarios().map((usuario) =>
        usuario.email === usuarioActualizado.email ? usuarioActualizado : usuario
    );

    guardarStorage(STORAGE_KEYS.USUARIOS, usuariosActualizados);
    guardarStorage(STORAGE_KEYS.SESION, usuarioActualizado.email);
};

/**
 * Escapa caracteres especiales antes de insertar datos dinámicos en una plantilla HTML.
 * Esto evita que nombres, correos o títulos se interpreten como etiquetas o scripts.
 *
 * @param {*} valor Dato que se mostrará en la página.
 * @returns {string} Texto seguro para insertar en HTML.
 */
const escaparHTML = (valor) => {
    const texto = valor === null || valor === undefined ? "" : String(valor);

    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
};

/**
 * Convierte una fecha AAAA-MM-DD a DD/MM/AAAA para mostrarla en pantalla.
 * Si recibe un formato distinto, devuelve el valor sin modificar.
 *
 * @param {string} fecha Fecha guardada.
 * @returns {string} Fecha preparada para mostrarse.
 */
const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const partes = String(fecha).split("-");
    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

/** @returns {string} Etiqueta de disponibilidad calculada a partir de los cupos. */
const obtenerEstadoCupos = (torneo) => {
    if (Number(torneo.cupos) <= 0) return "CUPOS AGOTADOS";
    if (Number(torneo.cupos) <= 3) return "ÚLTIMOS LUGARES";
    return torneo.estado || "INSCRIPCIÓN ABIERTA";
};

inicializarDatos();
