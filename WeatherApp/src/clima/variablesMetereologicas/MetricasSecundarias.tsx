import React from 'react';
import { View, Text } from "react-native";
import { Droplet, Gauge, Wind } from 'lucide-react-native';
import { styles } from "@/src/clima/estilos/estilosDeLaApp";

type Props = {
        Humedad: { humedad :number};
        PresionAtmosferica: { presion :number};
        VelocidadDelViento: { viento :number};
}

const MetricasSecundarias = ({  Humedad, PresionAtmosferica, VelocidadDelViento }: Props) => {
    return (
        <View style={styles.ContenedorDatosAdicionales}>

            <View testID="metric-item" style={styles.containerDeDatosMeteorologicos}>
                <Droplet testID="metric-icon" size={30} color="black" />
                <View style={styles.contenedorDeValoresMetereologicos}>
                    <Text testID="metric-value" style={styles.ValorMetereologico}>
                        {Humedad.humedad}
                    </Text>
                    <Text style={styles.MedidaDeValorMetereologico}> %</Text>
                </View>    
            </View>

            <View testID="metric-item" style={styles.containerDeDatosMeteorologicos}>
                <Gauge testID="metric-icon" size={30} color="black" />
                <View style={styles.contenedorDeValoresMetereologicos}>
                    <Text testID="metric-value" style={styles.ValorMetereologico}>
                    {PresionAtmosferica.presion}
                    </Text>
                    <Text style={styles.MedidaDeValorMetereologico}> hPa</Text>
                </View>
            </View>

            <View testID="metric-item" style={styles.containerDeDatosMeteorologicos}>
                <Wind testID="metric-icon" size={30} color="black" />
                <View style={styles.contenedorDeValoresMetereologicos}>
                    <Text testID="metric-value" style={styles.ValorMetereologico}>
                        {VelocidadDelViento.viento}
                    </Text>
                    <Text style={styles.MedidaDeValorMetereologico}> m/s</Text>
                </View>
            </View>

        </View>
    );
};

export default MetricasSecundarias;