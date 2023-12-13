---
layout:     post
title:      Apereo CAS - Database Authentication & Attributes
summary:    Learn how to configure database authentication in Apereo CAS.
tags:       ["CAS 7.0.x", "Authentication", "RDBMS"]
---

This is a short and sweet tutorial on how to configure CAS to authenticate against a database and then resolve/release attributes.
Most of the material is based on the [available documentation](https://apereo.github.io/cas/development/authentication/Database-Authentication.html).

{% include googlead1.html  %}

This tutorial specifically focuses on:

- CAS `7.0.x`
- Java `21`

# Create Schema

In my setup, I have two tables: one called `USERS` where user accounts are kept and another called `USERATTRS` where user attributes are kept. My `USERS` table is rather simple, but the `USERATTRS` follows something of a *multi-row* setup. You want to learn more about this setup [here](https://apereo.github.io/cas/development/integration/Attribute-Resolution.html#person-directory).

{% include googlead1.html  %}

So here goes the SQL:

```sql
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS USERATTRS;

CREATE TABLE USERATTRS (
  id INT NOT NULL IDENTITY ,
  uid VARCHAR(50) NOT NULL,
  attrname VARCHAR(50) NOT NULL,
  attrvalue VARCHAR(50) NOT NULL
);

CREATE TABLE USERS (
  id INT NOT NULL IDENTITY ,
  uid VARCHAR(50) NOT NULL,
  psw VARCHAR(50) NOT NULL
);

INSERT INTO USERS (uid, psw)
VALUES ('mmoayyed', 'TheBestPasswordEver');

INSERT INTO USERATTRS (uid,  attrname, attrvalue)
VALUES ('mmoayyed', 'firstname', 'Misagh');

INSERT INTO USERATTRS (uid, attrname, attrvalue)
VALUES ('mmoayyed', 'lastname', 'Moayyed');

INSERT INTO USERATTRS (uid, attrname, attrvalue)
VALUES ('mmoayyed', 'phone', '+13476452319');
```

Note that for the time being, I am just keeping the password as plain-text in the table. No encoding or anything has taken place.

# Deploy CAS

Hop over to [the overlay installation](https://apereo.github.io/cas/development/installation/WAR-Overlay-Installation.html) and follow the instructions in the README file to get CAS built and deployed. The CAS version I am using today is `7.0.0-SNAPSHOT`.

# Configure CAS

Follow the steps [described here](https://apereo.github.io/cas/development/authentication/Database-Authentication.html) to add the needed CAS modules. You do not have to add any additional JARs and such for database drivers. CAS ships with a few [automatically and by default](https://apereo.github.io/cas/development/installation/JDBC-Drivers.html). To do so, find the `build.gradle` file in your CAS overlay, and locate the _correct_ `dependencies` block to add the following module:

```groovy
dependencies {
    /**
     * CAS dependencies and modules may be listed here.
     **/
    implementation "org.apereo.cas:cas-server-support-jdbc"
}
```

Once you have added the change, be sure to rebuild the CAS overlay. 

# Query Mode

Please note that for the purposes of this tutorial, we assume that all CAS configuration properties are put inside `/etc/cas/config/cas.properties`. You will need to create this file, if one does not already exist. 

For this tutorial, we are going to start with a form of database authentication called *Query Mode*. This is the approach where CAS authenticates a user by comparing the user password (which can be encoded with a password encoder) against the password on record determined by a configurable database query. This is what I actually needed to make this work:

{% include googlead1.html  %}
```
cas.authn.jdbc.query[0].sql=SELECT * FROM USERS WHERE uid=?
cas.authn.jdbc.query[0].user=database-user
cas.authn.jdbc.query[0].password=database-password
cas.authn.jdbc.query[0].field-password=psw
cas.authn.jdbc.query[0].url=jdbc:hsqldb:hsql://localhost:9001/xdb

cas.authn.jdbc.query[0].dialect=org.hibernate.dialect.HSQLDialect
cas.authn.jdbc.query[0].driver-class=org.hsqldb.jdbcDriver
```

The last two settings are important, and may vary depending on your database choice. For example, for PostgreSQL you could use:
{% include googlead1.html  %}
```
cas.authn.jdbc.query[0].driver-class=org.postgresql.Driver
cas.authn.jdbc.query[0].dialect=org.hibernate.dialect.PostgreSQLDialect
```

Or for MySQL you could use:

```
cas.authn.jdbc.query[0].driver-class=com.mysql.cj.jdbc.Driver
cas.authn.jdbc.query[0].dialect=org.hibernate.dialect.MySQLDialect
```

Or for Oracle you could use:

```
cas.authn.jdbc.query[0].driver-class=oracle.jdbc.driver.OracleDriver
cas.authn.jdbc.query[0].dialect=org.hibernate.dialect.OracleDialect
```

Remember to adjust the URL and connection string correctly for each database type.

I also need to disable static authentication. It would also be very nice if I could turn on `DEBUG` logs and see what CAS attempts to do:
{% include googlead1.html  %}

```properties
logging.level.org.apereo=DEBUG
cas.authn.accept.enabled=false
```

# Build and Deploy

Once you get CAS built, i.e `./gradlew clean build`, and deployed, logs should indicate something like this:

```bash
- <No password encoder shall be created given the requested encoder type [NONE]>
- <Created authentication handler [QueryDatabaseAuthenticationHandler] 
  to handle database url at [jdbc:hsqldb:hsql://localhost:9001/xdb]>
```

Log in with `mmoayyed` and `TheBestPasswordEver` and you should be in. Viola!

# Password Encoding

As an extra bonus exercise, let's turn on `MD5` password encoding. The MD5 hash of `TheBestPasswordEver` is `ca541f57a3041c3b85c553d12d3e64a8`.

So we will update the database accordingly.

```sql
UPDATE USERS SET psw='ca541f57a3041c3b85c553d12d3e64a8' WHERE uid='mmoayyed';
```

Then configure CAS to handle `MD5` password encoding:

```
cas.authn.jdbc.query[0].password-encoder.type=DEFAULT
cas.authn.jdbc.query[0].password-encoder.character-encoding=UTF-8

cas.authn.jdbc.query[0].password-encoder.encoding-algorithm=MD5
```

Or alternatively, if you wanted to use a different algorithm such as `SHA-256`, you could use:

```
cas.authn.jdbc.query[0].password-encoder.encoding-algorithm=SHA-256
```

# Build and Deploy

Once you get CAS built and deployed, logs should indicate something like this:

```bash
- <Creating default password encoder with encoding alg [MD5] and character encoding [UTF-8]>
```

{% include googlead1.html  %}

Build and deploy. Log in with `mmoayyed` and `TheBestPasswordEver` and you should be in. Logs may indicate:

```bash
- <Encoded password via algorithm [MD5] and character-encoding [UTF-8] is [ca541f57a3041c3b85c553d12d3e64a8]>
- <Provided password does match the encoded password>
- <Authentication handler [QueryDatabaseAuthenticationHandler] successfully authenticated [mmoayyed]>
```

Good job! Lets get some attributes now.

# Attributes

Because the `USERATTRS` follows something of a *multi-row* setup, we want to make sure CAS [can understand](https://apereo.github.io/cas/development/integration/Attribute-Resolution.html#person-directory) the specifics of this schema model. We will need to set up a separate attribute repository instance that CAS will contact once the user is fully authenticated. In our case, the attribute repository is the same database instance. So the configuration may look something like this:

```
cas.authn.attribute-repository.jdbc[0].single-row=false
cas.authn.attribute-repository.jdbc[0].sql=SELECT * FROM USERATTRS WHERE {0}
cas.authn.attribute-repository.jdbc[0].username=uid
cas.authn.attribute-repository.jdbc[0].url=jdbc:hsqldb:hsql://localhost:9001/xdb
cas.authn.attribute-repository.jdbc[0].column-mappings.attrname=attrvalue
```

Once CAS understands the schema, we should then specify which attributes really should be retrieved by CAS.

{% include googlead1.html  %}

```
cas.authn.attribute-repository.jdbc[0].attributes.firstname=firstname
cas.authn.attribute-repository.jdbc[0].attributes.lastname=lastname
# cas.authn.attribute-repository.jdbc[0].attributes.phone=phone
```

Note how I am skipping over `phone`.

The above says, *Retrieve attributes `firstname` and `lastname` from the repositories and keep them as they are*.
If we wanted to, we could virtually rename the attributes to for instance `TheFir$tN@me` and `simpleL@stnam3`.

# Release Attributes

There are multiple ways of [releasing attributes](https://apereo.github.io/cas/development/integration/Attribute-Release.html). For this tutorial, I am going to release them globally to all applications:

```properties
cas.authn.attribute-repository.default-attributes-to-release=firstname,lastname
```

Note how I am skipping over `phone`.

# Build and Deploy

For this to actually be tested, we need a client to which we can release attributes, right? You can use whatever client/application you like, as long as it's registered correctly with CAS and is able to retrieve attributes. When attempting to access the application, I get redirected to CAS. Once I log in and return, I see the following in the CAS logs on startup:

```bash
- <Configured multi-row JDBC attribute repository 
  for [jdbc:hsqldb:hsql://localhost:9001/xdb]>
- <Configured multi-row JDBC column mappings for 
  [jdbc:hsqldb:hsql://localhost:9001/xdb] are [{attrname=attrvalue}]>
- <Configured result attribute mapping for [jdbc:hsqldb:hsql://localhost:9001/xdb] 
  to be [{firstname=firstname, lastname=lastname}]>
```

Which shows that CAS has been able to understand the schema and map columns to attributes. Logging into the client application also shows me:

{% include googlead1.html  %} 

{% include image.html img="https://cloud.githubusercontent.com/assets/1205228/23163353/5c39f42a-f847-11e6-806e-6d4e3ca88805.png"
width="60%" title="Apereo CAS - Database Authentication & Attributes" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
