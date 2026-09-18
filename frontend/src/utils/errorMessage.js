/**
 * Extrae un mensaje de error legible y amigable para el usuario desde respuestas de Axios o excepciones
 * @param {any} err - Objeto de error capturado en un try/catch
 * @param {string} [defaultMsg] - Mensaje de respaldo por defecto
 * @returns {string}
 */
export const getErrorMessage = (err, defaultMsg = 'Ocurrió un error inesperado. Intenta de nuevo.') => {
  if (!err) return defaultMsg;
  if (typeof err === 'string') return err;

  const data = err.response?.data;
  if (data) {
    // Si viene un objeto de validación Zod estructurado con fieldErrors
    if (data.details?.fieldErrors && typeof data.details.fieldErrors === 'object') {
      const entries = Object.entries(data.details.fieldErrors);
      if (entries.length > 0) {
        const [field, errors] = entries[0];
        const errorText = Array.isArray(errors) ? errors[0] : String(errors);
        const translatedField = translateFieldName(field);
        return `${translatedField ? `${translatedField}: ` : ''}${errorText}`;
      }
    }

    // Si viene un array simple de errores
    if (Array.isArray(data.details) && data.details.length > 0) {
      return String(data.details[0]);
    }

    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return defaultMsg;
};

function translateFieldName(field) {
  const map = {
    restaurantName: 'Nombre del negocio',
    slug: 'Enlace del negocio',
    email: 'Correo electrónico',
    password: 'Contraseña',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    address: 'Dirección',
    name: 'Nombre',
    price: 'Precio',
    categoryId: 'Categoría'
  };
  return map[field] || field;
}
