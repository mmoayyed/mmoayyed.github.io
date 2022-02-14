---
layout:     post
title:      Apereo CAS - Delegated Authentication & Identity Provider Selection
summary:    Learn how to present external identity providers to Apereo CAS for delegated (proxy) authentication, and choose strategies that allow the system to programmatically designate an identity provider as primary and automatically redirect the user to it for authentication and access.
tags:       ["CAS 6.5.x", "Delegated Authentication"]
---

When setting up Apereo CAS to delegate authentication to [external identity providers][delegation], one common consideration is to determine whether an identity provider can be programmatically chosen for the given request. Given the combination of the original request, various other dynamic parameters, and the requesting relying party, CAS ought to be able to find a qualifying and applicable identity provider. When known, the flow and client browser should attempt to auto-redirect to the chosen identity provider and effectively turn CAS into an *invisible* proxy.

{% include googlead1.html  %}

In this blog post, we will briefly review the configuration required to select delegated identity providers and ways we can modify the system to handle automatic redirects.

Our starting position is as follows:

- CAS `6.5.x`
- Java `11`

## Client-side Redirects

One strategy to select an identity provider for automatic redirection is to instruct CAS with a small Groovy script to customize the *redirection strategy*. This can be done using the following setting:

```properties
cas.authn.pac4j.core.groovy-redirection-strategy.location=file:/path/to/Redirection.groovy
```    

{% include googlead1.html  %}

The script itself is designed as:

```groovy
import org.apereo.cas.web.*

def run(Object[] args) {
    def requestContext = args[0]
    def service = args[1]
    def registeredService = args[2]
    def provider = args[3] as DelegatedClientIdentityProviderConfiguration
    def logger = args[4]
    logger.info("Checking provider ${provider.name} for service ${service?.id}...")
     if (service != null && service.id.startsWith("https://github.com/apereo/cas")) {
         provider.autoRedirect = true
         logger.info("Selected primary provider ${provider.name}")
         return provider
     }
    return null
}
```

The script makes a few calculations and sets a special flag on the provider, instructing CAS to prepare for an automatic redirect. This redirection is handled by the browser and the user is notified visually:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/139008024-ed1c2892-4ff4-4e5f-8c58-747fa1596525.png" 
width="90%" title="Redirecting to external identity provider" %}

## Server-side Redirects

The other variant of this use case is to remove CAS altogether from the picture and allow the redirect to execute on the server. In this approach, the server will immediately redirect to the external identity provider and no visual hints or elements would be displayed on the screen which would make CAS truly *invisible* as a proxy. 

To handle this scenario, we'll need to intercept and *post process* the construction of the primary external identity provider using a bit of scripting:

{% include googlead1.html  %}

```properties
cas.authn.pac4j.core.groovy-provider-post-processor.location=file:/path/to/PostProcessor.groovy
```

The script itself would be:

```groovy
import org.apereo.cas.web.*
import org.apereo.cas.web.support.*
import org.springframework.webflow.execution.*

def run(Object[] args) {
    def requestContext = args[0]
    def provider = (args[1] as Set<DelegatedClientIdentityProviderConfiguration>)[0]
    def logger = args[2]
    logger.info("Checking provider ${provider.name}...")
    def response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext)
    logger.debug("Redirecting to ${provider.redirectUrl}")
    response.sendRedirect(provider.redirectUrl);
}
```

{% include googlead1.html  %}

The script would auto-redirect to the first identity provider it finds from the configuration.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/6.5.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html