import React from 'react';
import { render } from '@testing-library/react-native';
import PantallaPrincipal from '../../app/index'; 

jest.mock('@/src/clima/hooks/useAPIpronostico', () => ({
  useAPIpronosticoClima: () => ({
    DatosDelPronostico: {
      fecha: '21/4',
      tempMin: 15,
      tempMax: 25,
      tempActual: 20,
      humedad: 60,
      presion: 1013,
      viento: 5,
      weatherCode: 0,
    }, 
    Datos: {
      DiaAnterior: '20/4',
      DiaSiguiente: '22/4',
      VerificacionDeQueEsHoy: true,
    },
    CambiarFecha: {
      irAlDíaAnterior: jest.fn(),
      irAlDíaSiguiente: jest.fn()
    }
  })
}));

describe('Pruebas de Integración', () => {
  test('La PantallaPrincipal expone todos los testID obligatorios', () => {
    const { getByTestId } = render(<PantallaPrincipal />);
    
    const requiredTestIds = [
      'screen-weather',
      'header-city',
      'button-prev-day',
      'button-next-day',
      'temp-current',
      'temp-min',
      'temp-max',
    ];

    requiredTestIds.forEach(id => {
      expect(getByTestId(id)).toBeTruthy();
    });
  });
});