import { styles } from "@/src/clima/estilos/estilosDeLaApp"
import { View, Text } from "react-native"

const TextoCiudad = () => {
    return (
            <View style={styles.ContenedorCiudad}>
                <Text testID="header-city" style={styles.TextoCiudad}>VILLA LUGANO</Text>
            </View>
    )
}
export default TextoCiudad;