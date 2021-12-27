---
layout:     post
title:      Apereo CAS - AWS Fargate & Amazon ECS<br>with Hazelcast
summary:    Learn how to deploy clustered Apereo CAS server nodes using AWS Fargate and Amazon ECS, with Hazelcast as the ticket registry for high availability.
tags:       ["CAS 6.3.x", "Hazelcast"]
---

[AWS Fargate](https://aws.amazon.com/fargate) is a serverless compute engine for containers that work with both Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS). For a highly-available CAS deployment, running the Apereo CAS backed with the [Hazelcast Ticket Registry](https://apereo.github.io/cas/6.3.x/ticketing/Hazelcast-Ticket-Registry.html) can be a great option, especially when run as a Docker container in an Amazon ECS environment to take advantage of ECS member discovery. In this blog post, we will take a quick look at the minimum configuration required to make this deployment scenario possible.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## CAS Configuration

Once you have configured the CAS WAR Overlay with the [Hazelcast Ticket Registry](https://apereo.github.io/cas/6.3.x/ticketing/Hazelcast-Ticket-Registry.html) module, we can begin by configuring Hazelcast to allow for member discovery options. Whether running in Amazon EC2 or ECS, Hazelcast support in CAS can handle auto-discovery automatically via [a dedicated extension](https://apereo.github.io/cas/6.3.x/ticketing/Hazelcast-Ticket-Registry.html#aws-ec2-auto-discovery).

At a minimum, our CAS configuration for an Amazon ECS would look as follows:

```properties
cas.ticket.registry.hazelcast.cluster.discovery.enabled=true
cas.ticket.registry.hazelcast.cluster.discovery.aws.security-group-name=service:cas-service-development
cas.ticket.registry.hazelcast.cluster.multicast-enabled=false
cas.ticket.registry.hazelcast.cluster.discovery.aws.port=-5701
```

{% include googlead1.html %}

Be sure to adjust the member address range to assist with auto-discovery.

Note that we do not need to specify an `iam-role` setting; This setting only affects deployments on Amazon EC2. If you are deploying CAS in an Amazon ECS environment, the role is automatically fetched from the task definition that is assigned to run CAS. You need to make sure the role assigned to the task definition is configured with the correct and sufficient set of permission to let the deployment proceed.

If you prefer, you can also use an access/secret key combination without relying on role definitions:

```properties
cas.ticket.registry.hazelcast.cluster.discovery.aws.access-key=xxxx
cas.ticket.registry.hazelcast.cluster.discovery.aws.secret-key=xxxx
```

To troubleshoot, you can always adjust the logs to investigate errors:

{% include googlead2.html %}

```xml
<Logger name="com.hazelcast" level="trace" additivity="false">
    <AppenderRef ref="console"/>
    <AppenderRef ref="file"/>
</Logger>
```


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html