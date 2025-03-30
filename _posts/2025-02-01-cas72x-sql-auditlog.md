---
layout:     post
title:      Apereo CAS - Audit Logs Managed by SQL Databases
summary:    Learn how to store, read, and manage CAS audit logs in SQL databases.
tags:       ["CAS 7.2.x", "RDBMS", "Monitoring", "Audits"]
---

Apereo CAS exposes several [audit operations](https://apereo.github.io/cas/7.2.x/audits/Audits.html) that capture events such as creation and removal of tokens, authentication sessions, requests and responses, and a lot more. Each audited operation typically carries a subject, an action, date/time of the event as well as other peripheral types of information such as client and server IP addresses, etc. Audit events can of course be managed and stored in a variety of database types, the most common of which happens to be [relational databases](https://apereo.github.io/cas/7.2.x/audits/Audits-Database.html) such as MySQL, Oracle, etc.
{% include googlead1.html  %}
This post demonstrates an overview of how audit events can be stored in a relational database and reviews the configuration required for a few databases to correctly retrieve, filter and clean up audit history.

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `7.2.x`
- Java `21`

# Initial Setup

Support for storing audit data into a relational database is first enabled by including the appropriate auto-configuration module in the build script of the [CAS WAR Overlay](https://apereo.github.io/cas/7.2.x/installation/WAR-Overlay-Installation.html):
{% include googlead1.html  %}
```gradle
implementation "org.apereo.cas:cas-server-support-audit-jdbc"
```

Next, CAS configuration needs to be told about the presence of an Oracle database:

{% include googlead1.html  %}

```properties
cas.audit.jdbc.dialect: org.hibernate.dialect.Oracle12cDialect
cas.audit.jdbc.driver-class: oracle.jdbc.driver.OracleDriver
cas.audit.jdbc.password: password
cas.audit.jdbc.url: jdbc:oracle:thin:@127.0.0.1:1521:XYZ
cas.audit.jdbc.user: user

cas.audit.jdbc.ddl-auto: create-drop    
```

<div class="alert alert-info">
  <strong>Schema Generation</strong><br/>Note the presence of the <code>ddl-auto</code> field which allows Hibernate to automatically generate the database schema required for audits. This mode will also automatically drop the generated schemas at the end of every session, and is <strong>primarily useful for development and testing</strong>.
</div>

The same exact construct can be used for a PosgreSQL database:
{% include googlead1.html  %}
```properties
cas.audit.jdbc.user=postgres
cas.audit.jdbc.password=password
cas.audit.jdbc.driver-class=org.postgresql.Driver
cas.audit.jdbc.url=jdbc:postgresql://localhost:5432/audit
cas.audit.jdbc.dialect=org.hibernate.dialect.PostgreSQLDialect
```

## Cleaning Records

By default, a background job is automatically scheduled to run at specific intervals to clean up stale audit records in the database. The configuration of the scheduler as well as staleness criteria can also be configured using the CAS configuration:
{% include googlead1.html  %}
```properties
cas.audit.jdbc.max-age-days: 180
cas.audit.jdbc.schedule.enabled: true
cas.audit.jdbc.schedule.start-delay: PT10S
cas.audit.jdbc.schedule.repeat-interval: PT60S
```

The above settings instruct CAS to schedule the cleaner process, running it every minute to remove audit records from the database that are older than `180` days. 

You may also turn off the cleaner background job if you intend to own the retetion policy:
{% include googlead1.html  %}
```properties
cas.audit.jdbc.schedule.enabled=false
```

## Viewing Audits

The audit management facilities in Apereo CAS can be fetched using [actuator endpoints](https://apereo.github.io/cas/7.2.x/audits/Audits.html). These endpoints, *once exposed, secured and enabled*, allow the adopter to peek into the current contents of the audit database and report back records based on configurable filtering criteria.
<div class="alert alert-info">
  <strong>Note</strong><br/>This post assumes that all CAS actuator endpoints are protected with basic auth using the predefined
  credentials <code>casuser</code> and <code>Mellon</code> for the username and password, respectively.
</div>
{% include googlead1.html  %}

For instance, the following endpoint is expected to produce audit records for the past 5 days:

```bash
curl -u casuser:Mellon https://sso.example.org/cas/actuator/auditLog?interval=P5D | jq 
```



# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)