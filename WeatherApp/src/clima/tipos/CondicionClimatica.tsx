import { Circle, Waves, Cloudy, Zap, Snowflake, CloudRainWind } from 'lucide-react-native';

export const obtenerIconoDelClima = (codigo: number) => {
    if (codigo === 0) return <Circle  size={350} />;
    if (codigo >= 1 && codigo <= 3) return <Cloudy size={350} />;
    if (codigo >= 4 && codigo <= 48) return <Waves size={350} />;
    if (codigo >= 49 && codigo <= 69) return <CloudRainWind size={350} />;
    if (codigo >= 70 && codigo <= 79) return <Snowflake size={350} />;
    if (codigo >= 80 && codigo <= 84) return <CloudRainWind size={350} />;
    if (codigo >= 85 && codigo <= 94) return <Snowflake size={350} />;
    if (codigo >= 95 && codigo <= 99) return <Zap size={350} />;
    return <Cloudy size={350} />;
};

export const obtenerNombreDelClima = (codigo: number): string => {
    if (codigo === 0) return 'sunny';
    if (codigo >= 1 && codigo <= 3) return 'cloudy';
    if (codigo >= 4 && codigo <= 48) return 'foggy';
    if (codigo >= 49 && codigo <= 69) return 'rainy';
    if (codigo >= 70 && codigo <= 79) return 'snowy';
    if (codigo >= 80 && codigo <= 84) return 'showers';
    if (codigo >= 85 && codigo <= 94) return 'snow-showers';
    if (codigo >= 95 && codigo <= 99) return 'storm';
    return 'cloudy';
};