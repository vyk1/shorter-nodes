## Requests

### Create a new link

curl -X POST -H "Content-Type: application/json" -d '{"code":"ufsc", "url":"http://ufsc.br"}' http://localhost:3333/links

### Get all links

curl http://localhost:3333/links


## DYK?

Serial will be incremented even if it fails to be inserted