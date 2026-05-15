import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../src/providers/auth-provider'

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setMessage(null);
    setIsSubmitting(true);

    //confirmar que las contraseñas coinciden y redirigir a login si el registro es exitoso y no requiere confirmación por correo
    if (password !== password) {
      setIsSubmitting(false);
      setMessage('Las contraseñas no coinciden');
      return;
    }
    
    const errorMessage = await signUp(email.trim(), password);
    setIsSubmitting(false);

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    setMessage('Cuenta creada. Si tu proyecto requiere confirmación por correo, revisa tu bandeja de entrada.');
  
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear usuario</Text>
        <Text style={styles.subtitle}>Registra tu correo para empezar a usar la aplicación.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Correo electrónico"
          placeholderTextColor="#94a3b8"
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
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          placeholder="Confirmar contraseña"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={styles.button} onPress={handleSignUp} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
        </Pressable>

        <Link href="/login" style={styles.link}>
          Ya tengo una cuenta
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#340156bb',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#7668AF',
    borderRadius: 50,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e5e7ee',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc4ce',
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
    backgroundColor: '#c966ff9d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  message: {
    color: '#0f172a',
    fontSize: 14,
  },
  link: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});