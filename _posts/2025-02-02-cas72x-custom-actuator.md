---
layout:     post
title:      Apereo CAS - Building Custom Actuator Endpoints
summary:    Learn how to build your own actuator endpoints in Apereo CAS with Spring Boot.
tags:       ["CAS 7.2.x", "Monitoring", "REST", "Spring Boot"]
---

An **Actuator** endpoint is a basically a URL (or set of URLs) that provides operational information about your CAS deployment and allows you to control and modify certain aspects of the running system. It can be seen as a REST API that is controlled and created by Spring Boot and typically allows the same type of operations that you could expect from a *normal* REST API. 
{% include googlead1.html  %}

In a CAS context, some key differences between an actuator endpoint and a more traditional REST API would be:
{% include googlead1.html  %}

- Actuator endpoints can be conditionally enabled via CAS properties.
- Likewise, they can be conditionally *exposed* to the web or other communication channels.
- The security of an actuator endpoint and authorization rules can also be controlled via CAS properties

# Audience

This post attempts to review the steps needed to build a simple actuator endpoint in CAS and explains how one may be able to enable, expose, and secure the endpoint. Please note that this post is intended for Java developers with a basic-to-medium familiarity with Spring, Spring Boot, and Spring Webflow. This is **NOT** a tutorial to be used verbatim via copy/paste. Instead, it is a recipe for developers to extend CAS based on specialized requirements.
{% include googlead1.html  %}
This tutorial specifically requires and focuses on:

- CAS `7.2.x`
- Java 21
- [WAR Overlay](https://apereo.github.io/cas/development/installation/WAR-Overlay-Installation.html)

# Actuator Endpoint

We intend to build an endpoint, `/greeting?username=Patrick`, whose job is to greet the username given as a query parameter. We can start by putting together the body of the endpoint:

```java
@Endpoint(id = "greeting", defaultAccess = Access.NONE)
public class GreetingEndpoint extends BaseCasActuatorEndpoint {
    @ReadOperation
    public String greet(String username) {
        return "Hello " + username;
    }
}
```
{% include googlead1.html  %}
This allows us to call the endpoint via:

```bash
curl -X GET https://sso.example.org/cas/actuator/greeting?username=Patrick
```

We could make the username optional too:
{% include googlead1.html  %}
```java
@ReadOperation
public String greet(@Nullable String username) {
    return "Hello " + username;
}
```

Or alternatively, we could replace the query parameter with a path variable:
{% include googlead1.html  %}
```java
@ReadOperation
public String greet(@Selector String username) {
    return "Hello " + username;
}
```

This allows us to call the endpoint via:

```bash
curl -X GET https://sso.example.org/cas/actuator/greeting/patrick
```

If you prefer a more Spring-MVC type of approach, you could remodel the endpoint to match the following:
{% include googlead1.html  %}
```java
@Endpoint(id = "greeting", defaultAccess = Access.NONE)
public class GreetingEndpoint extends BaseCasRestActuatorEndpoint {
    @GetMapping(path = "/{username}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String greet(@PathVariable("username") final String username) {
        return "Hello " + username;
    }
}
```

# Bean Definition

Our endpoint needs to be created and registered with the Spring runtime and application context. To achieve this, we need to create the following `@Bean` definition:
{% include googlead1.html  %}
```java
@Bean
@ConditionalOnAvailableEndpoint
public GreetingEndpoint myGreetingEndpoint() {
    return new GreetingEndpoint();
}
```

`@ConditionalOnAvailableEndpoint` is important. It ensures that the endpoint bean can only be registered with the spring application context if it's enabled and turned on via CAS configuration.

# CAS Configuration

We need to instruct CAS to allow unrestricted access to the endpoint and make sure it's available as a web resource under HTTP. This can be achieved via the following:
{% include googlead1.html  %}
```properties
management.endpoint.greeting.access=UNRESTRICTED
management.endpoints.web.exposure.include=greeting
```

# Endpoint Security

So far, our endpoint is available over the web to anyone who can discover its existence. We can ensure the endpoint requires authenticated access using the following settings:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.endpoint.greeting.access=AUTHENTICATED
spring.security.user.name=...
spring.security.user.password=...
```

Clients of our endpoint are now expected to supply a username/password combination using the `Basic` authentication scheme to access the endpoint.

You might prefer a more sophisticated scheme to manage multiple and yet not too many authorized user accounts. One way to handle this would be to define the authorized accounts in a JSON file:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.json.location=file:/path/to/users.json
```

This option allows you to define a static list of users and passwords along with their roles in a JSON file. The JSON file should be formatted as follows:
{% include googlead1.html  %}
```json
[
  {
    "username": "casadmin",
    "password": "{sha512}...",
    "authorities": [
      "ROLE_ADMIN"
    ]
  },
  {
    "username": "casuser",
    "password": "{sha512}...",
    "authorities": [
      "ROLE_USER"
    ]
  }
]
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
