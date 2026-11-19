const STORAGE_KEYS = {
    USUARIOS: "lh_usuarios",
    SESION: "lh_sesion",
    TORNEOS: "lh_torneos",
    TEMA: "lh_tema",
    VISTA: "lh_vista_torneos"
};

const TORNEOS_INICIALES = [
    {
        id: "t-1",
        titulo: "Copa Horizonte",
        deporte: "VÓLEY",
        categoria: "MIXTO · +18",
        fecha: "Sábado 24 de octubre",
        sede: "Sede central",
        precio: 25000,
        cupos: 8,
        estado: "INSCRIPCIÓN ABIERTA",
        imagen: "https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "t-2",
        titulo: "Liga de primavera",
        deporte: "VÓLEY",
        categoria: "FEMENINO · SUB-21",
        fecha: "Domingo 1 de noviembre",
        sede: "Sede central",
        precio: 22000,
        cupos: 4,
        estado: "QUEDAN 4 LUGARES",
        imagen: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: "t-3",
        titulo: "Liga de primavera",
        deporte: "VÓLEY",
        categoria: "MASCULINO · SUB-21",
        fecha: "Domingo 1 de noviembre",
        sede: "Sede central",
        precio: 22000,
        cupos: 4,
        estado: "QUEDAN 4 LUGARES",
        imagen: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80"
    }
];

const leerStorage = (clave, valorPorDefecto) => {
    try {
        const dato = localStorage.getItem(clave);
        return dato ? JSON.parse(dato) : valorPorDefecto;
    } catch {
        return valorPorDefecto;
    }
};

const guardarStorage = (clave, valor) => {
    localStorage.setItem(clave, JSON.stringify(valor));
};

const inicializarDatos = () => {
    if (!localStorage.getItem(STORAGE_KEYS.TORNEOS)) {
        guardarStorage(STORAGE_KEYS.TORNEOS, TORNEOS_INICIALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
        guardarStorage(STORAGE_KEYS.USUARIOS, []);
    }
};

const obtenerUsuarios = () => leerStorage(STORAGE_KEYS.USUARIOS, []);
const obtenerTorneos = () => leerStorage(STORAGE_KEYS.TORNEOS, []);
const obtenerSesion = () => leerStorage(STORAGE_KEYS.SESION, null);

const actualizarUsuarioActivo = (usuarioActualizado) => {
    const usuarios = obtenerUsuarios().map((u) =>
        u.email === usuarioActualizado.email ? usuarioActualizado : u
    );
    guardarStorage(STORAGE_KEYS.USUARIOS, usuarios);
    guardarStorage(STORAGE_KEYS.SESION, usuarioActualizado);
};

inicializarDatos();