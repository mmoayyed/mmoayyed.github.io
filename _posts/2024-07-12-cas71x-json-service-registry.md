---
layout:     post
title:      Apereo CAS - JSON Service Registry
summary:    Learn how to register applications and relying parties with the Apereo CAS server using JSON files.
tags:       ["CAS 7.1.x", "Getting Started", "Service Integrations"]
---

Client applications that wish to use the CAS server for authentication must register with the server apriori. CAS provides several facilities to keep track of the registration records, and you may choose any that best fits your needs. In more technical terms, CAS deals with application management using a special implementation called the Service Registry that sits on top of a real data source and acts as the controlling abstraction.

{% include googlead1.html  %}
This post will focus on using the JSON service registry and managing application registration records inside flat JSON files and the filesystem. Our starting position is as follows:
- CAS `7.1.x`
- Java `21`

# Configuration

The JSON service registry requires that you declare the appropriate module in your CAS build:
{% include googlead1.html  %}
```groovy
implementation "org.apereo.cas:cas-server-support-json-service-registry"
```

Next, you must teach CAS how to look up JSON files to read and write registration records. This is done in the `cas.properties` file that is typically found at `/etc/cas/config`:
{% include googlead1.html  %}
```properties
cas.service-registry.core.init-from-json=false
cas.service-registry.json.location=file:/etc/cas/services
```

...where a sample `ApplicationName-1001.json` would then be placed inside `/etc/cas/services`:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "ApplicationName",
  "id" : 1001
}
```

<div class="alert alert-info">
  <strong>Remember</strong><br/>The directory location can be anything and anywhere you prefer, as long as is remains available and accessible to all CAS server nodes. This is particularly important for a multi-node clustered deployment given all participating CAS server nodes must be able to have access to the same designated directory as the ultimate database of registration records.
</div>

Or perhaps a slightly more advanced version would be an application definition that allows for the release of certain attributes that we previously retrieved from external sources as part of the authentication attempt:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "ApplicationName",
  "id" : 1001,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail" ] ]
  }
}
```

The naming convention here is somewhat important and is determined based on the service `name` field and its numeric `id` using the below formula:
{% include googlead1.html  %}
```groovy
fileName = serviceName + "-" + serviceNumericId + ".json"
```

This means that the file should be named `ApplicationName-1001.json`. As you add more JSON files to the directory, you need to be absolutely sure that no two service definitions would have the same name or numeric id. If this happens, loading one definition will likely stop loading the other. While service ids can be chosen arbitrarily, ensure all service numeric identifiers are unique. CAS will also attempt to output warnings if duplicate data is found.

# Highlights

The setup and configuration of the JSON service registry is relatively straightforward. Here are a few more highlights that you may want to be aware of and take into consideration:

## Simplicity

The JSON Service Registry allows you to define services in a straightforward JSON format. Each service definition is encapsulated in a JSON file, making it easy to read, modify, and manage. Of course, such JSON files are human-readable and can be edited using any text editor, which allows one to quickly make changes to service definitions without needing specialized tools.

## Version Control

Since service definitions are stored as individual JSON files, they can easily be version-controlled using systems like Git. This feature enables administrators to track changes, revert to previous versions, and collaborate effectively in a team environment. You will need to navigate to the directory where services are found and turn that into a git repository. Something along the lines of the following snippet:
{% include googlead1.html  %}
```bash
cd /etc/cas/services
git init .
git add -A .
git commit -am "Added all service definitions to git repository"
```

## Monitoring

Since service definitions are not packaged with the CAS web application and can be found in an external directory, they can be modified and updated without rebuilding the CAS web application. But do we need to restart the CAS server every time a JSON file is changed or added?
{% include googlead1.html  %}
While that might be the safest thing to do to ensure changes are picked up, it is not necessary to do so strictly speaking. One of the more interesting features of the JSON Service Registry is its support for monitoring and dynamic reloading of JSON files. CAS will automatically reload service definitions when changes are detected. This capability should be turned on by default already, and can be controlled via the following property:
{% include googlead1.html  %}
```properties
cas.service-registry.json.watcher-enabled=true
```

## Periodic Reloading

Suppose you prefer to disable the watcher and not monitor service files for changes. In that case, an additional alternative allows CAS to scan and periodically reload service definitions at your chosen interval. In doing so, CAS will schedule a background job that would run once every so often to reload the application definitions in memory. This is typically controlled via the following property:
{% include googlead1.html  %}
```properties
cas.service-registry.schedule.enabled=true
cas.service-registry.schedule.repeat-interval=PT2M
```

Using the above configuration, CAS will reload all service definitions every `2` minutes. Of course, you would want to adjust this interval based on your deployment needs and rate of change.

## Syntax

CAS uses a version of the JSON syntax, so named *Human JSON*that provides a much more relaxed syntax with the ability to specify comments, multiline strings, trailing commas, and more. This makes managing changes and controlling syntax much easier without worrying about specific (and often annoying) syntax requirements. For example, this is a valid JSON file for CAS:
{% include googlead1.html  %}
```groovy
{
  /*
    This comment will continue
    on this line again.
  */
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^(https|imaps)://.*",
  "name" : "HTTPS and IMAPS",
  // "description": "This is commented out"
  "id" : 1, // Trailing comma here!
}
```
{% include googlead1.html  %}
You can see that CAS allows one to use comments in such JSON files, and for extra luck, trailing commas are prefectly allowed.

# Need Help?

If you have questions about this blog post's content or topic, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
