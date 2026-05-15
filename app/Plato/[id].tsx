import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { getDistance } from 'geolib';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePlatos, useEliminarPlato } from '@/src/hooks/usePlatos';
import { useLocation } from '@/src/hooks/useLocation';
import { Plato } from '@/src/types/plato';

function formatDistance(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return { value: meters.toString(), unit: 'm' };
  }
  const km = meters / 1000;
  return { value: km.toFixed(1), unit: 'km' };
}

function LiveDot() {
  const style = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(0.8, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return <Animated.View style={[styles.liveDot, style]} />;
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

  const eliminarMutation = useEliminarPlato();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar plato',
      `¿Estás seguro de eliminar "${plato?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarMutation.mutate(id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!plato) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="sad-outline" size={64} color="#94a3b8" />
        <Text style={styles.notFoundText}>Plato no encontrado</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const hasCoords = !!(plato.latitude && plato.longitude);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Animated.View
          entering={FadeInDown.duration(500).springify().dampingRatio(0.8)}
          style={styles.card}
        >
          {plato.photo_uri && (
            <Image source={{ uri: plato.photo_uri }} style={styles.image} />
          )}

          <Animated.View style={styles.content}>
            <Text style={styles.name}>{plato.name}</Text>

            {(plato.city || plato.country) && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(150).springify()}
                style={styles.row}
              >
                <Ionicons name="location-outline" size={18} color="#22d3ee" />
                <Text style={styles.locationText}>
                  {[plato.city, plato.country].filter(Boolean).join(', ')}
                </Text>
              </Animated.View>
            )}

            {plato.created_at && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(250).springify()}
                style={styles.row}
              >
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
                <Text style={styles.metaText}>
                  {new Date(plato.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Animated.View>
            )}

            {hasCoords ? (
              <Animated.View
                entering={FadeInDown.duration(400).delay(350).springify()}
                style={styles.coordsBox}
              >
                <Ionicons name="earth" size={16} color="#38bdf8" />
                <Text style={styles.coordsText}>
                  {plato.latitude!.toFixed(6)}, {plato.longitude!.toFixed(6)}
                </Text>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeInDown.duration(400).delay(350).springify()}
                style={styles.coordsBox}
              >
                <Ionicons name="alert-circle-outline" size={16} color="#fbbf24" />
                <Text style={styles.noCoordsText}>Sin ubicación registrada</Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>

        {hasCoords && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(250).springify().dampingRatio(0.8)}
            style={styles.distanceCard}
          >
            <View style={styles.distanceHeader}>
              <LiveDot />
              <Text style={styles.distanceTitle}>Distancia desde tu ubicación</Text>
            </View>

            {distance !== null ? (
              <Animated.View
                entering={FadeInDown.duration(400).delay(400).springify()}
                style={styles.distanceValueRow}
              >
                <Ionicons name="resize" size={28} color="#22d3ee" />
                <Text style={styles.distanceValue}>
                  {formatDistance(distance).value}
                </Text>
                <Text style={styles.distanceUnit}>
                  {formatDistance(distance).unit}
                </Text>
              </Animated.View>
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
          </Animated.View>
        )}

        {hasCoords && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(450).springify().dampingRatio(0.8)}
            style={styles.mapBtnWrapper}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/Mapa/view' as any,
                  params: { lat: plato.latitude, lng: plato.longitude, name: plato.name },
                } as any)
              }
            >
              <View style={styles.mapBtn}>
                <Ionicons name="map-outline" size={22} color="white" />
                <Text style={styles.mapBtnText}>Ver ubicación</Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.duration(500).delay(550).springify().dampingRatio(0.8)}
          style={styles.deleteBtnWrapper}
        >
          <Pressable
            onPress={handleDelete}
            disabled={eliminarMutation.isPending}
          >
            <View style={styles.deleteBtn}>
              <Ionicons
                name={eliminarMutation.isPending ? 'hourglass-outline' : 'trash-outline'}
                size={20}
                color="white"
              />
              <Text style={styles.deleteBtnText}>
                {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar plato'}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#340156bb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    color: '#1b4b8e',
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
    backgroundColor: "#7668AF",
    borderWidth: 1,
    borderColor: '#612278',
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
    backgroundColor: '#7309b08d',
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
    backgroundColor: '#7668AF',
    borderWidth: 1,
    borderColor: '#612278',
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
    color: '#100114',
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
    color: '#3c1970',
    fontSize: 15,
  },
  distanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  distanceMetaText: {
    color: '#1d2127',
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
    backgroundColor: '#c966ff9d',
  },
  mapBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  deleteBtnWrapper: {
    marginTop: 24,
    borderRadius: 22,
    overflow: 'hidden',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: '#c7558a',
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
