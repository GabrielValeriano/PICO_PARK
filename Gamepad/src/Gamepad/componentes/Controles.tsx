import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  textoEstado: string;
  ColorDelJugador: string;
  AlTocarUnBoton: (comando: string) => void;
}

export function ControlesGamepad({ textoEstado, ColorDelJugador, AlTocarUnBoton }: Props) {
  return (
    <SafeAreaView style={styles.contenedorGamepad}>

      <View style={styles.contenedorDpad}>
        <View style={styles.contenedorGrilla}>
          
          <View style={styles.filaGrilla}>
            <View style={styles.celdaVacia} />
            <TouchableOpacity onPress={() => AlTocarUnBoton('UP')} style={styles.botonDpad}>
              <Text style={styles.textoFlecha}>▲</Text>
            </TouchableOpacity>
            <View style={styles.celdaVacia} />
          </View>
          
          <View style={styles.filaGrilla}>
            <TouchableOpacity 
              onPressIn={() => AlTocarUnBoton('LEFT_START')} 
              onPressOut={() => AlTocarUnBoton('LEFT_STOP')} 
              style={styles.botonDpad}
            >
              <Text style={styles.textoFlecha}>◀</Text>
            </TouchableOpacity>
            <View style={styles.celdaVacia} /> 
            <TouchableOpacity 
              onPressIn={() => AlTocarUnBoton('RIGHT_START')} 
              onPressOut={() => AlTocarUnBoton('RIGHT_STOP')} 
              style={styles.botonDpad}
            >
              <Text style={styles.textoFlecha}>▶</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filaGrilla}>
            <View style={styles.celdaVacia} />
            <TouchableOpacity onPress={() => AlTocarUnBoton('DOWN')} style={styles.botonDpad}>
              <Text style={styles.textoFlecha}>▼</Text>
            </TouchableOpacity>
            <View style={styles.celdaVacia} />
          </View>
        </View>
      </View>

      <View style={styles.contenedorCentral}>
        <Text style={[styles.textoDelEstadoDelJugador, { color: ColorDelJugador }]}>{textoEstado}</Text>
        <TouchableOpacity onPress={() => AlTocarUnBoton('START_PAUSE')} style={styles.botonStartPausa}>
          <Text style={styles.textoStartPausa}>START / PAUSA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ContenedorDeBotonA}>
        <TouchableOpacity onPressIn={() => AlTocarUnBoton('JUMP')} style={styles.botonA}>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorGamepad: {
    flex: 1,
    backgroundColor: '#0f172a', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  contenedorDpad: { 
    flex: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  contenedorGrilla: { 
    width: 300, 
    height: 300, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filaGrilla: { 
    flexDirection: 'row' 
  },
  botonDpad: { 
    width: 100, 
    height: 80, 
    backgroundColor: '#334155', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: 5, 
    borderWidth: 3, 
    borderColor: '#475569' 
  },
  celdaVacia: { 
    width: 25, 
    height: 95 
  },
  textoFlecha: { 
    color: 'white', 
    fontSize: 36, 
    fontWeight: 'bold' 
  },
  contenedorCentral: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  textoDelEstadoDelJugador: { 
    fontWeight: 'bold', 
    fontSize: 24, 
    marginBottom: 40, 
    textTransform: 'uppercase' 
  },
  botonStartPausa: { 
    backgroundColor: '#22c55e', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 30 
  },
  textoStartPausa: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  ContenedorDeBotonA: { 
    flex: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  botonA: { 
    width: 140, 
    height: 140, 
    backgroundColor: '#ef4444', 
    borderRadius: 70, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 5, 
    borderColor: '#b91c1c' 
  }
});