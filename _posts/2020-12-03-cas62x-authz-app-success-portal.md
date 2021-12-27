---
layout:     post
title:      Apereo CAS - Authorized Applications Portal
summary:    Learn how to modify the Spring Webflow in Apereo CAS to display a list of user authorized applications on successful login attempts and present a mini user portal for application access.
tags:       ["CAS 6.2.x", "Authorization"]
---

I collaborated on an interesting CAS use case that asked for the following behavior:

> On successful login attempts, could we display a list of applications and services, registered with CAS, for which the authenticated user is authorized for access? 

Sure, [we could](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/). In this post, I will review the steps required to handle this use case at a high level while also briefly reviewing access and authorization strategies with CAS registered applications using modest attribute-based access control (ABAC).

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Authorization

By *authorized for access*, the question refers to the CAS concept of [*Access Strategy* for registered applications](https://apereo.github.io/cas/6.2.x/services/Configuring-Service-Access-Strategy.html). This strategy provides fine-grained control over the service authorization rules and can be configured to require a certain set of attributes that must exist before access can be granted to the service. This behavior allows one to configure various attributes in terms of access roles for the application and define rules that would be enacted and validated when an authentication request from the application arrives.

For example, the following policy allows access to `https://example.com` only if the authenticated user carries a `cn` attribute that contains `admin` as a value:

```json
{
  "@class": "org.apereo.cas.services.RegexRegisteredService",
  "serviceId": "https://example.com",
  "name": "Sample",
  "id": 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "requiredAttributes" : {
      "@class" : "java.util.HashMap",
      "cn" : [ "java.util.HashSet", [ "admin" ] ]
    }
  }
}
```

Such applications are managed and tracked by CAS using its own [service registry](https://apereo.github.io/cas/6.2.x/services/Service-Management.html). So the task at hand requires that on successful authentication attempts, the system should begin to execute the following steps:

1. Collect all registered applications from the CAS service registry.
2. Remove all registered applications that do not pass the access strategy authorization tests.
3. Pass the final collection of applications to the view layer.

{% include googlead1.html  %}

All of the above can be done at the right entry point by extending the CAS Spring Webflow to override the `GenericSuccessViewAction` that is responsible for executing and rendering the view after successful attempts.

## Spring Webflow

We start with [extending the CAS configuration](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Management-Extensions.html) so that we can inject our own custom implementation of the `GenericSuccessViewAction` components:

```java
@Bean
public Action genericSuccessViewAction() {
    return new CustomGenericSuccessViewAction(...);
}
```

Our `CustomGenericSuccessViewAction` will run through the above steps as such:

```java
public class CustomGenericSuccessViewAction extends GenericSuccessViewAction {
    public CustomGenericSuccessViewAction(...) {}

    @Override
    protected void doPostExecute(final RequestContext requestContext) throws Exception {
        var authorizedServices = new ArrayList<RegisteredService>();
        var tgt = WebUtils.getTicketGrantingTicketId(requestContext);
        getAuthentication(tgt).ifPresent(authentication -> {
            /**
            * Step 1: Collect all services
            */
            servicesManager.getAllServices().forEach(registeredService -> {
               /**
                * Step 2: Filter/Collect services per authorization rules
                */
                if (RegisteredServiceAuthorizer.isAuthorized(registeredService, authentication)) {
                    authorizedServices.add(registeredService);
                }
            });
        });
        /**
        * Step 3: Pass the final result to the view layer
        */
        requestContext.getFlowScope()
            .put("authorizedServices", authorizedServices);
        super.doPostExecute(requestContext);
    }
}
```

The bulk of authorization work is done by our `RegisteredServiceAuthorizer#isAuthorized()` component which more or less does the following:

```java
try {
    RegisteredServiceAccessStrategyUtils.ensureServiceAccessIsAllowed(registeredService);
    val service = new WebApplicationServiceFactory().createService(registeredService.getServiceId());
    RegisteredServiceAccessStrategyUtils.ensurePrincipalAccessIsAllowedForService(
        service, registeredService, authentication);
    return true;
} catch (final Exception e) {
    log.trace(e.getMessage());
}
return false;
```

## Displaying Results

To display our list of authorized applications in a mini-portal fashion, we should begin by customizing `casGenericSuccessView.html` file that is rendered on successful authentication attempts. The page should have access to the `authorizedServices` flow scope variable, and can loop through the results to display the applications:

{% include googlead1.html  %}

```html
You have access to the following applications:
<ul>
    <li th:each="service : ${authorizedServices}">
        <span th:utext="${service.name}"></span>
    </li>
</ul>
```

## Moving Forward

This capability is automatically provided by CAS `6.3.x`, so you can [stop writing code](/2017/09/10/stop-writing-code/).

![image](https://user-images.githubusercontent.com/1205228/100535693-6c328000-3230-11eb-9c27-f9c4383c3ee4.png)


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)