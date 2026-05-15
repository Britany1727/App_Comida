import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeafletMap } from './LeafletMap';
import { useLocation } from '../hooks/useLocation';
import { useEffect } from 'react';

interface MapViewProps {
  platoLat: number;
  platoLng: number;
  platoName?: string;
  onClose?: () => void;
}

export function MapView({ platoLat, platoLng, platoName, onClose }: MapViewProps) {
  const { location, getPosition, loading } = useLocation();

  useEffect(() => {
    getPosition();
  }, []);

  return (
    <View style={styles.container}>
      {onClose && (
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Ubicación del plato</Text>
            {platoName && (
              <Text style={styles.headerSubtitle}>{platoName}</Text>
            )}
          </View>
        </View>
      )}

      <LeafletMap
        centerLat={platoLat}
        centerLng={platoLng}
        markerLat={platoLat}
        markerLng={platoLng}
        userLat={location?.latitude}
        userLng={location?.longitude}
        zoom={15}
      />

      {location && (
        <View style={styles.infoBox}>
          <Ionicons name="location" size={16} color="#38bdf8" />
          <Text style={styles.infoText}>
            {platoLat.toFixed(6)}, {platoLng.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#1e293b',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  infoBox: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
