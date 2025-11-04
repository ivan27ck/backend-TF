/**
 * Implementación de K-Means para clustering geoespacial
 */

export type KPoint = {
  x: number;
  y: number;
  refId: string; // ID del servicio
};

export type KMeansResult = {
  centroids: { x: number; y: number }[];
  assignments: number[]; // Array donde assignments[i] = índice del cluster del punto i
};

/**
 * Calcula distancia euclídea entre dos puntos
 */
function euclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Inicialización K-Means++ para mejores resultados
 * Selecciona centroides iniciales maximizando la separación
 */
function initCentroidsKMeansPlusPlus(
  points: KPoint[],
  k: number
): { x: number; y: number }[] {
  const centroids: { x: number; y: number }[] = [];
  
  // Primer centroide aleatorio
  const firstIndex = Math.floor(Math.random() * points.length);
  centroids.push({ x: points[firstIndex].x, y: points[firstIndex].y });

  // Seleccionar k-1 centroides restantes
  while (centroids.length < k) {
    const distances = points.map((point) => {
      // Distancia al centroide más cercano
      const minDist = Math.min(
        ...centroids.map((c) => euclideanDistance(point, c))
      );
      return minDist;
    });

    // Suma de todas las distancias
    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    
    // Seleccionar próximo centroide con probabilidad proporcional a la distancia
    let randomValue = Math.random() * totalDist;
    let nextIndex = 0;
    
    for (let i = 0; i < distances.length; i++) {
      randomValue -= distances[i];
      if (randomValue <= 0) {
        nextIndex = i;
        break;
      }
    }

    centroids.push({ x: points[nextIndex].x, y: points[nextIndex].y });
  }

  return centroids;
}

/**
 * Algoritmo K-Means para clustering
 * @param points Array de puntos a clusterizar
 * @param k Número de clusters deseados
 * @param opts Opciones: maxIter (máximo de iteraciones), tol (tolerancia de convergencia)
 * @returns Resultado con centroides y asignaciones
 */
export function kmeans(
  points: KPoint[],
  k: number,
  opts?: { maxIter?: number; tol?: number }
): KMeansResult {
  const maxIter = opts?.maxIter || 100;
  const tol = opts?.tol || 1e-4;
  const n = points.length;

  // Casos especiales
  if (n === 0) {
    return { centroids: [], assignments: [] };
  }

  if (k >= n) {
    // Si k >= n, cada punto es su propio cluster
    const centroids = points.map((p) => ({ x: p.x, y: p.y }));
    const assignments = points.map((_, i) => i);
    return { centroids, assignments };
  }

  // Inicializar centroides con K-Means++
  let centroids = initCentroidsKMeansPlusPlus(points, k);
  let assignments = new Array(n).fill(0);
  let hasChanged = true;
  let iteration = 0;

  while (hasChanged && iteration < maxIter) {
    hasChanged = false;

    // Asignar cada punto al centroide más cercano
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;

      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(points[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = j;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        hasChanged = true;
      }
    }

    // Recalcular centroides
    const newCentroids: { x: number; y: number }[] = [];
    for (let j = 0; j < k; j++) {
      const clusterPoints = points.filter((_, i) => assignments[i] === j);

      if (clusterPoints.length === 0) {
        // Si un cluster queda vacío, mantener el centroide anterior
        newCentroids.push(centroids[j]);
      } else {
        const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
        newCentroids.push({
          x: sumX / clusterPoints.length,
          y: sumY / clusterPoints.length,
        });
      }
    }

    // Verificar convergencia
    let maxMovement = 0;
    for (let j = 0; j < k; j++) {
      const movement = euclideanDistance(centroids[j], newCentroids[j]);
      maxMovement = Math.max(maxMovement, movement);
    }

    centroids = newCentroids;

    if (maxMovement < tol) {
      hasChanged = false; // Converged
    }

    iteration++;
  }

  console.log(`K-Means converged in ${iteration} iterations`);

  return { centroids, assignments };
}

