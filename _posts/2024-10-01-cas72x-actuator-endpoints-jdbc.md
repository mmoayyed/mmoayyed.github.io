---
layout:     post
title:      Apereo CAS - Actuator Endpoints Security with SQL Databases
summary:    Learn how to secure CAS actuator endpoints using basic authentication and accounts found in SQL databases via Spring Security.
tags:       ["CAS 7.2.x", "Monitoring", "Spring Boot"]
---

CAS, being a Spring-Boot application at heart, includes a number of endpoints to help you monitor and manage the server when it’s pushed to production. You can choose to manage and monitor the deployment using HTTP endpoints, referred to as *actuators*. Such actuator endpoints can be secured in a variety of ways, the most common of which would be username/password via basic authentication. In this blog post, we will examine the security configuration of actuator endpoints secured whose access is controlled via a SQL database.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `7.2.x`
- Java 21
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)

## Configuration

Let's begin with the premise that you have enabled and exposed the `health` actuator endpoint. As the name suggests, this endpoint provides detailed information about the health of the CAS server. We will also mark the endpoint's access rule as `AUTHENTICATED` to disable anonymous access:
{% include googlead1.html  %}
```properties
management.endpoint.health.enabled=true
management.endpoints.web.exposure.include=health

cas.monitor.endpoints.endpoint.health.access=AUTHENTICATED
```

At this point, if you attempt to access the `health` endpoint, 
{% include googlead1.html  %}
```bash
curl https://sso.example.org/cas/actuator/health | jq 
```

{% include googlead1.html  %}

...you should see the following output:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "path": "/cas/actuator/health"
}
```

So far, so good.

## Spring Security JDBC

The `AUTHENTICATED` access rule forces CAS, via Spring Security, to require authenticated requests via basic authentication. Therefore, we need to teach CAS about credential sources such as SQL databases that can validate credentials and report back the authentication result status, thereby allowing or refusing access. To enforce security, CAS takes advantage of Spring Security's JDBC support to connect to a variety of databases, look up user information from different schemas and enforce access. The expected database schema would be as follows:
{% include googlead1.html  %}
```sql
create table users(
	username varchar_ignorecase(50) not null primary key,
	password varchar_ignorecase(500) not null,
	enabled boolean not null
);

create table authorities (
	username varchar_ignorecase(50) not null,
	authority varchar_ignorecase(50) not null,
	constraint fk_authorities_users foreign key(username) references users(username)
);
create unique index ix_auth_username on authorities (username,authority);
```

The `authority` column specifies the role assigned to the user. In our setup, accessing CAS actuator endpoints will require both a valid username/password AND an `admin` authority or role assigned to the account.

Now, let's configure CAS to talk to our database:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.jdbc.driver-class=...
cas.monitor.endpoints.jdbc.ddl-auto=none
cas.monitor.endpoints.jdbc.dialect=...
cas.monitor.endpoints.jdbc.user=...
cas.monitor.endpoints.jdbc.password=...
cas.monitor.endpoints.jdbc.url=...
```

As discussed, we want to enforce `ADMIN` level security before actuator endpoints are accessed:

```properties
spring.security.user.roles=ADMIN
cas.monitor.endpoints.jdbc.role-prefix=ROLE_
```

Finally, we need to instruct CAS to locate user accounts using a dedicated SQL query:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.jdbc.query=SELECT * FROM USERS WHERE username = ?
```

...and for extra credit, we can instruct CAS to use a better hashing algorithm when it comes to decoding and validating passwords in our SQL table:
{% include googlead1.html  %}
```properties
cas.monitor.endpoints.jdbc.password-encoder.type=DEFAULT
cas.monitor.endpoints.jdbc.password-encoder.encoding-algorithm=SHA-256
```

That is it! Now, when you attempt to access the `health` actuator endpoint, your credentials with the right role should get you in:
{% include googlead1.html  %}
```bash
curl -u casuser:M#ll0n https://sso.example.org/cas/actuator/health | jq 
```

For this to work, you would need to make sure `casuser` exists in the right tables with the right `ADMIN` role/authority, and its corresponding password is properly encoded using `SHA-256`.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
