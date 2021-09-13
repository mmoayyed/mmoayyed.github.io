---
layout:     post
title:      Apereo CAS - Management WebApp w/ Docker
summary:    Learn how to deploy the CAS management web application via Docker to provide an administrative overview of registered applications with CAS, and take advantage of dashboards and other monitoring tools.
tags:       [CAS]
---

The [CAS management web application](https://apereo.github.io/cas/6.3.x/services/Installing-ServicesMgmt-Webapp.html) provides a web interface and dashboard and allows CAS administrators and application owners delegated access so they can manage and modify policies associated with their applications. The operational capacity of the CAS server itself is not in any way tied to the deployment status of the management web application; you may decide to take the application offline for maintenance or completely remove it from your deployment scenario at any given time.

{% include googlead1.html %}

In this post, we will take a look at how to run and deploy the CAS management web application via Docker and connect it to our CAS service registry.

Our starting position is as follows:

- CAS Management `6.3.x`
- Java `11`
- Docker
- [CAS Management WAR Overlay][overlay]

## Configuration

The CAS management web application provides an option to run with an embedded Apache Tomcat container on port `8443` under `https`. The expectation is that the SSL keystore should be present and found at `file:/etc/cas/thekeystore`. So, once you have downloaded or cloned the [CAS Management WAR Overlay][overlay], you need to generate a keystore under the directory `./etc/cas` using the following command:

```bash
keytool -genkey -alias cas -keyalg RSA -validity 999 \
    -keystore ./etc/cas/thekeystore -ext san=dns:$REPLACE_WITH_FULL_MACHINE_NAME
```

<div class="alert alert-info">
  <strong>Note</strong><br/>Note that the keystore file should be generated and present in the overlay's <code>etc/cas</code> directory. 
  Our Docker build will automatically copy everything under <code>etc/cas</code> and <code>etc/cas/config</code> into the final Docker image so our changes are isolated and scoped to the overlay directory exclusively.
</div>

{% include googlead1.html %}

Next, review the `etc/cas/config/management.properties` file which is the main configuration store for the CAS management web application by default. At a minimum, you should make sure your CAS server location is referenced correctly:

```properties
cas.server.name=https://sso.example.org
```

Next, review the `etc/cas/config/users.json` file which is a simple strategy to present the list of users authorized to access the management application after successful login. For example, to authorize users `thor` and `ironman`, you need to have the following entries in the file:

```json
{
  "thor" : {
    "@class" : "org.apereo.cas.mgmt.authz.json.UserAuthorizationDefinition",
    "roles" : [ "ROLE_ADMIN" ]
  },
  "ironman" : {
    "@class" : "org.apereo.cas.mgmt.authz.json.UserAuthorizationDefinition",
    "roles" : [ "ROLE_ADMIN" ]
  }
}
```

{% include googlead1.html %}

Finally, review the `etc/cas/config/log4j2-management.xml` file which controls the logging configuration for the web application. For now, it would be good to set `<Property name="cas.log.level">debug</Property>` so we can get better diagnostic info as we troubleshoot the deployment.

## Build

Our [CAS Management WAR Overlay][overlay] is equipped to build and run with Docker using a more traditional `Dockerfile` approach. The Docker build will build and package the overlay via Gradle and will copy the configuration files into the expected placed into the image. Finally, it should expose the correct ports for http access and will run the CAS management application using the embedded Apache Tomcat and our keystore.

To execute the build, we can use:

```bash
# chmod +x *.sh
./docker-build.sh
```

Be patient. This step might take a while.

{% include googlead1.html %}

Once the build is complete, you should be able to see the following outcome:

```
Successfully built 3f088c897720
Successfully tagged apereo/cas-management:v6.3.0
Built CAS Management image successfully tagged as apereo/cas-management:v6.3.0
REPOSITORY              TAG       IMAGE ID       CREATED        SIZE
apereo/cas-management   v6.3.0    3f088c897720   1 second ago   277MB
```

Great. Now we are ready to run the application.

## Run

To run the web application, we can use:

```bash
# chmod +x *.sh
./docker-run.sh
```

Once the application is up, we should be able to access the CAS management dashboard via `https://localhost:8443/cas-management/` and begin to add or browse application definitions:

{% include googlead1.html %}

![image](https://user-images.githubusercontent.com/1205228/106856405-a2c6c400-66d3-11eb-9c21-f340ebb2f45d.png)

## Service Storage

The persistence storage for the management web application for services **MUST** be the same as that of the CAS server itself. The same service registry component that is configured for the CAS server, including module and settings, needs to be configured in the same way for the management web application. 

In this section, we will connect the management web application to an Oracle relational database using the [JPA Service Registry](https://apereo.github.io/cas/6.3.x/services/JPA-Service-Management.html). At a minimum, the extension module should be included in our overlay:

```groovy
dependencies {
    implementation "org.apereo.cas:cas-server-support-jpa-service-registry:${project.'cas.version'}"
}
```

{% include googlead1.html %}

Of course, we have to introduce the application and our Oracle database to each other using the following settings in the `management.properties`:

```properties
cas.jdbc.show-sql=true

cas.service-registry.jpa.user=system
cas.service-registry.jpa.password=password
cas.service-registry.jpa.driver-class=oracle.jdbc.driver.OracleDriver
cas.service-registry.jpa.url=jdbc:oracle:thin:@localhost:1521:ORCLCDB
cas.service-registry.jpa.dialect=org.hibernate.dialect.Oracle12cDialect
cas.service-registry.jpa.ddl-auto=none
```

You should be able to repeat the build process at this point and observe your application definitions in the main dashboard.

## Unknown Entities

If you attempt to create or edit an application definition type other than `CAS` itself such as OpenID Connect, you may receive the following error:

```
[Request processing failed; nested exception is java.lang.IllegalArgumentException: \
  Unknown entity: org.apereo.cas.services.OidcRegisteredService] with root cause>
org.hibernate.MappingException: Unknown entity: org.apereo.cas.services.OidcRegisteredService
  at org.hibernate.metamodel.internal.MetamodelImpl.entityPersister(MetamodelImpl.java:704)
```

This is because CAS registered service definitions that are managed by the JPA Service Registry are now put through a more fine-tuned dynamic registration process at runtime. Previously, database schemas were created automatically if appropriate entity classes, representing each client application type, were found on the classpath. In recent versions of CAS, entity classes are required to be explicitly registered with the CAS service management facility, specially in the context of the management web application deployments.

[See this entry](https://apereo.github.io/cas/6.3.x/release_notes/RC2.html#dynamic-jpa-service-management) for more info.

{% include googlead1.html %}

One way to bypass this error is to register the unknown entity directly. For example, in the `management.properties` file you can add:

```
cas.service-registry.jpa.managed-entities[0]=org.apereo.cas.services.OidcRegisteredService
```

This should let the service registry manage OIDC services as proper database entities.

## Upgrades

The configuration and build versions are specified in the `gradle.properties` file. You can always change the `casmgmt.version` and repeat the build process as patches and fixes are released by the CAS project.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[overlay]: https://github.com/apereo/cas-management-overlay