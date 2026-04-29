import { useState, useEffect } from 'react';
import { DiaClima } from '../tipos/Clima';

export function useAPIpronosticoClima() {
    // REEMPLAZO: Inicializamos con un día "en blanco" para evitar undefined
    const [DatosDelPronostico, setPronostico] = useState<DiaClima[]>([{
        fecha: '--/--',
        tempMin: 0,
        tempMax: 0,
        tempActual: 0,
        humedad: 0,
        presion: 0,
        viento: 0,
        weatherCode: 0
    }]);
    
    const [indiceDia, setIndiceDia] = useState(0); // Empezamos en 0 porque el array inicial tiene 1 solo elemento

    const fetchWeatherData = async () => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=-34.6751&longitude=-58.4621&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,temperature_2m_mean,surface_pressure_mean,wind_speed_10m_mean,weather_code&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&timezone=auto&past_days=1&forecast_days=2&wind_speed_unit=ms`;
            const response = await fetch(url);
            const data = await response.json();

            const diasMapeados: DiaClima[] = data.daily.time.map((fechaRaw: string, index: number) => {
                const fechaDate = new Date(fechaRaw + "T00:00:00");
                const esHoy = index === 1;
                return {
                    fecha: `${fechaDate.getDate()}/${fechaDate.getMonth() + 1}`,
                    tempMin: Math.round(data.daily.temperature_2m_min[index]),
                    tempMax: Math.round(data.daily.temperature_2m_max[index]),
                    tempActual: esHoy ? Math.round(data.current.temperature_2m) : Math.round(data.daily.temperature_2m_mean[index]),
                    humedad: esHoy ? Math.round(data.current.relative_humidity_2m) : Math.round(data.daily.relative_humidity_2m_mean[index]),
                    presion: esHoy ? Math.round(data.current.surface_pressure) : Math.round(data.daily.surface_pressure_mean[index]),
                    viento: esHoy ? Math.round(data.current.wind_speed_10m) : Math.round(data.daily.wind_speed_10m_mean[index]),
                    weatherCode: esHoy ? data.current.weather_code : data.daily.weather_code[index],
                };
            });
            
            setPronostico(diasMapeados);
            setIndiceDia(1); // Una vez que cargan los 3 días de la API, saltamos al día de "Hoy"
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    };

    useEffect(() => { fetchWeatherData(); }, []);

    const irAlDíaAnterior = () => { if (indiceDia > 0) setIndiceDia(indiceDia - 1); };
    const irAlDíaSiguiente = () => { if (indiceDia < DatosDelPronostico.length - 1) setIndiceDia(indiceDia + 1); };

    return { 
        DatosDelPronostico: DatosDelPronostico[indiceDia], 
        // Ya no devolvemos EstaCargando
        Datos: {
            DiaAnterior: (indiceDia > 0 && DatosDelPronostico[indiceDia - 1]) ? DatosDelPronostico[indiceDia - 1].fecha : "",
            DiaSiguiente: (indiceDia < DatosDelPronostico.length - 1 && DatosDelPronostico[indiceDia + 1]) ? DatosDelPronostico[indiceDia + 1].fecha : "",
            VerificacionDeQueEsHoy: indiceDia === 1,
            CantidadDias: DatosDelPronostico.length,
            indiceDia
        },
        CambiarFecha: {irAlDíaAnterior, irAlDíaSiguiente }
    };
}

