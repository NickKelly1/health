# Health ![status](https://health.nickkelly.dev/check?url=https://health.nickkelly.dev/_health)

Provides health checks based on the http status from an http request

## Usage

### Checking google.com:

![Google check](https://health.nickkelly.dev/check?url=https://google.com)

```
# check if google returns good http status
# visit: https://health.nickkelly.dev/check?url=https://google.com
```

### Choosing a "bad" image

![Choosing a bad image](https://health.nickkelly.dev/check?url=https://google.com/this_path_doesnt_exist_dsnjfksdf)
```
# set bad=<bad image url> in the search
# visit: https://health.nickkelly.dev/check?url=https://google.com&okay=https://tinyurl.com/y6kzednq
```

### Choosing a "good" image

![Choosing a good image](https://health.nickkelly.dev/check?url=https://google.com&good=https://tinyurl.com/y6kzednq)
```
# set good=<good image url> in the search
# visit: https://health.nickkelly.dev/check?url=https://google.com&good=https://tinyurl.com/y6kzednq
```

## Run with Docker:

```bash
docker run \
  --name health-checker \
  -p 5000:5000 \
  -e PORT=5000 \
  -e LOG_DIR=./storage/logs \
  -e LOG_MAX_SIZE=20m \
  -e LOG_ROTATION_MAX_AGE=7d \
  -e RATE_LIMIT_WINDOW_MS=60000 \
  -e RATE_LIMIT_MAX=100
  --rm \
  nick3141/health
```

## Run with Docker Compose:

```yaml
version: "3"

services:
  http_health_checker:
    container_name: http_health_checker
    image: nick3141/health
    restart: unless-stopped
    ports:
      - 5000:5000
    environment:
      - PORT=5000
      - LOG_DIR=./storage/logs
      - LOG_MAX_SIZE=20m
      - LOG_ROTATION_MAX_AGE=7d
      - RATE_LIMIT_WINDOW_MS=60000
      - RATE_LIMIT_MAX=100
```
