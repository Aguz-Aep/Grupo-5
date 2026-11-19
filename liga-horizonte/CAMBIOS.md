# Cambios realizados

- El registro público ya no ofrece elegir el rol. La primera cuenta es Administrador y las siguientes son Usuarios.
- El panel de administración permite crear cuentas y asignar o quitar permisos de Administrador. Se protege al único administrador y la cuenta que está usando el panel.
- La sesión guarda solamente el correo y recupera el usuario desde la lista de usuarios. Las sesiones anteriores se migran al nuevo formato.
- Se incorporó validación de correo y contraseña segura en el registro, con mensajes junto a cada campo.
- El alta de torneos valida los campos desde JavaScript y utiliza un selector de fecha.
- La disponibilidad se calcula a partir de los cupos y la confirmación del carrito descuenta cupos únicamente de torneos todavía disponibles.
- Se evita agregar una segunda inscripción al mismo torneo.
- Los datos dinámicos se escapan antes de insertarse en plantillas HTML para reducir el riesgo de XSS.
- El carrito sincroniza `aria-hidden` con su estado y se puede cerrar con Escape.
- Se agregó cierre de sesión en los encabezados, indicador de modo, confirmación al eliminar torneos y foco visible para teclado.
- Se añadieron comentarios, documentación JSDoc en `datos.js` y una guía `LEEME.md`.
