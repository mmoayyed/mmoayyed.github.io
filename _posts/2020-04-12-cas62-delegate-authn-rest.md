---
layout:     post
title:      Apereo CAS - Bootstrapping Delegated Authentication via REST
summary:    Learn how to configure and bootstrap your CAS server deployment for delegated authentication via an external REST API.
published: true
tags:       [CAS]
---

Apereo CAS has been able to delegate authentication to external [identity providers](https://apereo.github.io/cas/6.2.x/integration/Delegate-Authentication.html) for quite some time. Simply put, delegation is just a fancy word that means, whether automatically or at the click of a button, the browser is expected to redirect the user to an external identity provider (i.e. Twitter, GitHub, etc) and on the return trip back, CAS is tasked to parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or proxy in between.

{% include googlead1.html  %}

Registering the existence of such external identity providers is usually and most-commonly done via CAS settings. In this tutorial, we are going to take a look at alternative strategies for bootstrapping a CAS server deployment using an external REST API to feed and register our external identity providers with the CAS application runtime.

Our starting position as follows:

- CAS `6.2.x`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- Java 11

## Build

Hop over to [the CAS Overlay installation](https://github.com/apereo/cas-overlay-template) and get CAS built and deployed. Once you have a functional build, remember to include the following extension modules:

```groovy
implementation "org.apereo.cas:cas-server-support-pac4j-webflow:${project.'cas.version'}"
implementation "org.apereo.cas:cas-server-support-reports:${project.'cas.version'}"
```

The above two modules begin to activate delegated authentication functionality and reporting features with CAS. We'll specifically need the latter to take advantage of a few administrative endpoints to monitor the state of our deployment and reload the context as necessary.  

## Configuration

Next, let's ensure access to our administrative endpoints:

```properties
management.endpoint.reloadContext.enabled=true
management.endpoints.web.exposure.include=reloadContext

cas.monitor.endpoints.endpoint.reloadContext.access=ANONYMOUS
```

The configuration above allows CAS to enable and have access to the `reloadContext` actuator endpoint, expose it over the web so we can invoke it using the likes of `curl`. For the sake of this tutorial, the endpoint is made available without any extra security. 

<div class="alert alert-warning">
<strong>Security Warning!</strong><br/>Production deployments should of course take extra care to ensure all exposed endpoints are protected with adequate security measures.
</div>

Next, we need to design a REST API that produces the configuration for our external identity providers. For simplicity, our API is going to respond to `GET` requests with the following payload:

```json
{
    "callbackUrl": "https://sso.example.org/cas/login",
    "properties": {
        "github.id": "...",
        "github.secret": "..."
    }
}
```

The structure and syntax of the payload are dictated to CAS by [Pac4j](https://github.com/pac4j/pac4j) and its `PropertiesConfigFactory` component. The payload should specify the list of identity providers under `properties`
and also indicate a callback URL that is the CAS server itself.

Now that we have the REST API ready, all that is left is to register it with CAS itself:

```properties
cas.authn.pac4j.rest.url=https://api.example.org/delegatedauthn
```

{% include googlead1.html  %}

With the above configuration, you should see something close to the below screenshot the very next time you build and run CAS:

![image](https://user-images.githubusercontent.com/1205228/78877156-a82c9100-7a65-11ea-905f-fd100b67f89a.png)

## Refresh & Reload

In addition to GitHub, let's modify our API payload to also support delegating authentication to an external CAS server:

```json
{
    "callbackUrl": "https://sso.example.org/cas/login",
    "properties": {
        "github.id": "...",
        "github.secret": "...",

        "cas.protocol": "CAS30",
        "cas.loginUrl": "https://external.cas.org/cas/login"
    }
}
```

Once the change is made, we need to instruct CAS to reload the application context thus invoking our REST API one more time to bootstrap the runtime with the new payload:

```bash
curl -X POST -k https://sso.example.org/cas/actuator/reloadContext
```

Next, refresh the browser page and you should see the newly-registered CAS identity provider listed:

![image](https://user-images.githubusercontent.com/1205228/78877711-8a136080-7a66-11ea-968a-9f1b0197791d.png)

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)