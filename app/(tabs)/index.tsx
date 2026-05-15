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
  TouchableOpacity,
} from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { usePlatos, useAgregarPlato, useEliminarPlato } from '@/src/hooks/usePlatos';
import { useAuth } from '../../src/providers/auth-provider';
import { MapSelector } from '@/src/components/MapSelector';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';



function PlatoListItem({ item, index, onPress, onDelete }: { item: any; index: number; onPress: () => void; onDelete: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 80).springify().dampingRatio(0.85)}
    >
      <Pressable onPress={onPress} style={styles.platoCard}>
        {item.photo_uri && (
          <Image source={{ uri: item.photo_uri }} style={styles.platoImage} />
        )}
        <View style={styles.platoContent}>
          <View style={styles.platoTitleRow}>
            <Text style={styles.platoTitle}>{item.name}</Text>
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteIconBtn}
            >
              <Entypo name="trash" size={24} color="purple" />
            </TouchableOpacity>
          </View>
          {(item.city || item.country) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color="#22eee0" />
              <Text style={styles.locationText}>
                {[item.city, item.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          {item.latitude && item.longitude && (
            <Text style={styles.coords}>
              {item.latitude.toFixed(4)},{' '}
              {item.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

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

  const eliminarMutation = useEliminarPlato();  

  
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

  const handleEliminar = (id: string) => {
    const platoName = platos.find((p) => p.id === id)?.name ?? 'este plato';
    Alert.alert(
      'Eliminar plato',
      `¿Seguro que deseas eliminar "${platoName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarMutation.mutate(id);
          },
        },
      ]
    );
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
    <View
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
            <View
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="white"
              />
            </View>
          </Pressable>
        </View>

        {/* CARD */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="restaurant-menu" size={24} color="purple" />
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
                <Entypo name="camera" size={24} color="skyblue" />
                <Text style={styles.imageText}>
                  Seleccionar foto
                </Text>
              </View>
            )}
          </Pressable>

          {/* INPUTS */}
          <View style={styles.inputsContainer}>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="fastfood" size={24} color="skyblue" />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del plato"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome5 name="city" size={24} color="skyblue" />
              <TextInput
                value={ciudad}
                onChangeText={setCiudad}
                placeholder="Ciudad"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Fontisto name="world" size={20} color="skyblue" />
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
            <View
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
            </View>
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
            <View
              style={styles.button}
            >
              {agregarMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="skyblue" />

                  <Text style={styles.buttonText}>
                    Registrar plato
                  </Text>
                </>
              )}
            </View>
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
                name="restaurant"
                size={42}
                color="#94a3b8"
              />
              
              <Text style={styles.emptyText}>
                Todavía no hay platos registrados
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <PlatoListItem
              item={item}
              index={index}
              onPress={() => router.push(`/Plato/${item.id}` as any)}
               onDelete={() => handleEliminar(item.id)}
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#340156bb',
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
    color: '#e3ecf8',
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#7668AF',
    borderWidth: 1,
    borderColor: '#cd71f86d',
  },

  card: {
    backgroundColor: '#7668AF',
    borderWidth: 1,
    borderColor: '#612278',
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
    backgroundColor: '#fc79ed9c',
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
    color: 'rgb(212, 217, 223)',
    marginTop: 4,
  },

  imagePicker: {
    height: 190,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#475569',
    overflow: 'hidden',
    backgroundColor: '#2f174683',
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
    backgroundColor: '#2f174683',
    borderWidth: 1,
    borderColor: 'white',
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
    backgroundColor: '#c966ff9d',
  },

  button: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#c966ff9d',
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
    color: '#0e1012',
    marginTop: 14,
    textAlign: 'center',
  },

  platoCard: {
    backgroundColor: '#7668AF',
    borderWidth: 1,
    borderColor: '#612278',
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

  platoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platoTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    color: '#0b0d0f',
    fontSize: 12,
    marginTop: 12,
  },

  locationBtn: {
    marginTop: 18,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: "#c966ff9d",
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
    color: '#eef1f6',
    fontWeight: '600',
    fontSize: 14,
  },
});