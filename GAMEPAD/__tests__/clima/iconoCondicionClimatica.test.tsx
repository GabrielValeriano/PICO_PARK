import React from 'react';
import { render } from '@testing-library/react-native';
import IconoDeCondicionClimatica from '@/src/clima/iconoclima/IconoDeCondicionClimatica';

describe('Yo como usuario quiero ver los datos del clima para saber que poder hacer hoy', () => {

    test('El segundo dato a visualizar es el icono de condicion climatica en este caso deberia ser "sunny"', () => {
        const { getByTestId } = render(
            <IconoDeCondicionClimatica CondicionClimatica={{ weatherCode: 0 }} />
        );

        expect(getByTestId('icon-weather-sunny')).toBeTruthy();
    });

    test('Renderiza un icono climatico', () => {
        const { getByTestId } = render(<IconoDeCondicionClimatica CondicionClimatica={{ weatherCode: 0 }}/>);
        expect(getByTestId(/icon-weather-/)).toBeTruthy();
    });

});