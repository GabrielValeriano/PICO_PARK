import React from 'react';
import { useGamepad } from "@/src/Gamepad/hooks/useGamepad";
import { MetodosDeConexion } from "@/src/Gamepad/componentes/MetodosDeUnirse";
import { EscanerQR } from "@/src/Gamepad/componentes/EscanerQR";
import { PantallaDeCarga } from "@/src/Gamepad/componentes/CargaDeConexion";
import { ControlesGamepad } from "@/src/Gamepad/componentes/Controles";

export default function Gamepad() {
  const {
    PantallaDelJuego,
    textoEstado,
    miColor,
    enviarDatos,
    conectarAlServidor,
    abrirEscanerQR,
    alEscanearCodigo,
    alCerrarEscaner
  } = useGamepad();

  if (PantallaDelJuego === 'CARGANDO') {
    return <PantallaDeCarga />;
  }

  if (PantallaDelJuego === 'ESCANER') {
    return (
      <EscanerQR 
        AlCerrar={alCerrarEscaner} 
        AlEscanear={alEscanearCodigo} 
      />
    );
  }

  if (PantallaDelJuego === 'LOBBY') {
    return (
      <MetodosDeConexion 
        EscaneoDeQR={abrirEscanerQR} 
        DireccionIP={conectarAlServidor} 
      />
    );
  }

  return (
    <ControlesGamepad 
      textoEstado={textoEstado} 
      ColorDelJugador={miColor} 
      AlTocarUnBoton={enviarDatos} 
    />
  );
}