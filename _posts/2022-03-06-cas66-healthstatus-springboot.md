---
layout:     post
title:      Apereo CAS - Keeping Healthy with Spring Boot
summary:    Learn how you may keep your Apereo CAS deployment healthy, monitoring its status using Spring Boot actuator endpoints and health indicators.
tags:       ["CAS 6.5.x", "Monitoring"]
---

Apereo CAS, being a Spring-Boot application at heart, includes several endpoints to help you monitor and manage the server when it’s pushed to production. You can choose to manage and monitor the deployment using HTTP endpoints, referred to as *actuators*. This tutorial provides a basic overview of the `health` and `status` endpoints provided by both Spring Boot and CAS and also provides instructions on how such endpoints can be secured for access and win.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.5.x`
- Java `11`
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Overview

CAS has traditionally presented a `status` endpoint, now at `/actuator/status`, which provides the user with basic server information and reports from all `Monitor` components; those that reported back on memory usage, connection information, etc. Having switched to Spring Boot, such components are transformed to use the native Spring Boot API known as `HealthIndicator`s, and the `status` endpoint is mostly kept for legacy reasons and backward compatibility. The `status` endpoint now simply acts as a proxy by invoking the `health` endpoint internally to obtain and present data. If the `health` endpoint is turned off, you would only receive basic and very modest health data from `status` itself.

More information about the health endpoint and high-level notes discussing the monitoring capabilities of the Apereo CAS server can be [found here](https://apereo.github.io/cas/6.5.x/monitoring/Monitoring-Statistics.html).

## Configuration

Let's try to enable both `status` and `health` first. First, we should make sure the correct modules are included in our CAS build:

```groovy
dependencies {
  implementation "org.apereo.cas:cas-server-support-reports"
  implementation "org.apereo.cas:cas-server-core-monitor"
}
```

Then, the following settings should come in handy:

{% include googlead1.html  %}
```
management.endpoints.web.exposure.include=status,health

management.endpoint.status.enabled=true
management.endpoint.health.enabled=true

cas.monitor.endpoints.endpoint.defaults.access[0]=IP_ADDRESS
cas.monitor.endpoints.endpoint.defaults.required-ip-addresses[0]=127\\.0\\.0\\.1

management.endpoint.health.show-details=always
```

The above collection of settings instructs CAS to:

- Expose `status` and `health` over the web as HTTP endpoints.
- Enable them both and ensure access to all endpoints by default is protected by IP addresses that match the given regular expression pattern.
- Ensure the `health` endpoint can always produce details from internal monitors and health indicators.

If you invoke the `status` endpoint using `curl https://sso.example.org/cas/actuator/status | jq`:
{% include googlead1.html  %}
```json
{
  "status": 200,
  "description": "OK",
  "health": "UP",
  "host": "misaghmoayyed",
  "server": "https://sso.example.org",
  "version": "6.1.0-RC2-SNAPSHOT - ..."
}
```

Simple stuff. Let's invoke `health` with `curl https://sso.example.org/cas/actuator/health | jq`:

```json
{
  "status": "UP",
  "details": {
    "memory": {
      "status": "UP",
      "details": {
        "freeMemory": 4066209416,
        "totalMemory": 4294967296
      }
    }
  }
}
```

Notice how `details` are *always* returned in the response where we are getting data from one health indicator, reporting on memory usage and statistics.

## Health Indicators

The `health` endpoint provided by Spring Boot is set to check the status of your running CAS server. It is often used by monitoring software to alert someone when a production system goes down. Health information is collected from the content of a *registry* that has collected, at runtime, reports from `HealthIndicator` components and monitors.  
{% include googlead1.html  %}
Spring Boot includes several auto-configured `HealthIndicator`s and CAS presents a few of its own. The final system state is derived by an *aggregator* which sorts the statuses from each `HealthIndicator` based on an ordered list of statuses. The first status in the sorted list is used as the overall health status.

<div class="alert alert-warning">
  <strong>Hey!</strong><br/>If you have monitoring software that tries to check for CAS server status by continuously invoking the <code>/login</code> endpoint, stop doing that. You should be using <code>status</code> or <code>health</code> instead.
</div>

Note that all health indicators (except the `memoryHealthIndicator`) are turned off by default whose capability can be individually controlled. For instance, we could turn off the memory monitor via:

```properties
management.health.memoryHealthIndicator.enabled=false
```

<div class="alert alert-info">
  <strong>Note</strong><br/>Unlike the normal convention of CAS properties and settings, the name of the health indicator components, i.e. <code>memoryHealthIndicator</code> must be defined in camel-case mode. This is mainly because we are here referring to the name of an internal components, and not specifically a CAS (or Spring Boot) property.
</div>

With the above setting, if you try to invoke the `health` endpoint again you may see:

```json
{
  "status": "UP",
  "details": {
    "application": {
      "status": "UP"
    }
  }
}
```
{% include googlead1.html  %}
...where details on memory usage are now removed, given the monitor underneath, is disabled.

There are many other health indicators available to choose from, that are either offered by CAS or by Spring Boot that will show up or become available when the right extension module is included in the CAS build. 

Some of the more interesting ones are listed here:

- `diskSpaceHealthIndicator`
- `duoSecurityHealthIndicator`
- `hazelcastHealthIndicator`
- `redisHealthIndicator`
- `dataSourceHealthIndicator`
- `mailHealthIndicator`
- `samlRegisteredServiceMetadataHealthIndicator`
- `sessionHealthIndicator`
- `config`
- `refresh`
- `ping`

If you'd like to learn more details about this topic, see the [Spring Boot documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html#production-ready-health).

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
