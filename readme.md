# [HTTP Icons](https://http-icons.nickkelly.dev)

![status](https://http-icons.nickkelly.dev/check?size=xl&url=https://http-icons.nickkelly.dev/_health)

Send http requests and returns an icon based on the status.

## Usage

### Default image size options

xxl, xl, l, m, sm

![xxl](https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=xxl)
![xl](https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=xl)
![l](https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=l)
![m](https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=m)
![sm](https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=sm)

- **xxl**: `https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=xxl`
- **xl**: `https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=xl`
- **l**: `https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=lh`
- **m**: `https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=mh`
- **sm**: `https://http-icons.nickkelly.dev/check?url=https://http-icons.nickkelly.dev/_health&size=smh`

### Checking google.com

![Google check](https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com)

```
# check if google returns good http status
# visit: https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com
```

### Choosing a fail image

![Choosing a bad image](https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com/this_path_doesnt_exist_dsnjfksdf&bad=https://tinyurl.com/yxvpcy7c)

```sh
# set bad=<bad image url> in the search
# visit: https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com&okay=https://tinyurl.com/y6kzednq&bad=https://tinyurl.com/yxvpcy7c
```

### Choosing a good image

![Choosing a good image](https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com&good=https://tinyurl.com/y6kzednq)

```sh
# set good=<good image url> in the search
# visit: https://http-icons.nickkelly.dev/check?size=xl&url=https://google.com&good=https://tinyurl.com/y6kzednq
```

## Run with Docker

```bash
docker run \
  --name http-icons \
  -p 5000:5000 \
  -e PORT=5000 \
  -e LOG_DIR=./storage/logs \
  -e LOG_MAX_SIZE=20m \
  -e LOG_ROTATION_MAX_AGE=7d \
  -e RATE_LIMIT_WINDOW_MS=60000 \
  -e RATE_LIMIT_MAX=100 \
  --rm \
  nick3141/http-icons:latest
```

## Run with Docker Compose:

```yaml
version: "3"

services:
  http-icons:
    container_name: http-icons
    image: nick3141/http-icons:latest
    restart: unless-stopped
    ports:
      - 5000:5000
    environment:
      - PORT=5000
      # optional:
      # - LOG_DIR=./storage/logs
      # - LOG_MAX_SIZE=20m
      # - LOG_ROTATION_MAX_AGE=7d
      # - RATE_LIMIT_WINDOW_MS=60000
      # - RATE_LIMIT_MAX=100
```

## Development

### Linting ejs files

```sh
# run the npm script "ejslint" which runs the npm package "ejslint"
# and pass to it the file being linted
npm run ejslint -- views/pages/index.ejs
# alternatively: `npx ejslint views/pages/index.ejs`
```

## TODO

Separate documentation from application and host elsewhere
