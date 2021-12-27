---
layout:     post
title:      Apereo CAS - Service Redirection Strategies
summary:    Learn to customize Apereo CAS to modify the default strategy used for redirecting the authentication flow back to relying parties.
tags:       ["CAS 6.2.x"]
---

<div class="alert alert-success"><i class="far fa-lightbulb"></i> This blog post was originally posted on <a href="https://github.com/apereo/apereo.github.io">Apereo GitHub Blog</a>.</div>

# Overview

Per the [CAS Protocol](https://apereo.github.io/cas/6.2.x/protocol/CAS-Protocol-Specification.html), service tickets issued by a CAS server are expected
to be returned to the original service identifier provided in the initial authentication request via the `service` parameter. While this default behavior is enforced by 
the Apereo CAS server, there may be situations where the ultimate redirection URL may need to be customized or altered for advanced integrations.

{% include googlead1.html  %}

In this short tutorial, we are briefly going to review the specifics of the redirection strategy and ways that it might be tuned. Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

A similar blog post on how tuning service matching strategies [can be found here](/2019/10/28/cas61x-service-matching-strategy/).

# Configuration

The default redirection strategy is exact and enforced by `WebApplicationServiceResponseBuilder`, whose job is to build an 
appropriate response to the authentication request. The builder
supports *normal* authentication requests from generic web applications and is capable of producing 
responses as a `GET`, `POST`, etc. The definition of the builder can of course be
customized and replaced since it's defined as a Spring bean in the running application context. 

<div class="alert alert-warning">
<strong>Caution</strong><br/>Altering the internal mechanics of a CAS server may lead to a problematic insecure configuration and <i>may</i> also jeopradize the population of giant pandas. Such customizations should only be applied if absolutely necessary when all other alternatives are considered and ruled out.
</div>

To supply your own builder, you should start by [designing your own configuration component](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Management-Extensions.html) to include the following bean:

```java
@Bean
public ResponseBuilder<WebApplicationService> webApplicationServiceResponseBuilder() {
    return new MyWebApplicationServiceResponseBuilder(...);
}
```

The general outline of `MyWebApplicationServiceResponseBuilder` should have to follow the below example:

```java
public class MyWebApplicationServiceResponseBuilder 
        extends WebApplicationServiceResponseBuilder {
    
    @Override
    protected String determineServiceResponseUrl(WebApplicationService service) { 
        if (shouldWeCustomizeRedirectionUrls(service)) {
            return ...;
        }
        return super.determineServiceResponseUrl(service);
    }
}
```

Your task would then be to implement the `determineServiceResponseUrl()` method to provide your own custom logic.

Alternatively, you can specify an override for the registered service definition:

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "testId",
  "name" : "TEST",
  "id" : 1,
  "redirectUrl" : "https://somewhere.example.org",
  "evaluationOrder" : 1
}
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Finally, if you benefit from Apereo CAS as free and open-source software, we invite you to [join the Apereo Foundation](https://www.apereo.org/content/apereo-membership) and financially support the project at a capacity that best suits your deployment. If you consider your CAS deployment to be a critical part of the identity and access management ecosystem and care about its long-term success and sustainability, this is a viable option to consider.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
