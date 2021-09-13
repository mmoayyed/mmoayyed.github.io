---
layout:     post
title:      Apereo CAS - Securing Actuator Endpoints with LDAP
summary:    Learn how to secure CAS actuator endpoints using basic authentication and accounts found in LDAP.
tags:       [CAS]
---

CAS, being a Spring-Boot application at heart, includes several actuator endpoints to help you monitor and manage the server when it’s pushed to production. Such actuator endpoints can be secured in a variety of ways the most common of which would be username/password via basic authentication. In this blog post, we will examine the security configuration of actuator endpoints secured whose access is controlled via LDAP.

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)

## CAS Configuration

Actuator endpoints that are provided by CAS are available in a [separate extension module](https://apereo.github.io/cas/6.3.x/monitoring/Monitoring-Statistics.html) that must be included in the build configuration of the CAS WAR overlay. Once included, we can begin by enabling the `status` actuator endpoint and exposing it over HTTP. We will also mark the endpoint's access rule as `AUTHENTICATED` to disable anonymous access

```properties
management.endpoint.status.enabled=true
management.endpoints.web.exposure.include=status

cas.monitor.endpoints.endpoint.status.access=AUTHENTICATED
```

At this point, if you attempt to access the `status` endpoint, 

```bash
curl https://sso.example.org/cas/actuator/status | jq 
```

{% include googlead1.html  %}

...you should see the following output:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "path": "/cas/actuator/status"
}
```

## LDAP Configuration

The `AUTHENTICATED` access rule forces CAS, via Spring Security, to require authenticated requests via basic authentication. Therefor, we need to teach CAS about credential sources such as LDAP that can validate credentials and report back the authentication result status, thereby allowing or refusing access:

```properties
cas.monitor.endpoints.ldap.ldap-url=ldap://localhost:1389
cas.monitor.endpoints.ldap.base-dn=ou=people,dc=example,dc=org
cas.monitor.endpoints.ldap.search-filter=uid={user}
cas.monitor.endpoints.ldap.bind-dn=cn=Directory Manager,dc=example,dc=org
cas.monitor.endpoints.ldap.bind-credential=Password
```

This time, if you attempt to access the `status` endpoint, 

```bash
curl -u ldapuser:ldappassword https://sso.example.org/cas/actuator/status | jq 
```

...you should see the following output:

```json
{
  "status": 200,
  "description": "OK",
  "health": "UP",
  "host": "misaghmoayyed",
  "server": "https://sso.example.org",
  "version": "6.3.0"
}
```

## User Attributes and RBAC

Of course, not all valid accounts in LDAP should always be allowed access to an endpoint. What is often more desirable is the ability to limit access to a selection of authorized users based on predefined roles. For example, let's say that all valid users in LDAP who carry an `sn` attribute with a value of `admin` should be authorized for access, and all others should be denied. So let's teach CAS about this setup:

{% include googlead1.html  %}

```properties
cas.monitor.endpoints.ldap.ldap-authz.base-dn=ou=people,dc=example,dc=org
cas.monitor.endpoints.ldap.ldap-authz.search-filter=uid={user}
cas.monitor.endpoints.ldap.ldap-authz.role-attribute=sn
cas.monitor.endpoints.ldap.ldap-authz.role-prefix=ROLE_

# Access requirement that user roles must pass
spring.security.user.roles=ROLE_ADMIN
```

## User Groups and RBAC

Similarly, user roles can additionally be decided based on user's groups and memberships. Once the user is found in LDAP, an additional query will begin to look for user groups and memberships. When memberships are fetched from LDAP, the final authenticated profile is examines against pre-defined roles to determine access requirements:

```properties
cas.monitor.endpoints.ldap.ldap-authz.group-base-dn=ou=Groups,dc=example,dc=org
cas.monitor.endpoints.ldap.ldap-authz.group-filter=uniquemember={user}
cas.monitor.endpoints.ldap.ldap-authz.group-attribute=businessCategory
cas.monitor.endpoints.ldap.ldap-authz.group-prefix=GRP_

spring.security.user.roles=GRP_HR_ADMIN
```

{% include googlead2.html  %}

The `{user}` parameter will be replaced with the user DN at runtime to locate group membership. For each membership entry the value of the `businessCategory` is used to build the role, along with the prefix `GRP_`. For example, `cn=casuser,ou=People,dc=example,dc=org` is a member of the group `cn=HR Managers,ou=Groups,dc=example,dc=org`, as specified by the `uniquemember` attribute. The `businessCategory` for this membership is set to `HR_ADMIN`, which permits CAS to build the final role as `GRP_HR_ADMIN` and allows the endpoint request to pass authorization and gain access.

## Bonus

If you attempt to access the endpoint via the browser, you would be by default greeted with a login form and asked for username/password. To disable this behavior, make sure the following setting is defined:

```properties
cas.monitor.endpoints.form-login-enabled=false
```


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html