---
layout:     post
title:      Apereo CAS - Principal Transformation with Groovy
summary:    Learn how to transform the username prior to authentication attempts.
tags:       ["CAS 7.2.x", "Groovy"]
---

Apereo CAS provides options for each authentication strategy and method to modify and transform the username before attempting the authentication transaction. This is typically useful in scenarios where you want to standardize usernames across multiple authentication sources or manipulate the username by adding or replacing domain names, or enforce lowercase or uppercase transformations.

{% include googlead1.html  %}
This post demonstrates an how such transformation can be carried out using Groovy in a scripted fashion to look up the effective username from external sources.

Our starting position is as follows:

- CAS `7.2.x`
- Java `21`

# Setup

Let's imagine that a CAS deployment is configured to use LDAP authentication and intends to look up the effective username from a SQL database. We intend to achieve this lookup using a Groovy script to find out the effective username and let the LDAP authentication strategy build its filters, etc based on that value.
{% include googlead1.html  %}
```
cas.authn.ldap[0].principal-transformation.groovy.location=file:/path/to/script.groovy
```

Now all that is left is to write the actual script:
{% include googlead1.html  %}
```groovy
import groovy.sql.Sql

def run(Object... args) {
    def (providedUsername,logger) = args

    def dbUrl = 'jdbc:postgresql://localhost:5432/your_database'
    def dbUser = 'your_user'
    def dbPassword = 'your_password'
    def dbDriver = 'org.postgresql.Driver'

    def sql = Sql.newInstance(dbUrl, dbUser, dbPassword, dbDriver)
    def row = sql.firstRow("""
        SELECT uid FROM users WHERE username = ?
    """, [providedUsername])
    return row.uid
}
```

The script is tasked to establish a connection to a SQL database, and run the indicated SQL statement to find out the `uid` based on the provided username. For this to work correctly, we also need to ensure our CAS deployment is prepared to execute Groovy scripts via the following module:
{% include googlead1.html  %}
```groovy
dependencies {
  ...
  implementation "org.apereo.cas:cas-server-core-scripting"
  ...
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
