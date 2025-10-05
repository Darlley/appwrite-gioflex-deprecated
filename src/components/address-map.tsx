import { TAYAMA_PARK_BOUNDS, TAYAMA_PARK_CENTER } from '@/lib/geocoding.service';
import { Address } from '@/types/address.type';
import { AlertCircle, Home, Shield } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface AddressMapProps {
  addresses: Address[];
  focusedAddressId?: string | null;
}

export const AddressMap: React.FC<AddressMapProps> = ({ addresses, focusedAddressId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const restrictionPolygonRef = useRef<any>(null);

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidApiKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';

  const roleColor = {
    "agent": {
      primary: '#FFCC00',
      secondary: '#2D3700'
    },
    "client": {
      primary: '#00FFCC',
      secondary: '#00372C'
    }
  }

  // Cria ícone SVG customizado baseado no tipo de endereço
  const createMarkerIcon = (address: Address, isActive: boolean = false, index: number = 0) => {
    const size = 60;

    if (address.isAdminAddress) {
      // Guarita (company_owner)
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="42" height="52" viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="map-pin-guarita">
            <path id="pin" d="M41 21C41 33.4825 27.1525 46.4825 22.5025 50.4975C22.0693 50.8232 21.542 50.9994 21 50.9994C20.458 50.9994 19.9307 50.8232 19.4975 50.4975C14.8475 46.4825 1 33.4825 1 21C1 15.6957 3.10714 10.6086 6.85786 6.85786C10.6086 3.10714 15.6957 1 21 1C26.3043 1 31.3914 3.10714 35.1421 6.85786C38.8929 10.6086 41 15.6957 41 21Z" fill="${roleColor["agent"].primary}" stroke="${roleColor["agent"].secondary}" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="bg" d="M21 39C30.9411 39 39 30.9411 39 21C39 11.0589 30.9411 3 21 3C11.0589 3 3 11.0589 3 21C3 30.9411 11.0589 39 21 39Z" fill="${roleColor["agent"].secondary}"/>
            <text id="initialName" fill="${roleColor["agent"].primary}" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="18" letter-spacing="0em"><tspan x="6" y="28.2727">🏛️</tspan></text>
            </g>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2),
        title: 'Guarita de Segurança',
      };
    } else {
      // Casa (company_client)
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="42" height="52" viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="map-pin-casa">
            <path id="pin" d="M41 21C41 33.4825 27.1525 46.4825 22.5025 50.4975C22.0693 50.8232 21.542 50.9994 21 50.9994C20.458 50.9994 19.9307 50.8232 19.4975 50.4975C14.8475 46.4825 1 33.4825 1 21C1 15.6957 3.10714 10.6086 6.85786 6.85786C10.6086 3.10714 15.6957 1 21 1C26.3043 1 31.3914 3.10714 35.1421 6.85786C38.8929 10.6086 41 15.6957 41 21Z" fill="${roleColor['client'].primary}" stroke="${roleColor['client'].secondary}" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="bg" d="M21 39C30.9411 39 39 30.9411 39 21C39 11.0589 30.9411 3 21 3C11.0589 3 3 11.0589 3 21C3 30.9411 11.0589 39 21 39Z" fill="${roleColor['client'].secondary}"/>
            <text id="initialName" fill="${roleColor['client'].primary}" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="18" letter-spacing="0em"><tspan x="6" y="28.2727">🏠</tspan></text>
            </g>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2),
        title: `Residência Protegida`,
      };
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !hasValidApiKey) return;
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: TAYAMA_PARK_CENTER,
      mapTypeId: 'satellite',
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2563EB' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#E8F5E8' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#F3F4F6' }] },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    createRestrictionPolygon();
    updateMarkers();
  };

  const createRestrictionPolygon = () => {
    if (!mapInstanceRef.current || !window.google) return;
    if (restrictionPolygonRef.current) restrictionPolygonRef.current.setMap(null);
    const polygon = new window.google.maps.Polygon({
      paths: TAYAMA_PARK_BOUNDS,
      strokeColor: '#10B981', strokeOpacity: 0.8, strokeWeight: 3,
      fillColor: '#10B981', fillOpacity: 0.15, map: mapInstanceRef.current, zIndex: 1,
    });
    restrictionPolygonRef.current = polygon;
    polygon.addListener('click', (event: any) => {
      if (infoWindowRef.current && event.latLng) {
        infoWindowRef.current.setContent(`
          <div class="p-4 max-w-xs">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-xl">🛡️</span>
              </div>
              <div>
                <h3 class="font-bold text-green-800 text-lg">Tayamã Park</h3>
                <p class="text-xs text-green-600">Área de Proteção Residencial</p>
              </div>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p class="text-sm text-green-700 font-medium mb-2">👮 Área com Agente de Segurança</p>
              <div class="space-y-1 text-xs text-green-600">
                <p>🏠 Residências protegidas</p>
                <p>🛡️ Monitoramento de segurança</p>
                <p>📞 Atendimento 24h</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">📍 Campo Grande, MS - Apenas endereços dentro desta área protegida podem ser cadastrados</p>
          </div>
        `);
        infoWindowRef.current.setPosition(event.latLng);
        infoWindowRef.current.open(mapInstanceRef.current);
      }
    });
  };

  const updateMarkers = async () => {
    if (!mapInstanceRef.current || !window.google || !hasValidApiKey) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();
    if (addresses.length === 0) return;
    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    TAYAMA_PARK_BOUNDS.forEach(coord => bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng)));
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      try {
        const fullAddress = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}, ${address.cep}`;
        const result = await new Promise<any[]>((resolve, reject) => {
          geocoder.geocode({ address: fullAddress }, (results: any, status: string) => {
            if (status === 'OK' && results) resolve(results);
            else reject(new Error(`Geocoding failed: ${status}`));
          });
        });
        if (result[0]) {
          const isActive = focusedAddressId === address.id;
          const markerTitle = address?.isAdminAddress ? 'Agente de Segurança' : `Residência Protegida`;
          const marker = new window.google.maps.Marker({
            position: result[0].geometry.location,
            map: mapInstanceRef.current,
            title: `${markerTitle} - ${address.street}, ${address.number}`,
            icon: createMarkerIcon(address, isActive, i),
            zIndex: isActive ? 2000 : (i === 0 ? 1500 : 1000 + i),
            animation: isActive ? window.google.maps.Animation.BOUNCE : undefined,
          });
          if (isActive) {
            setTimeout(() => {
              marker.setAnimation(null);
            }, 3000);
          }
          marker.addListener('click', () => {
            if (infoWindowRef.current) {
              const formatDate = (date: Date) => {
                return new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                }).format(new Date(date));
              };
              const isSecurityAgent = address.isAdminAddress;
              const securityType = isSecurityAgent ? 'Guarita de Segurança' : address.userId?.name;
              const roleIcon = isSecurityAgent ? '🏛️' : '🏠';
              infoWindowRef.current.setContent(`
                <div class="p-4 max-w-sm text-sm font-sans">
                  <div class="flex items-start gap-3 mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xl">${roleIcon}</span>
                        <h3 class="font-bold text-gray-800 text-lg tracking-tight">${securityType}</h3>
                      </div>
                      <p class="text-sm font-medium mb-1"
                         style="color: ${isSecurityAgent ? roleColor.agent.secondary : roleColor.client.secondary}">
                        ${address.street}, ${address.number} - ${address.cep}
                      </p>
                      ${address.complement ? `<p class="text-xs text-gray-600">📍 ${address.complement}</p>` : ''}
                    </div>
                  </div>

                  ${address.description && `
                    <div class="mt-4 rounded-3xl border p-4">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                          <span class="text-white text-xs">✍️</span>
                        </div>
                        <span class="text-sm font-semibold text-gray-600">Instruções para a Equipe de Segurança</span>
                      </div>
                      <p class="text-sm text-gray-600 break-all whitespace-break-spaces">${address.description}</p>
                    </div>
                  `}
              
                  <div class="mt-4">
                    <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                      <span>📞</span> Contatos
                    </h4>

                    ${isSecurityAgent ?
                      `<div class="flex flex-col gap-2">
                          <a href="https://wa.me/5567993328678" target="_blank"
                            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 transition">
                            💬 WhatsApp
                          </a>
                          <a href="tel:190"
                            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-red-600 hover:bg-red-700 transition">
                            🚨 Ligar para Polícia (190)
                          </a>
                          <a href="tel:193"
                            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600 transition">
                            🔥 Ligar para Bombeiros (193)
                          </a>
                          <a href="mailto:darlleybrito@gmail.com"
                            class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition">
                            ✉️ Enviar Email
                          </a>
                        </div>`
                      :
                      `<div class="flex flex-col gap-2">
                            <a href="https://wa.me/5567993328678" target="_blank"
                              class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 transition">
                              💬 WhatsApp
                            </a>
                            <a href="mailto:darlleybrito@gmail.com"
                              class="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition">
                              ✉️ Enviar Email
                            </a>
                      </div>`
                    }
                  </div>
                  
                  <!-- Footer holográfico -->
                  <div class="mt-4 rounded-3xl p-5 relative overflow-hidden" style="
                    background: linear-gradient(145deg, rgba(156,163,175,0.1) 0%, rgba(156,163,175,0.05) 100%);
                    border: 1px solid rgba(156,163,175,0.2);
                    backdrop-filter: blur(15px);
                  ">
                    <div class="absolute top-0 left-0 right-0 h-px shimmer-effect" style="
                      background: linear-gradient(90deg, transparent, rgba(156,163,175,0.5), transparent);
                    "></div>
                    
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                        <span class="text-white text-xs">📅</span>
                      </div>
                      <span class="text-sm font-semibold text-gray-600">Informações do sistema</span>
                    </div>
                    
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <div class="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                        <p class="text-sm font-bold text-gray-700">Cadastrado: ${formatDate(address.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              `);

              infoWindowRef.current.open(mapInstanceRef.current, marker);
            }
          });
          //marker.addListener('mouseout', () => {
          //  if (focusedAddressId !== address.id) {
          //    infoWindowRef.current.open(false)
          //  }
          //});
          markersRef.current.set(address.id, marker);
          bounds.extend(result[0].geometry.location);
        }
      } catch (error) {
        // ignora erros de geocodificação
      }
    }
    mapInstanceRef.current.fitBounds(bounds);
    const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
      if (mapInstanceRef.current.getZoom() > 17) mapInstanceRef.current.setZoom(17);
      window.google.maps.event.removeListener(listener);
    });
  };

  useEffect(() => {
    if (focusedAddressId && mapInstanceRef.current && hasValidApiKey) {
      const marker = markersRef.current.get(focusedAddressId);
      if (marker) {
        const position = marker.getPosition();
        if (position) {
          mapInstanceRef.current.setCenter(position);
          mapInstanceRef.current.setZoom(18);
          const addressIndex = addresses.findIndex(addr => addr.id === focusedAddressId);
          if (addressIndex !== -1) {
            marker.setIcon(createMarkerIcon(addresses[addressIndex], true, addressIndex));
            marker.setZIndex(2000);
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(() => {
              marker.setAnimation(null);
            }, 3000);
          }
        }
      }
    } else {
      addresses.forEach((address, index) => {
        const marker = markersRef.current.get(address.id);
        if (marker) {
          marker.setIcon(createMarkerIcon(address, false, index));
          marker.setZIndex(index === 0 ? 1500 : 1000 + index);
          marker.setAnimation(null);
        }
      });
    }
  }, [focusedAddressId, addresses, hasValidApiKey]);

  useEffect(() => {
    if (hasValidApiKey) {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        if (!document.querySelector('#google-maps-script')) {
          const script = document.createElement('script');
          script.id = 'google-maps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
          script.async = true;
          script.defer = true;
          script.onload = initializeMap;
          document.head.appendChild(script);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && hasValidApiKey) {
      updateMarkers();
    }
  }, [addresses]);

  // Mock visual para quando não há chave de API
  const MockMap = () => (
    <div className="w-full h-full bg-gradient-to-br from-green-50 via-blue-50 to-green-100 rounded-lg flex items-center justify-center">
      <div className="text-center p-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-12 h-12 text-purple-600" />
          <Home className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Sistema de Proteção - Tayamã Park</h3>
        <p className="text-sm text-green-600 font-medium mb-4">👮 Agente de Segurança + 🏠 Clientes Protegidos</p>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🛡️</span>
            </div>
            <span className="text-sm font-bold text-green-800">Área Protegida</span>
          </div>
          <div className="space-y-1 text-xs text-green-700">
            <p>👮 Agente de segurança ativo</p>
            <p>🏠 Residências monitoradas</p>
            <p>📞 Atendimento 24 horas</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          {addresses.length === 0
            ? '🏠 Cadastre o agente e clientes protegidos'
            : addresses.length === 1
              ? '👮 1 agente de segurança cadastrado'
              : `👮 1 agente + 🏠 ${addresses.length - 1} cliente${addresses.length - 1 > 1 ? 's' : ''} protegido${addresses.length - 1 > 1 ? 's' : ''}`}
        </p>
        {addresses.length > 0 && (
          <div className="bg-white rounded-lg p-4 text-left max-w-sm mx-auto shadow-lg border border-green-200">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Sistema de Proteção:
            </h4>
            <ul className="space-y-3 text-sm">
              {addresses.slice(0, 4).map((addr, index) => {
                const isAgent = addr.isAdminAddress;
                const icon = isAgent ? '👮' : '🏠';
                const role = isAgent ? 'Agente de Segurança' : `Cliente #${index + 1}`;
                const bgColor = isAgent ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200';
                const textColor = isAgent ? 'text-purple-700' : 'text-green-700';
                const badgeColor = isAgent ? 'bg-purple-500 border-purple-600' : 'bg-green-500 border-green-600';
                return (
                  <li key={addr.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${focusedAddressId === addr.id
                    ? 'bg-red-50 border-2 border-red-300 font-bold text-red-700 shadow-md'
                    : `${bgColor} ${textColor} hover:opacity-80 border`
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${focusedAddressId === addr.id
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : `${badgeColor} text-white`
                      }`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{role}</div>
                      <div className="text-xs opacity-90">{addr.street}, {addr.number}</div>
                      <div className="text-xs opacity-75">{addr.neighborhood}</div>
                    </div>
                    {focusedAddressId === addr.id && (
                      <div className="flex flex-col items-center">
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                          🎯 FOCO
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
              {addresses.length > 4 && (
                <li className="text-gray-500 italic text-center py-2 border-t border-gray-200">
                  ... e mais {addresses.length - 4} cliente{addresses.length - 4 > 1 ? 's' : ''} protegido{addresses.length - 4 > 1 ? 's' : ''}
                </li>
              )}
            </ul>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-3 border border-orange-200">
          <AlertCircle className="w-4 h-4" />
          <span>Configure a API do Google Maps para visualização completa do sistema</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white overflow-hidden h-full lg:border-l lg:border-green-300">
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 border-b border-green-300 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm font-bold text-green-800 flex items-center gap-2">
                🛡️ Proteção do Tayamã Park
              </span>
              <p className="text-xs text-green-600">👮+🏠 Endereços</p>
            </div>
          </div>
          {addresses.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-full px-3 py-1 border border-green-300">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>
      </div>
      <div className="h-96 lg:h-full">
        {hasValidApiKey ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          <MockMap />
        )}
      </div>
    </div>
  );
};