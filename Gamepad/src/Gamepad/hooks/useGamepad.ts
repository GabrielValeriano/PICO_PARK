import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';

export type GamepadPantallas = 'CARGANDO' | 'ESCANER' | 'LOBBY' | 'CONTROLES';

const COLOR_DEL_JUGADOR = ['#dc2626', '#16a34a', '#2563eb', '#d97706']; // P1 a P4

export function useGamepad() {
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [mostrarEscaner, setMostrarEscaner] = useState(false);

  const [conectado, setConectado] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [textoEstado, setTextoEstado] = useState('Gamepad Listo');
  const [miColor, setMiColor] = useState('#fff');

  const JugadorID = useRef<number | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const EnCasoDeDesconexion = () => {
    setConectado(false);
    JugadorID.current = null;
    setTextoEstado('Desconectado');
    setMiColor('#fff');
  };

  const conectarAlServidor = (url: string) => {
    setConectando(true);
    const DireccionURLDeRed = url.includes('/ws') ? url : `${url}/ws`;
    
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(DireccionURLDeRed);

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: 'is_gamepad' }));
      setConectando(false);
      setConectado(true);
      setTextoEstado('Sincronizando...');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'setup') {
          JugadorID.current = data.id;
          const AsignacionDeColor = data.color || COLOR_DEL_JUGADOR[data.id] || '#4ade80';
          setMiColor(AsignacionDeColor);
          setTextoEstado(`Jugador ${data.idVisual}`);
        }

        if (data.type === 'server_reset') {
          EnCasoDeDesconexion();
          Alert.alert("Juego Reiniciado", "El monitor se ha reiniciado.");
        }
      } catch (e) {
        console.log("Mensaje no procesado:", event.data);
      }
    };

    ws.current.onerror = () => {
      setConectando(false);
      setConectado(false);
      Alert.alert("Error", "No se pudo conectar. ¿El server está en el puerto 3000?");
    };

    ws.current.onclose = () => EnCasoDeDesconexion();
  };

  const enviarDatos = (cmd: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && JugadorID.current !== null) {
      ws.current.send(JSON.stringify({ 
        id: JugadorID.current, 
        command: cmd 
      }));
    }
  };

  const abrirEscanerQR = async () => {
    if (permisoCamara?.granted) {
      setMostrarEscaner(true);
      return;
    }

    const resultado = await solicitarPermisoCamara();
    
    if (resultado.granted) {
      setMostrarEscaner(true);
    } else {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara para leer el código QR.");
    }
  };

  const alEscanearCodigo = (datosQR: string) => {
    setMostrarEscaner(false);
    conectarAlServidor(datosQR); 
  };

  const alCerrarEscaner = () => {
    setMostrarEscaner(false);
  };

  let PantallaDelJuego: GamepadPantallas = 'CONTROLES';
  
  if (conectando) {
    PantallaDelJuego = 'CARGANDO';
  } else if (mostrarEscaner) {
    PantallaDelJuego = 'ESCANER';
  } else if (!conectado) {
    PantallaDelJuego = 'LOBBY';
  }

  return {
    PantallaDelJuego,
    textoEstado,
    miColor,
    enviarDatos,
    conectarAlServidor,
    abrirEscanerQR,
    alEscanearCodigo,
    alCerrarEscaner
  };
}