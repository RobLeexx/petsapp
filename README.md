# PetSteps

Demostración Android interactiva creada con Expo, React Native y TypeScript. Incluye tres perfiles locales, progreso persistente, simulación determinista de actividad y no necesita backend, autenticación, sensores ni red después de instalar las dependencias.

## Ejecutar en Android

Requisitos: Node.js, npm y la aplicación Expo Go en un dispositivo Android.

```bash
npm install
npx expo start --clear
```

Escanea el QR con Expo Go. También puedes pulsar `a` si hay un emulador Android disponible.

## Validar

```bash
npx tsc --noEmit
npm test -- --watch=false
npx expo-doctor
npx expo export --platform android
```

## Demostraciones

- `ZorroBravo32`: perfil nuevo, selección persistente de la primera mascota y progreso vacío.
- `MiaExploradora`: nivel 8, 69 % de la meta diaria, cinco accesorios y 14 días de historial determinista.
- `Alex`: panel familiar con los dos menores, gráficas dinámicas y controles simulados.

La interfaz infantil incluye Inicio, Retos, Mascotas y Accesorios. La interfaz familiar incluye Panel, Actividad y Controles. La opción **Restablecer demostración** restaura todos los perfiles, fechas, progresos y ajustes originales.

## Mecánicas interactivas

- Pasos y minutos simulados con puntuación diaria limitada a 180 puntos.
- XP monotónica, niveles y etapas Cría, Explorador y Héroe.
- Progreso independiente para las seis mascotas y un cambio voluntario por día simulado.
- Retos diarios que solo recompensan una vez por día.
- Doce accesorios desbloqueables y equipables.
- Avance de un día o simulación determinista de siete días.
- Estadísticas infantiles y familiares derivadas del mismo estado persistido.
- Ajustes parentales simulados para metas, pantalla, modo seguro, chat y horarios.

El botón discreto **Modo demo** aparece en el inicio infantil y en Controles del panel familiar. Desde ahí se pueden añadir pasos, minutos, completar retos, avanzar el tiempo, previsualizar logros, repetir el splash, ver el loader o restablecer la demo.

## Guion sugerido de 3–5 minutos

1. Inicia la aplicación y muestra el splash animado y los tres perfiles.
2. Entra como `ZorroBravo32`, elige una mascota y abre **Modo demo**.
3. Añade 5.000 pasos y completa un reto para mostrar puntos, XP y recompensas.
4. Abre Accesorios, equipa un objeto desbloqueado y cambia de mascota.
5. Entra como `MiaExploradora`, enseña su nivel, evolución e historial; simula siete días o previsualiza su siguiente evolución.
6. Entra como `Alex`, comprueba que las cifras familiares se actualizaron y modifica una meta diaria.
7. Desde Controles, previsualiza el loader y restablece la demostración.

## Recursos gráficos

Las imágenes de referencia originales indicadas en el encargo no estaban incluidas en el repositorio ni en el adjunto recibido. Para mantener el prototipo utilizable sin emojis ni marcadores genéricos, se generaron dos láminas kawaii originales y se guardaron en `assets/reference/`, `assets/pets/` y `assets/accessories/`. La aplicación recorta cada celda en tiempo de renderizado; por eso los personajes conservan el fondo suave de su lámina. Si se facilitan los tres originales, pueden sustituirse las dos láminas sin cambiar los datos ni las pantallas.

## Alcance

Los pasos, retos, tiempo de pantalla, XP, desbloqueos y controles parentales son simulados. La aplicación no implementa sensores, verificación física de retos, mensajería real, PIN, límites del dispositivo, pagos ni sincronización.
