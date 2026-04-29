import { View } from "react-native"
import { obtenerIconoDelClima, obtenerNombreDelClima } from "../tipos/CondicionClimatica"

const IconoDeCondicionClimatica = ({CondicionClimatica} :{CondicionClimatica: { weatherCode : number}}) =>{
    
    const nombreClima = obtenerNombreDelClima(CondicionClimatica.weatherCode);

    return (
        <View testID={`icon-weather-${nombreClima}`}>
            {obtenerIconoDelClima(CondicionClimatica.weatherCode)}
        </View>
    )
}

export default IconoDeCondicionClimatica;