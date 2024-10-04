---
layout:     post
title:      Apereo CAS - Externalized Log4j2 Configuration via Spring Boot
summary:    Learn how to control and externalize your Log4j2 configuration using Spring's Environment
tags:       ["CAS 7.2.x", "Spring Boot"]
---

The primary logging technology and framework in Apereo CAS deployments is backed by [Apache Log4j](https://logging.apache.org/log4j/2.x/). This is a versatile, industrial-grade logging framework composed of an API, its implementation, and components to assist CAS deployments for many advanced use cases. The main log configuration file presents itself as a `log4j2.xml` file that contains various elements that control how data is captured and at which level, where that data is sent and how it's transformed etc.

{% include googlead1.html  %}

In this post, we'll take a look at how configuration settings and properties found in the `log4j2.xml` file can be externalized using a Spring-managed `Environment`. Our starting position is based on:

- CAS `7.2.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Spring's Environment

In a CAS deployment, all application settings are managed and loaded via Spring Boot using `PropertySource` components. Such settings can come from anywhere, really, and are most often housed inside a flat `cas.properties` file commonly found at `/etc/cas/config`. This file, among many other things, could for example, control the location of the logging configuration file:
{% include googlead1.html  %}
```properties
logging.config=file:/etc/cas/config/log4j2.xml
```

Regardless of where configuration properties are and their owner or source, all settings eventually are packaged inside a Spring *container* called the `Environment`. This is the main entry point for an application such as CAS to figure out what settings are loaded and how they may be fed into various other components. For example, you can ask the `Environment` to tell you the value assigned to the `logging.config` configuration key:
{% include googlead1.html  %}
```java
var config = environment.getProperty("logging.config");
```

What we want here is the ability to use the same construct when configuring settings inside the `log4j2.xml` file.

# Logging Configuration

Elements defined in the `log4j2.xml` file can be tweaked and adjusted using a variety of settings. For example, you may want to control the logging level of a particular namespace:
{% include googlead1.html  %}
```xml
<Logger name="org.apereo.cas" level="info" />
```

If you want to refer to properties from the Spring Environment, you can use `spring:` prefixed lookups. Doing so can be useful if you want to access values from the `cas.properties` file or any other configuration source in the Log4j2 configuration. For example, let's imagine that we have the following property defined in `cas.properties`:
{% include googlead1.html  %}
```properties
my.log.level=warn
```

To reference this setting in the logging configuration file, we can use:
{% include googlead1.html  %}
```xml
<Logger name="org.apereo.cas" level="${spring:my.log.level}" />
```

This construct works with any and all other settings whose value can be derived from an existing configuration key in the Spring `Environment`. Remember that the lookup key, such as `my.property-name`, should be specified in the kebab case when needed.

# Framework Support

Log4j's *Lookup* support for Spring and Spring Boot is, in fact, offered out of the box by Spring Boot, and there is no other change to make or dependency to include. However, this was not always the case. To be exact, CAS versions that rely on Spring Boot `2.x` do require the external dependency `org.apache.logging.log4j:log4j-spring-boot`, and this, unfortunately, ships by default with newer CAS versions. If your CAS version is based on Spring Boot `3.x`, such as any version of CAS `7.x` and beyond, you need to make sure to remove and exclude this dependency from your Gradle build. 
{% include googlead1.html  %}
Note that while this *may* work as is even with the external dependency included, not doing so *could* cause a conflict between the external dependency and what ships now out of the box. The `org.apache.logging.log4j:log4j-spring-boot` will be eventually removed from newer CAS releases or upcoming patch releases that are still in maintenance and rely on Spring Boot `3.x.`

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
