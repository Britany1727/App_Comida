import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../src/providers/auth-provider';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    const message = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>
        

        <Text style={styles.subtitle}>Usa tu correo y contraseña para entrar a la app.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Correo electrónico"
          placeholderTextColor="#838b96"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>

        <Link href="/signup" style={styles.link}>
          Crear una cuenta nueva
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '  #0f172a',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#006391',
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
  },
  link: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});