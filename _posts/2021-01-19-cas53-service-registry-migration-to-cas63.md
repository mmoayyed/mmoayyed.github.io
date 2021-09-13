---
layout:     post
title:      Apereo CAS - Service Registry Migrations
summary:    Learn how to migrate application records and services in the Apereo CAS 5.3.x Service Registry from one version to the next for easier upgrades.
tags:       [CAS]
---

If you are in the process of upgrading from Apereo CAS `5.3.x` over to `6.3.x`, you do need to think about a data migration strategy for your CAS application records that are managed in the Service Registry. This can become especially tricky depending on the type of service registry used to handle records. For example, if your application records are managed by an Oracle database, you not only have to review and possibly troubleshoot database schema differences across two different CAS versions, but also look for strategies to account for differences in CAS service definitions across versions.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `5.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)

## CAS Configuration

Let's suppose that in the existing Apereo CAS `5.3.x` deployment, application records and services are managed using a relational database via the [JPA service registry](https://apereo.github.io/cas/5.3.x/installation/JPA-Service-Management.html). Let's tackle the data migration problem in two separate steps: migrating tables and schemas, and then migrating data.

### Schema Generation

One option is to let the JPA service registry in CAS re-create the table schemas automatically in a brand new database, using Hibernate's DDL feature:

```properties
cas.service-registry.jpa.ddl-auto=create
```

{% include googlead1.html %}

Per Hibernate, this setting does the following:
> Create the schema, destroying previous data.

What you want to do is, set this setting and restart CAS once and observe the logs for any possible errors. Then examine the state of the database to see if the process was able to create the relevant schema and tables. Once you are satisfied with the state of the database, shut down CAS and reset the DDL feature to either `none` or `validate`, so as to not destroy data the next time you start CAS:

```properties
cas.service-registry.jpa.ddl-auto=none
```

So at this point, you should have all the required database schemas table available and ready for use.

### Data Migration

Apereo CAS `6.3.x` provides a [dedicated endpoint](/2020/08/15/cas63x-import-export-services/) that can be used to import application records one at a time. So, our strategy would be to modify the existing `5.3.x`. deployment to export application records one at a time as individual JSON files, such that we can then import them into the new deployment environment.

{% include googlead1.html %}

To handle this, let's start by customizing the `RegisteredServicesReportController` component in the existing `5.3.x` deployment to let it export application records as a zip file. The changes add an `export` endpoint which can be invoked via a GET request using: 

```bash
https://sso.example.org/cas/status/services/export
```

The relevant code snippet is as follows:

```java
@GetMapping("/export")
public void export(HttpServletRequest request, 
                   HttpServletResponse response) throws Exception {
    ensureEndpointAccessIsAuthorized(request, response);

    DefaultRegisteredServiceJsonSerializer serializer = 
      new DefaultRegisteredServiceJsonSerializer();

    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType(MediaType.APPLICATION_OCTET_STREAM.toString());

    String zipFileName = "services.zip";
    Sting disposition = "attachment; filename=\"" + zipFileName + "\"";
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, disposition);
    
    try (ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream())) {
        DefaultRegisteredServiceResourceNamingStrategy namingStrategy =
            new DefaultRegisteredServiceResourceNamingStrategy();
        for (RegisteredService service : servicesManager.load()) {
            StringWriter writer = new StringWriter();
            serializer.to(writer, service);

            String name = namingStrategy.build(service, "json");
            ZipEntry zipEntry = new ZipEntry(name);
            String content = writer.toString();
            zipEntry.setSize(content.length());

            zipOut.putNextEntry(zipEntry);
            StreamUtils.copy(content, StandardCharsets.UTF_8, zipOut);
            zipOut.closeEntry();
        }
        zipOut.finish();
    }
}
```

{% include googlead1.html %}

This will produce a zip file with the contents of the service registry as individual JSON files. These should be forward compatible with CAS `6.3.x`, though there may be a few anomalies that we can work through individually after the upgrade. You should be able to download and unzip the file, and then import each JSON file into CAS using the [import endpoint](/2020/08/15/cas63x-import-export-services/) in `6.3.x`.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html