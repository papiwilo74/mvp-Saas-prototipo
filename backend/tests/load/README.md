# Pruebas de Carga (k6)

## Requisitos

- [k6](https://k6.io/docs/getting-started/installation/)

## Uso

```bash
# Smoke test - 2 VUs durante 30s
k6 run tests/load/smoke.js

# Spike test - pico de 100 VUs
k6 run tests/load/spike.js

# Stress test - escalado gradual hasta 100 VUs
k6 run tests/load/stress.js

# Con URL personalizada
BASE_URL=https://api.tudominio.com/api k6 run tests/load/smoke.js
```

## Casos

| Script    | Descripción                          |
|-----------|--------------------------------------|
| `smoke.js`  | Prueba minima de humo (2 VUs)      |
| `spike.js`  | Pico repentino de trafico           |
| `stress.js` | Carga progresiva hasta limite       |
