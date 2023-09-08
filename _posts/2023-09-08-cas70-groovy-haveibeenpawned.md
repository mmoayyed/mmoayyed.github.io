---
layout:     post
title:      Apereo CAS - Have you been pawned?
summary:    Learn how Apereo CAS may be configured to check for pawned passwords and warn the user, using the haveibeenpawned.com service
tags:       ["CAS 7.0.x", "Groovy"]
---

[Have I been pwned](https://haveibeenpwned.com/API/v2) is an online service that tracks security breaches and other datalogs on the internet, 
allowing you to check if your passwords linked to an email have been compromised. This is a very simple method and does not guarantee that your stuff is safe, 
or will continue to be safe. It does, however, allow you to have an idea of when data linked to your accounts might have been exposed, 
and whether you changed (or not) your passwords since that point.

{% include googlead1.html  %}

A CAS deployment, as an entity that can support username/password credentials, can be integrated with this service such that after the user logs 
in with a valid password, CAS may check it against the [service API](https://haveibeenpwned.com/API/v2#SearchingPwnedPasswordsByRange) and present a page to the user notifying them if their password has been pwned suggesting they should change it, but allow them to continue.

This sort of thing is fairly simple to do in CAS and while there are a variety of ways to tap into the authentication flow, in this post we shall take advantage of
the CAS authenticator post-processors supported by a Groovy script. Our starting position is based on the following:

- CAS `7.0.x`
- Java `21`

## Configuration

First, we are going to teach CAS about the Groovy script that is to contact the relevant APIs and check for a pawned password:

```properties
cas.authn.core.engine.groovy-post-processor.location=file:/etc/cas/config/GroovyPostProcessor.groovy
```

Our script itself may look like this:

```groovy
import org.apereo.cas.*

def run(Object[] args) {
    def builder = args[0]
    def transaction = args[1]
    def logger = args[2]

    def credential = transaction.getPrimaryCredential().get()
    def password = credential.password as char[]

    /*
        DIY: Contact the API using the SHA-1 digest of the credential password.
        Parse through the results, check for matches and produce a warning
        where appropriate.
     */
    if (ohNoPasswordHasBeenPawned()) {
        builder.addWarning(new DefaultMessageDescriptor("password.pawned"))
    }
}

def supports(Object[] args) {
    def credential = args[0]
    def logger = args[1]
    credential instanceof UsernamePasswordCredential
}
```

Of course, the CAS message/language bundle (typically `custom_messages.properties` file) should also contain the text for the warning code `password.pawned`:

```properties
password.pawned=Your password is commonly used. Go <a href="https://example.org">here</a> to change it.
```

Note that the script itself is automatically monitored and cached for changes, so feel free to tweak and update as often as needed to test
your changes without restarting the CAS server environment.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
