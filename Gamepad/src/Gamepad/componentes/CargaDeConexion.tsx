import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export function PantallaDeCarga() {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.texto}>Conectando al Juego...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  texto: { color: 'white', marginTop: 10 }
});