---
layout:     post
title:      Apereo CAS 6.6.x Deployment - WAR Overlays
summary:    Learn how to configure and build your own CAS deployment via the WAR overlay method, get rich quickly, stay healthy indefinitely and respect family and friends in a few very easy steps.
tags:       ["CAS 6.6.x", "Getting Started", "Gradle"]
---

This is a short and sweet tutorial on how to deploy CAS via [the WAR Overlay method][overlaysetup].

This tutorial specifically requires and focuses on:

- CAS `6.6.x`
- Java 11

<div class="alert alert-info">
  <strong>Need Help?</strong><br/>If you ever get stuck and are in need of additional assistance, start by reviewing the suggestions <a href="https://apereo.github.io/cas/6.6.x/installation/Troubleshooting-Guide.html">provided here</a>. You may also look at available support options <a href="https://apereo.github.io/cas/Support.html">provided here</a>.
</div>

{% include googlead1.html  %}

# Overlay...What?

Overlays are a strategy to combat repetitive code and/or resources. Rather than downloading the CAS codebase and building it from source, overlays allow you to download a pre-built vanilla CAS web application server provided by the project itself, override/insert specific behavior into it and then merge it all back together to produce the final (web application) artifact. You can find a lot more about how overlays work [here][overlaysetup].

Please note that a CAS WAR Overlay can also be generated on demand using the [CAS Initializr](/2021/02/28/cas64-cas-initializr/).
{% include googlead1.html  %}
The concept of the WAR Overlay is NOT a CAS invention. It's specifically an *Apache Maven* feature and of course, there are techniques and plugins available to apply the same concept to Gradle-based builds as well. For this tutorial, the Gradle overlay we will be working with is [available here][overlay]. Be sure to check out the appropriate branch, that is `6.5`.

<div class="alert alert-info">
  <strong>Gradle WAR Overlay</strong><br/>The Maven WAR overlay template is now deprecated and moved aside. The reference overlay project simply resides here and is transformed to use the Gradle build tool instead. This is done to reduce maintenance overhead and simplify the deployment strategy while allowing future attempts to make auto-generation of the overlay as comfortable as possible.
</div>

The quickest way to generate a CAS WAR overlay starter template is via the following:

```bash
curl -k https://casinit.herokuapp.com/starter.tgz  \
  -d type=cas-overlay -d baseDir=overlay | tar -xzvf -
```

...if you prefer, you could always download and clone [this repository](https://github.com/apereo/cas-overlay-template).

Once you have forked and cloned the repository locally, or when you have generated the WAR overlay yourself using CAS Initializr, you're ready to begin.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Note</strong><br/>Remember to switch to the appropriate branch. Today, the <code>master</code> branch of the repository applies to CAS <code>6.6.x</code> deployments. That may not necessarily remain true when you start your own deployment. So examine the branches and make sure you <code>checkout</code> the one matching your intended CAS version.
</div>

# Overlay's Anatomy

Similar to Grey's, a *Gradle* WAR overlay is composed of several facets the most important of which are the `build.gradle` and `gradle.properties` file. These are build-descriptor files whose job is to teach Gradle how to obtain, build, configure (and in certain cases deploy) CAS artifacts.

<div class="alert alert-info">
  <strong>KISS</strong><br/>You do not need to download Gradle separately. The project provides one for you automatically with the embedded Gradle Wrapper.
</div>
{% include googlead1.html  %}
The CAS Gradle Overlay is composed of several sections. The ones you need to worry about are the following.

## Gradle Properties

In `gradle.properties` file, project settings, and versions are specified:

```properties
cas.version=6.5.3
```

The `gradle.properties` file describes what versions of CAS, Spring Boot, and Java are required for the deployment. You are in practice mostly concerned with the `cas.version` setting and as new (maintenance) releases come out, it would be sufficient to simply update that version and re-run the build.
{% include googlead1.html  %}
This might be a good time to review the CAS project's [Release Policy][releasepolicy] as well as [Maintenance Policy][maintenancepolicy].

## To Upgrade

You should do your best to stay current with [CAS releases](https://github.com/apereo/cas/releases), particularly those that are issued as security or patch releases. Security releases are a critical minimal change on a release to address a serious confirmed security issue, and typically take on the format of `X.Y.Z.1`, `X.Y.Z.2`, etc. A patch release is a conservative incremental improvement that includes bug fixes and is absolutely backward compatible with previous patch releases and takes on the format of `X.Y.1`, `X.Y.2`, etc. 
{% include googlead1.html  %}
Upgrading to a security or patch release is **STRONGLY** recommended, and should be a drop-in replacement. To upgrade to such releases, all you should have to do is to adjust the `cas.version` setting in your `gradle.proprties` file. For example, going from CAS `6.5.2` to `6.5.3` should be as easy as:

```properties
# cas.version=6.5.2
cas.version=6.5.3
```

The best way to stay current with CAS releases and receive release notifications and announcements is via subscribing to the GitHub repository and watch for releases:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/164376845-b5d62b54-8ba0-4fe2-a4ed-cbd69d1e021c.png" width="80%" 
title="Apereo CAS GitHub Repository Release Watch" %}

## Dependencies

The next piece describes the *dependencies* of the overlay build. These are the set of components almost always provided by the CAS project that will be packaged up and put into the final web application artifact. 

{% include googlead1.html  %}

Here is an example:

```groovy
dependencies {
  /**
    * CAS dependencies and modules may be listed here.
    *
    * There is no need to specify the version number for each dependency
    * since versions are all resolved and controlled by the dependency management
    * plugin via the CAS bom.
    **/
}
```

Note that when you include dependencies in the CAS build, you do not need to specify the CAS version itself. Each release of CAS provides a curated list of dependencies it supports. In practice, you do not need to provide a version for any of these dependencies in your build configuration as the CAS distribution is managing that for you. When you upgrade CAS itself, these dependencies will be upgraded as well in a consistent way.
{% include googlead1.html  %}
The curated list of dependencies contains a refined list of third-party libraries. The list is available as a standard Bill of Materials (BOM). Not everyone likes inheriting from the BOM. 

```groovy
depndencies {
    implementation enforcedPlatform("org.apereo.cas:cas-server-support-bom:${project.'cas.version'}")
    implementation platform(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES)

    // Include the CAS reports module without its version
    implementation "org.apereo.cas:cas-server-support-reports"
}
```

Including a CAS module/dependency in the `build.gradle` simply advertises to CAS *your intention* of turning on a new feature or a variation of current behavior. Do NOT include something in your build just because it looks and sounds cool. Remember that the point of an overlay is to only keep track of things you need and care about, and no more.
{% include googlead1.html  %}
<div class="alert alert-warning">
  <strong>Remember</strong><br/>Keep your build clean and tidy. A messy build often leads to a messy deployment, complicates your upgrade path and is a documented cause of early hair loss. Keep changes down to the absolute essentials and document their need for your deployment. If you review the configuration a year from now, you should have an idea of why things are the way they are.
</div>

# The Build

Now that you have a basic understanding of the build descriptor, it's time to run the build. A Gradle build is often executed by passing specific goals/commands to Gradle itself, aka `gradlew`. So for instance in the terminal and once inside the project directory you could execute things like:

```bash
cd cas-overlay-template
./gradlew clean
```
{% include googlead1.html  %}
The WAR Overlay project provides you with an embedded Gradle *wrapper* whose job is to first determine whether you have Gradle installed. If not, it will download and configure one for you based on the project's needs. The `gradlew tasks` command describes the set of available operations you may carry out with the build script.

<div class="alert alert-info">
  <strong>Remember</strong><br/>Docs grow old. Always consult the overlay project's <code>README</code> file to keep to date.
</div>

As an example, here's what I see if I were to run the build command:

```bash
./gradlew clean copyCasConfiguration build

...
Starting a Gradle Daemon (subsequent builds will be faster)
Configuration on demand is an incubating feature.

BUILD SUCCESSFUL in 14s
2 actionable tasks: 2 executed
...
```
{% include googlead1.html  %}
You can see that the build attempts to download, clean, compile and package all artifacts, and finally, it produces a `build/libs/cas.war` which you can then use for actual deployments.

# Configuration

I am going to skip over the configuration of `/etc/cas/config` and all that it deals with. If you need the reference, you may always [use this guide][configmgmt] to study various aspects of CAS configuration.

Suffice it to say that, quite simply, CAS deployment expects *the main* configuration file to be found under `/etc/cas/config/cas.properties`. This is a key-value store that can dictate and alter the behavior of the running CAS software.
{% include googlead1.html  %}
As an example, you might encounter something like:

```properties
cas.server.name=https://cas.example.org:8443
cas.server.prefix=${cas.server.name}/cas
logging.config=file:/etc/cas/config/log4j2.xml
```
{% include googlead1.html  %}
...which at a minimum, identifies the CAS server's URL and prefix and instructs the running server to locate the logging configuration at `file:/etc/cas/config/log4j2.xml`. The overlay by default ships with a `log4j2.xml` that you can use to customize logging locations, levels, etc. Note that the presence of all that is contained inside `/etc/cas/config/` is optional. CAS will continue to fall back onto defaults if the directory and the files within are not found.

## Keep Track

It is **VERY IMPORTANT** that you contain and commit the entire overlay directory (save the obvious exclusions such as the `build` directory) into some sort of source control system, such as `git`. Treat your deployment just like any other project with tags, releases, and functional baselines.

# Logging

CAS server logs are **THE BEST RESOURCE** for determining the root cause of a problem, provided you have configured the appropriate log levels. Specifically, you want to make sure `DEBUG` or `TRACE` levels are turned on for the relevant packages and components in your logging configuration. Know where the logging configuration is, become familiar with its syntax when changes are due and know where the output data is saved.
{% include googlead1.html  %}
## Configuration

The CAS server web application by default ships with a `log4j2.xml` file that provides sensible logging configuration and levels for basic use cases. This option typically is activated when no external logging configuration is available and provided by the CAS build or its configuration. In reality, the CAS build provides dedicated settings by default to control the loggig configuration via the following setting:

```properties
logging.config=file:/etc/cas/config/log4j2.xml
```
{% include googlead1.html  %}
The logging configuration is then expected to be found and loaded from `/etc/cas/config/log4j2.xml`. If you deactivate or remove this setting, the default logging described earlier will begin to activate.

## Log Output

Log messages are routed to console, and a `cas.log` file at `/tmp/logs`. Here are a few points about the default logging facility:

- You can change the base directory by passing along a system property to the runtime when you start or deploy CAS via `-DbaseDir=/my/directory`.
- If you need the full stacktrace output of the exceptions, you can define the system property `-Dlog.file.stacktraces=true` for the runtime when you start or deploy CAS.
- If you need to change CAS logging levels, you can define the system property `-Dcas.log.level=debug` for the runtime when you start or deploy CAS. This will generally affect all log messages that would be submitted via components from the `org.apereo.cas` namespace, including all sub-packages and components.
{% include googlead1.html  %}
If you prefer to control the logging levels a bit more forcefully and dynamically, you can define the log level for the package you prefer when you start and run CAS particularly with an embedded servlet container:

```bash
java -jar build/libs/cas.war --logging.level.org.apereo.cas=debug
```

Or alternatively, you could define the same setting in your `cas.properties`, though note that this technique only affects log messages once the CAS configuration file has been loaded and processed by the runtime:

```properties
logging.level.org.apereo.cas=debug
```
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>If you are starting out, we <strong>STRONGLY</strong> recommend that you set the CAS logging level to either <code>debug</code> (or <code>trace</code> for more verbose and thorough logging). This is the most effective insight you have into the running software and your best troubleshooting tool to determine what exactly the system might be doing, and why.
</div>

These options work for all packages and components, regardless of whether they're owned or developed by CAS.

# LDAP Authentication

We need to first establish a primary mode of validating credentials by sticking with [LDAP authentication][ldapauthn]. The strategy here, as indicated by the CAS documentation, is to declare the intention/module in the build script:

{% include googlead1.html  %}

```groovy
implemntation "org.apereo.cas:cas-server-support-ldap"
```

...and then configure the relevant `cas.authn.ldap[x]` settings for the directory server in use. Most commonly, that would translate into the following settings:

```
cas.authn.ldap[0].type=AUTHENTICATED
cas.authn.ldap[0].ldap-url=ldaps://ldap1.example.org
cas.authn.ldap[0].base-dn=dc=example,dc=org
cas.authn.ldap[0].search-filter=cn={user}
cas.authn.ldap[0].bind-dn=cn=Directory Manager,dc=example,dc=org
cas.authn.ldap[0].bind-credential=...
```

To resolve and fetch the needed attributes which will be used later by CAS for release, the simplest way would be to let LDAP authentication retrieve the attributes directly from the directory server.  The following setting allows us to do just that:
{% include googlead1.html  %}
```
cas.authn.ldap[0].principal-attribute-list=memberOf,cn,givenName,mail
```

# Registering Applications

Client applications that wish to use the CAS server for authentication must be registered with the server apriori. CAS provides several [facilities to keep track of the registration records][servicemgmt] and you may choose any that fits your needs best. In more technical terms, CAS deals with service management using two specific components: Individual implementations that support a form of a database are referred to as *Service Registry* components and they are many. There is also a parent component that sits on top of the configured service registry as more of an orchestrator that provides a generic facade and entry point for the rest of CAS without entangling all other operations and subsystems with the specifics and particulars of storage technology.

{% include googlead1.html  %}

In this tutorial, we are going to try to configure CAS with [the JSON service registry][jsonservicemgmt].

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-json-service-registry"
```

Next, you must teach CAS how to look up JSON files to read and write registration records. This is done in the `cas.properties` file:
{% include googlead1.html  %}
```properties
cas.service-registry.core.init-from-json=false
cas.service-registry.json.location=file:/etc/cas/services
```

...where a sample `ApplicationName-1001.json` would then be placed inside `/etc/cas/services`:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "ApplicationName",
  "id" : 1001
}
```

Or perhaps a slightly more advanced version would be an application definition that allows for the release of certain attributes that we previously retrieved from LDAP as part of authentication:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "ApplicationName",
  "id" : 1001,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail" ] ]
  }
}
```

# Ticketing

A robust CAS deployment requires the presence and configuration of an *internal* database that is responsible for [keeping track of tickets][ticketing] issued by CAS. CAS itself comes by default with a memory-based node-specific cache that is often more than sufficient for smaller deployments or certain variations of a [clustered deployment][haguide]. Just like the service management facility, a large variety of databases and storage options are supported by CAS under the facade of a *Ticket Registry*.

{% include googlead1.html  %}

In this tutorial, we are going to configure CAS to use a [Hazelcast Ticket Registry][hazelcasttickets] with the assumption that our deployment is going to be deployed in an AWS-sponsored environment. Hazelcast Ticket Registry is often a decent choice when deploying CAS in a cluster and can take advantage of AWS's native support for Hazelcast to read node metadata properly and locate other CAS nodes in the same cluster to present a common, global and shared ticket registry. This is an ideal choice that requires very little manual work and/or troubleshooting, compared to using options such as Multicast or manually noting down the address and location of each CAS server in the cluster.

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-hazelcast-ticket-registry"
```

Next, the AWS-specific configuration of Hazelcast would go into our `cas.properties`:
{% include googlead1.html  %}
```properties
cas.ticket.registry.hazelcast.cluster.discovery.enabled=true
cas.ticket.registry.hazelcast.cluster.discovery.aws.access-key=...
cas.ticket.registry.hazelcast.cluster.discovery.aws.secret-key=...
cas.ticket.registry.hazelcast.cluster.discovery.aws.region=us-east-1
cas.ticket.registry.hazelcast.cluster.discovery.aws.security-group-name=...
# cas.ticket.registry.hazelcast.cluster.discovery.aws.tag-key=
# cas.ticket.registry.hazelcast.cluster.discovery.aws.tag-value=
```

That should do it.
{% include googlead1.html  %}
Of course, if you are working on a more modest CAS deployment in an environment that is more or less owned by you and you prefer more explicit control over CAS node registrations in your cluster, the following settings would be more ideal:

```properties
# cas.ticket.registry.hazelcast.cluster.instance-name=localhost
# cas.ticket.registry.hazelcast.cluster.network.port=5701
# cas.ticket.registry.hazelcast.cluster.network.port-auto-increment=true
cas.ticket.registry.hazelcast.cluster.network.members=123.321.123.321,223.621.123.521,...
```

# Audit Logs

CAS provides a facility for auditing authentication activity, allowing them to be recorded to a variety of storage services. Essentially, audited authentication events attempt to provide the *who, what, when, how*, along with any additional contextual information that might be useful to track activity. By default, auditable records are sent to the CAS log file and they may look like this:
{% include googlead1.html  %}
```
WHO: casuser
WHAT: supplied credentials: ...
ACTION: AUTHENTICATION_SUCCESS
APPLICATION: CAS
WHEN: Mon Aug 26 12:35:59 IST 2013
CLIENT IP ADDRESS: 172.16.5.181
SERVER IP ADDRESS: 192.168.200.22
```

It's often useful to track audit records in a relational database for future monitoring, data mining and querying features that may be done outside CAS. Here, we try to configure CAS to push audit data into a PostgreSQL database.

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
dependencies {
  implementation "org.apereo.cas:cas-server-support-audit-jdbc"
}
```
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>You should not have to include additional modules or dependencies to provide database drivers. Those will be automatically provided by CAS to the build with the inclusion of the module above.
</div>

Then, put specific audit settings in `cas.properties`:
{% include googlead1.html  %}
```properties
cas.audit.jdbc.user=postgres
cas.audit.jdbc.password=password
cas.audit.jdbc.driver-class=org.postgresql.Driver
cas.audit.jdbc.url=jdbc:postgresql://localhost:5432/audit
cas.audit.jdbc.dialect=org.hibernate.dialect.PostgreSQL10Dialect
```

You may also note that the audit record includes a special field for *Client IP Address*, which typically notes the IP address of the end-user attempting to authenticate, etc. Deployments that are behind a proxy or a load balancer often tend to mask the real IP address by default, and expose it using a dedicated header, such as `X-Forwarded-For`. This can be configured with CAS as well, so the correct IP is then recorded into the audit log:
{% include googlead1.html  %}
```properties
cas.audit.engine.alternate-client-addr-header-name=X-Forwarded-For
```

# Multifactor Authentication via Duo Security

As a rather common use case, the majority of CAS deployments that intend to turn on multifactor authentication support tend to do so via [Duo Security][duo]. We will be going through the same exercise here where we let CAS trigger Duo Security for users who belong to the `mfa-eligible` group, indicated by the `memberOf` attribute on the LDAP user account.

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-duo"
```

Then, put specific Duo Security settings in `cas.properties`. Things such as the secret key, integration key, etc which should be provided by your Duo Security subscription:
{% include googlead1.html  %}
```
cas.authn.mfa.duo[0].duo-secret-key=
cas.authn.mfa.duo[0].duo-integration-key=
cas.authn.mfa.duo[0].duo-api-host=
# cas.authn.mfa.duo[0].duo-application-key=
```

At this point, we have enabled Duo Security and we just need to find a way to instruct CAS to route the authentication flow over to Duo Security in the appropriate condition. Our task here is to build a special condition that activates multifactor authentication if any of the values assigned to the attribute `memberOf` contain the value `mfa-eligible`. This condition is placed in the `cas.properties` file:

```properties
cas.authn.mfa.triggers.principal.global-principal-attribute-name-triggers=memberOf
cas.authn.mfa.triggers.principal.global-principal-attribute-value-regex=mfa-eligible
```
{% include googlead1.html  %}
If the above condition holds true and CAS is to route to a multifactor authentication flow, that would be one supported and provided by Duo Security since that’s the only provider that is currently configured to CAS.

# OpenID Connect

We can also turn on support for the [OpenID Connect][oidc] protocol, allowing CAS to act as an OP (OpenID Connect Provider). OpenId Connect is a continuation of the OAuth protocol with some additional variations. If you enable OpenId Connect, you will have automatically enabled OAuth as well. "Two birds for one stone" sort of thing, though no disrespect to the avian community!
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Let There Be SSO</strong><br/>Remember that any successful authentication activity that allows CAS to establish a single sign-on session will be seen as valid, regardless of what protocol is used to interact and communicate with CAS. Switching the protocol and sending authentication requests between various applications integrated with CAS does not invalidate an existing single sign-on session and end-users will be not be asked to login again unless forcefully asked or indicated by the coming request.
</div>

By turning on support for [OpenID Connect][oidc], CAS begins to act as an authorization server, allowing client applications to verify the identity of the end-user and to obtain basic profile information in an interoperable and REST-like manner. For this tutorial, our focus is to mainly on integrating web-based client applications using the *Authorization Code* flow of OpenID Connect, which is quite similar to the CAS protocol; you receive a *code*, you validate the *code* and receive an access token as well as an ID token.

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-oidc"
```
{% include googlead1.html  %}

Then, we teach CAS about specific aspects of the authorization server functionality:

```properties
cas.authn.oidc.core.issuer=https://sso.example.org/cas/oidc
cas.authn.oidc.jwks.file-system.jwks-file=file:///etc/cas/config/keystore.jwks
```

The JWKS resource is used by CAS to create (or use an existing) JSON web keystore composed of private and public keys that enable clients to validate a JSON Web Token (JWT) such as an id token, issued by CAS as an OpenID Connect Provider. Here, we define the global keystore as a path on the file system. 
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Clustered Deployments</strong><br/>When deploying CAS in a cluster, you must make sure all CAS server nodes have access to and share an identical and exact copy of the keystore file. Keystore differences will lead to various validation failures and application integration issues.
</div>

That should be all. Now, you can proceed to register your client web application with CAS similar to the approach described earlier:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "my-client-id",
  "clientSecret": "my-client-secret",
  "serviceId" : "^https://my.application.com/oidc/.+",
  "name": "OIDC",
  "description": "A sample OIDC client application"
  "id": 1
}
```

# Monitoring & Status

Many CAS deployments rely on the `/status` endpoint for monitoring the health and activity of the CAS deployment. This endpoint is typically secured via an IP address, allowing external monitoring tools and load balancers to reach the endpoint and parse the output. In this quick exercise, we are going to accomplish that task, allowing the `status` endpoint to be available over HTTP to `localhost`.

## Configuration

First, ensure you have declared the appropriate module/intention in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-monitor"
```
{% include googlead1.html  %}
To enable and expose the `status` endpoint, the following settings should come in handy:

```properties
management.endpoints.web.base-path=/actuator
management.endpoints.web.exposure.include=status
management.endpoint.status.enabled=true

cas.monitor.endpoints.endpoint.status.access=IP_ADDRESS
cas.monitor.endpoints.endpoint.status.required-ip-addresses=127.0.0.1
```

Remember that the default path for endpoints exposed over the web is at `/actuator`, such as `/actuator/status`.

# Overlay Customization

The `build/libs` directory contains the results of the overlay process. Since I have not actually customized and overlaid anything yet, all configuration files simply match their default and are packaged as such. As an example, let's grab [the default message bundle][localization] and change the text associated with `screen.welcome.instructions`.

<div class="alert alert-warning">
  <strong>Remember</strong><br/>Do NOT ever make changes in the <code>build</code> directory. The changesets will be cleaned out and set back to defaults every time you do a build. Follow the overlay process to avoid surprises.
</div>
{% include googlead1.html  %}
First, I will need to move the file to my project directory so that during the overlay process Gradle can use that instead of what is provided by default.

Here we go:

```bash
./gradlew getResource -PresourceName=messages.properties
```

Then I'll leave everything in that file alone, except the line I want to change.

```
...
screen.welcome.instructions=Speak friend and enter.
...
```

Then I'll package things up as usual.

```bash
./gradlew clean build
```

If I `explode` the built web application again and look at `build/cas/WEB-INF/classes/messages.properties` after the build, I should see that the overlay process has picked and overlaid onto the default *my version* of the file.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>Only overlay and modify files you need and try to use externalized resources and configuration as much as possible. Just because you CAN override something in the default package, it doesn't mean that you should.
</div>

# User Interface Customizations

To modify the CAS HTML views, each file first needs to be brought over into the overlay. You can use the `./gradlew listTemplateViews` command to see what HTML views are available for customizations. Once chosen, simply use `./gradlew getResource -PresourceName=footer.html` to bring the view into your overlay. Once you have the `footer.html` brought into the overlay, you can simply modify the file at `src/main/resources/templates/fragments/footer.html`, and then repackage and run the build as usual.

# Deploy

You have several options when it comes to deploying the final `cas.war` file. The easiest approach would be to simply use the `./gradlew run` command and have the overlay be deployed inside an embedded container. By default, the CAS web application expects to run on the secure port `8443` which requires that you create a keystore file at `/etc/cas/` named `thekeystore`.

## Deploy Behind a Proxy

Using the embedded Apache Tomcat container provided by CAS automatically is the recommended approach in almost all cases (The embedded bit; not the Apache Tomcat bit) as the container configuration is entirely automated by CAS and its version is guaranteed to be compatible with the running CAS deployment. Furthermore, updates and maintenance of the servlet container are handled at the CAS project level where you as the adopter are only tasked with making sure your deployment is running the latest available release to take advantage of such updates.

{% include googlead1.html  %}

If you wish to run CAS via the embedded Apache Tomcat container behind a proxy or load balancer and have that entity terminate SSL, you will need to open up a communication channel between the proxy and CAS such that (as an example):
{% include googlead1.html  %}
- Apache Tomcat runs on port 8080, assuming that’s what the proxy uses to talk to CAS.
- Apache Tomcat has SSL turned off.
- Apache Tomcat connector listening on the above port is marked as secure.

The above task list translates to the following properties expected to be found in your `cas.properties`:

```properties
server.port=8080
server.ssl.enabled=false
cas.server.tomcat.http.enabled=false
cas.server.tomcat.http-proxy.enabled=true
cas.server.tomcat.http-proxy.secure=true
cas.server.tomcat.http-proxy.scheme=https
```

## Deploy via Docker

The overlay embraces the Jib Gradle Plugin to provide easy-to-use out-of-the-box tooling for building CAS docker images. Jib is an open-source Java containerizer from Google that handles all the steps of packaging CAS into a container image. It does not require you to write a `Dockerfile` and it is directly integrated into the overlay.

Building a CAS docker image via jib is as simple as:
{% include googlead1.html  %}
```bash
./gradlew build jibDockerBuild
```

If you prefer a more traditional approach, there is always:

```bash
./gradlew build
docker-compose build
```

You may also build Docker images using the [Spring Boot Gradle plugin](/2020/10/24/cas63x-spring-boot-docker/).

## Deploy via Embedded Container

If the WAR overlay is prepped with an embedded servlet container such as Apache Tomcat, then you may run the CAS web application directly and once built, using:

```bash
java -jar build/libs/cas.war
```

The choice of the embedded servlet container is noted by the `appServer` property found in the `gradle.properties` file:

```properties
# Use -tomcat, -jetty, -undertow for deployment to other embedded containers
# if the overlay application supports or provides the chosen type.
# You should set this to blank if you want to deploy to an external container.
# and want to set up, download, and manage the container (i.e. Apache Tomcat) yourself.
appServer=-tomcat
```
{% include googlead1.html  %}
All servlet containers presented here, embedded or otherwise, aim to be production-ready. This means that CAS ships with useful defaults out of the box that may be overridden, if necessary and by default, CAS configures everything for you from development to production in today’s platforms. In terms of their production quality, there is almost no difference between using an embedded container vs. an external one.

Unless there are specific, technical, and reasonable objections, choosing an embedded servlet container is almost always the better choice.

If you forget to specify the correct servlet container type and yet choose to run CAS directly, it is likely that you would receive the following error:

```bash
ERROR [org.springframework.boot.SpringApplication] - <Application run failed>
  org.springframework.context.ApplicationContextException: Unable to start web server;
    nested exception is org.springframework.context.ApplicationContextException: 
    Unable to start ServletWebServerApplicationContext due to missing ServletWebServerFactory bean.
```

# Gradle Tasks

The Gradle WAR overlay provides many additional commands that might prove helpful for troubleshooting purposes:

```bash
# Run the CAS web application in standalone executable mode
./gradlew executable

# Debug the CAS web application in embedded mode on port 5005
./gradlew debug

# Run the CAS web application in embedded container mode
./gradlew run

# Display the CAS version
./gradlew casVersion

# Export collection of CAS properties
./gradlew exportConfigMetadata
```
{% include googlead1.html  %}
The `exportConfigMetadata` task can be quite useful as it produces a comprehensive catalog of all CAS settings that one could potentially use, along with documentation for each setting, default values, and more.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

You must start simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribute] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[duo]: https://apereo.github.io/cas/6.6.x/mfa/DuoSecurity-Authentication.html
[oidc]: https://apereo.github.io/cas/6.6.x/authentication/OIDC-Authentication.html
[hazelcasttickets]: https://apereo.github.io/cas/6.6.x/ticketing/Hazelcast-Ticket-Registry.html
[contribute]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[localization]: https://apereo.github.io/cas/6.6.x/ux/User-Interface-Customization-Localization.html
[haguide]: https://apereo.github.io/cas/6.6.x/high_availability/High-Availability-Guide.html
[ticketing]: https://apereo.github.io/cas/6.6.x/ticketing/Configuring-Ticketing-Components.html
[jsonservicemgmt]: https://apereo.github.io/cas/6.6.x/services/JSON-Service-Management.html
[servicemgmt]: https://apereo.github.io/cas/6.6.x/services/Service-Management.html#storage
[ldapauthn]: https://apereo.github.io/cas/6.6.x/installation/LDAP-Authentication.html
[configmgmt]: https://apereo.github.io/cas/6.6.x/configuration/Configuration-Management.html
[overlay]: https://github.com/apereo/cas-overlay-template
[releasepolicy]: https://apereo.github.io/cas/developer/Release-Policy.html
[maintenancepolicy]: https://apereo.github.io/cas/developer/Maintenance-Policy.html
[overlaysetup]: https://apereo.github.io/cas/6.6.x/installation/WAR-Overlay-Installation.html
