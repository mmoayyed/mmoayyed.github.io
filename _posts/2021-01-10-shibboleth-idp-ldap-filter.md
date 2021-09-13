---
layout:     post
title:      Shibboleth IdP - Scriptable LDAP Filter
summary:    A review of scripted query templates of the LDAP DataConnector in the Shibboleth Identity Provider to build LDAP queries dynamically.
published: true
tags:       [Shib]
---

I have been working on a use case that involves configuring the [Shibboleth Identity Provider](https://wiki.shibboleth.net/confluence/display/IDP4/Home) to handle a SAML2 authentication flow to an external SAML2-capable Okta identity provider. The external identity provider was releasing a SAML2 NameID in the `eppn` format (i.e. `user@example.org`) and the Shibboleth installation was set to resolve attributes using the filter defined in the LDAP [`DataConnector`](https://wiki.shibboleth.net/confluence/display/IDP4/LDAPConnector):

```xml
<DataConnector id="myLDAP" 
     xsi:type="LDAPDirectory"
     ...
     exportAttributes="mail displayName">
     <FilterTemplate>
          <![CDATA[
               (uid=$resolutionContext.principal)
          ]]>
     </FilterTemplate>
</DataConnector>
```

{% include googlead1.html  %}

This meant that regardless of the system handling the authentication attempt and whether it was the identity provider itself or the external Okta instance, querying LDAP for attributes was always based on the resolved principal matching the `uid` attribute. For the Okta instance, this could cause the Shibboleth identity provider to load the incorrect account. 

The question is, could the LDAP `FilterTemplate` choose a different attribute based on the structure of the resolved principal? 

{% include googlead1.html  %}

# Scripting Filter Templates

The answer, though not quite clear from the documentation to the novice eye, is yes. The search filter is put together using an instance of `ExecutableSearchBuilder<ExecutableSearchFilter>` which can treat the provided template as an [Apache Velocity](https://velocity.apache.org/) template. This means that the Apache Velocity syntax and its scripting capabilities can be used to modify the search filter dynamically. So one possible filter template could as follows:

{% include googlead2.html  %}

```xml
<FilterTemplate>
<![CDATA[
     #set ($principal = $resolutionContext.principal)
     #if( $principal.contains("@example.org") )
          (oktaNetId=$principal.substring(0, $principal.indexOf("@")) )
     #else
          (uid=$principal)
     #end
]]>
</FilterTemplate>
```

That's it. 


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)