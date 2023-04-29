---
layout:     post
title:      Apereo CAS - Customizing Configuration Security
summary:    Learn how to load encrypted configuration settings into Apereo CAS using your customized encryption strategy.
tags:       ["CAS 7.0.x", "Configuration Management", "Spring Cloud", "Jasypt"]
---

A good number of Apereo CAS settings and properties may carry sensitive values. Database passwords, API tokens, and various other secrets need to be protected and secured first and then taught to CAS in a way that it can decode and process those values when connections and requests to those systems are made. While there are multiple ways to handle [configuration security](https://apereo.github.io/cas/development/configuration/Configuration-Properties-Security.html) with CAS, it's entirely possible that you might have your custom and unique way of handling CAS properties and need a way to allow CAS to learn and decrypt properties using your security strategy.

{% include googlead1.html %}

In this post, we will take a brief look at how CAS may be customized to decrypt secured properties on the fly. Our starting position is:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Configuration values and properties in Apereo CAS are ultimately managed internally via the Spring Cloud `PropertySource` components, which are responsible to connect with different sources and loading settings into the CAS runtime and ultimately the Spring application context. While settings are initially loaded, they may pass through a configuration *cipher* whose job is to examine settings and values and decide, conditionally, whether a property needs to be decrypted. If so, the cipher is given the chance to decrypt the property and pass the result back to the calling `PropertySource`.

To tap into this process, you need to design your cipher by first defining an `@AutoConfiguration` class and registering it with Spring Cloud:
{% include googlead1.html %}
```properties
org.springframework.cloud.bootstrap.BootstrapConfiguration=org.example.MyConfiguration
```

Your auto-configuration class would look similar to the following:

```java
@AutoConfiguration
public class MyConfiguration {
}
```
{% include googlead1.html %}
Next comes your own `CipherExecutor` bean definition and implementation:

```java
@Bean
public CipherExecutor<String, String> casConfigurationCipherExecutor(
    final Environment environment) {
    return new MyCipherExecutor(environment);
}
```
{% include googlead1.html %}
Your cipher needs to implement `MyCipherExecutor#decode(Map, Object[])`. It receives a `Map` which contains all the properties loaded by CAS already. This is where you decode values and finally return the results as a `Map<String, Object>` of all processed and possibly-decrypted settings.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html