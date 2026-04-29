import { styles } from "@/src/clima/estilos/estilosDeLaApp"
import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context"

const LayoutPantallaPrincipal = ({children}: PropsWithChildren) =>{
    return (
        <SafeAreaView testID="screen-weather" style={styles.ContenedorDatos}>
            {children}
        </SafeAreaView>
    );
};

export default LayoutPantallaPrincipal;