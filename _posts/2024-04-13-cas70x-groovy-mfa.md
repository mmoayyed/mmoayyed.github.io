---
layout:     post
title:      Apereo CAS - Scripting Multifactor Authentication Triggers
summary:    Learn how Apereo CAS may be configured to trigger multifactor authentication using Groovy conditionally decide whether MFA should be triggered for internal vs. external access, taking into account IP ranges, LDAP groups, etc.
tags:       ["CAS 7.0.x", "MFA", "Groovy"]
---

If you have configured multifactor authentication with CAS with a provider (i.e. [Duo Security][duosecurity]), you may find yourself in need of conditionally triggering MFA based on a variety of factors rather dynamically. Here is a possible scenario:

- Allow internal access to a service without forcing MFA via IP range
- Rejecting external access to a service unless in MFA LDAP group

CAS provides a large number of strategies to [trigger multifactor authentication][triggers]. To deliver the use case, we can take advantage of a Groovy-based trigger to implement said conditions. The script is invoked by CAS globally (regardless of application, user, MFA provider, etc) whose outcome should determine whether an MFA provider can take control of the subsequent step in the authentication flow.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `7.0.x`
- Java `21`

## Configuration

With [Duo Security][duosecurity] configured as our multifactor authentication provider, we can start off with the following settings:
{% include googlead1.html  %}
```properties
cas.audit.engine.alternate-client-addr-header-name=X-Forwarded-For
cas.authn.mfa.groovy-script.location=file:/path/to/GroovyScript.groovy
```

Here, we are teaching CAS to use the `X-Forwarded-For` header when fetching client IP addresses, and we are also indicating a reference path to our yet-to-be-written Groovy script.

The script itself would have the following structure:
{% include googlead1.html  %}
```groovy
import java.util.*
import org.apereo.inspektr.common.web.*;

class GroovyMfaScript {

    def privateIPPattern = "(^127\\.0\\.0\\.1)";
    def mfaGroupPattern = "CN=MFA-Enabled";
    def servicePattern = "https://app.example.org";

    def run(final Object... args) {
        def (service,registeredService,authentication,httpRequest,logger) = args

        if (service.id.contains(servicePattern)) {
            def clientInfo = ClientInfoHolder.getClientInfo();
            def clientIp = clientInfo.getClientIpAddress();
            logger.info("Client IP [{}]", clientIp);
            if (clientIp.find(privateIPPattern)) {
                logger.info("Internal IP address found");

                def memberOf = authentication.principal.attributes['memberOf']
                for (String group : memberOf) {
                    if (group.contains(mfaGroupPattern)) {
                        logger.info("In MFA group");
                        return "mfa-duo";
                    }
                }
                logger.info("Membership {} does not qualify for MFA", memberOf);
                return null;
            }
            logger.info("Client IP is not internal. Activating MFA");
            return "mfa-duo";
        }
        return null;
    }
}
```

The above script goes through the following conditions:
{% include googlead1.html  %}
- The requesting application is `https://app.example.org`.
- The incoming client IP address matches the pattern `(^127\\.0\\.0\\.1)`.
- The authenticated user carries a `memberOf` attribute with a value of `CN=MFA-Enabled`.

If all of those conditions are true, then MFA is activated...or else ignored. Note that the function of a Groovy trigger is not specific to a multifactor authentication provider. So long as the conditions execute correctly and the provider is configured properly, it can be used to signal any provider back to the authentication flow.


# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)


[duosecurity]: https://apereo.github.io/cas/7.0.x/mfa/DuoSecurity-Authentication.html
[triggers]: https://apereo.github.io/cas/7.0.x/mfa/Configuring-Multifactor-Authentication-Triggers.html