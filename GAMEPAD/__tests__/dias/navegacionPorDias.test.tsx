import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavegacionPorDias } from '@/src/clima/dias/NavegacionPorDias';

describe('Pruebas de Navegación por Días (Requerimiento 3)', () => {
    
    // Mocks de las funciones (Jest "espía" si son llamadas)
    const IrAlAnteriorFalso = jest.fn();
    const IrAlSiguienteFalso = jest.fn();

    const PropsConDatosFalsos = {
        FechaActual: { fecha: '21/4' },
        FechaDeAyer: { DiaAnterior: '20/4' },
        FechaDeMañana: { DiaSiguiente: '22/4' },
        AlPresionarElDiaAnterior: { irAlDíaAnterior: IrAlAnteriorFalso },
        AlPresionarElDiaSiguiente: { irAlDíaSiguiente: IrAlSiguienteFalso }
    };

    test('permite navegar al día anterior (presionar botón izquierdo)', () => {
        const { getByTestId } = render(<NavegacionPorDias {...PropsConDatosFalsos} />);
        fireEvent.press(getByTestId('button-prev-day'));
    });

    test('permite navegar al día siguiente (presionar botón derecho)', () => {
        const { getByTestId } = render(<NavegacionPorDias {...PropsConDatosFalsos} />);
        
        fireEvent.press(getByTestId('button-next-day'));
    });
});