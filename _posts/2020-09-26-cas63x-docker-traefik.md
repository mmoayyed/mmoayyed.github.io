---
layout:     post
title:      Apereo CAS - Dockerized Deployment via Traefik Reverse Proxy
summary:    Learn how to deploy Apereo CAS using Docker and allowing Traefik as a reverse proxy and edge router to channel http and https traffic to the CAS container.
published: true
tags:       [CAS]
---

[Traefik](https://doc.traefik.io/traefik/) is an open-source cloud-native, modern reverse proxy and edge Router that makes publishing services quite simple. Its key characteristic is that it can automatically discover the right configuration for services as it inspects infrastructure to find relevant information on which service serves which request.

In this post, we will take a look at how Apereo CAS can be [deployed via Docker](/2020/01/31/cas6-docker-deployment/) and sit behind Traefik. A dockerized CAS deployment is an existing CAS overlay project wrapped in Spring Boot, Docker, and Docker Compose. This setup requires a few extra modifications in order to allow an additional integration with Traefik for http and https access.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- Docker
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# HTTP Setup

The first step is to allow the CAS server to serve requests on a designated port `8080` and under `http`. To do this, the `cas.properties` file should be adjusted to include the following settings:

```properties
server.ssl.enabled=false

server.port=8080

server.tomcat.remoteip.protocol-header-https-value=http
```

## Port Detection

You can choose any port you prefer, but you do need to make sure the same port is *exposed* in the `Dockerfile` for the CAS server via the `EXPOSE` directive. Traefik retrieves the private IP and port of containers from the Docker API as part of its auto-configuration and discovery strategy.

Ports detection works as follows:

- If a container exposes only one port, then Traefik uses this port for private communication.
- If a container exposes multiple ports, or does not expose any port, then you must manually specify which port Traefik should use for communication by using the label `traefik.http.services.cas.loadbalancer.server.port` 

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Note that the CAS `Dockerfile` found in the overlay project does include `EXPOSE 8080 8443` for port exposure.

## Docker Setup

Next, the `docket-compose.yml` file should be adjusted to pull down the Traefik docker image and auto-configure it:

```yaml
version: '3.8'
services:
  cas:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cas.rule=HOST(`auth.example.org`)"
      - "traefik.http.services.cas.loadbalancer.server.port=8080"

  traefik:
    image: traefik:v2.3.0
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "$PWD/traefik.toml:/etc/traefik/traefik.toml"
```

The labels will be read later by Traefik to auto-configure the service. Specifically, 

- `traefik.enable` ensures that Traefik sees our CAS container and routes traffic to it. This directive can be replaced with `exposedByDefault = true` in the Traefik configuration. 
- `traefik.http.routers.cas.rule` create a `cas` *router* rule for Traefik that allows it to route traffic to the CAS container if the host header matches `auth.example.org`.
- `traefik.http.services.cas.loadbalancer.server.port` specifies the target destination port for traffic into the running service.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

The Traefik container itself is exposed over port `80` for routing traffic and we also allow for port `8080` which grants access to the Traefik dashboard. We are also mapping two volumes:

- The first volume makes Traefik aware of Docker containers.
- The second volume mounts a `traefik.toml` configuration file inside the Traefik container which is loaded by Traefik on startup.

At this point, the only remaining task is to create and design the `traefik.toml` file. 

```toml
[entryPoints]
  [entryPoints.cas]
    address = ":80"

[api]
insecure = true

[log]
level = "INFO"

[accessLog]

[providers]
  [providers.docker]
    exposedByDefault = true
```

# Build & Deploy

We can use the following to build and run our Docker containers:

```bash
docker-compose down && docker-compose up --build
```

Please be patient, as doing a build for the first time might take a while depending on your bandwidth. Once ready, you should be able to browse to `http://localhost:8080/dashboard` and access the Traefik dashboard:

![image](https://user-images.githubusercontent.com/1205228/94335683-13edc080-ffea-11ea-8d6a-34843e483c31.png)

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

We can also examine our `CAS` router and its configuration:

![image](https://user-images.githubusercontent.com/1205228/94335724-5e6f3d00-ffea-11ea-9601-411f6afb22b7.png)

Of course, you should be able to get to the CAS server using `http://auth.example.org/cas/login`.

For extra credit, you can in fact examine the CAS service and its configuration that is automatically discovered and configured by Traefik to note the expected port:

![image](https://user-images.githubusercontent.com/1205228/94336548-f1ab7100-fff0-11ea-8bdb-12dfb6053f41.png)

# HTTPS Setup

Setting up TLS is quite similar to previous steps. First, we need to make sure the correct protocol header that is passed from Traefik to CAS is defined as `https`:

```properties
server.tomcat.remoteip.protocol-header-https-value=https
```

Our `docker-compose.yml` file must be adjusted to turn on TLS, relevant ports and map volumes and certificates:

```yaml
version: '3.8'
services:
  cas:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cas.rule=HOST(`auth.example.org`)"
      - "traefik.http.services.cas.loadbalancer.server.port=8080"
      - "traefik.http.routers.cas.tls=true"

  traefik:
    image: traefik:v2.3.0
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "$PWD/traefik.toml:/etc/traefik/traefik.toml"
      - "$PWD/server.crt:/etc/traefik/server.crt"
      - "$PWD/server.key:/etc/traefik/server.key"
      - "$PWD/certificates.toml:/etc/traefik/certificates.toml"
```

The most notable differences are,

- The `traefik.http.routers.cas.tls` label enables TLS for the CAS service.
- Port `443` is now enabled to front HTTPS requests.
- We are mapping the server private key and certificate into the Traefik container to support HTTPS requests. Certificates and keys can be generated using `openssl` and Traefik also has excellent support for [Let's Encrypt](https://doc.traefik.io/traefik/https/acme/) and other ACME providers for automatic certificate generation.
- An additional `certificates.toml` how the above private key and certificate should be loaded by Traefik.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

The `certificates.toml` file simply points to the certificates that are mapped inside the Traefik container:

```toml
[[tls.certificates]] 
   certFile = "/etc/traefik/server.crt"
   keyFile = "/etc/traefik/server.key"

[tls.stores]
  [tls.stores.default]
    [tls.stores.default.defaultCertificate]
      certFile = "/etc/traefik/server.crt"
      keyFile  = "/etc/traefik/server.key"
```

Finally, we should adjust the Traefik configuration file to enable redirection from port `80` to `443` and specify how Traefik should load our certificate configuration file:

```toml
[entryPoints]
  [entryPoints.cas]
    address = ":80"
  [entryPoints.cas.http]
    [entryPoints.cas.http.redirections]
      [entryPoints.cas.http.redirections.entryPoint]
        to = "websecure"
        scheme = "https"
  [entryPoints.websecure]
    address = ":443"

[api]
insecure = true

[providers.file]
  filename = "/etc/traefik/certificates.toml"

[log]
level = "INFO"

[accessLog]

[providers]
  [providers.docker]
    exposedByDefault = true
```

# Build & Deploy

If you rebuild and launch the containers again, the Traefik dashboard should indicate that port `443` is enabled to serve secure traffic:

![image](https://user-images.githubusercontent.com/1205228/94336201-20741800-ffee-11ea-9875-ca13f2065f46.png)

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Of course, our router setup also should indicate that TLS is now activated:

![image](https://user-images.githubusercontent.com/1205228/94336226-51544d00-ffee-11ea-9874-c793a1c2a642.png)

At this point, you should be able to get to the CAS server using `https://auth.example.org/cas/login`.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)