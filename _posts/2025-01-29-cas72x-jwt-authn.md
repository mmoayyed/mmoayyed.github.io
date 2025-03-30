---
layout:     post
title:      Apereo CAS - JWT All the Things
summary:    A tutorial on how to let Apereo CAS handle authentication events accompanied by JWTs.
tags:       ["CAS 7.2.x", "MFA"]
---

Apereo CAS has had built-in support for [JWTs](https://jwt.io/) for some time now in a variety of different ways. Notions of JWT support date back to CAS `3.5.x`. Since then, support for JWTs has significantly improved and grown over the years and continues to get better with an emerging number of use cases whose chief concern is improving performance and removing round-trip calls, among other things.

{% include googlead1.html  %}

In this tutorial, I am going to briefly review various forms of JWT functionality in CAS. Specifically, the following topics will be reviewed:

- [JWT Authentication](https://apereo.github.io/cas/7.2.x/installation/JWT-Authentication.html): Allowing CAS to accept JWTs as credentials in non-interactive authentication modes mostly.
- JWTs with [Duo Security Multifactor Authentication](https://apereo.github.io/cas/7.2.x/installation/DuoSecurity-Authentication.html): Exploring an approach where a non-interactive authentication request may be routed to a multifactor authentication flow and back.
- [JWTs as Service Tickets](https://apereo.github.io/cas/7.2.x/installation/Configure-ServiceTicket-JWT.html): Allowing CAS to transform service tickets issued for applications into JWTs.

Our starting position is as follows:

- CAS `7.2.x`
- Java `21`

# JWT Authentication

CAS provides support for token-based authentication on top of JWTs, where an authentication request can be granted an SSO session based on a form of credentials that are JWTs. CAS expects a `token` parameter (or request header) to be passed along to the `/login` endpoint as the credential. The parameter value must of course be a JWT.

## Let There Be JWT

To generate a JWT, I ended up using the [CAS Command-line Shell](https://apereo.github.io/cas/7.2.x/installation/Configuring-Commandline-Shell.html):

```bash
./gradlew runShell

...
Run the following command to launch the shell:
        java -jar build/libs/cas-server-support-shell-7.0.0-SNAPSHOT.jar
```
{% include googlead1.html  %}
This will allow you to enter the interactive shell, where you have documentation, tab completion, and history for all commands. 

```bash
cas>

cas>generate-jwt --subject Misagh

==== Signing Secret ====
MY4Jpxr5VeZsJ...

==== Encryption Secret ====
MZCjxBbDFq9cHPdy...

Generating JWT for subject [Misagh] with signing key size [256], signing algorithm [HS256],
    encryption key size [48], encryption method [A192CBC-HS384], and encryption algorithm [dir]

==== JWT ====
eyJjdHkiOiJKV1QiLCJ...
```
{% include googlead1.html  %}
Hooray! We have a JWT.

There are a variety of other parameters such as encryption methods and signing algorithms you can choose from to generate the JWT. For this tutorial, let's keep things simple. Of course, you don't have to use the CAS command-line shell. Any valid compliant JWT generator would do fine.

<div class="alert alert-info">
  <strong>Don't Take Things Literally</strong><br/>I am abbreviating the secrets and the generated JWT above. Do NOT copy-paste these into your environment and configuration, thinking they might do the trick.
</div>

## Configure Application

CAS [needs to be taught](https://apereo.github.io/cas/7.2.x/installation/JWT-Authentication.html) the security properties of the JWT to unpack and validate it and produce the relevant authenticated session. For a given authentication request, CAS will try to find the matching record for the application in its registry that is capable of validating JWTs. If such a record is found and the request is accompanied by JWT credentials, the credential is validated and the service ticket is issued.

{% include googlead1.html  %}

My CAS overlay is already equipped with the [relevant configuration module](https://apereo.github.io/cas/7.2.x/installation/JWT-Authentication.html) and my application record using [the JSON service registry](https://apereo.github.io/cas/7.2.x/installation/JSON-Service-Management.html) looks something like this:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://www.example.org",
  "name" : "Example",
  "id" : 1,
  "properties" : {
    "@class" : "java.util.HashMap",
    "jwtSigningSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MY4Jpxr5VeZsJ..." ] ]
    },
    "jwtEncryptionSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MZCjxBbDFq9cHPdy..." ] ]
    }
  }
}
```

Now, we are ready to start sending requests.

## Authenticate

Using `curl` from a terminal, here is the authentication sequence:
{% include googlead1.html  %}
```bash
$ curl -i "https://mmoayyed.example.net/cas/login? \
  service=https://www.example.org&token=eyJjdHkiOiJKV1QiLCJ..."

HTTP/1.1 302
...
Location: https://www.example.org?ticket=ST-1-zmEt1zfAuHv...
...
```

A few things to note:

- The `-i` option allows `curl` to output the response headers where `Location` in the above case contains the redirect URL with the issued service ticket.
- The entire URL in the `curl` command is encased in double quotes. This is necessary for `curl` to ensure the query string is entirely passed along to CAS.

Of course, I can pass the JWT as a request header too:
{% include googlead1.html  %}
```bash
$ curl -i "https://mmoayyed.example.net/cas/login? \
  service=https://www.example.org" --header "token:eyJjdHkiOiJKV1QiLCJ..."

HTTP/1.1 302
...
Location: https://www.example.org?ticket=ST-1-qamgyzfAuHv9vG6Do...
...
```

Grab the `ticket` from the `Location` header and proceed to validate it, as you would any regular service ticket.

# Single Sign-on Tokens

When JWT authentication is enabled, authentication attempts (such as those with a username/password) can be allowed to produce a special token that could, later on, be used for authentication. This token is passed back to the application as an authentication attribute. To enable this behavior, you will need to turn on the feature via:

```properties
cas.authn.token.sso-token-enabled=true
```

Next, when you log in to an application successfully the CAS validation payload will include:
{% include googlead1.html  %}
```xml
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
    <cas:authenticationSuccess>
        <cas:user>casuser</cas:user>
        <cas:attributes>
            <cas:token>eyJjdHkiOiJK...</cas:token>
        </cas:attributes>
    </cas:authenticationSuccess>
</cas:serviceResponse>
```

The application may then use this token as a form of credential for JWT authentication with CAS.

You may also ask CAS to generate single sign-on tokens for you out of band using the `tokenAuth` actuator endpoint:

```bash
curl --location --request POST \
  'https://mmoayyed.example.net/cas/actuator/tokenAuth/casuser?service=https://www.example.org' \
  --header 'Content-Type: application/json'
```

<div class="alert alert-warning">
  <strong>WATCH OUT!</strong><br/>The security of the exposed endpoints should be taken into account very seriously. For production, you should carefully choose which endpoints to expose and how to secure access to them with proper forms of authentication.
</div>

...and the response will produce the token back to you: 
{% include googlead1.html  %}
```json
{
  "registeredService": {
  },
  "token": "eyJjdHkiOiJKV1..."
}
```

# OpenID Connect JWT Access Tokens

[JWT authentication](https://apereo.github.io/cas/7.2.x/installation/JWT-Authentication.html) in CAS can also support OpenID Connect
access tokens that are issued as JWTs themselves. CAS also allows OpenID Connect access tokens to be passed as the `token` parameter
which is decoded and then fetched as a valid access token from the ticket registry, allowing CAS establish an authenticated session 
and subsequently create a single sign-on session.

# Duo Security MFA With JWTs

I want to be able to use my JWT to authenticate with CAS and get a service ticket issued to my application at `https://www.example.org`, but I also want the request to be verified via second-factor credentials and an MFA flow provided by Duo Security. How do I do that?

{% include googlead1.html  %}

[Duo Security integration support](https://apereo.github.io/cas/7.2.x/installation/DuoSecurity-Authentication.html) of CAS can also support non-browser-based multifactor authentication requests. To trigger this behavior, applications (i.e. `curl`, REST APIs, etc.) need to specify a special `Content-Type` to signal to CAS that the request is submitted from a non-web-based environment. The multifactor authentication request is submitted to Duo Security in `auto` mode which effectively may translate into an out-of-band factor (push or phone) recommended by Duo as the best for the user’s devices.

<div class="alert alert-warning">
  <strong>YMMV</strong><br/>If you are using a different kind of multifactor authentication provider, you will need to verify whether it's able to support such behaviors.
</div>

## Configure Duo Security

My overlay is prepped with the [relevant configuration module](https://apereo.github.io/cas/7.2.x/installation/DuoSecurity-Authentication.html) of course and settings that include integration keys, secret keys, etc.

## Application MFA Trigger

I am also going to configure [an application-based trigger](https://apereo.github.io/cas/develoment/installation/Configuring-Multifactor-Authentication-Triggers.html#applications) for `https://www.example.org` so that authentication requests are routed to the relevant multifactor authentication provider.

So my application record will take on the following form:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://www.example.org",
  "name" : "Example",
  "id" : 1000,
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-duo" ] ]
  },
  "properties" : {
    "@class" : "java.util.HashMap",
    "jwtSigningSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MY4Jpxr5VeZsJ..." ] ]
    },
    "jwtEncryptionSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MZCjxBbDFq9cHPdy..." ] ]
    }
  }
}
```

## Authenticate

Using `curl` again from a terminal, here is the authentication sequence:

```bash
$ curl -i "https://mmoayyed.example.net/cas/login? \
  service=https://www.example.org"
  --header "token:eyJjdHkiOiJKV1QiLCJ..." \
  --header "Content-Type: application/cas"

HTTP/1.1 302
...
Location: https://www.example.org?ticket=ST-1-gdfe1zfAuHv9vG6Do...
...
```

Things work the same as before, except that this time your device registered with Duo Security will receive a  notification where your approval will authorize CAS to establish a session and generate a ticket.

# JWT Service Tickets

All operations so far have issued a regular service ticket back to the application that must be validated in a subsequent trip so the application can retrieve the authenticated user profile. In a different variation, it's possible for the service ticket itself to [take on the form of a JWT](https://apereo.github.io/cas/7.2.x/installation/Configure-ServiceTicket-JWT.html). 

{% include googlead1.html  %}

JWT-based service tickets are issued to applications based on the same semantics defined by the CAS Protocol. CAS having received an authentication request via its `/login` endpoint will conditionally issue back JWT service tickets to the application in the form of a `ticket` parameter via the requested http method.

<div class="alert alert-info">
  <strong>Let's REST</strong><br/>In case you are using the CAS REST APIs, you should know that service tickets issued as part of REST API operations <a href="https://apereo.github.io/cas/7.2.x/protocol/REST-Protocol.html#jwt-service-tickets">may also be JWTs</a>.
</div>

## Configure JWTs

For CAS to transform service tickets into JWTs, essentially we need to execute the reverse of the above configuration steps. We will need to ensure CAS is provided with relevant keys to generate JWTs and these keys are in turn used by the application to unpack the *JWTness* of the generated service ticket. 

The overlay also needs to be equipped with [the relevant extension module](https://apereo.github.io/cas/7.2.x/installation/Configure-ServiceTicket-JWT.html) of course to allow for this functionality.

You may generate the required secrets manually per the above link. In this example, I left them undefined in my properties which forces CAS to generate a few on its own and warn me about them when it starts up:

```bash
... - <Secret key for encryption is not defined for [Token/JWT Tickets]; 
    CAS will attempt to auto-generate the encryption key>
... - <Generated encryption key [...] of size [256] for [Token/JWT Tickets]. 
    The generated key MUST be added to CAS settings under setting [cas.authn.token.crypto.encryption.key].>
... - <Secret key for signing is not defined for [Token/JWT Tickets]. 
    CAS will attempt to auto-generate the signing key>
... - <Generated signing key [...] of size [512] for [Token/JWT Tickets]. 
    The generated key MUST be added to CAS settings under setting [cas.authn.token.crypto.signing.key].>
```

Fine! Let's proceed.

## Configure Application

JWTs as service tickets are issued on a per-application basis. This means that once CAS finds a matching record for the application in its registry, it will try to determine if the application requires JWTs as service tickets. So my application record will take on the following form:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://www.example.org",
  "name" : "Example",
  "id" : 1000,
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-duo" ] ]
  },
  "properties" : {
    "@class" : "java.util.HashMap",
    "jwtSigningSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MY4Jpxr5VeZsJ..." ] ]
    },
    "jwtEncryptionSecret" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "MZCjxBbDFq9cHPdy..." ] ]
    },
    "jwtAsServiceTicket" : {
      "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
      "values" : [ "java.util.HashSet", [ "true" ] ]
    }
  }
}
```

Now, we are ready to start sending requests.

## Authenticate

Using `curl` again from a terminal, here is the authentication sequence:
{% include googlead1.html  %}
```bash
$ curl -i "https://mmoayyed.example.net/cas/login? \
  service=https://www.example.org" 
  --header "token:eyJjdHkiOiJKV1QiLCJ..." \
  --header "Content-Type: application/cas"

HTTP/1.1 302
...
Location: https://www.example.org?ticket=eyJhbGciOiJIUzUxMiJ9.WlhsS05tRllRV2xQYVVwRlVsV...
...
```

This works the same as before, except that now the `ticket` parameter contains a JWT as a service ticket. 
 
To validate the token, you may ask CAS to produce the public key version of the key that was used to sign the token especially if your signing keys are defined as an RSA-enabled private/public keypair. This can be done using the `jwtTicketSigningPublicKey` actuator endpoint:
{% include googlead1.html  %}
```bash
curl --location --request GET \
  'https://mmoayyed.example.net/cas/actuator/jwtTicketSigningPublicKey? \
  service=https://www.example.org' \
  --header 'Content-Type: application/json'
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
