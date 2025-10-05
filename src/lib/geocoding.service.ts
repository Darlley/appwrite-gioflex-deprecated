import { Coordinates } from '@/types/address.type';

export const TAYAMA_PARK_BOUNDS = [
  { lat: -20.44197, lng: -54.57016 },
  { lat: -20.44337, lng: -54.57151 },
  { lat: -20.44774, lng: -54.57087 },
  { lat: -20.44731, lng: -54.56851 },
  { lat: -20.44245, lng: -54.56937 },
  { lat: -20.44197, lng: -54.57016 }, // Fechando o polígono
];


// Centro aproximado conforme seu exemplo
export const TAYAMA_PARK_CENTER = {
  lat: -20.44774,
  lng: -54.57015
};

export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    // Se temos Google Maps API disponível, usar ela
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result[0]) {
        const location = result[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
    }

    // Fallback para API de geocoding alternativa (OpenStreetMap Nominatim)
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Erro na geocodificação');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return null;
  }
};

// Função para verificar se um ponto está dentro do polígono (algoritmo ray casting)
export const isPointInPolygon = (point: Coordinates, polygon: Coordinates[]): boolean => {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

// Função para calcular distância entre dois pontos (fórmula de Haversine)
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
};

// Função para validar endereços no Tayamã Park
export const isAddressInTayamaPark = async (address: string): Promise<{ isValid: boolean; coordinates?: Coordinates }> => {
  const coordinates = await geocodeAddress(address);
  
  if (!coordinates) {
    return { isValid: false };
  }

  // Verificar se está dentro do polígono definido
  let isValid = isPointInPolygon(coordinates, TAYAMA_PARK_BOUNDS);
  
  // Verificação adicional para endereços que podem estar ligeiramente fora do polígono
  // mas ainda são do Tayamã Park
  if (!isValid) {
    // Verificar se o endereço contém "Tayamã" ou variações no nome
    const addressLower = address.toLowerCase();
    const hasTayamaInName = addressLower.includes('tayamã') || 
                           addressLower.includes('tayama') || 
                           addressLower.includes('tayamã park') ||
                           addressLower.includes('tayama park');
    
    // Verificar proximidade com o centro do Tayamã Park (raio de ~1km para ser mais restritivo)
    const distanceFromCenter = calculateDistance(coordinates, TAYAMA_PARK_CENTER);
    const isNearTayamaPark = distanceFromCenter <= 1; // 1km de raio
    
    // Verificar se está em Campo Grande, MS
    const isInCampoGrande = addressLower.includes('campo grande') && 
                           (addressLower.includes('ms') || addressLower.includes('mato grosso do sul'));
    
    // Se tem "Tayamã" no nome E está próximo E está em Campo Grande, aceitar
    if (hasTayamaInName && isNearTayamaPark && isInCampoGrande) {
      isValid = true;
    }
  }
  
  return { 
    isValid, 
    coordinates 
  };
}; 