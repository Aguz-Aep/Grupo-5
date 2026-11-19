window.addEventListener("load", () => {
    const checkboxTema = document.getElementById("tema-oscuro");
    const iconoTema = document.getElementById("icono-tema");
    const textoTema = document.getElementById("texto-tema");
    const temaGuardado = localStorage.getItem(STORAGE_KEYS.TEMA) || "claro";

    /** Aplica las variables de color del tema elegido. */
    const aplicarTema = (tema) => {
        const esOscuro = tema === "oscuro";
        document.documentElement.setAttribute("data-theme", esOscuro ? "dark" : "light");
        if (checkboxTema) checkboxTema.checked = esOscuro;
        if (iconoTema) iconoTema.textContent = esOscuro ? "☀" : "☾";
        if (textoTema) textoTema.textContent = esOscuro ? "Claro" : "Oscuro";
    };

    aplicarTema(temaGuardado);

    if (checkboxTema) {
        checkboxTema.addEventListener("change", () => {
            const nuevoTema = checkboxTema.checked ? "oscuro" : "claro";
            localStorage.setItem(STORAGE_KEYS.TEMA, nuevoTema);
            aplicarTema(nuevoTema);
        });
    }
});
