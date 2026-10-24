# 05 · Arquitectura y QVAC

## Sobre QVAC (verificar siempre en https://docs.qvac.tether.io)
- Ecosistema **open source** de Tether para aplicaciones de IA **local-first** y peer-to-peer: los modelos se cargan y ejecutan en la propia máquina, sin depender de la nube.
- **SDK oficial:** `@qvac/sdk` (npm), JavaScript/TypeScript. Corre en Node.js, Bare y Expo.
- **CLI oficial:** `@qvac/cli`, incluye un servidor HTTP que expone una **API compatible con OpenAI**. Esto permite que nuestro backend le hable como a cualquier API de chat.
- Capacidades: inferencia de LLM, embeddings, traducción, reconocimiento de voz (ASR), texto a voz, OCR, RAG, entre otras.
- La documentación está pensada para ser leída por personas y por asistentes de programación.
- Soporte: Discord y FeatureBase de QVAC; Tether da capacitaciones durante la Innovathon.
- ⚠️ El paquete de PyPI `qvac-sdk` es de un tercero; **no usar**.

## Arquitectura del MVP
```
[Navegador del celular o PC del asesor]
        │  (HTTPS, sin datos guardados)
        ▼
[web/  React + Vite]  ──►  [server/  Node.js + Express]
                                 │
                                 ├── data/*.json  (catálogo, ocupaciones, regiones, cursos)
                                 │
                                 └── AIProvider
                                       ├── MockProvider  (palabras clave, sin modelo)
                                       └── QvacProvider  (servidor QVAC compatible con OpenAI,
                                                          corriendo en infraestructura propia/MTPE)
```
- El servidor QVAC corre en la misma máquina o red del backend (en producción: infraestructura del MTPE). Ningún texto de la persona sale a terceros.
- Variables de entorno (`.env`): `AI_PROVIDER`, `QVAC_BASE_URL`, `QVAC_MODEL`, `EMPLEOS_PERU_URL` (TODO), `CAPACITATE_PERU_URL` (TODO), `PORT`.

## Privacidad (MVP)
- Sin base de datos de personas, sin cookies de seguimiento, sin analítica de terceros.
- El estado del recorrido vive en memoria del navegador; "Empezar de nuevo" lo borra.
- Logs del servidor sin el texto de la persona.

## Voz (fase siguiente)
- No usar Web Speech API del navegador (envía audio a terceros).
- Fase 2: grabar audio en el navegador, enviarlo al backend y transcribirlo con la capacidad de reconocimiento de voz de QVAC. En el MVP el botón de voz aparece deshabilitado con "Próximamente".

## Integración con gob.pe (visión)
El MVP es una web independiente con la marca Chambea. En producción se integraría como un módulo del portal de empleo de gob.pe, con enlaces directos a Empleos Perú y Capacítate Perú, y el backend QVAC operado por el MTPE.
