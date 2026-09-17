import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Field } from '../components';
import { styles as s } from '../styles';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function login() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError('E-mail ou senha incorretos.');
      return;
    }

    setError('');
    onLogin();
  }

  return <KeyboardAvoidingView style={s.loginPage} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={s.loginContent} keyboardShouldPersistTaps="handled">
      <View style={s.loginBrand}>
        <Image source={require('../../assets/images/logo.png')} style={s.loginLogo} resizeMode="contain" accessibilityLabel="TruckFlow" />
        <Text style={s.loginTitle}>Bem-vindo</Text>
        <Text style={s.loginSubtitle}>Entre para gerenciar{`\n`}sua oficina.</Text>
      </View>

      <View style={s.loginCard}>
        <Field label="E-mail" value={email} onChangeText={value => { setEmail(value); setError(''); }} keyboardType="email-address" placeholder="seu@email.com" />
        <Field label="Senha" value={password} onChangeText={value => { setPassword(value); setError(''); }} secureTextEntry placeholder="Digite sua senha" />
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <Button title="Entrar" onPress={login} />
      </View>

      <Text style={s.loginFooter}>Acesso administrativo · TruckFlow</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
