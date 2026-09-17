import { ReactNode } from 'react';
import { KeyboardAvoidingView, KeyboardTypeOptions, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Status } from './data';
import { styles as s } from './styles';

export function Button({ title, onPress, secondary = false, danger = false }: { title: string; onPress: () => void; secondary?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, danger && s.danger, pressed && { opacity: 0.7 }]}>
    <Text style={[s.buttonText, secondary && s.secondaryText, danger && s.dangerText]}>{title}</Text>
  </Pressable>;
}

export function IconButton({ onPress, accessibilityLabel }: { onPress: () => void; accessibilityLabel: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={8} onPress={onPress} style={({ pressed }) => [s.iconButton, pressed && { opacity: 0.6 }]}>
    <Ionicons name="trash-outline" size={16} color="#DC2626" />
  </Pressable>;
}

export function Field({ label, value, onChangeText, uppercase = false, keyboardType = 'default', placeholder, secureTextEntry = false }: { label: string; value: string; onChangeText: (value: string) => void; uppercase?: boolean; keyboardType?: KeyboardTypeOptions; placeholder?: string; secureTextEntry?: boolean }) {
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      style={s.input}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={uppercase ? 'characters' : keyboardType === 'email-address' || secureTextEntry ? 'none' : 'sentences'}
      autoCorrect={!secureTextEntry && keyboardType !== 'email-address'}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      secureTextEntry={secureTextEntry}
      maxLength={uppercase ? 8 : 100}
    />
  </View>;
}

export function Badge({ status }: { status: Status }) {
  const backgroundColor = status === 'Concluída' ? '#E8F7EE' : status === 'Aberta' ? '#FFF4DF' : '#EAF2FF';
  const color = status === 'Concluída' ? '#18723C' : status === 'Aberta' ? '#895700' : '#0056B3';
  return <View style={[s.badge, { backgroundColor }]}><Text style={[s.badgeText, { color }]}>{status}</Text></View>;
}

export function FormModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Button title="Cancelar" onPress={onClose} secondary />
          <Text style={s.title}>{title}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
