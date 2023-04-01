---
layout:     post
title:      Spring Cloud GCP - Working w/ Google Cloud Firestore & PubSub Emulators
summary:    An overview of how to configure your Spring application on Google Cloud, and test it locally using dockerized emulators for Google Cloud Firestore as well as PubSub.
tags:       ["Spring Cloud", "Docker", "Google Cloud"]
---

The Google Cloud Platform offers two attractive products for cloud-native application deployments:

- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) is an asynchronous and scalable messaging service that decouples services producing messages from services processing those messages Pub/Sub allows services to communicate asynchronously, with latencies on the order of 100 milliseconds.
{% include googlead1.html %}
- [Google Cloud Firestore](https://firebase.google.com/docs/firestore) is a flexible, scalable NoSQL cloud database to store and sync data for clients and servers. Its data model supports flexible, hierarchical data structures so you can store your data in documents, organized into collections. 

In this blog post, we will take a quick look at how to set up a Java application to connect to Google Cloud Firestore and PubSub emulators for local development and testing, using [Spring Cloud GCP](https://googlecloudplatform.github.io/spring-cloud-gcp). There will also be small demonstrations of how to run emulators locally via Docker.

{% include googlead1.html %}

This tutorial specifically focuses on:

- Docker
- Spring Cloud GCP `4.1.3`
- Java `17`

# Running Emulators

To run Firestore and PubSub emulators locally for development and testing, we'll need to put together a `Dockerfile` that start off with a base image:

```docker
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:$GCLOUD_SDK_VERSION
```
{% include googlead1.html %}
Then, we need to install the emulators:

```docker
RUN gcloud components install cloud-firestore-emulator beta --quiet
RUN gcloud components install pubsub-emulator beta --quiet
RUN gcloud components update
```

Finally, we'll need to provide an `ENTRYPOINT` for the Docker image to run the emulators:
{% include googlead1.html %}
```bash
gcloud config set project "${GCP_PROJECT_ID}"
gcloud beta emulators firestore start --host-port="0.0.0.0:${FIRESTORE_PORT}" &
gcloud beta emulators pubsub start --host-port="0.0.0.0:${PUBSUB_PORT}"
```

You can choose your GCP project ID as well as ports for Firestore and PubSub as you prefer. By default, these typically
would be set to `8080` and `8085`.

To build the Docker image and run the container, you may use:

```bash
docker build . -t my/gcp:latest
docker run --name gcp-server -d --rm -p 8080:8080 -p 8085:8085 my/gcp
```
{% include googlead1.html %}
At this point, your emulators should be running on ports `8080` and `8085` for both Firestore and PubSub.

# Connecting to PubSub

To test and develop against the PubSub emulator, Spring Cloud provides the following properties:

```properties
spring.cloud.gcp.pubsub.emulator-host=localhost:${PUBSUB_PORT}
spring.cloud.gcp.pubsub.project-id=${GCP_PROJECT_ID}
```
{% include googlead1.html %}
Of course, this is not exactly sufficient mainly because the emulators run on a non-SSL connection and we'll need to instruct Google Cloud GCP to adjust its communication channel accordingly. This is handled using `` and we'll need to have one for the publisher transport and one for the subscriber transport:

```java
@Bean
public TransportChannelProvider publisherTransportChannelProvider(GcpPubSubProperties properties) {
    var channel = ManagedChannelBuilder.forTarget(...);
    return FixedTransportChannelProvider.create(GrpcTransportChannel.create(channel));
}

@Bean
public TransportChannelProvider subscriberTransportChannelProvider(GcpPubSubProperties properties) {
    var channel = ManagedChannelBuilder.forTarget(...).build();
    return FixedTransportChannelProvider.create(GrpcTransportChannel.create(channel));
}
```
{% include googlead1.html %}
Furthermore, you might need to do the same sort of thing if your application intends to use the `PubSubAdmin` component. This will have you adjust the topic admin settings so you can query and create topics:

```java
@Bean
public TopicAdminSettings topicAdminSettings(GcpPubSubProperties properties) {
    var channel = ManagedChannelBuilder.forTarget(...).build();
    var channelProvider = FixedTransportChannelProvider.create(GrpcTransportChannel.create(channel));
    return TopicAdminSettings.newBuilder()
        .setCredentialsProvider(NoCredentialsProvider.create())
        .setTransportChannelProvider(channelProvider)
        .build();
}
```

...and finally, we would need to adjust the subscription admin settings so our application can create and query subscriptions:
{% include googlead1.html %}
```java
@Bean
public SubscriptionAdminClient subscriptionAdminClient(GcpPubSubProperties properties) {
    var channel = ManagedChannelBuilder.forTarget(...).build();
    var channelProvider = FixedTransportChannelProvider.create(GrpcTransportChannel.create(channel));
    return SubscriptionAdminClient.create(SubscriptionAdminSettings.newBuilder()
        .setCredentialsProvider(NoCredentialsProvider.create())
        .setTransportChannelProvider(channelProvider)
        .build());
}
```

# Connecting to Firestore

This is slightly simpler; to test and develop against the Firestore emulator, Spring Cloud provides the following properties:

```properties
spring.cloud.gcp.firestore.project-id=${GCP_PROJECT_ID}
spring.cloud.gcp.firestore.emulator.enabled=true
spring.cloud.gcp.firestore.host-port=localhost:${FIRESTORE_PORT}
```
{% include googlead1.html %}
Note that Spring Cloud GCP may proceed to create a `firestoreTemplate` template bean if, among other things, it sees the `Flux` on the classpath. If you do not need the reactive `FirestoreTemplate` template, you will need to consider removing the appropriate dependency from the classpath.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html