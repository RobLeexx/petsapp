# PetSteps

Prototipo visual Android creado con Expo, React Native y TypeScript. Incluye tres perfiles locales de demostración y no necesita backend, autenticación, sensores ni red después de instalar las dependencias.

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
```

## Demostraciones

- `ZorroBravo32`: perfil nuevo, selección persistente de la primera mascota y progreso vacío.
- `MiaExploradora`: nivel 8, 69 % de la meta diaria, cinco accesorios y 14 días de historial determinista.
- `Alex`: panel familiar con los dos menores, gráficas dinámicas y controles simulados.

La interfaz infantil incluye Inicio, Retos, Mascotas y Accesorios. La interfaz familiar incluye Panel, Actividad y Controles. La opción **Restablecer demostración** borra únicamente el perfil reciente y la primera mascota elegida.

## Recursos gráficos

Las imágenes de referencia originales indicadas en el encargo no estaban incluidas en el repositorio ni en el adjunto recibido. Para mantener el prototipo utilizable sin emojis ni marcadores genéricos, se generaron dos láminas kawaii originales y se guardaron en `assets/reference/`, `assets/pets/` y `assets/accessories/`. La aplicación recorta cada celda en tiempo de renderizado; por eso los personajes conservan el fondo suave de su lámina. Si se facilitan los tres originales, pueden sustituirse las dos láminas sin cambiar los datos ni las pantallas.

## Alcance

Los pasos, retos, XP, desbloqueos y controles parentales son datos visuales simulados. Esta etapa no implementa sensores, validación de retos, evolución real, mensajería, PIN, límites del dispositivo, pagos ni sincronización.
