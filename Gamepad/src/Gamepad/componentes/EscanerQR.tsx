import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

type Props = {
  AlCerrar: () => void;
  AlEscanear: (datosContenido: string) => void;
}

export function EscanerQR({ AlCerrar, AlEscanear }: Props) {
  return (
    <View style={styles.contenedorPrincipal}>
      {/* Vista nativa de la cámara de Expo */}
      <CameraView 
        style={StyleSheet.absoluteFill} 
        onBarcodeScanned={({ data }) => AlEscanear(data)} 
      />
      
      {/* Botón flotante para retroceder */}
      <TouchableOpacity style={styles.botonVolver} onPress={AlCerrar}>
        <Text style={styles.textoVolver}>← VOLVER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { 
    flex: 1 
  },
  botonVolver: { 
    position: 'absolute', 
    top: 40, 
    left: 20, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    padding: 15, 
    borderRadius: 10 
  },
  textoVolver: { 
    color: 'white', 
    fontWeight: 'bold' 
  }
});