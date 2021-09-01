---
layout:     post
title:      Run the Azure Cosmos DB Emulator on Docker for MacOS
summary:    The Azure Cosmos DB Linux Emulator provides a local environment that emulates the Azure Cosmos DB service for development purposes. This post shows how the emulator may be run on a MacOS platform and how client Java applications can be configured to connect to the service.
tags:       [CAS]
---

The [Azure Cosmos DB Linux Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/linux-emulator) is now available on Linux platforms, though as of this writing continues to be in *Preview* mode. The emulator provides a local environment that mimics the Azure Cosmos DB service for development purposes. In this post, I'll take a quick look at how the emulator may be run on a MacOS platform and how client Java applications can be configured to connect to the service.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- MacOS Big Sur or later.
- Java 11
- Docker 3.6.x (though earlier versions may work too)

# Running the Emulator

The emulator can be run as a Docker container:

{% include googlead1.html  %}

```bash
#!/bin/bash
docker stop cosmosdb || true && docker rm cosmosdb || true
ipaddr="$(ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n 1)"
echo "System IP address is $ipaddr"
docker pull mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator
docker run --rm -p 8081:8081 -p 10251:10251 -p 10252:10252 -p 10253:10253 -p 10254:10254 \
  -m 3g --cpus=2.0 --name=cosmosdb \
  -e AZURE_COSMOS_EMULATOR_PARTITION_COUNT=2 \
  -e AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=true \
  -e AZURE_COSMOS_EMULATOR_IP_ADDRESS_OVERRIDE="$ipaddr" \
  -d mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator
```

While running, you can browse to `https://localhost:8081/_explorer/index.html` to see the emulator in action:

{% include image.html img="https://user-images.githubusercontent.com/1205228/131633004-4524d045-f86a-407c-bb87-199425802227.png" 
width="80%" title="Azure Cosmos DB Emulator on Docker for MacOS" %}

{% include googlead1.html  %}

# Emulator Certificate

The emulator runs behind a self-signed certificate, which needs to be trusted by the JDK platform. Failure to do so may cause the following stacktraces to show up:

```bash
javax.net.ssl.SSLHandshakeException: General OpenSslEngine problem
  at io.netty.handler.ssl.ReferenceCountedOpenSslEngine.handshakeException(ReferenceCountedOpenSslEngine.java:1772) 
  ...
Caused by: sun.security.validator.ValidatorException: PKIX path building failed: 
  sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
  at java.base/sun.security.validator.PKIXValidator.doBuild(PKIXValidator.java:438)
  ...
	Suppressed: javax.net.ssl.SSLHandshakeException: 
    error:1000007d:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED
    at io.netty.handler.ssl.ReferenceCountedOpenSslEngine.sslReadErrorResult(ReferenceCountedOpenSslEngine.java:1288)
    ...
Caused by: sun.security.provider.certpath.SunCertPathBuilderException: 
  unable to find valid certification path to requested target
  at java.base/sun.security.provider.certpath.SunCertPathBuilder.build(SunCertPathBuilder.java:141)
  ...
```

{% include googlead1.html  %}

To export and install the certificate into the `cacerts` keystore of the JDK platform, one may use: 

```bash
echo "Fetching CosmosDb certificate..."
rm -Rf ./emulatorcert.crt
curl -k https://localhost:8081/_explorer/emulator.pem > emulatorcert.crt
cat emulatorcert.crt
echo "Removing precious certificate from $JAVA_HOME/lib/security/cacerts"
sudo keytool -delete -alias "cosmosdb" -keystore \
  "$JAVA_HOME"/lib/security/cacerts -storepass changeit -noprompt
echo "Adding certificate to $JAVA_HOME/lib/security/cacerts"
sudo keytool -importcert -file ./emulatorcert.crt -keystore \
  "$JAVA_HOME"/lib/security/cacerts -alias "cosmosdb" --storepass changeit -noprompt
rm -Rf ./emulatorcert.crt
sudo keytool -list -keystore "$JAVA_HOME"/lib/security/cacerts \
  -alias "cosmosdb" --storepass changeit
```

# Java Client Applications

Client applications that need to connect to the Azure Cosmos DB service need to build a `CosmosClient` client object:

{% include googlead1.html  %}

```java
var throttlingRetryOptions = new ThrottlingRetryOptions()
    .setMaxRetryAttemptsOnThrottledRequests(properties.getMaxRetryAttemptsOnThrottledRequests())
    .setMaxRetryWaitTime(Beans.newDuration(properties.getMaxRetryWaitTime()));

var builder = new CosmosClientBuilder()
    .endpoint(properties.getUri())
    .key(properties.getKey())
    .preferredRegions(properties.getPreferredRegions())
    .consistencyLevel(ConsistencyLevel.valueOf(properties.getConsistencyLevel()))
    .contentResponseOnWriteEnabled(false)
    .clientTelemetryEnabled(properties.isAllowTelemetry())
    .userAgentSuffix(properties.getUserAgentSuffix())
    .throttlingRetryOptions(throttlingRetryOptions)
    .endpointDiscoveryEnabled(properties.isEndpointDiscoveryEnabled())
    .directMode();
this.client = builder.buildClient();
```

The `CosmosClient` or its `CosmosClientBuilder` friend do not provide a way to set and configure the SSL context or trust managers of the client. If you fail  to import the emulator certificate into the JDK trust store (or cannot do for whatever reason) and need to bypass SSL-related issues in your application, you will need to resort to an *ugly* hack for now to configure the trust manager of the client:

{% include googlead1.html  %}

```java
var sslContext = SslContextBuilder
    .forClient()
    .sslProvider(SslProvider.JDK)
    .trustManager(...) // Could be InsecureTrustManagerFactory.INSTANCE
    .build();
var configsMethod = ReflectionUtils.findRequiredMethod(builder.getClass(), "configs");
configsMethod.trySetAccessible();
var configs = (Configs) configsMethod.invoke(builder);
var sslContextField = ReflectionUtils.findRequiredField(configs.getClass(), "sslContext");
sslContextField.trySetAccessible();
sslContextField.set(configs, sslContext);
```

That should do it.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)