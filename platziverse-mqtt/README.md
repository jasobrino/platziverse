# platziverse-mqtt

## `agent/connected`
``` js
{
  agent: {
    uuid, //auto generado
    username, //definir por configuración
    name,  // definir por configuración
    hostname, //obtener del s.o.
    pid //obtener del proceso
  }
}
```

## `agent/disconnected`
``` js
{
  agent: {
    uuid
  }
}
```


## `agent/message`
``` js
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp // generar cuando creamos el mensaje
}
```