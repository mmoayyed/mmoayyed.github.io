---
layout:     post
title:      Troubleshooting Hazelcast Integrations
summary:    An overview of several common errors when doing integrations with Hazelcast distributed caching.
tags:       [CAS]
---

[Hazelcast IMDG](https://github.com/hazelcast/hazelcast) is an open-source in-memory data grid based on Java. It allows data to be evenly distributed among the nodes of a cluster, allowing for horizontal scaling of processing and available storage. Integrations with Hazelcast can be somewhat tricky, given different the variety of components involved, the characteristics of the network and the chosen communication strategy between cluster node. In this blog post, several common Hazelcast errors are cataloged for reviews and better troubleshooting.

{% include googlead1.html  %}

## Node Failed To Start: Timeout

This error is demonstrated in the logs via the following stacktrace:

```
Caused by: java.lang.IllegalStateException: Node failed to start!
    at com.hazelcast.instance.impl.HazelcastInstanceImpl.<init>(HazelcastInstanceImpl.java:125) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.constructHazelcastInstance(HazelcastInstanceFactory.java:211) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.newHazelcastInstance(HazelcastInstanceFactory.java:190) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.newHazelcastInstance(HazelcastInstanceFactory.java:128) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.core.Hazelcast.newHazelcastInstance(Hazelcast.java:57) ~[hazelcast-4.1.jar:4.1]
```

{% include googlead1.html  %}

You may also see the following `TimeoutException` type of errors:

```
Caused by: java.util.concurrent.TimeoutException:
    JoinMastershipClaimOp failed to complete within 9999995000 NANOSECONDS.
    at com.hazelcast.spi.impl.operationservice.impl.InvocationFuture.newTimeoutException(InvocationFuture.java:85) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.spi.impl.AbstractInvocationFuture.get(AbstractInvocationFuture.java:653) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.internal.util.FutureUtil.executeWithDeadline(FutureUtil.java:389) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.internal.util.FutureUtil.returnWithDeadline(FutureUtil.java:270) ~[hazelcast-4.1.jar:4.1]
    ... 157 more
```

{% include googlead1.html  %}

This error usually indicates that one server in the Hazelcast cluster has been started with no Hazelcast cluster members defined. If so, Hazelcast will not allow the other members to join with members defined. Double check your Hazelcast configuration and make sure all cluster members are properly configured for member dynamic discovery, or all members are correctly specified in the static configuration.

## Node Failed To Start: Rolling Upgrades

This error is demonstrated in the logs via the following stacktrace:

```
Caused by: java.lang.IllegalStateException: Node failed to start!
    at com.hazelcast.instance.impl.HazelcastInstanceImpl.<init>(HazelcastInstanceImpl.java:125) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.constructHazelcastInstance(HazelcastInstanceFactory.java:211) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.newHazelcastInstance(HazelcastInstanceFactory.java:190) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.instance.impl.HazelcastInstanceFactory.newHazelcastInstance(HazelcastInstanceFactory.java:128) ~[hazelcast-4.1.jar:4.1]
    at com.hazelcast.core.Hazelcast.newHazelcastInstance(Hazelcast.java:57) ~[hazelcast-4.1.jar:4.1]
```

{% include googlead1.html  %}

You may also see the following log `ERROR` entries:

```
ERROR [com.hazelcast.security] - <[server1.net]:5701 [dev] [4.1] Node could not join cluster.
    Before join check failed node is going to shutdown now!>
ERROR [com.hazelcast.security] - <[server1.net]:5701 [dev] [4.1] Reason of failure for node join:
    Joining node's version 4.1.0 is not compatible with cluster version 4.0
    (Rolling Member Upgrades are only supported in Hazelcast Enterprise)>
```

{% include googlead1.html  %}

These errors show when cluster members use different version of Hazelcast. In this case, we have a member that is attempting to join the cluster using Hazelcast `4.1.0` while the cluster identifies itself with `4.0`. Note that rolling 
member upgrades for patch versions (`4.2.1` to `4.2.2`) are supported in different editions of Hazelcast IMDG. However, rolling upgrade for minor versions is supported in the Enterprise edition of Hazelcast IMDG. If you are not running the Enterprise 
edition, you may need to upgrade all nodes in each Hazelcast cluster.

## AWS ECS Fargate: Unable to Retrieve Credentials

This error is demonstrated in the logs via the following stacktrace:

```
com.hazelcast.config.InvalidConfigurationException: Unable to retrieve credentials from IAM Role:
    'arn:aws:iam::124312666645:role/hazelcast-ecs-role', please make sure it's attached to your EC2 Instance
```

For dynamic discovery of Hazelcast members in AWS ECS environments, you need to make sure the *IAM Role* is not specified in your application configuration, because the Hazelcast plugin would then fetch your credentials by using your IAM role. In AWS ECS, the role is fetched from the task definition that is assigned to run the application.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
