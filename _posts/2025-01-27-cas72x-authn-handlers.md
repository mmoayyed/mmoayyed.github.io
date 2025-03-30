---
layout:     post
title:      Apereo CAS - Customized Authentication Strategy
summary:    Master writing custom authentication handlers in CAS to verify user identity from custom account stores and observe the operations using Micrometer to collect metrics and statistics for better troubleshooting and monitoring.
tags:       ["CAS 7.2.x", "Authentication", "Monitoring"]
---

While [authentication support](https://apereo.github.io/cas/7.2.x/authentication/Configuring-Authentication-Components.html)
in CAS for a variety of systems is somewhat comprehensive and complex, a common deployment use case
is the task of designing custom authentication schemes.

{% include googlead1.html  %}

This post:

- Describes the necessary steps needed to design and register a custom authentication strategy (i.e. `AuthenticationHandler`).
- Shows you how the authentication attempt can be monitored and *observed* using the Micrometer Observation API and collect metrics.

# Audience

This post is intended for Java developers with a basic-to-medium familiarity with Spring, Spring Boot, and Spring Webflow. This is **NOT** a tutorial to be used verbatim via copy/paste. It is instead a recipe for developers to extend CAS based on specialized requirements.

This tutorial specifically requires and focuses on:

- CAS `7.2.x`
- Java 21
- [WAR Overlay](https://apereo.github.io/cas/7.2.x/installation/WAR-Overlay-Installation.html)

# Customized Authentication

The overall tasks may be categorized as such:
{% include googlead1.html  %}
1. Design the authentication handler
2. Register the authentication handler with the CAS authentication engine.
3. Tell CAS to recognize the registration record and authentication configuration.

<div class="alert alert-success">
<strong>Collaborate</strong><br/>Before stepping into a development mode, consider whether your choice of authentication handler or attribute repository implementation may be contributed back to CAS as a first-class feature, specially if the system with which you are interfacing is somewhat mainstream, robust and in reasonable demand.</div>

## Design Authentication Handlers

The first step is to define the skeleton for the authentication handler itself. This is the core principal component whose job is to declare support for a given type of credential only to then attempt to validate it and produce a successful result. The core parent component from which all handlers extend is the `AuthenticationHandler` interface.
{% include googlead1.html  %}
With the assumption that the type of credentials used here deal with the traditional username and password, noted by the infamous `UsernamePasswordCredential` below, a more appropriate skeleton to define for a custom authentication handler may seem like the following:
{% include googlead1.html  %}
```java
public class MyAuthenticationHandler extends AbstractUsernamePasswordAuthenticationHandler {
    ...
    @Override
    protected AuthenticationHandlerExecutionResult authenticateUsernamePasswordInternal(
        final UsernamePasswordCredential credential,
        final String originalPassword) {
        
        if (everythingLooksGood()) {
            return createHandlerResult(credential,
                principalFactory.createPrincipal(username), 
                new ArrayList<>());
        }
        throw new FailedLoginException("Sorry, you have failed!");
    }
    ...
}
```

Note that:

- `AuthenticationHandler`s have the ability to produce a fully resolved principal along with attributes. If you have the ability to retrieve attributes from the same place as the original user/principal account store, the final `Principal` object that is resolved here must then be able to carry all those attributes and claims inside it at construction time.

{% include googlead1.html  %}

- The last parameter, `new ArrayList<>()`, is effectively a collection of warnings that are eventually worked into the authentication chain and conditionally shown to the user. Examples of such warnings include password status nearing an expiration date, etc.
- Authentication handlers also have the ability to block authentication by throwing a number of specific exceptions. A more common exception to throw back is `FailedLoginException` to note authentication failure. Other specific exceptions may be thrown to indicate abnormalities with the account status itself, such as `AccountDisabledException`.
{% include googlead1.html  %}
- Various other components such as `PrincipalNameTransformer`s, `PasswordEncoder`s and such may also be injected into our handler if need be, though these are skipped for now in this post for simplicity.

## Register Authentication Handlers

Once the handler is designed, it needs to be registered with CAS and put into the authentication engine.
This is done via the magic of `@AutoConfiguration` classes that are picked up automatically at runtime, per your approval,
whose job is to understand how to dynamically modify the application context.

So let's design our own `@AutoConfiguration` class:
{% include googlead1.html  %}
```java
package com.example.cas;

@AutoConfiguration
@EnableConfigurationProperties(CasConfigurationProperties.class)
public class MyAuthenticationConfiguration {

    @Bean
    public AuthenticationHandler myAuthenticationHandler() {
        var handler = new MyAuthenticationHandler();
        /*
            Configure the handler by invoking various setter methods.
            Note that you also have full access to the collection of resolved CAS settings.
            Note that each authentication handler may optionally qualify for an 'order`
            as well as a unique name.
        */
        return handler;
    }

    @Bean
    public AuthenticationEventExecutionPlanConfigurer authenticationConfigurer(
        @Qualifier("myAuthenticationHandler")
        final AuthenticationHandler myAuthenticationHandler) {
        return plan -> plan.registerAuthenticationHandler(myAuthenticationHandler);
    }
}
```

## Register Auto Configuration

Now that we have properly created and registered our handler with the CAS authentication machinery, we just need to ensure that CAS is able to pick up our special configuration. To do so, create a `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` file and reference the configuration class in it as such:
{% include googlead1.html  %}
```
com.example.cas.MyAuthenticationConfiguration
```

Note that the configuration registration step is not of CAS doing. It's a mechanism provided to CAS via [Spring Boot](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-developing-auto-configuration.html)
and it's an efficient way to pick up and register components into the runtime application context without the additional overhead of component-scanning and such.

{% include googlead1.html  %}

At runtime, CAS will try to automatically detect all components and beans that advertise themselves as `AuthenticationEventExecutionPlanConfigurer`s. Each detected component is then invoked to register its own authentication execution plan. The result of this operation at the end will produce a ready-made collection of authentication handlers that are ready to be invoked by CAS in the given order defined if any.

# Observations

Observability allows you to understand the internals of the system using metrics, logging, and distributed tracing. Ultimately, this combination gives you the ability to reason about the state of your deployment in order to debug exceptions and latency. This task is handled by [Micrometer](https://micrometer.io/) and particularly its *Observation API* which help you to instrument code once using a single API and have multiple benefits out of it (e.g. metrics, tracing, logging).
{% include googlead1.html  %}
CAS already observes a large number of its own internal operations when it comes to managing the webflow, authentication attempts, loading applications and more. Specific metrics are collected for each operation using the Micrometer Observation API and are available for various reporting tasks. To handle this, you will need to include the following modules at a minimum in your CAS build:
{% include googlead1.html  %}
```gradle
...
dependencies {
    ...
    implementation "org.apereo.cas:cas-server-support-reports"
    implementation "org.apereo.cas:cas-server-support-metrics"
}
...
```

Furthermore, you will need to expose, enable and authorize access to the `metrics` actuator endpoint:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.endpoint.defaults.access=ANONYMOUS
management.endpoint.metrics.enabled=true
management.endpoints.web.exposure.include=metrics
```

<div class="alert alert-warning">
  <strong>WATCH OUT!</strong><br/>The above collection of settings <strong>MUST</strong> only be used for demo purposes and serve as an <strong>EXAMPLE</strong>. It is not wise to enable and expose all actuator endpoints to the web and certainly, the security of the exposed endpoints should be taken into account very seriously.
</div>
{% include googlead1.html  %}
The above changes should allow you access to the `metrics` endpoint at `https://sso.example.org/cas/actuator/metrics`. The collection of metrics that are produced can be further examined via `https://sso.example.org/cas/actuator/metrics/<metric-name>`. This helps you gain valuable insights into the operational state of your CAS server and helps with troubleshooting, performance tuning, and ensuring high availability.

# Micrometer Observation API

To observe our authentication attempts and collect metrics, we need to integrate with the Micrometer Observation API. This needs to be done by injecting an `ObservationRegistry` (supplied by Spring Boot automatically) into our authentication handler:
{% include googlead1.html  %}
```java
@Bean
public AuthenticationHandler myAuthenticationHandler(ObservationRegistry or) {
    var handler = new MyAuthenticationHandler(or);
    return handler;
}
```

Then our `AuthenticationHandler` will have to start the observation before validating user credentials:
{% include googlead1.html  %}
```java
private final ObservationRegistry registry;
...
@Override
protected AuthenticationHandlerExecutionResult authenticateUsernamePasswordInternal(
    final UsernamePasswordCredential credential,
    final String originalPassword) {
    
    return Observation.createNotStarted("my.authentication", registry)
        .contextualName("authenticating-user")
        .lowCardinalityKeyValue("type", "usernamePasswordAuthN") 
        .highCardinalityKeyValue("userId", credential.getUsername())
        .observe(() -> {
            // This is where authentication should happen
            // and you would return the result back...
        }); 
}
...
```

A few points:

- `my.authentication` is a "technical" name that does not depend on the context. It will be used to name e.g. Metrics
- Low cardinality means that the number of potential values won't be big. Low cardinality entries will end up in e.g. Metrics. It means that a key value will have a bounded number of possible values
{% include googlead1.html  %}
- High cardinality means that the number of potential values can be large. High cardinality entries will end up in e.g. Spans. It means that a pair will have an unbounded number of possible values. 
- `authenticating-user` is a "contextual" name that gives more details within the provided context. It will be used to name e.g. Spans

Now, once you have passed through a number of authentication attempts you can browse metrics data via `https://sso.example.org/cas/actuator/metrics/my.authentication`.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
