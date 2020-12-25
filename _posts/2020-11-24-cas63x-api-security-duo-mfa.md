---
layout:     post
title:      Apereo CAS - Protect APIs via Duo Security MFA
summary:    Learn how to use Duo Security for multifactor authentication with Apereo CAS to protect application APIs and REST endpoints in non-browser MFA sequences.
tags:       [CAS]
---

Apereo CAS can integrate with [Duo Security](https://www.duo.com/) to provide a smooth and seamless multifactor authentication scenario. Support for Duo Security can cover authentication scenarios for web-based applications as well as command-line interfaces and APIs. Furthermore, recent versions of CAS can provide integration support for Duo Security's *Universal Prompt* using Duo's [OIDC Auth API](https://duo.com/docs/oauthapi). In this walkthrough, we'll take a look at the Duo Security integration setup with CAS and will also review options for command-line or API access. 

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [Bootiful CAS Client](https://github.com/cas-projects/bootiful-cas-client)
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)

## CAS Server

The CAS overlay should be prepped with a method for primary authentication, such as [Basic Auth](https://apereo.github.io/cas/6.3.x/installation/Basic-Authentication.html). This is especially appropriate for command-line access if we are to access APIs using `curl` with the combination of Basic Auth as well as Duo MFA. Furthermore, CAS overlay must include the [appropriate module](https://apereo.github.io/cas/6.3.x/mfa/DuoSecurity-Authentication.html) for Duo Security in the build, and integration settings must be obtained from the Duo admin console and be provided as CAS properties:

```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-application-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=..
```

The *WebSDK* variant for Duo Security allows CAS to host the Duo Security authentication prompt inside an embedded `iFrame`. This approach requires the `duo-application-key`, which is at least 40 characters long and is a setting you must generate and keep secret. You can generate a random string in Python with:

```python
import os, hashlib
print hashlib.sha1(os.urandom(32)).hexdigest()
```

{% include googlead1.html  %}

The *Universal Prompt* variant no longer requires you to generate and use a application key value. Instead, it requires a client id and client secret, which are known and taught to CAS using the integration key and secret key configuration settings. You will need to get your integration key, secret key, and API hostname from Duo Security when you register CAS as a protected application. In the CAS settings, the absence of `duo-application-key` indicates that Universal Prompt should be used instead of the WebSDK integration mode.

```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=..
```

Furthermore, let's make sure that all requests from all applications should be asked for multifactor authentication with Duo Security:

```properties
cas.authn.mfa.global-provider-id=mfa-duo
```

## Client Application

For testing and demo purposes, I am using the [Bootiful CAS Client](https://github.com/cas-projects/bootiful-cas-client) application with some minor adjustments:

- The `MainController` is annotated with `@RestController` and contains the following endpoint to simply produce the authenticated user principal as JSON:

```groovy
@RequestMapping(value = '/json', method = RequestMethod.GET, produces = "application/json")
def json(HttpServletRequest request) {
    return request.userPrincipal
}
```

We can use this endpoint as an API that would be accessed from the command-line to demonstrate MFA via Duo Security.

- We should also make sure that the new `/json` endpoint defined above is added to the list of authentication and validation patterns in the `application.yml` file:

```yaml
authentication-url-patterns: [/protected, /protected2, /json]
validation-url-patterns: [/protected, /protected2, /json]
request-wrapper-url-patterns: [/protected, /protected2, /json]
assertion-thread-local-url-patterns: [/*]
```

{% include googlead1.html  %}

Of course, don't forget that the application (i.e. `https://localhost:8444`) must be [registered with CAS](https://apereo.github.io/cas/6.3.x/services/Service-Management.html) before proceeding to the next step.

## Test

The Duo Security module of CAS can also support non-browser multifactor authentication requests. To trigger this behavior, applications (i.e. `curl`, REST APIs, etc) need to specify a special `Content-Type` to signal to CAS that the request is submitted from a non-web-based environment. Note that the multifactor authentication request is submitted to Duo Security in `auto` mode which effectively may translate into an out-of-band factor (push or phone) recommended by Duo as the best for the user’s devices.

Once the CAS server and the client application are running, we can try a programmatic command-line access request to our `/json` endpoint:

```bash
curl -k --location --header "Content-Type: application/cas" \
  https://localhost:8444/json -L -u casuser:Mellon | jq
```

In this example, `curl` attempts to authenticate into our API by first exercising basic authentication while identifying the request content type as `application/cas`. The request is passed along to CAS which authenticates the user credentials and performs Duo MFA using a push notification. Once the user accepts and acknowledges the notification, the MFA sequence will complete to finally return the authenticated user profile to our endpoint:

{% include googlead1.html  %}

```json
{
  "name": "casuser",
  "attributes": {
    "credentialType": [
      "UsernamePasswordCredential",
      "DuoSecurityDirectCredential"
    ],
    "isFromNewLogin": "true",
    "authenticationDate": "2020-11-25T08:37:14.008158Z",
    "bypassMultifactorAuthentication": "false",
    "authenticationMethod": [
      "STATIC",
      "mfa-duo"
    ],
    "authnContextClass": "mfa-duo",
    "successfulAuthenticationHandlers": [
      "STATIC",
      "mfa-duo"
    ],
    "longTermAuthenticationRequestTokenUsed": "false"
  }
}
```

It is important to note that both the CAS server and the client application and API are all part of the same `localhost` domain.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
