---
layout:     post
title:      Apereo CAS Delegated Authentication with ADFS
summary:    Learn how your Apereo CAS deployment may be configured to delegate authentication to Microsoft ADFS.
tags:       [CAS]
---

Apereo CAS has had support to [delegated authentication to Microsoft ADFS](https://apereo.github.io/cas/6.0.x/integration/ADFS-Integration.html) for quite some time now. This functionality, if memory serves me correctly, started around CAS `3.x` in form of an [extension](https://github.com/Unicon/cas-adfs-integration) which then later found its way into the CAS codebase as a first class feature. Since then, the functionality more or less has evolved to allow the adopter less configuration overhead and fancier ways to automated workflows.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

The story is actually quite simple: The integration between the CAS Server and ADFS delegates user authentication from CAS Server to ADFS, making CAS Server an ADFS client. *Delegation* of course is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate ADFS endpoint and on the return trip back, CAS is tasked to parse the response and extract claims, etc in order to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system such as ADFS in this case and CAS simply begins to act as a client or *proxy* in between.

In the most common use case, CAS is made entirely invisible to the end-user such that the redirect simply happens automatically and as far as the audience is concerned, there is only the external identity provider (i.e. ADFS) and the target application that is, of course, prepped to speak the CAS protocol. This is **important note** to consider: target applications are CASified applications. While the end-user just interacts with ADFS and the application, the application itself only interacts with CAS since of course, CAS is proxying the workflow in between. The application should not have to care about the source of the identity information and the intricacies of data extraction from various identity providers. It cannot. Its sole concern is to speak the CAS protocol and exchange a service ticket with the CAS server for the *right stuff* that CAS may have gathered from any number of sources.

Of course, you and I know that source could very well be ADFS; but that's just between you and me...and let's keep it that way!

<div class="alert alert-success">
  <strong>Usage Warning</strong><br/>If you are trying to figure how you may log into ADFS while CAS plays the role of a SAML2 identity provider, you are in the wrong place. Please <a href="/2017/11/22/cas-saml-integration-adfs/">read this post</a> instead.
</div>

Our starting position is based on the following:

- CAS `6.0.x`
- Java 11
- [Maven Overlay](https://github.com/apereo/cas-overlay-template) (The `6.0` branch specifically)

<div class="alert alert-info">
  <strong>The Cutting Edge</strong><br/>Note that as of this writing today, CAS <code>6</code> is very much in development and is not officially released. While the functionality and instructions noted here, more or less remain the same for CAS <code>5</code>, you may want to take steps described here with a pinch of salt, and of course as always, <a href="/2017/03/08/the-myth-of-ga-rel/">shake well before use</a>.
</div>

## Configuration

The initial setup is in fact super simple; as the [documentation describes](https://apereo.github.io/cas/6.0.x/integration/ADFS-Integration.html) you simply need to add the required dependency in your overlay:

```xml
<dependency>
  <groupId>org.apereo.cas</groupId>
  <artifactId>cas-server-support-wsfederation-webflow</artifactId>
  <version>${cas.version}</version>
</dependency>
```

...and then in your `cas.properties`, instruct CAS to hand off authentication to ADFS:

```
# cas.authn.wsfed[0].identityProviderUrl=https://sample.adfs.org/adfs/ls/
# cas.authn.wsfed[0].identityProviderIdentifier=http://sample.adfs.org/adfs/services/trust
# cas.authn.wsfed[0].relyingPartyIdentifier=urn:cas:mmoayyed
# cas.authn.wsfed[0].name=ADFS Server
# cas.authn.wsfed[0].identityAttribute=upn
# cas.authn.wsfed[0].signingCertificateResources=file:/etc/cas/adfs-signing.cer
# cas.authn.wsfed[0].autoRedirect=false
```

A few tips for the enlightened:

- Surely, swap out `sample.adfs.org` with your ADFS domain as appropriate.
- Remember to register CAS as a client of ADFS by setting up a relying party trust under the id `urn:cas:sample`. You can choose any identifier you prefer, so long as CAS and ADFS both agree to use the same value. If you make changes, please be generous and share the value with both systems.
- ADFS tends to sign responses using a signing certificate. The certificate will need to be obtained and shared with the CAS server with you physically defining its home and sharing that path with CAS, as is done in my example above with `adfs-signing.cer`.
- Of course, CAS somehow needs to figure out the authenticated username from the ADFS-produced response. To do this, it tends to look at a specific claim within that response typically released as `upn`. That is to say, you need to ensure ADFS is releasing this attribute (or anything else you prefer) to CAS and then ensure CAS is using the same claim name when it begins to do its extraction magic.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

If you are interested to learn more about the settings, I recommend checking out the [CAS commandline shell](/2017/10/30/intro-cas-cli-shell/) or better yet, use the [CAS administrator dashboards](/2018/06/15/cas53-admin-endpoints-security/) to look up documentation and *configuration metadata* by querying for settings.

## Mutating Attributes

I wish this section was more about how certain ADFS claims begin to start a revolution, rise up against the X-Men and transform into evil giant XML blobs on demand to wreak havoc but sadly, the topic here is much more boring than that. 

As ADFS claims are released to CAS, you are here given the opportunity to transform and *mutate* those claims and attributes before they are packed into the
 CAS-enveloped authenticated subject. You can add or remove attributes or more commonly change and sanitize values for certain claims. To do so, CAS provides you with a brand-new option to implement said transformation rules as a Groovy script whose path may be taught to CAS as such: 
   
```properties
# cas.authn.wsfed[0].attributeMutatorScript.location=file:/etc/cas/config/wsfed-attr.groovy
```

...and of course, the script may look like this:

```groovy
import org.apereo.cas.*
import java.util.*
import org.apereo.cas.authentication.*

def Map run(final Object... args) {
    def attributes = args[0]
    def logger = args[1]
    logger.info("Mutating attributes {}", attributes)
    return [upn: "Wolverine"]
}
```

So, we are getting a bunch of claims or attributes from ADFS and are tasked to simply return a map of keys and values. In my example above and regardless of what ADFS delivers to CAS, I decided to only stuff the `upn` attribute into that final map with a single value that is `Wolverine`. Of course, since `upn` is designated to act the username claim, the ultimate CAS principal will be established under the username `Wolverine`.

...without the claws, certainly, though [that is possible too](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/).

## ADFS Configuration

### Relying Party Trust

A relying party trust needs to be created in ADFS for `urn:cas:mmoayyed`:

![image](https://user-images.githubusercontent.com/1205228/53475690-cdab3680-3a2d-11e9-875b-97e2003d8f67.png)

Make sure you set the relying party identifier(s) correctly:

![image](https://user-images.githubusercontent.com/1205228/53475715-dbf95280-3a2d-11e9-9973-499c6bafe3a1.png)

Make sure endpoints are defined:

![image](https://user-images.githubusercontent.com/1205228/53475744-f2071300-3a2d-11e9-8d20-a535639374d5.png)

![image](https://user-images.githubusercontent.com/1205228/53475750-f7fcf400-3a2d-11e9-91bd-edc8f1e87d40.png)

Verify the secure hash algorithm setting:

![image](https://user-images.githubusercontent.com/1205228/53475770-06e3a680-3a2e-11e9-9784-cb098eccbe99.png)

### Claim Rules

Edit claim rules to let ADFS release attributes to CAS:

![image](https://user-images.githubusercontent.com/1205228/53475819-2bd81980-3a2e-11e9-83f5-2bf11fff2eef.png)

![image](https://user-images.githubusercontent.com/1205228/53475841-3692ae80-3a2e-11e9-8393-ec09f1a04fb5.png)

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
