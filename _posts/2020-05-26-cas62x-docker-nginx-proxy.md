---
layout:     post
title:      Apereo CAS - Dockerized Deployment via NGINX
summary:    Learn how to run multiple CAS servers on a single VM using Docker, all behind an NGINX proxy.
published: true
tags:       [CAS]
---

<div class="alert alert-success"><i class="far fa-lightbulb"></i> This post is largely inspired by <a href="https://blog.ssdnodes.com/blog/host-multiple-websites-docker-nginx/">this guide.</a>
</div>

A [dockerized CAS deployment](/2020/01/31/cas6-docker-deployment/) allows one to run multiple CAS servers on a single VM, where each server might be configured differently to address different needs for authentication policy, attribute release, etc. To avoid conflicts and achieve better separation of concerns, we can use Docker and NGINX to host multiple CAS containers behind a proxy, in their isolated network and let the proxy offload the SSL context onto the Docker container running CAS and correctly route traffic. 

{% include googlead1.html  %}

As is pointed out by the [referenced guide](https://blog.ssdnodes.com/blog/host-multiple-websites-docker-nginx/),

> That’s exactly what nginx-proxy does: it listens to port 80 (the standard HTTP port) and forwards incoming requests to the appropriate container. This is often known as a reverse proxy, and takes advantage of Docker’s `VIRTUAL_HOST` variable.

Our starting position is as follows:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## NGINX Configuration

First, we need to create a Docker network that we will use to bridge all of these containers together.

```bash
docker network create nginx-proxy
```


{% include googlead1.html  %}

Then, let's run the proxy on port `80`:

```bash
# Run proxy on port 80
docker run -d -p80:80 --name nginx-proxy --net nginx-proxy -v \
    /var/run/docker.sock:/tmp/docker.sock jwilder/nginx-proxy
```

The bit about `/var/run/docker.sock:/tmp/docker.sock` is important. It gives the container access to the host’s Docker socket, which contains information about a variety of Docker events, such as creating a new container or shutting one down.

{% include googlead1.html  %}

As is pointed out by the [referenced guide](https://blog.ssdnodes.com/blog/host-multiple-websites-docker-nginx/),

> This means that every time you add a container, `nginx-proxy` sees the event through the socket, automatically creates the configuration file needed to route traffic, and restarts nginx to make the changes available immediately by looking for containers with the `VIRTUAL_HOST` variable enabled.

## CAS Configuration

Let's assume that our CAS container is going to be available via DNS at `foo.bar.com`. The easiest way, for now, would be to simply map this host  to `127.0.0.1` in your operating system's host file.

Then, in CAS overlay's `etc/cas/config/cas.properties` add the following lines:

```properties
# Allow X-Forward-Proto Header to handle port 80 and http
server.tomcat.protocol-header-https-value=http

# Run on port 80; disable SSL for now
server.port=80
server.ssl.enabled=false
```

When you are done, save the file and build the CAS docker image:

```bash
./docker-build.sh
```

{% include googlead1.html  %}

Once the image is built, run the container:

```bash
docker run -d --expose 80 --net nginx-proxy \
    -e VIRTUAL_HOST=foo.bar.com --name="cas" \
    org.apereo.cas/cas:v6.2.0-SNAPSHOT \
```

The proxy listens and adds an entry for the virtual host automatically to the NGINX config file, and restarts it for full effect. Also, note how the container is running in its isolated network via `--net nginx-proxy` sharing it with the NGINX proxy itself.


{% include googlead1.html  %}

Watch the CAS logs to make sure the server is ready:

```bash
docker logs -f cas
```

{% include googlead1.html  %}

...and then finally, test the configuration to validate how NGINX is proxying traffic onto the appropriate CAS container:

```bash
curl -k -v -I http://foo.bar.com/cas/login
```

## SSL Configuration

Once you have configured NGINX and the proxy to handle SSL and certificates, you also need to make sure this property accounts for those changes in CAS:

```properties
server.tomcat.protocol-header-https-value=https
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)