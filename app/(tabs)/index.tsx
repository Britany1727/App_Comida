import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  Animated,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { usePlatos, useAgregarPlato } from '@/src/hooks/usePlatos';
import { useAuth } from '../../src/providers/auth-provider';
import { MapSelector } from '@/src/components/MapSelector';


export default function App() {
  const router = useRouter();

  const { session, signOut } = useAuth();

  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showMapSelector, setShowMapSelector] = useState(false);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);

  const { data: platos = [] } = usePlatos();

  const agregarMutation = useAgregarPlato();

  const pickImage = (useCamera: boolean) => async () => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso para usar imágenes.'
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
        });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Foto del plato', 'Selecciona una opción', [
      {
        text: '📷 Cámara',
        onPress: pickImage(true),
      },
      {
        text: '🖼 Galería',
        onPress: pickImage(false),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  const agregar = async () => {
    setError(null);

    if (!session?.user?.id) return;

    if (!nombre.trim() || !ciudad.trim() || !pais.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const locationPermission =
      await Location.requestForegroundPermissionsAsync();

    let latitude: number | null = manualLat;
    let longitude: number | null = manualLng;

    if (latitude === null || longitude === null) {
      if (locationPermission.granted) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    }

    agregarMutation.mutate(
      {
        user_id: session.user.id,
        name: nombre.trim(),
        photo_uri: photoUri,
        city: ciudad.trim(),
        country: pais.trim(),
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          setNombre('');
          setCiudad('');
          setPais('');
          setPhotoUri(null);
          setManualLat(null);
          setManualLng(null);
          setError(null);
        },
      }
    );
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <LinearGradient
      colors={['#006391', '#E21837', '#1e293b']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sessionText}>
              Sesión activa
            </Text>

            <Text style={styles.title}>
              Gestión de Platos
            </Text>
          </View>

          <Pressable onPress={handleLogout}>
            <LinearGradient
              colors={['#F5F5F5', '#dc2626']}
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="white"
              />

              <Text style={styles.logoutText}>
                Salir
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* CARD */}
        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="restaurant"
                size={26}
                color="white"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Nuevo Plato
              </Text>

              <Text style={styles.cardSubtitle}>
                Completa la información
              </Text>
            </View>
          </View>

          {/* FOTO */}
          <Pressable
            onPress={showPhotoOptions}
            style={styles.imagePicker}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.image}
              />
            ) : (
              <View style={styles.imagePlaceholder}>

                <Ionicons
                  name="camera-outline"
                  size={42}
                  color="#94a3b8"
                />

                <Text style={styles.imageText}>
                  Seleccionar foto
                </Text>
              </View>
            )}
          </Pressable>

          {/* INPUTS */}
          <View style={styles.inputsContainer}>

            <View style={styles.inputWrapper}>

              <Ionicons
                name="fast-food-outline"
                size={20}
                color="#38bdf8"
              />

              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del plato"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>

              <Ionicons
                name="business-outline"
                size={20}
                color="#38bdf8"
              />

              <TextInput
                value={ciudad}
                onChangeText={setCiudad}
                placeholder="Ciudad"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>

              <Ionicons
                name="earth-outline"
                size={20}
                color="#38bdf8"
              />

              <TextInput
                value={pais}
                onChangeText={setPais}
                placeholder="País"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>
          </View>

          {/* UBICACIÓN MANUAL */}
          <Pressable
            onPress={() => setShowMapSelector(true)}
            style={styles.locationBtn}
          >
            <LinearGradient
              colors={manualLat ? ['#059669', '#10b981'] : ['#1e293b', '#334155']}
              style={styles.locationBtnInner}
            >
              <Ionicons
                name={manualLat ? 'location' : 'map-outline'}
                size={20}
                color={manualLat ? 'white' : '#94a3b8'}
              />
              <Text style={[styles.locationBtnText, manualLat ? { color: 'white' } : undefined]}>
                {manualLat
                  ? `Ubicación: ${manualLat.toFixed(4)}, ${manualLng!.toFixed(4)}`
                  : 'Seleccionar ubicación en mapa'}
              </Text>
              {manualLat && (
                <Pressable
                  onPress={() => { setManualLat(null); setManualLng(null); }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color="#f87171" />
                </Pressable>
              )}
            </LinearGradient>
          </Pressable>

          {/* ERROR */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* BUTTON */}
          <Pressable
            onPress={agregar}
            disabled={agregarMutation.isPending}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={['#006391', '#0891b2']}
              style={styles.button}
            >
              {agregarMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="white"
                  />

                  <Text style={styles.buttonText}>
                    Registrar plato
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* TITULO */}
        <Text style={styles.listTitle}>
          Platos registrados
        </Text>

        {/* LISTA */}
         
              
        <FlatList
          scrollEnabled={false}
          data={platos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: 16,
          }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>

              <Ionicons
                name="restaurant-outline"
                size={42}
                color="#94a3b8"
              />

              <Text style={styles.emptyText}>
                Todavía no hay platos registrados
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/Plato/${item.id}` as any)}
              style={styles.platoCard}
            >

              {item.photo_uri && (
                <Image
                  source={{ uri: item.photo_uri }}
                  style={styles.platoImage}
                />
              )}

              <View style={styles.platoContent}>

                <Text style={styles.platoTitle}>
                  {item.name}
                </Text>

                {(item.city || item.country) && (
                  <View style={styles.locationRow}>

                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#22d3ee"
                    />

                    <Text style={styles.locationText}>
                      {[item.city, item.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                )}

                {item.latitude && item.longitude && (
                  <Text style={styles.coords}>
                    {item.latitude.toFixed(4)},
                    {' '}
                    {item.longitude.toFixed(4)}
                  </Text>
                  
                )}
              </View>
            </Pressable>
          )}
        />
      </ScrollView>
      {/* MAP SELECTOR MODAL */}
      <Modal visible={showMapSelector} animationType="slide" presentationStyle="fullScreen">
        <MapSelector
          onLocationSelected={(lat, lng) => {
            setManualLat(lat);
            setManualLng(lng);
            setShowMapSelector(false);
          }}
          onClose={() => setShowMapSelector(false)}
        />
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  sessionText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },

  logoutText: {
    color: 'white',
    fontWeight: '700',
  },

  card: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 28,
    padding: 20,
    marginBottom: 28,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },

  cardSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },

  imagePicker: {
    height: 190,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#475569',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    marginBottom: 22,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageText: {
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '600',
  },

  inputsContainer: {
    gap: 16,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
  },

  errorText: {
    color: '#fecaca',
    textAlign: 'center',
  },

  buttonWrapper: {
    marginTop: 22,
    overflow: 'hidden',
    borderRadius: 22,
  },

  button: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },

  listTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#94a3b8',
    marginTop: 14,
    textAlign: 'center',
  },

  platoCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 28,
    overflow: 'hidden',
  },

  platoImage: {
    width: '100%',
    height: 190,
  },

  platoContent: {
    padding: 20,
  },

  platoTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  locationText: {
    color: '#cbd5e1',
    marginLeft: 8,
  },

  coords: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 12,
  },

  locationBtn: {
    marginTop: 18,
    borderRadius: 18,
    overflow: 'hidden',
  },
  locationBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  locationBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
});