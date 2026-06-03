import { useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';

export function usePedirPermisoParaEscaneoCamara() {
  const [estadoPermiso, solicitarPermiso] = useCameraPermissions();

  useEffect(() => {
    if (estadoPermiso && !estadoPermiso.granted && estadoPermiso.canAskAgain) {
      solicitarPermiso();
    }
  }, [estadoPermiso]);

  const cargandoPermiso = !estadoPermiso;
  const permisoConcedido = estadoPermiso?.granted ?? false;

  return {
    cargandoPermiso,
    permisoConcedido,
    onSolicitarPermiso: solicitarPermiso,
  };
}