
# Wallapop Advanced Search

Una herramienta web avanzada para buscar y visualizar productos de usuarios en Wallapop. Este proyecto no está asociado oficialmente con Wallapop.

Demo: [Wallapop Advanced Search](https://dcimorra.es/tools/wallapop?u=daniel-329001854)

## Características

- **Búsqueda de usuarios:** Introduce el nombre de usuario o URL del perfil de Wallapop para obtener detalles del usuario.
- **Visualización de productos:** Lista de productos publicados por el usuario con detalles como precio, disponibilidad de envío y estado de reserva.
- **Filtros avanzados:** Filtra los productos por título y ordénalos por nombre o precio.
- **Interfaz intuitiva:** Información detallada del usuario y productos en un diseño amigable.

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript.
- **API:** Se conecta a la API de Wallapop para obtener datos de usuarios y productos.

## Instalación

1. Clona este repositorio:

   ```bash
   git clone <repositorio>
   ```

2. Abre el archivo `index.html` en tu navegador.

## Uso

1. Introduce el nombre de usuario o URL del perfil de Wallapop en el campo de búsqueda.
2. Haz clic en el botón "Buscar" para obtener información del usuario y sus productos.
3. Usa los filtros para buscar productos específicos o cambiar el orden de visualización.

## Requisitos Adicionales

Para consumir la información del usuario, es necesario utilizar un proxy debido a restricciones de CORS en la API de Wallapop. Por defecto, el código implementa `cors-anywhere` como solución proxy.

## Estructura del Proyecto

- `index.html`: Interfaz principal de la aplicación.
- `main.js`: Lógica de búsqueda, filtros y conexión con la API de Wallapop.
- `css/styles.min.css`: Estilos del proyecto.

## Limitaciones

- Esta herramienta depende de la API de Wallapop y puede verse afectada si hay cambios en su funcionamiento.
- Solo para uso personal y no comercial.

## Contribuciones

Si deseas contribuir al proyecto, envía un pull request o abre un issue en el repositorio.

## Licencia

Este proyecto está bajo la licencia MIT.
