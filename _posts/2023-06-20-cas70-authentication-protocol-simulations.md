---
layout:     post
title:      Apereo CAS - Authentication Protocol Simulations
summary:    Learn how to simulate user authentication attempts and examine responses and payloads in the context of various authentication protocols such as CAS and SAML2.
tags:       ["CAS 7.0.x", "SAML", "Authentication", "Spring Boot"]
---

When troubleshooting application integrations, it can often be very helpful to try and examine the authentication payload produced by the identity provider to see what claims and attributes the application receives. This can be especially painful in scenarios and authentication protocols where the payload is produced as part of a back-channel call, it can be near impossible for one to catch the actual payload without digging into server logs. Authentication responses that pass through the browser/front channel are easier to diagnose and examine but only if the payload is not encrypted.
{% include googlead1.html %}
In this post, we will review several options that are available to Apereo CAS deployments that attempt to simulate authentication protocol responses and payloads for easier troubleshooting and diagnostics.

Our starting position is as follows:

- CAS `7.0.x`
- Java `17`

# CAS Protocol

You may take advantage of [dedicated actuator endpoints](https://apereo.github.io/cas/development/integration/Attribute-Release-Policies.html) that allow you to examine the attributes that would be authorized for release for applications that are integrated with Apereo CAS using the CAS protocol. The produced payload here will show the execution context that CAS will use to build the final response. 

<div class="alert alert-warning">
  <strong>WATCH OUT!</strong><br/>The collection of endpoints described here <strong>MUST</strong> be properly secured for production purposes. It is not wise to enable and expose all actuator endpoints to the web and certainly, the security of the exposed endpoints should be taken into account very seriously. None of the CAS or Spring Boot actuator endpoints are enabled by default. For production, you should carefully choose which endpoints to expose.
</div>

For example, if you want to simulate an authentication attempt by `casuser` when logging into the application `https://apereo.github.io`, the following request should prove useful:
{% include googlead1.html %}
```bash
curl --request POST --location 'https://sso.example.org/cas/actuator/releaseAttributes? \
    username=casuser&password=Mellon&service=https%3A%2F%2Fapereo.github.io'
```

The produced payload will have the following structure where youw: 

```json
{
    "assertion": {
        "primaryAuthentication": {
            "@class": "o.a.c.a.DefaultAuthentication",
            "principal": {
                "@class": "o.a.c.a.p.SimplePrincipal",
                "id": "casuser",
                "attributes": {
                    "displayName": [ "Misagh Moayyed" ],
                    "email": [ "mm1844@gmail.com" ]
                }
            },
            "attributes": {
                "clientIpAddress": [ "127.0.0.1" ],
                "credentialType": [ "UsernamePasswordCredential" ]
            }
        },
    },
    "service": {
    },
    "registeredService": {
    }
}
```

Attributes that are resolved and authorized for release will go into the `primaryAuthentication` object. This is where you see person attributes that belong to the authenticated principal, as well as authentication-level attributes such as `clientIpAddress` that describe the authentication attempt and its relevant metadata.

Note that in the above example, person attributes are produced in two separate attempts:

- Person attributes that may be found as part of the user authentication attempt, since the password is supplied.
- Person attributes that may be found as part of the [attribute resolution phase](https://apereo.github.io/cas/development/integration/Attribute-Resolution.html) from separate attribute repository sources.

This means that if you do not have access to the user's password, you may of course remove it from the request:
{% include googlead1.html %}
```bash
curl --request POST --location 'https://sso.example.org/cas/actuator/releaseAttributes? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'
```

...and the result will only contain person attributes that could be resolved from separate attribute repository sources, if any, and no user authentication will ever take place. Depending on your configuration, this may not exactly be a super realistic simulation.

As you observe, the above endpoint only produces the data that CAS will use in its execution context to build the protocol payload. To see the actual payload, you could invoke the following endpoints:
{% include googlead1.html %}
```bash
# CAS Protocol v1
curl --request POST --location 'https://sso.example.org/cas/actuator/casValidate/validate? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'

# CAS Protocol v2
curl --request POST --location 'https://sso.example.org/cas/actuator/casValidate/serviceValidate? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'

# CAS Protocol v3
curl --request POST --location 'https://sso.example.org/cas/actuator/casValidate/p3/serviceValidate? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'
```

# SAML v1 Protocol

Similar to above, to see the execution context data when CAS is preparing the SAML v1 validation payload you may use the following endpoint:

```bash
curl --request POST --location 'https://sso.example.org/cas/actuator/samlValidate? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'
```
If you'd rather see the actual protocol payload, specify the `Content-Type` header as `text/xml` or `application.xml`:

{% include googlead1.html %}
```bash
curl -H 'Content-Type: text/xml' \
    --request POST --location 'https://sso.example.org/cas/actuator/samlValidate? \
    username=casuser&service=https%3A%2F%2Fapereo.github.io'
```

# SAML2 Protocol

To see the SAML2 protocol response when CAS is responding to a SAML2 service provider you may use the following endpoint:
{% include googlead1.html %}
```bash
curl --location --request POST \
    'https://sso.example.org/cas/actuator/samlPostProfileResponse? \
    username=casuser&entityId=https%3A%2F%2Fspring.io%2Fsecurity%2Fsaml-sp'
```

Note the `password` parameter is removed from all such requests and is treated as optional. Just as before, no user authentication will ever take place if the `password` parameter is absent.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
