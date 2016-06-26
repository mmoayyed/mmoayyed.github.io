---
layout:     post
title:      CAS Survey Results
summary:    ...in which I present a summarized view of the latest CAS community survey and discuss results.

---

A [while ago](https://groups.google.com/a/apereo.org/forum/#!searchin/cas-user/survey/cas-user/vQr3eBdHNg8/eKm9gkpxIwAJ) the CAS project management committee prepared a [survey](http://goo.gl/forms/rF9EeCN6GH) to help plan the future roadmap of the project. The primary objectives of the survey were to gain a better understanding of the current configuration pain points from a deployer point of view and learn what additional features and enhancements should have to be prioritized for development.

In this post, I intend to provide a summarized view of the survey results and discuss what has or will be done to address the feedback.

# Results

There were about 200 responses to the survey from both individuals and institutions. Some responses were submitted by consulting firms who provide CAS commercial services for their clients which indicates the actual number of deployers may be larger than the reported 200. 

Participants of the survey indicated that on average, they have been running CAS for more than 10 years in a variety of industry sectors such as Government, Higher-Ed, Insurance, Finance, Travel and Health. More than 50% of the results indicated a CAS server deployment size of more than 10K users which is considered a rather large deployment of the platform.

The table below demonstrates what percentage of the community has chosen a given form of primary authentication:


| Method  | Adoption |
| ------------- | ------------- |
| LDAP/AD | 82% |
| RDBMS  | 8%  |
| Other  | 10%  |

The "Other" category being: NoSQL, X509, Rest, Social AuthN and many other forms of authentication supported by CAS.

## CAS Version

The table below shows what percentage of the community is using a given CAS server version.

| Version  | Adoption |
| ------------- | ------------- |
| 3.x  | 53% |
| 4.0.x  | 22%  |
| 4.1.x  | 14%  |
| 4.2.x  | 4%  |
| Other  | 7%  |

It's important to note that CAS 3.x has been EOLed for almost 2 years. What this means is that CAS 3.x will no longer be maintained, fixed or (in case of security vulnerabilities) patched by the development team. Therefor, it is strongly recommended that those deployments switch and upgrade to a more recent and stable version of the platform, which at the time of this writing is CAS 4.2.x. 

## Features

Survey participants were also asked to vote on a number of proposed features on a 1-5 scale with 5 being most desirable. The following table shows an aggregated view of the results for each given feature where the adoption percentage is a summary of 4 and 5 response types, indicating  development should strongly focus on the completion or improvement of the proposed item.

| Feature  | Vote |
| ------------- | ------------- |
| Admin UIs  | 60%  |
| SAML2  | 60%  |
| MFA  | 52% |
| Surrogate AuthN  | 43%  |
| Adaptive AuthN  | 42%  |
| Rest APIs  | 40%  |
| GUI Wizard  | 33%  |
| Front-Channel SLO  | 33%  |
| WS-Fed  | 31%  |
| OIDC  | 29%  |
| OAuth2  | 28%  |
| FIDO  | 16%  |
| Dynamic Registration  | 11%  |


## Additional Feedback

The following items were also reported by the community as areas that require improvement and clarification:

### Better Documentation

The current CAS documentation assumes a high degree of familiarity with deployment tools such as Maven, Tomcat/Jetty, etc. The adopter also at times has to deal with multiple XML configuration files for enabling features such as LDAP authentication. This presents varying degrees of difficulty for a novice deployer to quickly get started with a CAS deployment. Step-by-step installation instructions, more samples and clarity in the documentation when it comes to dealing with specific CAS modules and features would be strongly desirable. A non-Maven deployment strategy could also be devised to relieve some of that pain when it comes to managing dependencies and CAS artifacts.

### Easier Upgrades

The current CAS deployment strategy consists of constructing a Maven overlay in order to combine and merge local customizations with the original CAS distribution. This at times can morph into a complicated CAS upgrade process, specially if local customizations end up at odd conflicts with the new CAS distribution. Adopters are invariably forced to compare locally overlaid artifacts with their original version and fill in the gaps where necessary. Needless to say, this process for a novice deploy is than less obvious to understand and utilize.

### Other Features

A number of other features were requested by participants that were not part of proposed scope. These included:

1. JWT authentication
2. Integrated Password Management
3. Tracking and Geo-profiling authentication requests.
4. Other registry types of managing CAS tickets and service definitions, such as YAML, Redis, etc.

# Response

The CAS development team has been working on the next major release of the platform, that is 5.0.0. Taking into account the community survey and feedback, here are a few notes to help clarify how CAS 5 attempts to address some of the reported issues.

Before we get started, it should be pointed out that [early milestone releases of CAS 5 are available](https://github.com/apereo/cas-overlay-template/tree/5.0). Deployers are more than welcome to try out the milestone releases and share feedback. 

The current in-development documentation of CAS 5 is also [available here](https://apereo.github.io/cas/development/index.html).

## Features

### Core

CAS 5 will have built-in support for:

- MFA based on Duo Security, Google Authenticator and more. 
- SAML2 authentication, acting as an identity provider consuming and producing SAML metadata.
- OpenID Connect, acting as an OP producing claims for RPs
- A YAML-based service registry.
- Delegating authentication to a remote REST endpoint.
- Recoding and Geotracking authentication events.

Since CAS 4.2.x, the platform has supported:

- JWT authentication.
- Delegating authentication to ADFS, CAS, SAML2 IdPs and a large variety of social authentication providers such as Facebook, Twitter and more.
- Ticket registry implementations based on Redis and Apache Cassandra.

### Auto Configuration

Loudly pointed out by the survey, a much-needed overhaul of the CAS documentation is needed to enable configuration of CAS features. To address this issue, CAS 5 takes an orthogonal approach where most if not all CAS features are **automatically configured** by CAS itself relieving the deployer from having to deal with XML configuration. This is a model we refer to as **Intention-driven configuration**.

In the past in order to turn on a particular CAS feature, the adopter had to:

- Find and declare the module as a dependency
- Fiddle with a variety of XML configuration files to declare components
- Touch a few properties and settings supplying the appropriate values for those components.
- Repackage and redeploy.

This process was much prone to errors and at times had to be repeated over and over again until the final works was in place. It also was extremely dependent on an accurate and reasonably detailed and clear documentation. It goes without saying that sustaining this model of development and configuration presents a high degree of difficulty for maintainers of the project and adopters of the platform.

To remove some of this pain, CAS 5 takes the following approach:

- Find and declare the feature module as a dependency, thus announcing your intention of enabling a particular feature in CAS.
- Optionally, configure the module by supplying settings via a simple `.properties` file.


At deployment time, CAS will auto-determine every single change that is required for the functionality of declared modules and will auto-configure it all in order to remove the extra XML configuration pain. This is a strategy that is put into place for nearly **ALL** modules and features. 

This strategy helps with the documentation issue as well, to a large degree because there is no longer a need to document every single XML configuration file and changes required for each for a given needed feature. The platform should have very low expectations of the adopter in terms of learning its internals and different configuration mechanics. Simply declaring an intention and optionally configuring it should be more than sufficient.

This strategy also greatly assists with future upgrades because there would be very few, if any, local configuration files lying around in a deployment environment. The adopter should mostly care about the appropriate settings and values supplied to CAS that describe the corer intended business functionality desired.

As an example, in order to turn configure LDAP authentication, all an adopter has to do is declare the appropriate module/intention:

<pre class="prettyprint lang-xml">
&lt;dependency>
     &lt;groupId>org.apereo.cas&lt;/groupId>
     &lt;artifactId>cas-server-support-ldap&lt;/artifactId>
     &lt;version>${cas.version}&lt;/version>
&lt;/dependency>
</pre>

...and declare the relevant settings:

<pre class="prettyprint lang-properties">
...
# cas.authn.ldap[0].ldapUrl=ldaps://ldap1.example.edu,...
# cas.authn.ldap[0].baseDn=dc=example,dc=org
# cas.authn.ldap[0].userFilter=cn={user}
# cas.authn.ldap[0].bindDn=cn=Directory Manager,dc=example,dc=org
# cas.authn.ldap[0].bindCredential=Password
...
</pre>

That's all. Note that auto configuration of modules not only takes into account core what-used-to-be XML configuration but also any additions that may be required for the CAS login webflow.

This model would not have possible without CAS taking full advantage of [Spring Boot](http://projects.spring.io/spring-boot/).

### Managing Configuration

Previously, adopters had to repackage and redeploy the CAS web application if a configuration property (i.e. LDAP URL) had to be changed. This will no longer be true in CAS 5 where **most if not all** CAS components become reloadable. Specific endpoints are exposed to adopters which can receive a reload request and auto-configure the CAS application context with the new version of the settings without the need to repackage and/or deploy the CAS software.

This model would not have possible without CAS taking full advantage of [Spring Cloud](http://projects.spring.io/spring-cloud/).

### Deployment

Once packaged, adopters previously had to grab the final CAS web application and deploy it into a servlet container of choice such as Tomcat or Jetty. While this model is and will be supported, CAS 5 takes this one step further and ships with a built-in Tomcat container that can simply launch the CAS application from the command line. The recipe is as simple as:

<pre class="prettyprint lang-bash">
...
mvn clean package
java -jar target/cas.war

...

  __  ____     _     ____  __
 / / / ___|   / \   / ___| \ \
| | | |      / _ \  \___ \  | |
| | | |___  / ___ \  ___) | | |
| |  \____|/_/   \_\|____/  | |
 \_\                       /_/

CAS Version: 5.0.0.M3-SNAPSHOT
Build Date/Time: 2016-06-26T20:55:15.345Z
Java Home: C:\Program Files\Java\jdk1.8.0_92\jre
Java Vendor: Oracle Corporation
Java Version: 1.8.0_92
OS Architecture: amd64
OS Name: Windows 10
OS Version: 10.0
...
</pre>

Every attempt has been made to ensure every aspect of the built-it Tomcat container (such as SSL, context path, etc) is configurable via the same `.properties` file that houses all other CAS configuration.

Built-in containers are also available, optionally, for Jetty and Undertow.

This model would not have possible without CAS taking full advantage of [Spring Boot](http://projects.spring.io/spring-boot/).

### User Interfaces






















