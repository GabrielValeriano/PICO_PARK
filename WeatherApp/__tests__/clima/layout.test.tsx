import React from 'react';
import { render } from '@testing-library/react-native';
import LayoutPantallaPrincipal from '@/src/clima/PantallaPrincipal/LayoutParaPantallaPrincipal';

describe('Yo como usuario quiero hacer una pruebas de integración', () => {
  test('renderiza la pantalla principal del clima', () => {
    const { getByTestId } = render(<LayoutPantallaPrincipal />);
    expect(getByTestId('screen-weather')).toBeTruthy();
  });
});