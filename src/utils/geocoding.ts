// Mapeo de ubicaciones a coordenadas aproximadas
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Guadalajara, Jalisco': { lat: 20.6597, lng: -103.3496 },
  'Monterrey, Nuevo León': { lat: 25.6866, lng: -100.3161 },
  'Puebla, Puebla': { lat: 19.0414, lng: -98.2063 },
  'Ciudad de México': { lat: 19.4326, lng: -99.1332 },
  'Mérida, Yucatán': { lat: 20.9674, lng: -89.5926 },
  'San Luis Potosí, SLP': { lat: 22.1565, lng: -100.9855 },
  'Tijuana, Baja California': { lat: 32.5149, lng: -117.0382 },
  'Cancún, Quintana Roo': { lat: 21.1619, lng: -86.8515 },
  'Querétaro, Querétaro': { lat: 20.5881, lng: -100.3881 },
  'León, Guanajuato': { lat: 21.1250, lng: -101.6860 },
  'Aguascalientes, Aguascalientes': { lat: 21.8853, lng: -102.2916 },
  'México, CDMX': { lat: 19.4326, lng: -99.1332 },
  'Puerto Vallarta, Jalisco': { lat: 20.6597, lng: -105.2296 },
  'Zapopan, Jalisco': { lat: 20.7236, lng: -103.3848 },
  'Tlaquepaque, Jalisco': { lat: 20.6409, lng: -103.2933 },
  'Tonalá, Jalisco': { lat: 20.6235, lng: -103.2330 },
  'Tlajomulco, Jalisco': { lat: 20.4736, lng: -103.4431 },
  'Chihuahua, Chihuahua': { lat: 28.6329, lng: -106.0691 },
  'Juárez, Chihuahua': { lat: 31.6904, lng: -106.4245 },
  'Saltillo, Coahuila': { lat: 25.4232, lng: -101.0053 },
  'Torreón, Coahuila': { lat: 25.5428, lng: -103.4068 },
  'Toluca, Estado de México': { lat: 19.2925, lng: -99.6569 },
  'Ecatepec, Estado de México': { lat: 19.6018, lng: -99.0506 },
  'Naucalpan, Estado de México': { lat: 19.4753, lng: -99.2376 },
  'Morelia, Michoacán': { lat: 19.7008, lng: -101.1844 },
  'Uruapan, Michoacán': { lat: 19.4208, lng: -102.0628 },
  'Cuernavaca, Morelos': { lat: 18.9242, lng: -99.2216 },
  'Tepic, Nayarit': { lat: 21.5039, lng: -104.8950 },
  'Oaxaca, Oaxaca': { lat: 17.0732, lng: -96.7266 },
  'Xalapa, Veracruz': { lat: 19.5312, lng: -96.9159 },
  'Veracruz, Veracruz': { lat: 19.1738, lng: -96.1342 },
  'Villahermosa, Tabasco': { lat: 17.9894, lng: -92.9476 },
  'Reynosa, Tamaulipas': { lat: 26.0806, lng: -98.2883 },
  'Matamoros, Tamaulipas': { lat: 25.8690, lng: -97.5027 },
  'Tampico, Tamaulipas': { lat: 22.2553, lng: -97.8686 },
  'Tuxtla Gutiérrez, Chiapas': { lat: 16.7520, lng: -93.1167 },
  'Campeche, Campeche': { lat: 19.8301, lng: -90.5349 },
  'Chetumal, Quintana Roo': { lat: 18.5141, lng: -88.3038 },
  'La Paz, Baja California Sur': { lat: 24.1426, lng: -110.3128 },
  'Hermosillo, Sonora': { lat: 29.0729, lng: -110.9559 },
  'Culiacán, Sinaloa': { lat: 24.8047, lng: -107.3949 },
  'Mazatlán, Sinaloa': { lat: 23.2494, lng: -106.4111 },
  'Durango, Durango': { lat: 24.0277, lng: -104.6532 },
  'Zacatecas, Zacatecas': { lat: 22.7709, lng: -102.5832 }
};

/**
 * Geocodifica una dirección usando Nominatim (OpenStreetMap)
 * @param address - Dirección completa (ej: "Col. Centro, Zapopan, Jalisco")
 * @returns Coordenadas { lat, lng } o null si no se encuentra
 */
async function geocodeWithNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Agregar "México" al final para mejorar resultados
    const searchQuery = address.includes('México') || address.includes('Mexico') 
      ? address 
      : `${address}, México`;
    
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=mx`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TrabajoFacil/1.0 (contact@trabajofacil.com)' // Nominatim requiere User-Agent
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding with Nominatim:', error);
    return null;
  }
}

/**
 * Extrae código postal de una ubicación string
 * @param location - Ubicación como string (ej: "Col. Centro, CP 44100, Guadalajara, Jalisco")
 * @returns Código postal (5 dígitos) o null
 */
function extractPostalCode(location: string): string | null {
  if (!location) return null;

  // Buscar patrón CP 44100 o 44100
  const cpPattern = /CP\s*(\d{5})|(\d{5})/i;
  const match = location.match(cpPattern);
  
  if (match) {
    return match[1] || match[2] || null;
  }

  return null;
}

/**
 * Obtiene coordenadas desde código postal usando Nominatim
 * @param postalCode - Código postal (5 dígitos)
 * @returns Coordenadas { lat, lng } o null si no se encuentra
 */
async function getCoordinatesFromPostalCode(postalCode: string): Promise<{ lat: number; lng: number } | null> {
  if (!postalCode || postalCode.length !== 5) return null;

  try {
    const encodedPostalCode = encodeURIComponent(postalCode);
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodedPostalCode}&countrycodes=mx&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TrabajoFacil/1.0 (contact@trabajofacil.com)'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Busca coordenadas por ciudad/estado en el diccionario
 * @param location - Ubicación como string
 * @returns Coordenadas { lat, lng } o null
 */
function findCoordinatesByCity(location: string): { lat: number; lng: number } | null {
  const lowerLocation = location.toLowerCase();

  // Buscar coincidencia exacta
  if (locationCoordinates[location]) {
    return locationCoordinates[location];
  }

  // Buscar por ciudad (tomar la primera parte antes de la coma)
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    const cityName = key.split(',')[0].trim().toLowerCase();
    if (lowerLocation.includes(cityName)) {
      return coords;
    }
  }

  // Buscar palabras clave comunes
  const cityKeywords: Record<string, { lat: number; lng: number }> = {
    'guadalajara': { lat: 20.6597, lng: -103.3496 },
    'zapopan': { lat: 20.7236, lng: -103.3848 },
    'tlaquepaque': { lat: 20.6409, lng: -103.2933 },
    'tonalá': { lat: 20.6235, lng: -103.2330 },
    'tlajomulco': { lat: 20.4736, lng: -103.4431 },
    'monterrey': { lat: 25.6866, lng: -100.3161 },
    'puebla': { lat: 19.0414, lng: -98.2063 },
    'méxico': { lat: 19.4326, lng: -99.1332 },
    'cdmx': { lat: 19.4326, lng: -99.1332 },
    'ciudad de mexico': { lat: 19.4326, lng: -99.1332 },
    'mérida': { lat: 20.9674, lng: -89.5926 },
    'san luis potosí': { lat: 22.1565, lng: -100.9855 },
    'san luis potosi': { lat: 22.1565, lng: -100.9855 },
    'tijuana': { lat: 32.5149, lng: -117.0382 },
    'cancún': { lat: 21.1619, lng: -86.8515 },
    'cancun': { lat: 21.1619, lng: -86.8515 },
    'querétaro': { lat: 20.5881, lng: -100.3881 },
    'queretaro': { lat: 20.5881, lng: -100.3881 },
    'león': { lat: 21.1250, lng: -101.6860 },
    'leon': { lat: 21.1250, lng: -101.6860 },
    'aguascalientes': { lat: 21.8853, lng: -102.2916 },
    'puerto vallarta': { lat: 20.6597, lng: -105.2296 },
    'chihuahua': { lat: 28.6329, lng: -106.0691 },
    'juárez': { lat: 31.6904, lng: -106.4245 },
    'juarez': { lat: 31.6904, lng: -106.4245 },
    'saltillo': { lat: 25.4232, lng: -101.0053 },
    'torreón': { lat: 25.5428, lng: -103.4068 },
    'torreon': { lat: 25.5428, lng: -103.4068 },
    'toluca': { lat: 19.2925, lng: -99.6569 },
    'ecatepec': { lat: 19.6018, lng: -99.0506 },
    'naucalpan': { lat: 19.4753, lng: -99.2376 },
    'morelia': { lat: 19.7008, lng: -101.1844 },
    'uruapan': { lat: 19.4208, lng: -102.0628 },
    'cuernavaca': { lat: 18.9242, lng: -99.2216 },
    'tepic': { lat: 21.5039, lng: -104.8950 },
    'oaxaca': { lat: 17.0732, lng: -96.7266 },
    'xalapa': { lat: 19.5312, lng: -96.9159 },
    'veracruz': { lat: 19.1738, lng: -96.1342 },
    'villahermosa': { lat: 17.9894, lng: -92.9476 },
    'reynosa': { lat: 26.0806, lng: -98.2883 },
    'matamoros': { lat: 25.8690, lng: -97.5027 },
    'tampico': { lat: 22.2553, lng: -97.8686 },
    'tuxtla': { lat: 16.7520, lng: -93.1167 },
    'campeche': { lat: 19.8301, lng: -90.5349 },
    'chetumal': { lat: 18.5141, lng: -88.3038 },
    'la paz': { lat: 24.1426, lng: -110.3128 },
    'hermosillo': { lat: 29.0729, lng: -110.9559 },
    'culiacán': { lat: 24.8047, lng: -107.3949 },
    'culiacan': { lat: 24.8047, lng: -107.3949 },
    'mazatlán': { lat: 23.2494, lng: -106.4111 },
    'mazatlan': { lat: 23.2494, lng: -106.4111 },
    'durango': { lat: 24.0277, lng: -104.6532 },
    'zacatecas': { lat: 22.7709, lng: -102.5832 }
  };

  for (const [keyword, coords] of Object.entries(cityKeywords)) {
    if (lowerLocation.includes(keyword)) {
      return coords;
    }
  }

  return null;
}

/**
 * Convierte una ubicación (string) a coordenadas lat/lng
 * Intenta múltiples métodos: código postal, geocoding API, diccionario
 * @param location - Ubicación como string (ej: "Col. Centro, Zapopan, Jalisco")
 * @returns Coordenadas { lat, lng } o null si no se encuentra
 */
export async function getCoordinatesFromLocation(location: string | null | undefined): Promise<{ lat: number; lng: number } | null> {
  if (!location) return null;

  // 1. Intentar obtener coordenadas desde código postal (más preciso)
  const postalCode = extractPostalCode(location);
  if (postalCode) {
    const coordinates = await getCoordinatesFromPostalCode(postalCode);
    if (coordinates) {
      return coordinates;
    }
  }

  // 2. Intentar geocodificar la dirección completa con Nominatim
  const geocoded = await geocodeWithNominatim(location);
  if (geocoded) {
    return geocoded;
  }

  // 3. Buscar en diccionario por ciudad/estado
  const dictCoordinates = findCoordinatesByCity(location);
  if (dictCoordinates) {
    return dictCoordinates;
  }

  // 4. Si no se encuentra nada, retornar null (no usar fallback)
  // Es mejor no tener coordenadas que tener coordenadas incorrectas
  return null;
}
