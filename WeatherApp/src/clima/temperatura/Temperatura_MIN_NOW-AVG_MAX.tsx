import { View, Text } from "react-native";
import { styles } from "../estilos/estilosDeLaApp";

type Props ={
    Temperatura_MIN: { tempMin: number },
    Temperatura_Actual: { tempActual: number },
    Temperatura_MAX: { tempMax: number },
    Datos: { VerificacionDeQueEsHoy: any }
}
const Temperatura_MIN_NOWAVG_MAX = ({ Temperatura_MIN, Temperatura_Actual, Temperatura_MAX, Datos}: Props ) =>{
    return(
            <View style={styles.ContenedorPrincipalDelPronostico}>
                <View style={styles.ContenedorPronostico}>
                    <View style={styles.ContenedorDeTempLateral}>
                        <Text testID="temp-min" style={styles.TextoTempSecundaria}> {Temperatura_MIN.tempMin}°</Text>
                    </View>
                    <View style={styles.ContenedorDeTempCentral}>
                        <Text testID="temp-current" style={styles.TextoTempPrincipal}> {Temperatura_Actual.tempActual}°</Text>
                    </View>
                    <View style={styles.ContenedorDeTempLateral}>
                        <Text testID="temp-max" style={[styles.TextoTempSecundaria, { textAlign: 'right' }]}> {Temperatura_MAX.tempMax}°</Text>
                    </View>
                </View>
                <View style={styles.ContenedorDeTextoPronostico}>
                    <View style={styles.ContenedorDeTextoLateral}>
                        <Text style={styles.TextoLateralDeLaTemp}>MIN</Text>
                    </View>
                    <View style={styles.ContenedorDeTextoCentral}>
                        <Text testID="navigation-current-day" style={styles.TextoCentralDeLaTemp}>{Datos.VerificacionDeQueEsHoy ? "NOW" : "AVG"}</Text>
                    </View>
                    <View style={styles.ContenedorDeTextoLateral}>
                        <Text style={styles.TextoLateralDeLaTemp}>MAX</Text>
                    </View>
                </View>
            </View>
    );
};

export default Temperatura_MIN_NOWAVG_MAX;