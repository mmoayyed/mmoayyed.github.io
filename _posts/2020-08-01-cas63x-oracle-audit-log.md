---
layout:     post
title:      Apereo CAS - Audit Logs Managed by Oracle Database
summary:    Learn how to store, read, and manage CAS audit logs in Oracle databases.
published: true
tags:       [CAS]
---

Apereo CAS exposes several [audit operations](https://apereo.github.io/cas/development/installation/Audits.html) that capture events such as creation and removal of tokens, authentication sessions, requests and responses, and a lot more. Each audited operation typically carries a subject, an action, date/time of the event as well as other peripheral types of information such as client and server IP addresses, etc. Audit events can of course be managed and stored in a variety of database types, the most common of which happens to be [relational databases](https://apereo.github.io/cas/development/installation/Audits.html#database-audits) such as MySQL, Oracle, etc.

This post demonstrates an overview of how audit events can be stored in an Oracle relational database and reviews the configuration required for Oracle databases to correctly retrieve,  filter and clean up audit history.

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Initial Setup

Support for storing audit data into a relational database is first enabled by including the appropriate auto-configuration module in the build script of the [CAS WAR Overlay](https://apereo.github.io/cas/development/installation/WAR-Overlay-Installation.html):

```gradle
implementation "org.apereo.cas:cas-server-support-audit-jdbc:${project.'cas.version'}"
```

Next, CAS configuration needs to be told about the presence of the database:

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
  <strong>Schema Generation</strong><br/>Note the presence of the <code>ddl-auto</code> field which allows Hibernate to automatically generate the database schema required for audits. This mode will also automatically drop the generated schemas at the end of every session, and is <strong>primarily useful for development and testing</strong>. To learn more about other appropriate options for production, <a href="https://apereo.github.io/cas/development/configuration/Configuration-Properties-Common.html#ddl-configuration">see this</a>.
</div>

That might be just enough; however, depending on how the Oracle database may be installed and configured, you may receive an error complaining about <code>ORA-01843: Not a Valid Month</code>. What is that about?

## ORA-01843: Not a Valid Month

This error most likely has to do with the fact that when Oracle is installed, the default format in which dates are expected, (likely specified in the <code>NLS_DATE_FORMAT</code> column of the <code>NLS_SESSION_PARAMETERS</code> table), might not quite match CAS' expectations of date values and format. To remove this error, CAS configuration must be modified to use the appropriate date format. Finally, the SQL query used to fetch and filter audits should also be modified to correctly cast and transform date values:


{% include googlead1.html  %}

```properties
cas.audit.jdbc.date-formatter-pattern: yyyy-MM-dd
cas.audit.jdbc.select-sql-query-template: SELECT * FROM %s WHERE \
     AUD_DATE>=TO_DATE('%s','YYYY-MM-DD') ORDER BY AUD_DATE DESC            
```

## Cleaning Records

By default, a background job is automatically scheduled to run at specific intervals to clean up stale audit records in the database. The configuration of the scheduler as well as staleness criteria can also be configured using the CAS configuration:

```properties
cas.audit.jdbc.max-age-days: 180
cas.audit.jdbc.schedule.enabled: true
cas.audit.jdbc.schedule.start-delay: 10PTS
cas.audit.jdbc.schedule.repeat-interval: 60PTS
```

The above settings instruct CAS to schedule the cleaner process, running it every minute to remove audit records from the database that are older than 180 days. 

## Viewing Audits

The audit management facilities in Apereo CAS can be fetched using [actuator endpoints](https://apereo.github.io/cas/development/installation/Audits.html#administrative-endpoints). These endpoints, *once exposed, secured and enabled*, allow the adopter to peek into the current contents of the audit database and report back records based on configurable filtering criteria.


{% include googlead1.html  %}

For instance, the following endpoint is expected to produce audit records for the past 5 days:

```bash
curl -u casuser:Mellon https://sso.example.org/cas/actuator/auditLog/P5D | jq 
```

<div class="alert alert-info">
  <strong>Note</strong><br/>This post assumes that all CAS actuator endpoints are protected with basic auth using the predefined
  credentials <code>casuser</code> and <code>Mellon</code> for the username and password, respectively.
</div>

You can also put together advanced querying criteria based on multiple conditions. For example, you can fetch all audit events for the past day performed by `casuser`:

```bash
curl -H "Content-Type: application/json" -X POST \
     -d '{"interval":"P1D", "principal":"casuser"}' \
     https://sso.example.org/cas/actuator/auditLog | jq
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)