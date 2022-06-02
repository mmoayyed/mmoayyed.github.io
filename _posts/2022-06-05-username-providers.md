---
layout:     post
title:      Apereo CAS - Sharing Subject Identifiers with Client Applications
summary:    Review configuration options for application policies that allow a CAS, SAML2, or OpenID Connect relying party to receive the authenticated username from Apereo CAS.
tags:       ["CAS 6.6.x", "SAML", "OpenID Connect"]
---

Applications and relying parties that are integrated and registered with Apereo CAS often need to receive the authenticated username to verify the authentication transaction and allow access into their domain. Depending on the authentication protocol used to communicate with the application, this identifier can be shared with the application in a variety of ways and its structure and format can be freely customized. 
{% include googlead1.html %}

In this blog post, we will take a look at a few of the popular techniques that can be used to share the username with applications that can speak CAS, SAML2, and OpenID authentication protocols, with the assumption that application registration policies are managed as JSON files using the [JSON Service Registry](https://apereo.github.io/cas/development/services/JSON-Service-Management.html). 

{% include googlead1.html %}

Our starting position is based on the following:

- CAS `6.6.x`
- Java 11

# Scoped Identifiers

Suppose you are in the process of integrating a content management system with CAS, using the CAS protocol. This CMS requires subject identifiers to always be in an *UPPERCASE* format and scoped to a particular domain. The following policy demonstrates this use case:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://cms.example.net",
  "name" : "CMS",
  "id" : 1,
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceUsernameProvider",
    "canonicalizationMode" : "UPPER",
    "scope": "example.net"
  }
}
```
{% include googlead1.html %}
If we take `casuser` as the authenticated subject identifier, then when the validation response is produced by CAS and shared with the application, the `<cas:user>` tag in the final CAS validation payload would contain `CASUSER@EXAMPLE.NET`.

# Attribute-based Identifiers

Let's imagine the CMS changes requirements and instead wants to receive the subject's email address as the identifier. We assume that when our `casuser` authenticates, a collection of pre-defined attributes are also fetched from attribute sources among which the `email` attribute exists. With that assumption, the following policy demonstrates this use case:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://cms.example.net",
  "name" : "CMS",
  "id" : 1,
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.PrincipalAttributeRegisteredServiceUsernameProvider",
    "usernameAttribute" : "email"
  }
}
```

<div class="alert alert-info">
<strong>Note</strong><br />The configuration tasks and details required to fetch the <code>email</code> attribute from attribute repository sources configured in CAS are outside the scope of this blog post. If you look around the blog, you are likely to find many other related posts and examples.</div>

This time around, the `<cas:user>` tag in the final CAS validation payload would contain `casuser@example.net` which is identical to the value of the `email` attribute retrieved for the same user.

# Scripted Identifiers

Now, let's imagine the CMS changes requirements *again* and instead wants to receive the subject's identifier using the following formula: `<uid>#<ssi>` where both `uid` and `ssi` are attributes that are fetched and retrieved from CAS attribute sources *AND* the final value **MUST** always be in lower-case. With that assumption, the following policy demonstrates this use case:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://cms.example.net",
  "name" : "CMS",
  "id" : 1,
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.GroovyRegisteredServiceUsernameProvider",
    "groovyScript" : "groovy { return attributes['uid'][0] + '#' + attributes['ssi'][0] }",
    "canonicalizationMode" : "LOWER"
  }
}
```
{% include googlead1.html %}
This time around, the `<cas:user>` tag in the final CAS validation payload would contain `casuser#342135` which should match the formula requested by the CMS application.

# Identifier Attribute

Let's take the previous example, and slightly alter it; our CMS application informs us that for *insert-reason*, it is unable to accept and parse the `<cas:user>` tag and instead wishes to receive the user identifier inside the `<cas:attributes>` blog as a typical attribute named as `orgSubjectId`. With that assumption, the following policy demonstrates this use case:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://cms.example.net",
  "name" : "CMS",
  "id" : 1,
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.GroovyRegisteredServiceUsernameProvider",
    "groovyScript" : "groovy { return attributes['uid'][0] + '#' + attributes['ssi'][0] }",
    "canonicalizationMode" : "LOWER",
    "principalIdAttribute" : "orgSubjectId"
  }
}
```
{% include googlead1.html %}
Complicated, right? The `principalIdAttribute` allows you to choose an attribute name of your choosing that will be stuffed into the final bundle of CAS attributes, carrying the CAS authenticated principal identifier as constructed by the script. 

# OpenID Connect Subjects

In all previous examples, our CMS application was using the CAS protocol as its main method of integration with CAS. Let's now change gears and assume that the CMS wants to use the OpenID Connect protocol and wants to receive the subject identifier as part of the `sub` claim that is contained within the ID token. If you have been following along so far, you will be glad to know that the same `usernameAttributeProvider` configuration blocks equally apply to OpenID Connect application policies. For example, the following registration policy would apply to our CMS acting as an OpenID Connect relying party:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "cid12345",
  "clientSecret": "s3crEt",
  "serviceId" : "https://cms.example.net",
  "name" : "CMS",
  "id" : 1,
  "scopes" : [ "java.util.HashSet", [ "openid", "profile" ] ],
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.GroovyRegisteredServiceUsernameProvider",
    "groovyScript" : "groovy { return attributes['uid'][0] + '#' + attributes['ssi'][0] }",
    "canonicalizationMode" : "LOWER"
  }
}
```

# SAML2 NameIDs

Just as in our previous example, the same type of configuration block would also equally apply to SAML2 service provider registrations. Configuration of the username in this context means controlling the `NameID` attribute in the final SAML2 response. If we take the previous example as a baseline, the following policy would be relevant for our CMS application acting as a SAML2 service provider:

{% include googlead1.html %}

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://cms.example.net/saml/sp",
  "metadataLocation": "/path/to/cms-metadata.xml",
  "name" : "CMS",
  "id" : 1,
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.GroovyRegisteredServiceUsernameProvider",
    "groovyScript" : "groovy { return attributes['uid'][0] + '#' + attributes['ssi'][0] }",
    "canonicalizationMode" : "LOWER"
  }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
