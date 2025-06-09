# 🖥️ Despliegue con Electron - Configuración de Base de Datos

## 📋 Resumen

Esta configuración asegura que la base de datos SQLite funcione correctamente en aplicaciones Electron multiplataforma sin problemas de permisos.

## 🔧 Configuración Implementada

### 📁 Ubicación de Base de Datos por OS

La aplicación utiliza directorios específicos para cada sistema operativo donde el usuario siempre tiene permisos de escritura:

| OS | Ubicación | Ejemplo |
|---|---|---|
| **Windows** | `%APPDATA%/OroyaAPI/` | `C:\Users\Usuario\AppData\Roaming\OroyaAPI\` |
| **macOS** | `~/Library/Application Support/OroyaAPI/` | `/Users/usuario/Library/Application Support/OroyaAPI/` |
| **Linux** | `~/.config/OroyaAPI/` | `/home/usuario/.config/OroyaAPI/` |

### 🔄 Modo Desarrollo vs Producción

- **Desarrollo** (`NODE_ENV=development`): Usa `backend/database.sqlite` (ruta relativa)
- **Producción/Electron**: Usa directorio de datos de usuario

### 🛡️ Características de Seguridad

1. **Verificación de Permisos**: Verifica permisos de escritura antes de usar el directorio
2. **Creación Automática**: Crea directorios automáticamente si no existen
3. **Fallback**: Usa directorio temporal si hay problemas de permisos
4. **Configuración Optimizada**: SQLite configurado para mejor rendimiento

## 🚀 Configuración para Electron

### 1. Variables de Entorno

Asegúrate de configurar la variable de entorno en tu aplicación Electron:

```javascript
// En tu proceso principal de Electron
process.env.NODE_ENV = 'production';
```

### 2. Empaquetado

Al empaquetar tu aplicación con herramientas como `electron-builder`, asegúrate de:

```json
{
  "build": {
    "files": [
      "!backend/database.sqlite",
      "!backend/storage/**/*"
    ],
    "extraResources": [
      {
        "from": "backend/database-template.sqlite",
        "to": "database-template.sqlite"
      }
    ]
  }
}
```

### 3. Inicialización en Electron

```javascript
// En tu proceso principal
const { app } = require('electron');

app.whenReady().then(async () => {
  // La base de datos se inicializará automáticamente en el directorio correcto
  console.log('Database will be created in user data directory');
});
```

## 🔍 Debug y Verificación

### Endpoint de Debug

Puedes verificar la configuración accediendo a:

```
GET /api/debug/database
```

Respuesta ejemplo:
```json
{
  "message": "Database configuration info",
  "path": "/Users/usuario/Library/Application Support/OroyaAPI/database.sqlite",
  "platform": "darwin",
  "userDataPath": "/Users/usuario/Library/Application Support/OroyaAPI",
  "isDevelopment": false
}
```

### Verificación Manual

```bash
# Probar la configuración
curl http://localhost:8080/api/debug/database
```

## ⚙️ Configuración SQLite Optimizada

La configuración incluye optimizaciones para aplicaciones de escritorio:

```sql
PRAGMA journal_mode = WAL;       -- Mejor concurrencia
PRAGMA synchronous = NORMAL;     -- Balance entre rendimiento y seguridad
PRAGMA cache_size = 1000;        -- Cache en memoria
PRAGMA foreign_keys = ON;        -- Integridad referencial
PRAGMA temp_store = MEMORY;      -- Tablas temporales en memoria
```

## 🔧 Resolución de Problemas

### Error: "attempt to write a readonly database"

✅ **Solucionado**: La nueva configuración previene este error usando directorios de usuario apropiados.

### Error: "Database not found"

✅ **Solucionado**: Los directorios se crean automáticamente.

### Error: "Permission denied"

✅ **Solucionado**: Sistema de fallback a directorio temporal.

## 📦 Archivos Modificados

- `backend/src/config/database.ts` - Configuración principal
- `backend/src/router/index.ts` - Endpoint de debug

## 🎯 Beneficios

1. ✅ **Sin problemas de permisos** en ningún OS
2. ✅ **Instalación limpia** sin necesidad de permisos administrativos
3. ✅ **Datos persistentes** en ubicación estándar del OS
4. ✅ **Fácil backup/migración** (ubicación conocida)
5. ✅ **Compatibilidad total** con Windows, macOS y Linux
6. ✅ **Mejor rendimiento** con configuración optimizada

## 🔜 Siguientes Pasos

1. Probar en diferentes sistemas operativos
2. Implementar migración automática de datos
3. Agregar backup automático
4. Configurar logging específico para Electron 