import React from 'react';
import { render } from '@testing-library/react-native';
import TextoCiudad from '@/src/clima/ciudad/TextoCiudad';

describe('Yo como usuario quiero ver los datos del clima para saber que poder hacer hoy', () => {
    test('El primer dato a visualizar debe ser la ciudad en este caso "VILLA LUGANO" ', () => {
        const { getByTestId } = render(<TextoCiudad />);
        const componente = getByTestId('header-city');
        
        expect(componente.props.children).toBe('VILLA LUGANO');
    });
});