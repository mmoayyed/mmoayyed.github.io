---
layout:     post
title:      Apereo CAS - Controlling Configuration w/ Feature Toggles
summary:    Learn how to turn on or disable CAS feature modules and auto-configuration components.
tags:       ["CAS 6.6.x", "Configuration Management", "Spring Boot"]
---

Being a Spring Boot application at its core, Apereo CAS presents many semi-opinionated modules that attempt to auto-configure the running application context with specific features. Each specific CAS feature, such as support for [OpenID Connect](https://apereo.github.io/cas/development/protocol/OIDC-Protocol.html), might be encapsulated in several components each registred in CAS and tagged as a `@Configuration`. This tutorial provides a basic overview of how such configuration components may be disabled/ignored at runtime, while also reviewing the possibility to control *batches* of auto-configuration components using feature categories and toggles.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.6.0`
- Java 11
- [CAS Overlay](https://github.com/apereo/cas-overlay-template)
 
# Configuration Exclusion Rules

Following the guidelines from Spring Boot, one strategy to control a particular auto-configuration component is to exclude it directly from processing and inclusion. For example, if you know the path and location of the particular `@Configuration` components, you can exclude its processing using the following property:

```properties
spring.autoconfigure.exclude=org.apereo.cas.config.QRAuthenticationConfiguration
```
{% include googlead1.html  %}
Excluding a configuration component is almost identical to not having the owner module in the CAS build. All brain matter found in the above configuration class is ignored and skipped at initialization time, allowing you to ship a particular module in your CAS build without it contributing anything to the runtime context. 

<div class="alert alert-info">
  <strong>Note</strong><br/>Remember that such exclusion rules cannot be refreshed using the <code>refresh</code> actuator endpoint. Spring application context will not refresh beans that are excluded (or conditionally activated/created) at initialization/startup time, because there is no reference to an existing bean to refresh. You cannot refresh something that was never created in the first place. 
</div>

# Feature Toggles

While the above strategy works as advertised in specific scenarios, there are serious risks associated with its usage. Of course, you have to hunt down and find the location of the actual configuration class to then exclude it from the runtime. Then, you have to be careful about all the other modules and configuration classes that might be negatively affected by this exclusion rule, and likewise, find and exclude those as well. Finally, such configuration classes are mainly seen as *internal implementation detail*, which means they be relocated, broken down, or renamed in the lifecycle of the CAS software and you might have to essentially repeat the same exercise for each upgrade to ensure the right stuff is excluded. 

Rather than individual configuration components, a better alternative would be to disable *categories of features* and toggle their activity in a way that would be comprehensive and risk-free. For example, your *intention* is to disable the OpenID Connect functionality in CAS, regardless of where it's defined in whatever many configuration components. A feature toggle does exactly that. 
{% include googlead1.html  %}
To achieve this, many CAS configuration components internally are *annotated* with a specific condition that groups their activation together using a special flag. For example, all components related to handling and managing the [SAML2 Identity Provider functionality](https://apereo.github.io/cas/development/authentication/Configuring-SAML2-Authentication.html) might be annotated with:

```java
@ConditionalOnFeature(feature = CasFeatureModule.FeatureCatalog.SamlIdP)
```

This means that if you were to disable this functionality at initialization time, you could simply turn off the feature using the following:

```properties
CasFeatureModule.SamlIdP.enabled=false
```
{% include googlead1.html  %}
Or, perhaps control over a particular variant of a given feature:

```java
@ConditionalOnFeature(feature = CasFeatureModule.FeatureCatalog.Audit, module = "redis")
```

...which translates into the following property:

```properties
CasFeatureModule.Audit.redis.enabled=false
```

<div class="alert alert-info">
  <strong>Note</strong><br/>Just like above, note that exclusion rules cannot be refreshed using the <code>refresh</code> actuator endpoint. Same rule applies where you will be required to restart the server container and/or CAS to make feature-toggle changes known to the runtime.
</div>
{% include googlead1.html  %}
This approach tends to be a lot safer than excluding configuration classes indiviually since internal implementation details are abstracted away.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
