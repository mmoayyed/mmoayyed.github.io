---
layout:     post
title:      Apereo CAS - Simple Multifactor Authentication
summary:    Learn to configure Apereo CAS to act as a simple multifactor provider itself.
tags:       ["CAS 6.6.x", "MFA"]
---

# Overview

The Apereo CAS portfolio presents support for an impressive number of [multifactor authentication providers](https://apereo.github.io/cas/6.6.x/mfa/Configuring-Multifactor-Authentication.html) out of the box. One such option is to remove dependencies to an external vendor integration and let the CAS server itself become a provider. This is a rather [simplified multifactor authentication](https://apereo.github.io/cas/6.6.x/mfa/Simple-Multifactor-Authentication.html) solution where after primary authentication, CAS begins to issue time-sensitive tokens to end-users via pre-defined communication channels such as email or text messages.

{% include googlead1.html  %}

In this tutorial, we are going to briefly review the steps required to turn on [Simple Multifactor Authentication](https://apereo.github.io/cas/6.6.x/mfa/Simple-Multifactor-Authentication.html).

Our starting position is based on:

- CAS `6.6.x`
- Java `11`
- [MockMock](https://github.com/tweakers/MockMock)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Prepare your CAS overlay with the correct [auto-configuration module](https://apereo.github.io/cas/6.6.x/mfa/Simple-Multifactor-Authentication.html). Next, we will first instruct CAS to trigger *simple mfa* for all requests and applications:

```properties
cas.authn.mfa.triggers.global.global-provider-id=mfa-simple
```
{% include googlead1.html  %}
<div class="alert alert-info">
<strong>Why All?</strong><br/>This is done to keep things simple for purposes of this blog post. You are of course welcome to choose any multifactor trigger that works best for you. It should work all the same.
</div>

Then, let's choose email as our preferred communication mechanism for sharing tokens. To do so, let's teach CAS about [our email server](https://github.com/tweakers/MockMock):

```properties
spring.mail.host=localhost
spring.mail.port=25000
spring.mail.testConnection=true
```

<div class="alert alert-info">
<strong>Why Spring?</strong><br/>Settings and properties that are directly controlled by the CAS platform always begin with the prefix <code>cas</code>. All other settings are controlled and provided to CAS via other underlying frameworks and may have their schemas, syntax and validation rules. In this case, the presence of the above settings will instruct <i>Spring Boot</i> to create the required components internally for sending an email and make them available to CAS.
</div>

Then, let's instruct CAS to share tokens via email:
{% include googlead1.html  %}
```properties
cas.authn.attribute-repository.stub.attributes.mail=misagh@somewhere.com

cas.authn.mfa.simple.mail.from=wolverine@example.org
cas.authn.mfa.simple.mail.subject=CAS MFA Token
cas.authn.mfa.simple.mail.text=Hello! Your requested CAS token is %s
cas.authn.mfa.simple.mail.attribute-name=mail

cas.authn.mfa.simple.time-to-kill-in-seconds=30
```

A few things to note:

- The `%s` acts as a placeholder for the generated token in the body of the message.
- The expiration of the generated token is set to `30` seconds.
- User email addresses are expected to be found under a `mail` attribute. In this example, this is done as a static attribute via the stub attribute repository configuration.

{% include googlead1.html  %}

At this point, we should be ready to test.

# Test

Once you build and bring up the deployment, let's simulate an authentication attempt from a made-up application, `https://app.example.org`, by submitting the following request:
{% include googlead1.html  %}
```bash
https://sso.example.org/cas/login?service=https://app.example.org
```

After authentication, you should see the following entries in the CAS log:

```bash
- <Added ticket [CASMFA-004291] to registry.>
- <Successfully submitted token via SMS and/or email to [misagh]>
```

The screen should ask for the token:

![image](https://user-images.githubusercontent.com/1205228/66712549-4d182b00-edaf-11e9-8ab8-2ce916577eac.png)
{% include googlead1.html  %}
If you check your email, you should have received a token:

![image](https://user-images.githubusercontent.com/1205228/66712619-78e7e080-edb0-11e9-97bc-0d908d1052d8.png)

Submit the generated token `CASMFA-004291` back to CAS and you should be allowed to proceed.

# Token Management

Token generation management can be handled in several ways. You can let CAS issue and manage tokens, or of course you could outsource that task to an external REST API. Let's review both options quickly.

## Default

To control the length of the generated token, use:
{% include googlead1.html  %}
```properties
cas.authn.mfa.simple.token.core.token-length=6
```

You can take direct control of the token generation logic by [designing your own configuration component](https://apereo.github.io/cas/6.6.x/configuration/Configuration-Management-Extensions.html) with the following bean in place:
{% include googlead1.html  %}
```java
@Bean
public UniqueTicketIdGenerator casSimpleMultifactorAuthenticationUniqueTicketIdGenerator() {
    return new MyUniqueTicketIdGenerator();
}
```

Implement the `MyUniqueTicketIdGenerator` as you see fit or better yet, use the `GroovyUniqueTicketIdGenerator` instead to hand off the implementation to an external Groovy script with the following body:
{% include googlead1.html  %}
```groovy
def run(Object... args) {
    def prefix = args[0]
    def logger = args[1]
    return ...
}
```

You can also control the token validation logic by supplying the following bean that should respond to credentials of type `CasSimpleMultifactorTokenCredential`:
{% include googlead1.html  %}
```java
@Bean
public AuthenticationHandler casSimpleMultifactorAuthenticationHandler() {
    return ...
}
```

Customizing the authentication handler as the parent component might be slightly overkill. Instead, you may opt into supplying your own multifactor authentication service directly:
{% include googlead1.html  %}
```java
@Bean
public CasSimpleMultifactorAuthenticationService casSimpleMultifactorAuthenticationService() {
    return ...
}
```

## REST API

The operations that deal with token generation and management can also be entirely outsourced to an external REST API. This comes in handy in senarios where you might have your own token generation service that wants own the managament and maintenance tasks when it comes to tokens. To handle this, you need to instruct CAS to contact your REST API endpoint:

```properties
cas.authn.mfa.simple.token.rest.url=http://api.example.org/mfa
cas.authn.mfa.simple.token.rest.basic-auth-username=api-username
cas.authn.mfa.simple.token.rest.basic-auth-password=1234567890
```
{% include googlead1.html  %}
The API needs to support the following endpoints and payloads:

```javascript
const principal = {
    "@class": "org.apereo.cas.authentication.principal.SimplePrincipal",
    "id": "casuser"
};
let payload = {
    "/new": {
        "get": 'generated-token'
    },
    "/": {
        "post": 'generated-token'
    },
    "/:id": {
        "get": principal
    }
};
```
{% include googlead1.html  %}
The `/new` endpoint is responsible for generating tokens via `GET` requests. The root path is tasked to actually save and store the generated token via a `POST` and finally, the `/{id}` endpoint should validate the given token and produce the corresponding payload once the token is deemed valid. 

# Rate Limiting

By default, if the user keeps asking for tokens without actually using them, CAS will continue to send the same unused token to the user so long as the token continues to be valid. This provides a useful defensive measure against too many token requests, but you may want to control the rate of the submitted requests as well. This can be done by forming a rate-limiting configuration plan to limit the number of requests:

```
cas.authn.mfa.simple.bucket4j.enabled=true
cas.authn.mfa.simple.bucket4j.blocking=true

cas.authn.mfa.simple.bucket4j.bandwidth[0].capacity=100
cas.authn.mfa.simple.bucket4j.bandwidth[0].duration=PT1M

cas.authn.mfa.simple.bucket4j.bandwidth[1].capacity=60
cas.authn.mfa.simple.bucket4j.bandwidth[1].duration=PT5S
```
{% include googlead1.html  %}
We are allowed to define multiple rate-limting plans. For example, the above configuration handles requests in *blocking* mode, which means the client request will be blocked until resources eventually become available. Our plan allows for 100 requests per minute, but not no more often than 60 tokens per 5 seconds.

Specifying multiple bandwidths and configuration plans may be a very useful technique in protecting against clever attacks. For example, Bucket4j documentation provides the following scenario:

>Suppose that you start with a limit of 10000 tokens / per 1 hour per user. A malicious attacker may send 9999 request within 10 seconds. This would correspond to 100 request per second which could seriously impact the system. A skilled attacker could stop at 9999 request per hour, and repeat every hour, which would make this attack impossible to detect because the limit would not be reached.
{% include googlead1.html  %}
For additional details, please visit the [Bucket4j reference documentation](https://bucket4j.com/).

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html

