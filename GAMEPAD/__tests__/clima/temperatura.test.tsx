import React from 'react';
import { render } from '@testing-library/react-native';
import Temperatura_MIN_NOWAVG_MAX from '@/src/clima/temperatura/Temperatura_MIN_NOW-AVG_MAX';

describe('Yo como usuario quiero ver los datos del clima para saber que poder hacer hoy', () => {
    
    const PropsConDatosFalsos = {
        Temperatura_MIN: { tempMin: 10 },
        Temperatura_Actual: { tempActual: 20 },
        Temperatura_MAX: { tempMax: 30 },
        Datos: { VerificacionDeQueEsHoy: true }
    };

    test('el cuarto dato a visualizar es la temperatura actual', () => {
        const { getByTestId } = render(<Temperatura_MIN_NOWAVG_MAX {...PropsConDatosFalsos} />);
        
        expect(getByTestId('temp-current').props.children.toString()).toMatch(/°/);
    });

    test('Los ultimos datos a visualizar son la temperatura mínima y máxima', () => {
        const { getByTestId } = render(<Temperatura_MIN_NOWAVG_MAX {...PropsConDatosFalsos} />);
        
        expect(getByTestId("temp-min")).toBeTruthy();
        expect(getByTestId("temp-max")).toBeTruthy();
    });

    test('el indicador de navegación debe alternar entre NOW y AVG según la verificacion del dia si es hoy o no', () => {
        const { getByTestId, rerender } = render(<Temperatura_MIN_NOWAVG_MAX {...PropsConDatosFalsos} Datos={{ VerificacionDeQueEsHoy: true }} />);
        
        expect(getByTestId('navigation-current-day').props.children).toBe('NOW');

        rerender(<Temperatura_MIN_NOWAVG_MAX {...PropsConDatosFalsos} Datos={{ VerificacionDeQueEsHoy: false }} />);
        
        expect(getByTestId('navigation-current-day').props.children).toBe('AVG');
    });
});