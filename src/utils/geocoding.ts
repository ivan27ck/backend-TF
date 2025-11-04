// Mapeo de ubicaciones a coordenadas aproximadas
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Guadalajara, Jalisco': { lat: 20.6597, lng: -103.3496 },
  'Monterrey, Nuevo León': { lat: 25.6866, lng: -100.3161 },
  'Puebla, Puebla': { lat: 19.0414, lng: -98.2063 },
  'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
  'Mérida, Yucatán': { lat: 20.9674, lng: -89.5926 },
  'San Luis Potosí, SLP': { lat: 22.1565, lng: -100.9855 },
  'Av. Mariano Barcena s/n, Auditorio, 45180 Zapopan, Jal.': { lat: 20.7242, lng: -103.3935 },
  'Tijuana, Baja California': { lat: 32.5149, lng: -117.0382 },
  'Cancún, Quintana Roo': { lat: 21.1619, lng: -86.8515 },
  'Querétaro, Querétaro': { lat: 20.5881, lng: -100.3881 },
  'León, Guanajuato': { lat: 21.1250, lng: -101.6860 },
  'Aguascalientes, Aguascalientes': { lat: 21.8853, lng: -102.2916 },
  'México, CDMX': { lat: 19.4326, lng: -99.1332 },
  'Puerto Vallarta, Jalisco': { lat: 20.6597, lng: -105.2296 }
};

/**
 * Convierte una ubicación (string) a coordenadas lat/lng aproximadas
 * @param location - Ubicación como string (ej: "Guadalajara, Jalisco")
 * @returns Coordenadas { lat, lng } o null si no se encuentra
 */
export function getCoordinatesFromLocation(location: string | null | undefined): { lat: number; lng: number } | null {
  if (!location) return null;
  
  // Buscar coincidencia exacta
  if (locationCoordinates[location]) {
    return locationCoordinates[location];
  }
  
  // Buscar por ciudad (tomar la primera parte antes de la coma)
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    const cityName = key.split(',')[0].trim();
    if (location.includes(cityName)) {
      return coords;
    }
  }
  
  // Buscar palabras clave comunes
  const lowerLocation = location.toLowerCase();
  
  if (lowerLocation.includes('guadalajara') || lowerLocation.includes('zapopan')) {
    return { lat: 20.6597, lng: -103.3496 };
  }
  if (lowerLocation.includes('monterrey')) {
    return { lat: 25.6866, lng: -100.3161 };
  }
  if (lowerLocation.includes('puebla')) {
    return { lat: 19.0414, lng: -98.2063 };
  }
  if (lowerLocation.includes('méxico') || lowerLocation.includes('cdmx') || lowerLocation.includes('ciudad de mexico')) {
    return { lat: 19.4326, lng: -99.1332 };
  }
  if (lowerLocation.includes('mérida')) {
    return { lat: 20.9674, lng: -89.5926 };
  }
  if (lowerLocation.includes('san luis')) {
    return { lat: 22.1565, lng: -100.9855 };
  }
  if (lowerLocation.includes('tijuana')) {
    return { lat: 32.5149, lng: -117.0382 };
  }
  if (lowerLocation.includes('cancún')) {
    return { lat: 21.1619, lng: -86.8515 };
  }
  if (lowerLocation.includes('querétaro')) {
    return { lat: 20.5881, lng: -100.3881 };
  }
  if (lowerLocation.includes('león')) {
    return { lat: 21.1250, lng: -101.6860 };
  }
  if (lowerLocation.includes('aguascalientes')) {
    return { lat: 21.8853, lng: -102.2916 };
  }
  if (lowerLocation.includes('puerto vallarta')) {
    return { lat: 20.6597, lng: -105.2296 };
  }
  
  // Por defecto, usar coordenadas de Guadalajara
  return { lat: 20.6597, lng: -103.3496 };
}
