---
layout:     post
title:      Apereo CAS - Token Authentication w/ JWTs
summary:    A short overview of Apereo CAS handling authentication events accompanied by JWTs as credentials.
tags:       ["CAS 6.6.x", "Authentication"]
---


Apereo CAS has had built-in support for [JWTs](https://jwt.io/) for some time now in a variety of different ways. Notions of JWT support really date back to CAS `3.5.x` and since then, support for JWTs has significantly improved and grown over the years and continues to get better with an emerging number of use cases whose chief concern is improving performance and removing round-trip calls, among other things.

{% include googlead1.html  %}

In this tutorial, I am going to take a look at how JWTs can be used as credentials to authenticate the user with Apereo CAS and get back a session, in non-interactive authentication modes mostly. Our starting position is as follows:

- Apereo CAS `6.6.x`
- curl `7.79.1`
- [CAS Initializr](https://apereo.github.io/cas/6.6.x/installation/WAR-Overlay-Initializr.html)

# Overview

CAS provides support for token-based authentication on top of JWTs, where an authentication request can be granted an SSO session based on a form of credentials that are JWTs. CAS expects a `token` parameter (or request header) to be passed along to the `/login` endpoint as the credential. The parameter value must of course be a JWT.

# Configuration

To generate a JWT, I will use the [CAS Command-line Shell][shell]. This will allow you to enter the interactive shell, where you have documentation, tab completion, and history for all commands. 

When you have generated your CAS overlay, you can get and run the shell using:
{% include googlead1.html  %}
```bash
./gradlew runShell
...
java -jar build/libs/cas-server-support-shell-6.6.x.jar
```

Once you run the shell, you should be greeted as such:

```bash
cas>generate-jwt --subject Misagh

==== Signing Secret ====
MY4Jpxr5VeZsJ...

==== Encryption Secret ====
MZCjxBbDFq9cHPdy...

Generating JWT for subject [Misagh] with signing key size [256], signing algorithm [HS256],
    encryption key size [48], encryption method [A192CBC-HS384] and encryption algorithm [dir]

==== JWT ====
eyJjdHkiOiJKV1QiLCJ...
```
{% include googlead1.html  %}
Hooray! We have a JWT.

There are a variety of other parameters such as encryption methods and signing algorithms you can choose from to generate the JWT. For the purposes of this tutorial, let's keep things simple. Of course, you don't have to use the CAS command-line shell. Any valid compliant JWT generator would do fine.

<div class="alert alert-info">
  <strong>Don't Take Things Literally</strong><br/>I am abbreviating the secrets and the generated JWT above. Do NOT copy-paste these into your environment and configuration, thinking they might do the trick.
</div>

# Application Configuration

CAS [needs to be taught][jwtauthn] the security properties of the JWT to unpack and validate it and produce the relevant authenticated session. For a given authentication request, CAS will try to find the matching record for the application in its registry that is capable of validating JWTs. If such a record is found and the request is in fact accompanied by JWT credentials, the credential is validated and the service ticket issued.

{% include googlead1.html  %}

My CAS overlay is already equipped with the [relevant configuration module][jwtauthn] and my application record using [the JSON service registry][jsonsvc] looks something like this:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://www.example.org",
  "name" : "Example",
  "id" : 1000,
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
{% include googlead1.html  %}
Note that the `jwtSigningSecret` and `jwtEncryptionSecret` are those that are produced by the CAS command-line shell and shared with you when the JWT is created.

Now, we are ready to start sending requests. Using `curl` from a terminal, here is the authentication sequence:

```bash
$ curl -i "https://mmoayyed.example.net/cas/login?\
  service=https://www.example.org&token=eyJjdHkiOiJKV1QiLCJ..."

HTTP/1.1 302
...
Location: https://www.example.org?ticket=ST-1-zmEt1zfAuHv9vG6DogfBeH5ylmc-mmoayyed-4
...
```

A few things to note:

- The `-i` option allows `curl` to output the response headers where `Location` in the above case contains the redirect URL with the issued service ticket.
- The entire URL in the `curl` command is encased in double quotes. This is necessary for `curl` to ensure the query string is entirely passed along to CAS.

Of course, I can pass the JWT as a request header too:
{% include googlead1.html  %}
```bash
$ curl -i "https://sso.example.org/cas/login?service=https://www.example.org" \
  --header "token:eyJjdHkiOiJKV1QiLCJ..."

HTTP/1.1 302
...
Location: https://www.example.org?ticket=ST-1-qamgyzfAuHv9vG6DogfBeH5ylmc-mmoayyed-4
...
```

Grab the `ticket` from the `Location` header and proceed to validate it, as you would any regular service ticket.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[jwtauthn]: https://apereo.github.io/cas/6.6.x/installation/JWT-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[shell]: https://apereo.github.io/cas/6.6.x/installation/Configuring-Commandline-Shell.html
[jsonsvc]: https://apereo.github.io/cas/6.6.x/installation/JSON-Service-Management.html