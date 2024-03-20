## Requests

### Create a new link
```bash
curl -X POST -H "Content-Type: application/json" -d '{"code":"ufsc", "url":"http://ufsc.br"}' http://localhost:3333/api/links
```

### Get all links
```bash
curl http://localhost:3333/api/links
```

### Get a link by code (and get redirected)
```bash
curl http://localhost:3333/ufsc
```

### Get metrics
```bash
curl http://localhost:3333/api/metrics
```

## DYK?

- Serial will be incremented even if it fails to be inserted
