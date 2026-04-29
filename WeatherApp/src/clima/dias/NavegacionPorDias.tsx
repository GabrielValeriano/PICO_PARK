import { View, Text, TouchableOpacity } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { styles } from "@/src/clima/estilos/estilosDeLaApp"

type Props ={
    FechaActual: { fecha : any };
    FechaDeAyer: { DiaAnterior : any };
    FechaDeMañana: { DiaSiguiente : any};
    AlPresionarElDiaSiguiente: {irAlDíaSiguiente: () => void}
    AlPresionarElDiaAnterior: {irAlDíaAnterior: () => void}
}

export const NavegacionPorDias = ({ FechaActual, FechaDeAyer, FechaDeMañana, AlPresionarElDiaSiguiente, AlPresionarElDiaAnterior }: Props) => {
    return (
        <View style={styles.ContenedorNavegacion}>
            
            {/* COLUMNA IZQUIERDA: Alineada al inicio */}
            <View style={styles.columnaIzquierda}>
                {FechaDeAyer.DiaAnterior ? (
                    <TouchableOpacity 
                        testID="button-prev-day" 
                        onPress={AlPresionarElDiaAnterior.irAlDíaAnterior} 
                        style={styles.Navegacion}
                    >
                        <ChevronLeft color="black" size={20} />
                        <Text style={styles.textoNavChico}>{FechaDeAyer.DiaAnterior}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* COLUMNA CENTRAL: Siempre en el medio */}
            <View style={styles.columnaCentral}>
                <Text style={styles.textoFechaPrincipal}>{FechaActual.fecha}</Text>
            </View>

            {/* COLUMNA DERECHA: Alineada al final */}
            <View style={styles.columnaDerecha}>
                {FechaDeMañana.DiaSiguiente ? (
                    <TouchableOpacity 
                        testID="button-next-day"
                        onPress={AlPresionarElDiaSiguiente.irAlDíaSiguiente} 
                        style={styles.Navegacion}
                    >
                        <Text style={styles.textoNavChico}>{FechaDeMañana.DiaSiguiente}</Text>
                        <ChevronRight color="black" size={20}/>
                    </TouchableOpacity>
                ) : null}
            </View>

        </View>
    );
};