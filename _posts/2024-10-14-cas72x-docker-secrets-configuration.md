---
layout:     post
title:      Apereo CAS - Configuration Security with Docker Secrets
summary:    Learn how to load CAS configuration settings from Docker secrets.
tags:       ["CAS 7.2.x", "Docker", "Configuration Management"]
---

If your CAS server is deployed and running as a Docker container, you may want to manage and store certain sensitive configuration settings as Docker secrets.Such secrets are a blob of data, such as a password, private keys, or another piece of data that should not be transmitted over a network or stored unencrypted in a Dockerfile or in CAS configuration sources in plaintext. 

{% include googlead1.html  %}

In this post, we will take a look at options provided by CAS that allow one to pull settings from Docker secrets. Our starting position is based on:

- CAS `7.2.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Docker Secrets

In terms of Docker Swarm services, a secret is a blob of sensitive data that should not be transmitted over a network or stored unencrypted in a Dockerfile or put in CAS configuration sources in plain text. You can use Docker secrets to centrally manage this data and securely transmit it to only CAS containers that need access to it. Secrets are encrypted during transit and at rest in a Docker swarm. A given secret is only accessible to those CAS services which have been granted explicit access to it, and only while those CAS service tasks are running.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>Docker secrets are only available to swarm services, not to standalone CAS containers. To use this feature, consider adapting your CAS container to run as a service. Stateful CAS containers can typically run with a scale of 1 without changing the container code.
</div>

The CAS integration with Docker secrets works by scanning configuration properties that are found by default at `/run/secrets`. The properties are then loaded into CAS and made available to the application context and its environment. This default configuration directory
can be configured via the system property (or environment variable) `CAS_DOCKER_SECRETS_DIRECTORY`.
{% include googlead1.html  %}
Note that the filenames of the secrets must match the property names that CAS expects. For example,
your secret might be named `/run/secrets/cas.some.fancy.setting` with a sensitive value. At runtime, CAS
will attempt to locate and read the secret from the file and apply it to the setting `cas.some.fancy.setting`.
{% include googlead1.html  %}
To activate this configuration mode, you will need to make sure `CONTAINER` is set to `true` either as an environment
variable or a system property when the container launches. This setting is used to determine whether CAS is running inside a container
and will activate the Docker-relevant configuration source.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
