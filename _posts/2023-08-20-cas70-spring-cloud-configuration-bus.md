---
layout:     post
title:      Apereo CAS - Distributed Configuration Management w/ Spring Cloud Bus
summary:    Learn how to manage CAS configuration changes in distributed deployments using Spring Cloud, Spring Cloud Bus, and RabbitMQ.
tags:       ["CAS 7.0.x", "Spring Cloud"]
---

CAS uses the Spring Cloud Bus to manage configuration in a distributed deployment. Spring Cloud Bus links nodes of a distributed system with a lightweight message broker. This can then be used to broadcast state changes (e.g. configuration changes) or other management instructions. In this post, we will briefly look at the configuration steps required to apply changes in one CAS server environment and have those changes be broadcasted and distributed to other CAS nodes in the same cluster.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `7.0.x`
- Java `21`

# Initial Setup

Spring Cloud Bus supports sending messages to all CAS nodes listening. Broadcasted events will attempt to update, refresh and reload each CAS server application’s configuration. The key idea here is that the bus is like a distributed, scaled-out `refresh` actuator for CAS. The underlying communication and transport channel for the Bus is backed by an AMQP broker or Apache Kafka.

The initial setup requires the following module to be present in a CAS build:
{% include googlead1.html  %}
```groovy
implementation "org.apereo.cas:cas-server-support-configuration-cloud-amqp"
```

Then, we will need to configure CAS to have access to the AMQP broker, such as RabbitMQ:

```properties
spring.rabbitmq.host=...
spring.rabbitmq.port=...
```

...and finally, we shall enable Spring Cloud Bus:
{% include googlead1.html  %}
```properties
spring.cloud.bus.enabled=true
spring.cloud.bus.refresh.enabled=true
```

# Actuator Endpoints

The bus currently supports sending messages to all CAS nodes listening. The `/bus/*` actuator namespace has some HTTP endpoints. Currently, two are implemented. The first, `/bus/env`, sends key/value pairs to update each CAS node’s application Environment. The second, `/bus/refresh`, reloads each CAS server's configuration, as though they had all been pinged on their `/refresh` endpoint.

# Overview 

Once the `busrefresh` actuator endpoint is also enabled, CAS will be able to get the latest configuration from its configuration sources and update all refreshable components, sending a message to AMQP exchange informing about configuration change and refresh event. Then, all subscribed CAS nodes will update their configuration as well. The `busrefresh` actuator endpoint effectively broadcasts a `RefreshRemoteApplicationEvent` type of event. This allows each CAS node to update its configuration without restarting and without explicit refresh requests almost simultaneously. The arrival of refresh events can usually be verified via CAS server logs as well:
{% include googlead1.html  %}
```bash
o.s.cloud.bus.event.RefreshListener: Received remote refresh request. Keys refreshed [...]
```

Note that each CAS server node will automatically be assigned a service ID, whose value can be set with `spring.cloud.bus.id` and whose value is expected to be a colon-separated list of identifiers, in order from least specific to most specific. The default value is constructed from the environment as a combination of the `spring.application.name` and `server.port` (or `spring.application.index`, if set).
{% include googlead1.html  %}
The HTTP endpoints accept a `destination` path parameter, such as `/bus-refresh/cas:1234` where the destination is a service ID. If the ID is owned by the CAS instance on the bus, it processes the message, and all other CAS instances ignore it. Alternatively, `/bus-env/cas:**` targets all CAS instances of the `cas` service regardless of the rest of the service ID. You might need to make sure service IDs are always unique. If multiple instances of a CAS deployment have the same ID, events are not processed. 

Note that Bus events can be traced by setting `spring.cloud.bus.trace.enabled=true`. If you do so, such events are captured internally and then can be reproduced via the `/trace` actuator endpoint.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html