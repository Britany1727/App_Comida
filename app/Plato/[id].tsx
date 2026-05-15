import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { getDistance } from 'geolib';
import { usePlatos } from '@/src/hooks/usePlatos';
import { useLocation } from '@/src/hooks/useLocation';
import { Plato } from '@/src/types/plato';

function formatDistance(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return { value: meters.toString(), unit: 'm' };
  }
  const km = meters / 1000;
  return { value: km.toFixed(1), unit: 'km' };
}

export default function PlatoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: platos = [], isLoading } = usePlatos();
  const { location, startWatching } = useLocation();

  useEffect(() => {
    startWatching();
  }, []);

  const plato: Plato | undefined = platos.find((p) => p.id === id);

  const distance = useMemo(() => {
    if (!location || !plato?.latitude || !plato?.longitude) return null;
    return getDistance(location, {
      latitude: plato.latitude,
      longitude: plato.longitude,
    });
  }, [location, plato?.latitude, plato?.longitude]);

  if (isLoading) {
    return (
      <LinearGradient colors={['#006391', '#E21837', '#1e293b']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </LinearGradient>
    );
  }

  if (!plato) {
    return (
      <LinearGradient colors={['#006391', '#E21837', '#1e293b']} style={styles.loadingContainer}>
        <Ionicons name="sad-outline" size={64} color="#94a3b8" />
        <Text style={styles.notFoundText}>Plato no encontrado</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const hasCoords = !!(plato.latitude && plato.longitude);

  return (
    <LinearGradient colors={['#006391', '#E21837', '#1e293b']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <View style={styles.card}>
          {plato.photo_uri && (
            <Image source={{ uri: plato.photo_uri }} style={styles.image} />
          )}

          <View style={styles.content}>
            <Text style={styles.name}>{plato.name}</Text>

            {(plato.city || plato.country) && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={18} color="#22d3ee" />
                <Text style={styles.locationText}>
                  {[plato.city, plato.country].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}

            {plato.created_at && (
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
                <Text style={styles.metaText}>
                  {new Date(plato.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {hasCoords ? (
              <View style={styles.coordsBox}>
                <Ionicons name="earth" size={16} color="#38bdf8" />
                <Text style={styles.coordsText}>
                  {plato.latitude!.toFixed(6)}, {plato.longitude!.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View style={styles.coordsBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#fbbf24" />
                <Text style={styles.noCoordsText}>Sin ubicación registrada</Text>
              </View>
            )}
          </View>
        </View>

        {hasCoords && (
          <View style={styles.distanceCard}>
            <View style={styles.distanceHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.distanceTitle}>Distancia desde tu ubicación</Text>
            </View>

            {distance !== null ? (
              <View style={styles.distanceValueRow}>
                <Ionicons name="resize" size={28} color="#22d3ee" />
                <Text style={styles.distanceValue}>
                  {formatDistance(distance).value}
                </Text>
                <Text style={styles.distanceUnit}>
                  {formatDistance(distance).unit}
                </Text>
              </View>
            ) : (
              <View style={styles.distanceLoadingRow}>
                <ActivityIndicator size="small" color="#38bdf8" />
                <Text style={styles.distanceLoadingText}>
                  Obteniendo ubicación...
                </Text>
              </View>
            )}

            <View style={styles.distanceMetaRow}>
              <Ionicons name="navigate" size={14} color="#64748b" />
              <Text style={styles.distanceMetaText}>
                {location
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : '---'}
              </Text>
            </View>
          </View>
        )}

        {hasCoords && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/Mapa/view' as any,
                params: { lat: plato.latitude, lng: plato.longitude, name: plato.name },
              } as any)
            }
            style={styles.mapBtnWrapper}
          >
            <LinearGradient colors={['#059669', '#10b981']} style={styles.mapBtn}>
              <Ionicons name="map-outline" size={22} color="white" />
              <Text style={styles.mapBtnText}>Ver ubicación</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 12,
  },
  backLinkText: {
    color: '#38bdf8',
    fontSize: 16,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 28,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 260,
  },
  content: {
    padding: 24,
    gap: 14,
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  coordsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  coordsText: {
    color: '#38bdf8',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  noCoordsText: {
    color: '#fbbf24',
    fontSize: 13,
  },
  distanceCard: {
    marginTop: 20,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 28,
    padding: 24,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22d3ee',
  },
  distanceTitle: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  distanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  distanceValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: '800',
  },
  distanceUnit: {
    color: '#22d3ee',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 4,
  },
  distanceLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  distanceLoadingText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  distanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  distanceMetaText: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  mapBtnWrapper: {
    marginTop: 16,
    borderRadius: 22,
    overflow: 'hidden',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 22,
  },
  mapBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});
