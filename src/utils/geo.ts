/**
 * Utilidades geoespaciales para cálculo de distancias
 */

// Radio de la Tierra en kilómetros
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param a Punto A con latitud y longitud
 * @param b Punto B con latitud y longitud
 * @returns Distancia en kilómetros
 */
export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const deltaLat = toRad(b.lat - a.lat);
  const deltaLng = toRad(b.lng - a.lng);

  const a_calc =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a_calc), Math.sqrt(1 - a_calc));

  return EARTH_RADIUS_KM * c;
}

/**
 * Proyecta coordenadas geográficas a un plano cartesiano en metros
 * Útil para algoritmos que trabajan con distancia euclídea
 * @param lat Latitud del punto
 * @param lng Longitud del punto
 * @param latRef Latitud de referencia (usualmente la del usuario)
 * @returns Coordenadas proyectadas en metros {x, y}
 */
export function projectToMeters(
  lat: number,
  lng: number,
  latRef: number
): { x: number; y: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const latRad = toRad(lat);
  const lngRad = toRad(lng);
  const latRefRad = toRad(latRef);

  const x = EARTH_RADIUS_M * lngRad * Math.cos(latRefRad);
  const y = EARTH_RADIUS_M * latRad;

  return { x, y };
}

/**
 * Calcula un bounding box aproximado para filtrar resultados
 * @param lat Latitud central
 * @param lng Longitud central
 * @param radiusKm Radio en kilómetros
 * @returns Coordenadas del bounding box {minLat, maxLat, minLng, maxLng}
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Aproximación: 1 grado de latitud ≈ 111 km
  // 1 grado de longitud ≈ 111 km * cos(lat)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

