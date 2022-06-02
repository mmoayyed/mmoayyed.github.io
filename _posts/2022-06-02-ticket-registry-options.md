---
layout:     post
title:      Apereo CAS - Ticket Registry World Tour
summary:    Review several ticket registry implementation options available to handle ticket and token management, that would be useful for both single and clustered deployments.
tags:       ["CAS 6.5.x", "Hazelcast", "Redis", "MongoDb"]
---

A robust CAS deployment requires the presence and configuration of an *internal* database that is responsible for keeping track of tickets and tokens issued by CAS. A large variety of databases and storage services are supported by Apereo CAS under the facade of a *Ticket Registry*, and in this post, we will review a few of the more popular options that would be particularly useful for distributed deployments with high-availability requirements.
{% include googlead1.html %}
<div class="alert alert-info">
  <strong>One Registry to Rule Them All</strong><br />Apereo CAS accepts and can work with <i>one</i> ticket registry option at the most. Choose one with which you are most comfortable and familiar; that generally is the best selection criteria.
</div>

Our starting position is based on the following:

- CAS `6.5.x`
- Java 11
- [Docker](https://www.docker.com/get-started)

# Hazelcast

Hazelcast Ticket Registry is often a decent choice when deploying CAS in a cluster. This ticket registry implementation is cluster-aware and allows each CAS server node to auto-join the cluster on startup. Furthermore, Hazelcast will evenly distribute the ticket data among all the members of a CAS cluster in a very efficient manner. 

## Configuration

Make sure you have included the appropriate module in the build:
{% include googlead1.html %}
```groovy
implementation "org.apereo.cas:cas-server-support-hazelcast-ticket-registry"
```

When you are working on a more modest CAS deployment in an environment that is more or less owned by you and you prefer more explicit control over CAS node registrations in your cluster, the following settings would be more ideal:

```properties
# cas.ticket.registry.hazelcast.cluster.network.port=5701
# cas.ticket.registry.hazelcast.cluster.network.port-auto-increment=true
cas.ticket.registry.hazelcast.cluster.network.members=123.321.123.321,223.621.123.521,...
```
{% include googlead1.html %}
In this strategy, and using manual registration and discovery, the list of members is to include *all* members of the cluster, including the current CAS server node. Finally, you need to make sure CAS server nodes are free to communicate with each other over port `5701`. 

# Redis

This registry stores tickets in one or more Redis instances. CAS presents and uses Redis as a key/value store that accepts String keys and CAS ticket objects as values. The key is started with `CAS_TICKET`. The Redis ticket registry also supports Redis Sentinel, which provides high availability for Redis.

## Configuration

Make sure you have included the appropriate module in the build:
{% include googlead1.html %}
```groovy
implementation "org.apereo.cas:cas-server-support-redis-ticket-registry"
```

You should also take note of the following settings:

```properties
cas.ticket.registry.redis.host=localhost
cas.ticket.registry.redis.port=6379
cas.ticket.registry.redis.pool.enabled=true
```
{% include googlead1.html %}
To support a Sentinel-aware configuration, you may also register other Redis nodes, in this case, `3`:

```
cas.ticket.registry.redis.sentinel.master=the-master-node
cas.ticket.registry.redis.sentinel.node[0]=localhost:26379
cas.ticket.registry.redis.sentinel.node[1]=localhost:26380
cas.ticket.registry.redis.sentinel.node[2]=localhost:26381
```

# JPA

The JPA Ticket Registry allows CAS tickets in a relational database back-end such as MySQL, etc. The configuration of the database tables and schema should all be handled automatically by CAS; you will simply need to make sure the database instance is created and made available to the running CAS server.

## Configuration

Make sure you have included the appropriate module in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-jpa-ticket-registry"
```

You should also take note of the following settings that allow CAS to connect to a PostgreSQL database:
{% include googlead1.html %}
```properties
cas.ticket.registry.jpa.user=postgres
cas.ticket.registry.jpa.password=password
cas.ticket.registry.jpa.driver-class=org.postgresql.Driver
cas.ticket.registry.jpa.url=jdbc:postgresql://localhost:5432/tickets
cas.ticket.registry.jpa.dialect=org.hibernate.dialect.PostgreSQL10Dialect
```

# MongoDb

This registry stores tickets in one or more MongoDb instances. Tickets are auto-converted and wrapped into document objects as JSON. Special indices are created to let MongoDb handle the expiration of each document and cleanup tasks. Note that CAS tries to create the relevant collections automatically to manage different ticket types; there is no other manual task required to prepare the Mongo database.

## Configuration

Make sure you have included the appropriate module in the build:

```groovy
implementation "org.apereo.cas:cas-server-support-mongo-ticket-registry"
```
{% include googlead1.html %}
The following settings should also come in handy:

```properties
cas.ticket.registry.mongo.host=localhost
cas.ticket.registry.mongo.port=27017
cas.ticket.registry.mongo.user-id=root
cas.ticket.registry.mongo.password=secret
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
