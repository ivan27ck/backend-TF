import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';
import { haversineDistanceKm, projectToMeters } from '../utils/geo';
import { kmeans, type KPoint } from '../utils/kmeans';
import { getCoordinatesFromLocation } from '../utils/geocoding';

export async function getServices(req: Request, res: Response) {
  try {
    const { category, location, search, page = 1, limit = 100, userLat, userLng } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'active' };

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { category: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              reviewsCount: true,
              location: true,
              profession: true,
              experience: true,
              completedJobs: true,
              verified: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.service.count({ where })
    ]);

    // Si el usuario envió sus coordenadas, calcular distancia usando las coordenadas guardadas en la BD
    let servicesWithDistance = services;
    if (userLat && userLng) {
      const userLatNum = parseFloat(userLat as string);
      const userLngNum = parseFloat(userLng as string);

      if (!Number.isNaN(userLatNum) && !Number.isNaN(userLngNum)) {
        servicesWithDistance = services.map(service => {
          // Usar las coordenadas que ya están guardadas en la base de datos
          if (service.lat !== null && service.lng !== null) {
            const distance = haversineDistanceKm(
              { lat: userLatNum, lng: userLngNum },
              { lat: service.lat, lng: service.lng }
            );
            return {
              ...service,
              distance
            };
          }
          // Si el servicio no tiene coordenadas, no agregar distancia
          return service;
        });

        // Ordenar por distancia (servicios sin coordenadas al final)
        servicesWithDistance.sort((a, b) => {
          const aDist = 'distance' in a ? (a as any).distance : Infinity;
          const bDist = 'distance' in b ? (b as any).distance : Infinity;
          return aDist - bDist;
        });
      }
    }

    res.json({
      success: true,
      services: servicesWithDistance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getServiceById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewsCount: true,
            location: true,
            profession: true,
            experience: true,
            completedJobs: true,
            verified: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json({ success: true, service });
  } catch (error) {
    console.error('Error getting service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function createService(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { title, description, category, price, location, images, mainImage, lat, lng } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Título y categoría son requeridos' });
    }

    let latValue: number | null = null;
    let lngValue: number | null = null;

    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        latValue = parsedLat;
        lngValue = parsedLng;
      }
    }

    if (latValue === null || lngValue === null) {
      const coordinates = await getCoordinatesFromLocation(location);
      if (coordinates) {
        latValue = coordinates.lat;
        lngValue = coordinates.lng;
      }
    }

    const service = await prisma.service.create({
      data: {
        userId: decoded.id,
        title,
        description,
        category,
        price,
        location,
        images: images || [],
        mainImage: mainImage || null,
        lat: latValue,
        lng: lngValue
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewsCount: true,
            location: true,
            profession: true,
            experience: true,
            completedJobs: true,
            verified: true
          }
        }
      }
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { id } = req.params;
    const { title, description, category, price, location, images, mainImage, lat, lng } = req.body;

    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    if (existingService.userId !== decoded.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    let latValue: number | null | undefined = lat;
    let lngValue: number | null | undefined = lng;

    if (latValue !== undefined && latValue !== null) {
      const parsedLat = Number(latValue);
      latValue = Number.isNaN(parsedLat) ? null : parsedLat;
    }

    if (lngValue !== undefined && lngValue !== null) {
      const parsedLng = Number(lngValue);
      lngValue = Number.isNaN(parsedLng) ? null : parsedLng;
    }

    if ((latValue === undefined || latValue === null) && (lngValue === undefined || lngValue === null)) {
      const coordinates = await getCoordinatesFromLocation(location ?? existingService.location ?? null);
      if (coordinates) {
        latValue = coordinates.lat;
        lngValue = coordinates.lng;
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        category,
        price,
        location,
        images,
        mainImage: mainImage || null,
        lat: latValue ?? existingService.lat,
        lng: lngValue ?? existingService.lng
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewsCount: true,
            location: true,
            profession: true,
            experience: true,
            completedJobs: true,
            verified: true
          }
        }
      }
    });

    res.json({ success: true, service: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = verifyToken(token) as { id: string };
    const { id } = req.params;

    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    if (existingService.userId !== decoded.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Búsqueda de servicios cercanos usando K-Means clustering
 * Agrupa servicios por cercanía y devuelve el cluster más cercano al usuario
 */
export async function getNearbyServicesKMeans(req: Request, res: Response) {
  try {
    const { userLat, userLng, k, limit = '20', page = '1', radiusKm, category, q } = req.query;

    console.log('🔍 Búsqueda por cercanía iniciada:');
    console.log(`   Parámetros: userLat=${userLat}, userLng=${userLng}, radiusKm=${radiusKm}, category=${category}, q=${q}`);

    // Validar parámetros obligatorios
    if (!userLat || !userLng) {
      return res.status(400).json({
        success: false,
        message: 'userLat y userLng son obligatorios'
      });
    }

    const userLatNum = parseFloat(userLat as string);
    const userLngNum = parseFloat(userLng as string);
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);

    if (isNaN(userLatNum) || isNaN(userLngNum)) {
      return res.status(400).json({
        success: false,
        message: 'userLat y userLng deben ser números válidos'
      });
    }

    // Construir filtros de búsqueda
    const where: any = {
      status: 'active',
      lat: { not: null },
      lng: { not: null }
    };

    if (category) {
      where.category = category as string;
    }

    if (q) {
      where.OR = [
        { title: { contains: q as string } },
        { description: { contains: q as string } }
      ];
    }

    // Consultar servicios
    const services = await prisma.service.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewsCount: true,
            location: true,
            profession: true,
            verified: true
          }
        }
      }
    });

    // Filtrar por radio (por defecto 15 km si no se especifica)
    const DEFAULT_RADIUS_KM = 15;
    const radiusNum = radiusKm ? parseFloat(radiusKm as string) : DEFAULT_RADIUS_KM;
    
    console.log(`🔍 Filtrando servicios dentro de ${radiusNum} km del usuario`);
    
    let filteredServices = services.filter(service => {
      if (!service.lat || !service.lng) return false;
      const distance = haversineDistanceKm(
        { lat: userLatNum, lng: userLngNum },
        { lat: service.lat, lng: service.lng }
      );
      return distance <= radiusNum;
    });
    
    console.log(`   Servicios dentro del radio: ${filteredServices.length} de ${services.length}`);

    const n = filteredServices.length;

    // Si no hay servicios, retornar vacío
    if (n === 0) {
      return res.json({
        success: true,
        total: 0,
        page: pageNum,
        limit: limitNum,
        k: 0,
        centroid: null,
        items: []
      });
    }

    // Si hay muy pocos servicios, no usar K-Means
    if (n < 2) {
      console.log('🔍 Búsqueda cercana (sin K-Means - muy pocos servicios):');
      console.log('   Total servicios:', n);
      console.log('   Radio máximo:', radiusNum, 'km');
      console.log('   Ubicación del usuario: lat=', userLatNum, 'lng=', userLngNum);

      const servicesWithDistance = filteredServices.map(service => ({
        ...service,
        distance: haversineDistanceKm(
          { lat: userLatNum, lng: userLngNum },
          { lat: service.lat!, lng: service.lng! }
        )
      }));

      servicesWithDistance.sort((a, b) => a.distance - b.distance);

      console.log('   📍 Distancias de servicios:');
      servicesWithDistance.forEach((service, index) => {
        console.log(`      ${index + 1}. "${service.title}" - ${service.distance.toFixed(2)} km (lat=${service.lat}, lng=${service.lng})`);
      });
      
      const skip = (pageNum - 1) * limitNum;
      const paginatedServices = servicesWithDistance.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        total: n,
        page: pageNum,
        limit: limitNum,
        k: 1,
        centroid: { lat: filteredServices[0].lat, lng: filteredServices[0].lng },
        items: paginatedServices
      });
    }

    // Calcular k óptimo si no se especifica
    let kNum = k ? parseInt(k as string) : Math.min(Math.max(2, Math.round(Math.sqrt(n / 2))), 10);
    
    // Ajustar k si es mayor que n
    if (kNum > n) {
      kNum = n;
    }

    // Proyectar servicios a espacio cartesiano
    const points: KPoint[] = filteredServices.map(service => {
      const projected = projectToMeters(service.lat!, service.lng!, userLatNum);
      return {
        x: projected.x,
        y: projected.y,
        refId: service.id
      };
    });

    // Ejecutar K-Means
    const kmeansResult = kmeans(points, kNum);

    // Proyectar ubicación del usuario
    const userProjected = projectToMeters(userLatNum, userLngNum, userLatNum);

    // Encontrar el centroide más cercano al usuario
    let closestCentroidIdx = 0;
    let minDistToCentroid = Infinity;

    for (let i = 0; i < kmeansResult.centroids.length; i++) {
      const dist = euclideanDistance(userProjected, kmeansResult.centroids[i]);
      if (dist < minDistToCentroid) {
        minDistToCentroid = dist;
        closestCentroidIdx = i;
      }
    }

    // Obtener servicios del cluster más cercano
    const clusterServiceIds = points
      .filter((_, i) => kmeansResult.assignments[i] === closestCentroidIdx)
      .map(p => p.refId);

    const clusterServices = filteredServices.filter(service =>
      clusterServiceIds.includes(service.id)
    );
    
    console.log('🔍 K-Means Debug:');
    console.log('   Total servicios consultados:', n);
    console.log('   Radio máximo:', radiusNum, 'km');
    console.log('   Número de clusters (k):', kNum);
    console.log('   Cluster más cercano:', closestCentroidIdx);
    console.log('   Servicios en cluster cercano:', clusterServices.length);
    console.log('   Límite de paginación:', limitNum);
    console.log('   Ubicación del usuario: lat=', userLatNum, 'lng=', userLngNum);

    // Calcular distancia real para cada servicio, filtrar por radio y ordenar
    const servicesWithDistance = clusterServices
      .map(service => ({
        ...service,
        distance: haversineDistanceKm(
          { lat: userLatNum, lng: userLngNum },
          { lat: service.lat!, lng: service.lng! }
        )
      }))
      .filter(service => service.distance <= radiusNum); // Filtro adicional por seguridad

    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    console.log('   📍 Distancias de servicios:');
    servicesWithDistance.forEach((service, index) => {
      console.log(`      ${index + 1}. "${service.title}" - ${service.distance.toFixed(2)} km (lat=${service.lat}, lng=${service.lng})`);
    });

    // Paginación
    const skip = (pageNum - 1) * limitNum;
    const paginatedServices = servicesWithDistance.slice(skip, skip + limitNum);

    // Calcular centroide del cluster en coordenadas geográficas (aproximado)
    const centroidGeo = {
      lat: userLatNum + (kmeansResult.centroids[closestCentroidIdx].y / EARTH_RADIUS_M) * (180 / Math.PI),
      lng: userLngNum + (kmeansResult.centroids[closestCentroidIdx].x / (EARTH_RADIUS_M * Math.cos(userLatNum * Math.PI / 180))) * (180 / Math.PI)
    };

    res.json({
      success: true,
      total: clusterServices.length,
      page: pageNum,
      limit: limitNum,
      k: kNum,
      centroid: centroidGeo,
      items: paginatedServices
    });

  } catch (error) {
    console.error('Error in getNearbyServicesKMeans:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

const EARTH_RADIUS_M = 6371000;

/**
 * Calcula distancia euclídea entre dos puntos
 */
function euclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
