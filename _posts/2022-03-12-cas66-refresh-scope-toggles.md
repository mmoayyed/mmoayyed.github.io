---
layout:     post
title:      Apereo CAS - Keeping Configuration Fresh w/ @RefreshScope
summary:    Learn how to reload Spring application context on configuration changes and how to combine refresh requests with @ConditionalOn annotations.
tags:       ["CAS 6.6.x", "Configuration Management", "Spring Boot", "Spring Cloud"]
---

From the very early days of Apereo CAS 5.x, the project provided support for external configuration and property sources via integration with Spring Cloud. This integration also allows CAS to mark its internal `@Bean` components in the Spring application context with a special annotation, `@RefreshScope` allowing for the internal state to be reloadable. This particular use case and integration can be quite challenging to address when such beans are also marked with the `@ConditionalOn*` annotation that makes their existence depend on a particular setting or a more general condition.
{% include googlead1.html  %}

In this blog post, we will examine the range of options available to handle the task of creating conditional beans that are also marked to be reloadable. Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## What is @RefreshScope?

A Spring `@Bean` that is marked as `@RefreshScope` will be recreated and reinitialized on configuration changes, that are signaled typically using the `actuator/refresh` endpoint. This capability addresses the problem of stateful beans that only get their configuration injected when they are initialized. 

Here is a very basic example:
{% include googlead1.html  %}
```java
public interface PrincipalResolver {}

@Bean
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public PrincipalResolver principalResolver(MyProperties props) {
    return new MyPrincipalResolver();
}
```

On startup, the Spring application context is initialized and contains many individual beans that are fed properties and settings from configuration sources. When the property source changes and the configuration is refreshed, we would want to reload those beans so they may operate on new settings. 

<div class="alert alert-info">
  <strong>Remember</strong><br/>Note how the return type of the bean that is registered in the application context is an interface, <code>PrincipalResolver</code>. This makes it easier for the runtime to create a JDK dynamic proxy around this bean, when necessary. This fact will become very important when we start marking <i>conditional</i> beans for reloadability.
</div>
{% include googlead1.html  %}
From the Spring Cloud documentation:

> Refresh scope beans are lazy proxies that initialize when they are used (i.e. when a method is called), and the scope acts as a cache of initialized values. To force a bean to re-initialize on the next method call you just need to invalidate its cache entry.

[See this](https://cloud.spring.io/spring-cloud-static/spring-cloud.html#_refresh_scope) for more.

The Spring application context at runtime can be refreshed using the `actuator/refresh` endpoint. We will need to enable and expose the endpoint first:

```properties
management.endpoints.web.exposure.include=refresh
management.endpoint.refresh.enabled=true
cas.monitor.endpoints.endpoint.refresh.access=AUTHENTICATED

spring.security.user.name=casuser
spring.security.user.password=Mellon
```
{% include googlead1.html  %}
Once the property source changes are committed (i.e. `cas.properties`, etc), we can invoke the `refresh` endpoint to invalidate the context cache for reloadable beans:

```bash
curl -k -u casuser:Mellon https://sso.example.org/cas/actuator/refresh \
  -d {} -H "Content-Type: application/json"
```

<div class="alert alert-info">
  <strong>Remember</strong><br/>Invoking the <code>refresh</code> endpoint only invalidates the context cache but does not force the re-initialization of Spring Beans. Remmeber that such beans are lazy proxies; they are only created when called upon explicitly by the runtime context.
</div>

## Conditional @RefreshScope

Let's mark our previous bean to be conditional on a property; that is to say that the existence of this bean will be based on whether or not a particular setting from the environment matches a value. 
{% include googlead1.html  %}
```java
@Bean
@ConditionalOnProperty(name = "principal.resolver.enabled", havingValue = "true")
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public PrincipalResolver principalResolver(MyProperties props) {
    return new MyPrincipalResolver();
}
```

If you start the application with the property `principal.resolver.enabled=true`, this condition will pass and the resulting application context will contain a reloadable bean under the name `principalResolver`. So far, so good.

Let's make things interesting. Let's say you start out with `principal.resolver.enabled=false` to disallow the existence of the bean. Once the application is up and running, you realize that you need to turn this behavior on and so naturally, you would try to change the property to `principal.resolver.enabled=true` and then refresh the application context to get your `principalResolver` bean recreated and back in the game. Unfortunately, this cannot ever happen.

## To Be or Not To Be

It turns out that `@Bean` definitions, marked with `@RefreshScope` and `@ConditionalOnProperty` are not re-evaluated or re-created when the property value changes. The spring application context will fail to refresh beans that are excluded (or conditionally activated/created) at initialization/startup time because there is nothing to refresh, to begin with. 
{% include googlead1.html  %}
Refresh requests and beans decorated with `@RefreshScope` only work in scenarios where there is an existing reference to a bean in the application context hierarchy that can be refreshed; beans or configuration classes that are skipped during the startup and application context initialization will never be refreshable because they are not re-created upon refresh requests. In other words, refresh requests only work best when there is a setting or property whose existing value changes from A to B; if there was no A, to begin with, or if A is being removed, refresh requests and the reload strategy may fall short.

So in summary, you cannot refresh something that was never created in the first place.

## Possible Solutions

While the above explanation may seem perfectly reasonable, it does not detract from the fact that this is a problem and limitation we must overcome. From the end-user perspective, the configuration must be refreshable regardless of the technology complications therein. Sure, one could always force the reinitialization of the application context with a server/application restart but that is not always desirable, possible, or even cost-effective in certain cases. 

So in the spirit of *It should just work*, let's take a look at how we *attempt* to solve this issue in Apereo CAS. When we look at the category of beans that need to be reloadable, the solution comes down to the following three groups:
{% include googlead1.html  %}
- Conditional beans for which there exists a sensible default implementation.
- Conditional beans for which there exists a sensible *no-op* implementation.
- Conditional beans for whose return type is some sort of collection that contains other beans.
- Conditional beans for which there exists default no implementation.

We first begin by defining our condition:

```java
static final BeanCondition CONDITION = 
  BeanCondition.on("principal.resolver.enabled").isTrue();
```

...and then set about to create the bean definitions. 

<div class="alert alert-info">
  <strong>Remember</strong><br/>As you review the various implementation options below, you should note that the <code>@ConditionalOnProperty</code> annotation has been replaced with <code>BeanCondition</code> and <code>BeanSupplier</code> APIs.
</div>

### Default Beans

In this scenario, we first attempt to create the bean if the environment property does pass our condition, and otherwise we fallback onto a default implementation:
{% include googlead1.html  %}
```java
@Bean
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public PrincipalResolver principalResolver(ApplicationContext applicationContext,
                                           MyProperties props) {
  return BeanSupplier.of(PrincipalResolver.class)
    .when(CONDITION.given(applicationContext.getEnvironment()))
    .supply(() -> {
        return new MyPrincipalResolver();
    })
    .otherwise(YourPrincipalResolver::new)
    .get();
  }
```

### NoOp Beans

This scenario is the same as the previous case except that the fallback 
clause produces a no-op (i.e. does nothing) implementation:
{% include googlead1.html  %}
```java
@Bean
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public PrincipalResolver principalResolver(ApplicationContext applicationContext,
                                           MyProperties props) {
  return BeanSupplier.of(PrincipalResolver.class)
    .when(CONDITION.given(applicationContext.getEnvironment()))
    .supply(() -> {
        return new MyPrincipalResolver();
    })
    .otherwise(NoOpPrincipalResolver::new)
    .get();
  }
```

### Container Beans

This scenario addresses the case where the return type is expected to be some sort of collection or container. The fallback clause, in this case, is allowed to return an empty collection:
{% include googlead1.html  %}
```java
@Bean
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public BeanContainer<PrincipalResolver> principalResolver(
  ApplicationContext applicationContext, MyProperties props) {
  return BeanSupplier.of(PrincipalResolver.class)
    .when(CONDITION.given(applicationContext.getEnvironment()))
    .supply(() -> {
        return BeanContainer.of(new MyPrincipalResolver());
    })
    .otherwise(BeanContainer::empty)
    .get();
  }
```

### Proxy Beans

This scenario addresses the case where there is no default or no-op implementation available for the fallback case, and it does not make sense to create one. Instead, we attempt to create a JDK dynamic proxy for the bean definition:

<div class="alert alert-info">
  <strong>Remember</strong><br/>Note how the return type of the bean that is registered in the application context is an interface, <code>PrincipalResolver</code>, which allows the JDK to create a dynamic proxy object for the returned instance.
</div>
{% include googlead1.html  %}

```java
@Bean
@RefreshScope(proxyMode = ScopedProxyMode.DEFAULT)
public PrincipalResolver principalResolver(
  ApplicationContext applicationContext, MyProperties props) {
  return BeanSupplier.of(PrincipalResolver.class)
    .when(CONDITION.given(applicationContext.getEnvironment()))
    .supply(() -> {
        return new MyPrincipalResolver();
    })
    .otherwiseProxy()
    .get();
  }
```

## Feature Toggles

*Feature Toggles* is a new addition to the CAS portfolio that allows you to group a set of auto-configuration components under one logical name. For example, you may decide that the "Acceptable Usage Policy" and all its accompanying implementations should be entirely disabled and excluded from the application context. To handle this, you could try the following:

- Excluding all relevant modules from your Gradle build.
- ...or you exclude all auto-configuration classes via the likes of `spring.autoconfigure.exclude`.
- ...or you use the dedicated feature toggle, `CasFeatureModule.AcceptableUsagePolicy.enabled=false`.
{% include googlead1.html  %}

To learn more about feature toggles, [please see this](2022/03/01/cas66-feature-toggles/).

Note that the feature toggle enforces conditional access to the auto-configuration class where a whole suite of `@Bean` definitions would be included or excluded in the application context upon initialization and startup. Conditional inclusion or exclusion of beans generally has consequences when it comes to `@RefreshScope` and supporting refreshable beans. Feature modules are not refreshable at this point; they are processed on startup and will either be included in the assembled application context or skipped entirely, depending on the result of the enforced condition.

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
