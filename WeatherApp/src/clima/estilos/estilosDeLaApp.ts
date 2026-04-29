import { Star } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    loaderContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'white' 
    },
    ContenedorDatos: { 
        backgroundColor: "white", 
        width: "100%", 
        height: "100%", 
        paddingHorizontal: 25,
        alignItems: "center", 
        gap: 18  
    },
    ContenedorNavegacion: { 
        flexDirection: "row", 
        width: "100%", 
        alignItems: "center",
        height: "5%", // Altura fija para que sea más estable
    },
    columnaIzquierda: {
        flex: 1,
        alignItems: 'flex-start',
    },
    columnaCentral: {
        flex: 2, // Más espacio al centro
        alignItems: 'center',
    },
    columnaDerecha: {
        flex: 1,
        alignItems: 'flex-end',
    },
    Navegacion: { 
        flexDirection: "row", 
        alignItems: "center",
    },
    textoFechaPrincipal: { 
        fontSize: 25, 
    },
    textoNavChico: { 
        fontSize: 20,  
        opacity: 0.3 
    },
    ContenedorCiudad:{
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "18%"

    },
    TextoCiudad: { 
        fontSize: 40, 
        fontWeight: '900', 
        letterSpacing: 1 

    },
    ContenedorDatosAdicionales: { 
        alignSelf: "flex-start", 
        gap: 4,  
    },
        contenedorDeValoresMetereologicos:{
        alignItems: "baseline",
        flexDirection: "row",
    },
    ValorMetereologico:{
        fontSize: 30,
        fontWeight: 'bold',

        
    },
    MedidaDeValorMetereologico:{
        fontSize:16,
        fontWeight: 'bold',
        opacity: 0.3
    },
    ContenedorPrincipalDelPronostico: { width: '100%'},
    ContenedorPronostico: { flexDirection: "row", width: "100%", alignItems: 'baseline' },
    ContenedorDeTextoPronostico: { flexDirection: 'row', width: '100%', alignItems: "center" },
    ContenedorDeTempLateral: { flex: 1, alignItems: "center" },
    ContenedorDeTempCentral: { flex: 2, alignItems: 'center' },
    ContenedorDeTextoLateral: { flex: 1, alignItems: "center" },
    ContenedorDeTextoCentral: { flex: 2, alignItems: 'center' },
    TextoTempPrincipal: { fontSize: 90, fontWeight: '800'},
    TextoTempSecundaria: { fontSize: 40, fontWeight: 'bold'},
    TextoCentralDeLaTemp: { fontSize: 25, fontWeight: '700', letterSpacing: 2 },
    TextoLateralDeLaTemp: { fontSize: 20, fontWeight: '700', opacity: 0.2 },
    containerDeDatosMeteorologicos:{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10
    }
});