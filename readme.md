# Health ![status](https://health.nickkelly.dev/check?url=https://health.nickkelly.dev/_health)

Provides health checks based on the http status from a http request

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
