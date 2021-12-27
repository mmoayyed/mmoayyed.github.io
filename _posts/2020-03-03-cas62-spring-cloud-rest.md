---
layout:     post
title:      Apereo CAS - Bootstrapping Configuration via REST
summary:    Bootstrapping the CAS application context using external REST APIs, while taking advantage of Spring Cloud's ability to dynamically refresh and reload settings.
tags:       ["CAS 6.2.x", "Spring Cloud", "REST"]
---

Since the adoption of Spring Boot and Spring Cloud, Apereo CAS could bootstrap its running application context using a variety of external property and settings sources such as the [Spring Cloud Configuration Server](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Server-Management.html) as well as MongoDb, JDBC, etc. In this walkthrough, we will take a look at how a given CAS server can bootstrap itself using an [external REST API](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Server-Management.html#rest) to auto-configure features and behavior while also keeping the ability to dynamically reload the configuration at runtime and on-demand.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.2.x`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- Java 11

## Configuration

To bootstrap the CAS application context using a REST API, the following dependencies must first be included in the Overlay:

```groovy
implementation "org.apereo.cas:cas-server-support-configuration-cloud-rest:${casServerVersion}"
implementation "org.apereo.cas:cas-server-core-events-configuration:${casServerVersion}"
```

The above modules allow the CAS server to bootstrap and initialize itself with settings fetched from a REST endpoint while also allowing the system to intercept configuration events and reload/refresh itself dynamically when requested via Spring Cloud Actuator endpoints.

Of course, the location of our yet-to-be-designed REST API can be passed along as a system property when running the Overlay:

```bash
./gradlew build run -Dcas.spring.cloud.rest.url=https://rest.example.io/casproperties
```

The default expectation is for CAS to reach out to the endpoint via `GET` and receive a collection of settings paired as `key=value`. At this point, we are ready to design our REST endpoint.

## REST API

Our `/casproperties` endpoint quite simply is going to produce a collection of settings which are valid and recognizable by CAS or any other library/framework used by the system such as Spring Cloud, Spring Security, etc. At a minimum, let's have our endpoint return the following settings:

```json
{
    "cas.monitor.endpoints.endpoint.defaults.access": "AUTHENTICATED",

    "management.endpoints.web.exposure.include": "*", 
    "management.endpoints.enabled-by-default": "true",

    "spring.security.user.name": "casuser",
    "spring.security.user.password": "Mellon",
    
    "server.port": 8080,
    "server.ssl.enabled": false,
    
    "logging.level.org.apereo.cas": "trace"
}
```

Using the above settings, our REST API is going to dictate the following behavior to CAS:

1. Expose and enable all actuator endpoints.
2. Require basic authentication with credentials `casuser/Mellon` for secure access to all endpoints.
3. Run the server on port `8080` with SSL disabled.
4. Turn up logging for `org.apereo.cas` to `trace`.

<div class="alert alert-info">
<strong>Security</strong><br/>Note that while out of scope for this review, sensitive values in payload can always be obfuscated and encrypted using CAS-accepted ciphers and strategies.
</div>

As you observe, the produced settings are a combined mix of those controlled by CAS and some provided by Spring Boot. When you run CAS, at a minimum you should see the following in the application logs:

```bash
...
INFO [o.s.b.w.e.t.TomcatWebServer] - <Tomcat initialized with port(s): 8080 (http)>
...
```

...where the running server would be available at `http://localhost:8080/cas/login`.

## Refresh & Reload

The CAS server can dynamically alter itself once it receives *a refresh request*. Using this strategy, one can modify values and settings in the configuration store (backed by our REST API) and then send a notification request to the CAS server to update its state. The configuration management, retrieval and *refreshability* of components are all managed by Spring Cloud and family.

As an example, let's modify our REST API to produce the following:

```json
{
    "cas.monitor.endpoints.endpoint.defaults.access": "AUTHENTICATED",

    "management.endpoints.web.exposure.include": "*", 
    "management.endpoints.enabled-by-default": "true",

    "spring.security.user.name": "casuser",
    "spring.security.user.password": "Mellon",
    
    "server.port": 8080,
    "server.ssl.enabled": false,
    
    "logging.level.org.apereo.cas": "info",
    "logging.level.org.springframework.boot": "debug"
}
```

The new settings are more or less the same with the following notable differences:

- We enabled `debug` logging for `org.springframework.boot`.
- We updated the logging level to `info` for `org.apereo.cas`.

Once changes are saved, the CAS server can begin to refresh its state to collect and rejuvenate the application context via:

```bash
curl -k -u casuser:Mellon http://localhost:8080/cas/actuator/refresh -d {} -H "Content-Type: application/json"
```

The response should outline the collection of settings that were affected and refreshed.

## How?

Throughout the CAS codebase, components designed as Spring `@Bean`s that are marked as `@RefreshScope` will get special treatment when there is a configuration change. Refresh scope beans are lazy proxies that initialize when they are used and the scope acts as a cache of initialized values. Tagging a bean as *Refreshable* allows the Spring infrastructure to invalidate and clear its cached version where the invalidation operation can either be done globally or for a specific bean by its name. This functionality is exposed to the `/refresh` endpoint (over HTTP or JMX). 

To learn more, please review [the Spring Cloud documentation](https://cloud.spring.io/spring-cloud-static/spring-cloud.html#_refresh_scope).

## What Else?

- Spring Cloud also presents the ability to distribute the refresh request, if the receiving application (CAS) is distributed in a clustered deployment. This is managed using the Spring Cloud Bus.

- Components that can be refreshed are marked with `@RefreshScope` judiciously. Not every component has to be refreshable and certain beans should not be reloadable anyway. A bean's ability to reload its state must be a privilege and not a right. 


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)