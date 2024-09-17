---
layout:     post
title:      Apereo CAS - Ticket Management with RabbitMQ
summary:    A brief overview of how one may use AMQP backed by RabbitMQ to manage, distribute and replicate Apereo CAS tickets in a clustered deployment.
tags:       ["CAS 7.2.x", "Spring Boot"]
---

When working with a clustered CAS deployment and multiple nodes, it's often a requirement to enable and configure a ticket registry that is able to distribute CAS tokens and tickets across the entire cluster and CAS server nodes. This type of architecture allows CAS tickets and requests to be processed and validated by any CAS server node in the cluster regardless of where they were produced since all CAS nodes have access to the same shared *database*.
{% include googlead1.html  %}
CAS offers a ticket registry implementation backed by the Advanced Message Queuing Protocol (AMQP) protocol, the implementation of which is carried out by RabbitMQ. This is a lightweight, reliable, scalable, and portable message broker based on the AMQP protocol. CAS uses RabbitMQ to communicate through the AMQP protocol.
{% include googlead1.html  %}

In this post, we will take a brief look at how the AMQP ticket registry in CAS can be enabled and configured to broadcast tickets across a CAS cluster. Our starting position is as follows:

- CAS `7.2.x`
- Java `21`

# RabbitMQ

RabbitMQ is an open-source message broker that facilitates communication between CAS nodes by exchanging messages between producers (senders) and consumers (receivers). In our setup, each CAS node is a producer and a receiver. Via RabbitMQ, CAS tickets are sent, stored, and forwarded across other CAS nodes, ensuring reliable communication in asynchronous environments.
{% include googlead1.html  %}
In a nutshell, RabbitMQ acts as a middleman to:

- Receive messages from CAS nodes that produce tickets
- Route and store tickets based on queues and topics, automatically created and managed by CAS.
- Deliver tickets to CAS consumers.

Remember that RabbitMQ needs to be installed and run separately as a service on a server or a cloud platform. You can deploy it via Docker or take advantage of a cloud offering such as AWS RabbitMQ, Pivotal RabbitMQ, and others. Running it with Docker could be as simple as the following:
{% include googlead1.html  %}
```bash
docker run --rm -p 5672:5672 -p 15672:15672 \
    --hostname rabbitmq \
    --name rabbitmq-server \
    -e RABBITMQ_DEFAULT_USER=rabbituser \
    -e RABBITMQ_DEFAULT_PASS=bugsbunny \
    rabbitmq:3-management
```

# AMQP Ticket Registry

Assuming RabbitMQ is running, we need to prepare our CAS deployment with [the right extension module](https://apereo.github.io/cas/development/ticketing/Messaging-AMQP-Ticket-Registry.html), which enables the AMQP ticket registry option. As noted before, this registry is an extension of the default ticket registry that stores tickets in memory. However, the difference is that ticket operations applied to the registry are broadcasted using a messaging queue to other listening CAS nodes on the queue. Thus, every CAS node is both a producer and a receiver. One must also remember that each node keeps copies of the ticket state on its own and only instructs others to keep their copy accurate by broadcasting messages and data associated with each. 
{% include googlead1.html  %}
Because every CAS node in the cluster is both a producer and a receiver, CAS node A can produce ticket T1 and then receive a signal from the queue that the very same ticket, T1, is now available for processing. To avoid this problem, each message and ticket registry instance running inside a CAS node in the cluster is tagged with a unique identifier to prevent endless looping behavior and recursive needless inbound operations. This means that a CAS producer will ignore its operations identified by that unique id when handling signals and consumer notifications.

Now, we need to instruct CAS to connect to RabbitMQ. This configuration task is handled by Spring Boot, which requires the following configuration settings that match our previous Docker command:
{% include googlead1.html  %}
```properties
spring.rabbitmq.host=...
spring.rabbitmq.port=...
spring.rabbitmq.username=...
spring.rabbitmq.password=...
```

Because the registry is an extension of the default ticket registry, all options that apply to the default ticket registry are also applicable:
{% include googlead1.html  %}
```properties
cas.ticket.registry.in-memory.crypto.enabled=true
cas.ticket.registry.in-memory.crypto.signing.key=...
cas.ticket.registry.in-memory.crypto.encryption.key=...
```

Now, let's proceed with two separate CAS server nodes whose configuration is shared and identical. To get around the *inbound operation* problem, each CAS server node can be assigned its unique identifier. For example, CAS node A would have:
{% include googlead1.html  %}
```properties
cas.ticket.registry.core.queue-identifier=cas-queue-1
```

...and CAS node B would have:
{% include googlead1.html  %}
```properties
cas.ticket.registry.core.queue-identifier=cas-queue-2
```

The ID can be anything you prefer, as long as it's unique.

# Queues & Topics

RabbitMQ presents two important factors that one must be aware of: Topics and Queues.
{% include googlead1.html  %}
A queue in RabbitMQ is a storage mechanism that holds tickets until they are consumed by a CAS consumer. Queues are the primary entities where tickets are stored in RabbitMQ. A CAS producer sends tickets to an exchange, and the exchange routes the tickets to one or more queues based on the routing rules. CAS consumers receive tickets from these queues. As was implied, a topic exchange routes tickets to queues based on wildcard pattern matching of routing keys.
{% include googlead1.html  %}
CAS by default creates the necessary queue, `CasTicketRegistryQueue`, topic exchanges and auto-configures the routing rules. Unles you want to take matters into your own hands, there is nothing here for you to explicitly do. 
{% include googlead1.html  %}
Note that by default, CAS-created queues are *durable*. A durable queue is a queue that survives RabbitMQ restarts. Tickets stored in durable queues are not lost if RabbitMQ crashes or is restarted. You should note that a durable queue in RabbitMQ does not automatically guarantee that a new CAS node acting as a listener or consumer joining the cluster will receive all the previous tickets. Tickets are retained in the queue only if marked as persistent (handled by CAS automatically) and have not yet been *acknowledged* by a previous CAS consumer.

In other words,
{% include googlead1.html  %}
- If a new CAS node joins the queue, it will start receiving tickets that are still in the queue (i.e., tickets that were not yet consumed or acknowledged by other CAS nodes).
- The new CAS node will not receive tickets that have already been processed. Only unacknowledged (pending) tickets in the durable queue are available for new CAS servers.
- RabbitMQ does not replicate queue contents across nodes. A new CAS node joining a cluster node will not get the *history* of tickets unless they are still in the queue and unacknowledged.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)