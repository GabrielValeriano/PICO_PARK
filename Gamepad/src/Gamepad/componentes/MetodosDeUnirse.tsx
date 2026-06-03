import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

type Props = {
  EscaneoDeQR: () => void;
  DireccionIP: (ip: string) => void;
}

export function MetodosDeConexion({ EscaneoDeQR, DireccionIP }: Props) {
  const [ipInput, setIpInput] = useState('');

  return (
    <View style={styles.pantallaInicial}>
      <Text style={styles.tituloDelJuego}>PICO PARK</Text>
      <TouchableOpacity style={styles.ContenedorDeBotonDeEscaner} onPress={EscaneoDeQR}>
        <Text style={styles.TextoDelBotonDeEscaner}>ESCANEAR QR</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>O INGRESA LA IP MANUALMENTE:</Text>
      <View style={styles.ContenedorDeConexionIP}>
        <TextInput
          style={styles.ContenedorDeInputParaIngresarLaIP}
          placeholder="Ej: 192.168.0.10"
          placeholderTextColor="#94a3b8"
          value={ipInput}
          onChangeText={(text) => setIpInput(text.replace(/[^a-zA-Z0-9.]/g, ''))}
          keyboardType="default"
        />
        <TouchableOpacity 
          style={styles.BotonParaIngresarLaIP} 
          onPress={() => {
            if (ipInput.trim() !== '') DireccionIP(`ws://${ipInput.trim()}:3000`);
          }}
        >
          <Text style={styles.TextoDelBotonDeEscaner}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantallaInicial: { flex: 1, backgroundColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  tituloDelJuego: { color: 'white', fontSize: 60, fontWeight: 'bold', marginBottom: 20 },
  ContenedorDeBotonDeEscaner: { backgroundColor: '#ef4444', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
  TextoDelBotonDeEscaner: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  orText: { color: 'white', marginTop: 30, marginBottom: 10, fontSize: 14, fontWeight: 'bold', opacity: 0.8 },
  ContenedorDeConexionIP: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ContenedorDeInputParaIngresarLaIP: { backgroundColor: '#1e293b', color: 'white', padding: 15, borderRadius: 10, width: 200, textAlign: 'center' },
  BotonParaIngresarLaIP: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10 }
});