import React from 'react';
import { render } from '@testing-library/react-native';
import MetricasSecundarias from '@/src/clima/variablesMetereologicas/MetricasSecundarias';

describe('Yo como usuario quiero ver los datos del clima para saber que poder hacer hoy', () => {
    const PropsConDatosFalsos = {
        Humedad: { humedad: 75 },
        PresionAtmosferica: { presion: 1012 },
        VelocidadDelViento: { viento: 5 }
    };

    test('El tercer dato a visualizar son las metricas secundarias, humedad, presion, viento', () => {
        const { getByText } = render(<MetricasSecundarias {...PropsConDatosFalsos} />);
        
        expect(getByText('75')).toBeTruthy();
        expect(getByText('1012')).toBeTruthy();
        expect(getByText('5')).toBeTruthy();
    });

    test('renderiza al menos tres métricas secundarias', () => {
        const { getAllByTestId } = render(<MetricasSecundarias {...PropsConDatosFalsos} />);
        
        // REGLA: Debe haber al menos 3 elementos con testID="metric-item"
        const metricas = getAllByTestId('metric-item');
        expect(metricas.length).toBeGreaterThanOrEqual(3);
    });
});