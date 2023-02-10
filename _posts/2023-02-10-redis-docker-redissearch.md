---
layout:     post
title:      Bitnami Redis Docker Images w/ RediSearch
summary:    Learn how to slightly modify the Bitnami Redis Docker images to load and enable additional Redis modules such as RediSearch, JSON, etc.
tags:       ["Redis", "Docker"]
---

If you are deploying Redis via [Bitnami Redis Docker images](https://hub.docker.com/r/bitnami/redis/), you may be interested in enabling several additional Redis modules that allow you to [index and search documents](https://hub.docker.com/r/redislabs/redisearch/) stored in Redis. This post is a quick overview of how to extend and use the existing Docker base images to enhance the Bitnami Redis Docker image capabilities with search features.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- Redis `7.0.x`
- Docker

# Deployment

We will start with a convenience script that allows us to spin up containers using `docker-compose`:

```bash
#!/bin/bash
export REDIS_VERSION=${1:-7.0.7}
echo "Running Redis docker image: $REDIS_VERSION"
docker-compose -f docker-compose.yml down >/dev/null 2>/dev/null || true
docker-compose -f docker-compose.yml up -d
```
Our `docker-compose.yml` file is quite short:
{% include googlead1.html  %}
```yml
version: "3"

services:
  redis-master:
    build:
      context: .
      args:
        redisVersion: ${REDIS_VERSION}
    container_name: redis_server_master
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
    ports:
      - "6379:6379"
```
{% include googlead1.html  %}
The main element to note here is the build `context` where we specify the *current directory* for the tool to find our `Dockerfile`. Docker Compose will then use this `Dockerfile` to build an image and spin up the container. The Docker Compose reference documentation notes:

> Either a path to a directory containing a Dockerfile, or a URL to a git repository. When the value supplied is a relative path, it is interpreted as relative to the location of the Compose file. This directory is also the build context that is sent to the Docker daemon.
{% include googlead1.html  %}
The main building block of the deployment is defined in a `Dockerfile` which takes advantage of Docker's multi-stage builds:

```docker
ARG redisVersion

FROM docker.io/redislabs/redisearch:latest as redisearch
FROM bitnami/redis:$redisVersion

COPY --from=redisearch /usr/lib/redis/modules/redisearch.so /usr/lib/redis/modules/redisearch.so

CMD ["/run.sh", "--loadmodule", "/usr/lib/redis/modules/redisearch.so"]
```
{% include googlead1.html  %}
Our `Dockerfile` extracts the needed Redis modules from `redisearch` base image. Then, it will build a Docker image with `bitnami/redis` as the base image and will copy the extracted Redis modules into the final image. Of course, it would also have to instruct Redis to load those two modules when it runs. 

Once you run the image, you can `ssh` into the running container, run `redis-cli`, and then interact with Redis modules. An example would be:

```bash
127.0.0.1:6379> FT.CREATE myIdx ON HASH PREFIX 1 doc: SCHEMA title TEXT WEIGHT 5.0 body TEXT url TEXT
OK
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html