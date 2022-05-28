---
layout:     post
title:      Apereo CAS - Dockerized Deployments
summary:    Review a number of strategies that allow to run CAS Docker images and configure settings inside the running Docker container.
tags:       ["CAS 6.5.x", "Docker"]
---

Apereo CAS publishes [Docker images](https://hub.docker.com/r/apereo/cas/) typically for every release. The docker images that are hosted on Docker Hub are mostly meant to be used as quickstarts and demos and might be paticularly useful for integration tests, application developers, or those who wish to build client libraries for a given framework. You may also be able to use them as base images to add your customizations into the image. In this post, we will take a brief look at how one might be able to pull and run such containers and configure them for appropriate use.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.5.x`
- Java 11
- [Docker](https://www.docker.com/get-started)

## Running Docker Container

A dockerized CAS deployment is an existing [CAS overlay project](https://github.com/apereo/cas-overlay-template) that is wrapped by Docker. Similar to the overlay project, the Docker image also ships with an embedded Apache Tomcat container that would host CAS, and expects to run on a secure port backed by a configured keystore. Prior to running the Docker image, you need to create and configure keystore first. 

This can be done using the following `docker.sh` script:
{% include googlead1.html  %}
```bash
#!/bin/bash

if [[ -z "${CAS_KEYSTORE}" ]] ; then
  keystore="$PWD"/thekeystore
  echo -e "Generating keystore for CAS Server at ${keystore}"
  dname="${dname:-CN=localhost,OU=Example,OU=Org,C=US}"
  subjectAltName="${subjectAltName:-dns:example.org,dns:localhost,ip:127.0.0.1}"
  [ -f "${keystore}" ] && rm "${keystore}"
  keytool -genkey -noprompt -alias cas -keyalg RSA \
    -keypass changeit -storepass changeit \
    -keystore "${keystore}" -dname "${dname}"
  [ -f "${keystore}" ] && echo "Created ${keystore}"
  export CAS_KEYSTORE="${keystore}"
else
  echo -e "Found existing CAS keystore at ${CAS_KEYSTORE}"
fi

docker stop casserver || true && docker rm casserver || true
echo -e "Mapping CAS keystore in Docker container to ${CAS_KEYSTORE}"
docker run --rm -d \
  --mount type=bind,source="${CAS_KEYSTORE}",target=/etc/cas/thekeystore \
  -p 8444:8443 --name casserver apereo/cas:6.5.4
docker logs -f casserver &
echo -e "Waiting for CAS..."
until curl -k -L --output /dev/null --silent --fail https://localhost:8444/cas/login; do
  echo -n .
  sleep 1
done
echo -e "\nCAS Server is running on port 8444"
echo -e "\n\nReady!"
```

The script attempts to execute the following tasks:
{% include googlead1.html  %}
- Creates a keystore with a self-signed key and mounts that keystore into the Docker container.
- Starts the CAS Docker container in the background and maps the container port `8443` to the host port `8444`.
- Outputs CAS logs to the console using the `docker logs` command.
- Waits for the CAS container to start up and become available at `https://localhost:8444/cas/login`

<div class="alert alert-info">
<strong>CAS Version</strong><br />While the above instructions use Apereo CAS <code>6.5.4</code>, you may be able to use any other CAS version as the base Docker image for your tests. Previous release lines and CAS versions should continue to work in exactly the same way.</div>

## Container Configuration

The running CAS instance inside the container can pick up its own settings using a variety of ways, one of which would be using the `SPRING_APPLICATION_JSON` environment variable that is parsed and understood by Spring Boot. This environment variable may contain an *inlined JSON* document to pass properties and settings to the application.
{% include googlead1.html  %}
We can define the contents of `SPRING_APPLICATION_JSON` to handle the following:

- Adjust the CAS root logging level to `debug` so we can get more details from the running CAS web application.
- Rename the CAS SSO cookie to `SSO_COOKIE`.
- Allow the service registry instance to initialize and bootstrap itself from embedded JSON files that ship with CAS.
- Disable the schedule for the service registry loader, preventing from reloading JSON files.

These options translate to the following structure:

```bash
properties='{
  "logging": {
    "level": {
      "org.apereo.cas": "debug"
    }
  },
  "cas": {
    "tgc": {
      "name": "SSO_COOKIE"
    },
    "service-registry": {
      "core": {
        "init-from-json": true
      },
      "schedule": {
        "enabled": false
      }
    }
  }
}'
properties=$(echo "$properties" | tr -d '[:space:]')
echo -e "***************************\nCAS properties\n***************************"
echo "${properties}" | jq
```

At this stage, we can pass the `SPRING_APPLICATION_JSON` environment variable to the running Docker container and have it pick up our properties:
{% include googlead1.html  %}
```bash
docker run --rm -d \
  --mount type=bind,source="${CAS_KEYSTORE}",target=/etc/cas/thekeystore \
  -e SPRING_APPLICATION_JSON="${properties}" \
  -p 8444:8443 --name casserver apereo/cas:6.5.4
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
