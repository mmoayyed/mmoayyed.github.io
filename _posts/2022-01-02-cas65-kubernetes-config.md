---
layout:     post
title:      Apereo CAS - Managing Configuration w/ Spring Cloud & Kubernetes
summary:    Playing around with Kubernetes, Minikube, and friends to show how Apereo CAS might be deployed in a containerized and orchestrated fashion inside a Kubernetes cluster, and using Spring Cloud features such as Kubernetes ConfigMaps and Secrets. 
tags:       ["CAS 6.4.x", "CAS 6.5.x", "Configuration Management", "Kubernetes", "Spring Cloud", "Docker", "Spring Boot"]
---

Continuing with Apereo CAS thriving in a [containerized world](/2020/02/16/cas6-kubernetes/) for Kubernetes deployments, this blog post continues on the same thread to demonstrate how a CAS Docker container can be deployed and managed by [Kubernetes](https://kubernetes.io/) and use Kubernetes features such as `ConfigMap`s and `Secret`s for configuration management via Spring Cloud. 

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.5.x`
- Java 11
- [CAS Overlay](https://github.com/apereo/cas-overlay-template)
- [Docker](https://www.docker.com/get-started)
- [Minikube](https://github.com/kubernetes/minikube)
- MacOS Big Sur

## Minikube

I started by making sure my Minikube installation is ready and recent. You can try to verify the state of your installation via:

```bash
> minikube version

minikube version: v1.24.0
commit: 76b94fb3c4e8ac5062daf70d60cf03ddcc0a741b

...

> kubectl version

Client Version: version.Info{Major:"1", Minor:"23", GitVersion:"v1.23.1"...}
Server Version: version.Info{Major:"1", Minor:"22", GitVersion:"v1.22.3"...}
```

{% include googlead1.html  %}

When ready, Minikube can be launched using the following command:

```bash
❯ minikube start

😄  minikube v1.24.0 on Darwin 11.6.2
✨  Automatically selected the docker driver. Other choices: hyperkit, parallels, ssh
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
💾  Downloading Kubernetes v1.22.3 preload ...
    > preloaded-images-k8s-v13-v1...: 501.73 MiB / 501.73 MiB  100.00% 17.58 Mi
    > gcr.io/k8s-minikube/kicbase: 355.78 MiB / 355.78 MiB  100.00% 8.73 MiB p/
🔥  Creating docker container (CPUs=2, Memory=1985MB) ...
🐳  Preparing Kubernetes v1.22.3 on Docker 20.10.8 ...
❗  Certificate client.crt has expired. Generating a new one...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

You can always verify the Minikube status via:

```bash
❯ minikube status

minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

If you are working from a previous existing Minikube installation, especially one that may be incompatible with the newest upgrades or one whose certificate might have expired, you may want to delete the previous setup first before starting Minikube again:

```bash
minikube delete
```

{% include googlead1.html  %}

Finally, consider running the Minikube dashboard in a separate terminal window:

```bash
> minikube dashboard
```

{% include image.html img="https://user-images.githubusercontent.com/1205228/74601036-ba67ff80-50b2-11ea-95b2-e72c661a207d.png"
width="70%" title="Apereo CAS in Kubernetes Dashboard" %}

Great! You now have a running Kubernetes cluster in the terminal. Minikube started a virtual machine for you, and a Kubernetes cluster is now running in that VM.

## Deployments

Let's start by creating a deployment descriptor for our CAS server. To keep things simple, I started with a plain CAS container image that is published by the CAS project on [Docker Hub](https://hub.docker.com/r/apereo/cas/):

```bash
kubectl create deployment cas --image=apereo/cas:6.4.4.2 \
  --dry-run=client -o=yaml > deployment.yaml
echo --- >> deployment.yaml
kubectl create service clusterip cas --tcp=8080:8080 --tcp=8443:8443 \
  --dry-run=client -o=yaml >> deployment.yaml
kubectl apply -f deployment.yaml
```

{% include googlead1.html  %}

As the command demonstrates, our container image is based on Apereo CAS `6.4.4.2`, and the deployment is configured to map specific ports for our use and access later such as that ultimately, we would be able to access CAS via `http://localhost:8080/cas` or `https://localhost:8443/cas`. 

## Volume Mounts

If you examine the running `cas` pod in the Kubernetes dashboard and review the logs, you will find that the CAS Docker container is crashing on startup and fails to locate the keystore expected at `/etc/cas/thekeystore`. Of course, the keystore does not exist in the CAS container and there are no other volume mappings or mounts to indicate where the keystore might be found. The question is, how can we take a keystore that is generated outside the pod and the CAS container and map that resource into pod running inside Minikube? 

To get around for the time being, what we want to achieve is,

- Create the keystore at `/etc/cas/thekeystore` on the host machine.
- Start with Minikube and allow it to map the host directory `/etc/cas/` onto a `/etc/cas` path inside the Minikube container.
- Modify our `deployment.yaml` deployment descriptor to configure volume mount between Minikube and the running CAS container.

To create the initial keystore, you may use the JDK `keytool` command (use the password `changeit`):

{% include googlead1.html  %}

```bash
keytool -genkey -alias cas -keyalg RSA -validity 999 \
    -keystore /etc/cas/thekeystore -ext san=dns:$REPLACE_WITH_FULL_MACHINE_NAME
```

Once you have the keystore ready, instruct Minikube to handle the mount between the host and its container:

```bash
minikube mount /etc/cas/:/etc/cas/
```

<div class="alert alert-info">
  <strong>Note</strong><br/>You can also SSH into the running Minikube container via <code>minikube ssh</code> and run <code>ls /etc/cas</code> to verify the status and correctness of the mount.
</div>

Finally, the deployment descriptor file `deployment.yml` should be modified to allow for mapping between Minikube's volume and that of the CAS container. Here is a brief snippet of how that change might be applied:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: cas
  name: cas
spec:
  ...
  template:
    ...
    spec:
      volumes:
      - name: host-mount
        hostPath:
          path: "/etc/cas"
      containers:
      - image: apereo/cas:6.4.4.2
        name: cas
        volumeMounts:
        - mountPath: "/etc/cas"
          name: host-mount
        resources: {}
...
```

Be sure to apply the most recent changes via:
{% include googlead1.html  %}

```bash
kubectl apply -f deployment.yaml
```

Once the change is applied and back in the dashboard, you should be able to see the deployment running in all greens:

{% include image.html img="https://user-images.githubusercontent.com/1205228/147682910-47f09ccd-bd82-464a-be13-5212f88edb6e.png"
width="70%" title="Apereo CAS in Kubernetes Dashboard" %}

Now you need to be able to connect to CAS which is exposed as a [Service in Kubernetes](https://kubernetes.io/docs/concepts/services-networking/service/). We can use `kubectl port-forward` to select a matching pod for port-forwarding using our `cas` service in Kubernetes:

```
kubectl port-forward svc/cas 8443:8443
Forwarding from 127.0.0.1:8443 -> 8443
Forwarding from [::1]:8443 -> 8443
```

{% include googlead1.html  %}

...and voilà! our CAS server container is available under `https://localhost:8443/cas/login`.

## Kubernetes ConfigMaps

A `ConfigMap` is an API object used to store non-confidential data in key-value pairs. Pods can consume ConfigMaps as environment variables, command-line arguments, or as configuration files in a volume. A ConfigMap allows you to decouple environment-specific configuration from your container images so that your applications are easily portable.

<div class="alert alert-info">
  <strong>Note</strong><br/><code>ConfigMap</code> does not provide secrecy or encryption. If the data you want to store are confidential, use a <code>Secret</code> instead or use additional (third party) tools to keep your data private.
</div>

So, rather than mounting volumes and linking configuration files, what we should be able to do is to define our CAS configuration properties inside a `ConfigMap`, and allow the CAS pod to read those settings at bootstrap time, using the `PropertySource` Kubernetes implementation provided by [Spring Cloud Kubernetes](https://docs.spring.io/spring-cloud-kubernetes/docs/current/reference/html/).

{% include googlead1.html  %}

The default behavior is to create a `Fabric8ConfigMapPropertySource` based on a Kubernetes `ConfigMap` that has a `metadata.name` value as defined by `spring.application.name` or a custom name defined within the `bootstrap.properties` file under `spring.cloud.kubernetes.config.name`. In our case, this value would be `cas`.

### CAS Configuration

To turn on support for Kubernetes configuration management, we need to move away from the published CAS Docker image and instead build our image based on the [CAS Overlay](https://github.com/apereo/cas-overlay-template) that contains dedicated modules and dependencies for this support.

Once you have cloned the overlay, you will need to include the following dependency in the build:

```gradle
implementation "org.apereo.cas:cas-server-support-configuration-cloud-kubernetes"
```

Then, create a `src/main/resources/bootstrap.properties` file to instruct Spring Cloud Kubernetes to fetch configuration from `ConfigMap` sources:

{% include googlead1.html  %}
```properties
spring.application.name=cas

spring.cloud.kubernetes.config.fail-fast=false
spring.cloud.kubernetes.enabled=true
spring.cloud.kubernetes.config.name=cas
spring.cloud.kubernetes.config.namespace=default

spring.cloud.config.enabled=false

logging.level.io.fabric8.kubernetes=DEBUG
logging.level.org.springframework.cloud.kubernetes=DEBUG
```

Here we are assigning a `cas` configuration name to our deployment and we also instruct Spring Cloud Kubernetes to use the `default` namespace. It's also important to turn off the Spring Cloud Configuration Server using `spring.cloud.config.enabled=false` to avoid outbound calls to a non-existing configuration server.

<div class="alert alert-info">
  <strong>Note</strong><br/>If there are any issues, setting <code>spring.cloud.kubernetes.config.fail-fast=true</code> seems to immediately crash the running pod without any additional logs or data from the container. This could be specially the case if the pod does not have enough permissions to use the Kubernetes API to fetch configuration and secrets. <code>false</code> seems to be a safer approach for diagnostics.
</div>

Then, build the Docker image using [jib](/2018/11/09/cas6-docker-jib/):

```bash
./gradlew clean build jibDockerBuild
```
{% include googlead1.html  %}
Finally, push the image to Docker Hub so Kubernetes can pull the image and deploy it:

```bash
docker push mmoayyed/cas:latest
```

### Kubernetes Configuration

Now that the Docker image is published with Spring Cloud Kubernetes support, we need to modify our YAML deployment descriptor to account for the following changes:

- The Docker image coordinates should now switch to use our own built image.
- Volumes and volume mounts should be removed from the descriptor.
- A dedicated `ConfigMap` should be defined, tied to our application name (`cas`) and namespace (`default`) to contain necessary changes.
- Our deployment should be given enough permissions to read the `ConfigMap` at bootstrap time.


First, we can easily switch the Docker images coordinates to use our own and remove all other bits related to volumes:

```yaml
...
spec:
  template:
    spec:
      containers:
      - image: mmoayyed/cas:latest
        name: cas
        resources: {}
...
```

Then, we will define our own `ConfigMap` with the following settings:

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: cas
data:
  application.properties: |-
    server.ssl.enabled=false
    server.port=8080
    cas.authn.accept.users=minikube::Mellon
```
{% include googlead1.html  %}
To learn more about how configuration settings may be loaded, and how they may be divided between individual application profiles, please see [Spring Cloud Kubernetes](https://docs.spring.io/spring-cloud-kubernetes/docs/current/reference/html/).

Finally, our deployment should be given the necessary permissions to read data using the Kubernetes API:

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: default
  name: namespace-reader
rules:
  - apiGroups: [""]
    resources: ["configmaps", "pods", "services", "endpoints", "secrets"]
    verbs: ["get", "list", "watch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: namespace-reader-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: default
  apiGroup: ""
roleRef:
  kind: Role
  name: namespace-reader
  apiGroup: ""
```

<div class="alert alert-info">
  <strong>Note</strong><br/>For development purposes, you can add <code>cluster-reader</code> permissions to your <code>default</code> service account. On a production system you’ll likely want to provide more granular permissions.
</div>
{% include googlead1.html  %}

So here is the complete YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: cas
  name: cas
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cas
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: cas
    spec:
      containers:
      - image: mmoayyed/cas:latest
        name: cas
        resources: {}
status: {}
---
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: cas
  name: cas
spec:
  ports:
  - name: 8080-8080
    port: 8080
    protocol: TCP
    targetPort: 8080
  - name: 8443-8443
    port: 8443
    protocol: TCP
    targetPort: 8443
  selector:
    app: cas
  type: ClusterIP
status:
  loadBalancer: {}
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: cas
data:
  application.properties: |-
    server.ssl.enabled=false
    server.port=8080
    cas.authn.accept.users=minikube::Mellon
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: default
  name: namespace-reader
rules:
  - apiGroups: [""]
    resources: ["configmaps", "pods", "services", "endpoints", "secrets"]
    verbs: ["get", "list", "watch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: namespace-reader-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: default
  apiGroup: ""
roleRef:
  kind: Role
  name: namespace-reader
  apiGroup: ""
```

At this point, you are ready to apply the changes:

```bash
kubectl apply -f deployment.yaml
```

Back in the dashboard, we can always double-check to ensure our `ConfigMap` changes are applied:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/147869228-8a539242-1fca-40da-bf11-2b4f6928808b.png"
width="70%" title="Apereo CAS in Kubernetes Dashboard" %}

### Test

Back in the Minikube dashboard, you can force-delete the existing pod and watch the system re-create the pod using the latest deployment descriptor changes and our Docker image. As you observe the logs, you'll see the following entries:


```bash
...
[AbstractKubernetesProfileEnvironmentPostProcessor] - <Adding 'kubernetes' to list of active profiles>
[Config] - <Trying to configure client from Kubernetes config...>
[Config] - <Did not find Kubernetes config at: [/root/.kube/config]. Ignoring.>
[Config] - <Trying to configure client from service account...>
[Config] - <Found service account host and port: 10.96.0.1:443>
[Config] - <Found service account ca cert at: [/var/run/secrets/kubernetes.io/serviceaccount/ca.crt}].>
[Config] - <Found service account token at: [/var/run/secrets/kubernetes.io/serviceaccount/token].>
[Config] - <Trying to configure client namespace from Kubernetes service account namespace path...>
[Config] - <Found service account namespace at: [/var/run/secrets/kubernetes.io/serviceaccount/namespace].>
[KubernetesNamespaceProvider] - <Looking for service account namespace at: [/var/run/secrets/kubernetes.io/serviceaccount/namespace]
[KubernetesNamespaceProvider] - <Found service account namespace at: [/var/run/secrets/kubernetes.io/serviceaccount/namespace].>
[KubernetesNamespaceProvider] - <Service account namespace value: /var/run/secrets/kubernetes.io/serviceaccount/namespace>
...
```

...and then, as the CAS application starts up:

```bash
[ConfigMapPropertySourceLocator] - <Config Map normalized sources : [{ config-map name : 'cas', namespace : 'default', prefix : '' }]>
[Fabric8ConfigUtils] - <Config Map namespace from normalized source or passed directly : default>
[Fabric8ConfigUtils] - <Config Map namespace from normalized source or passed directly : default>
[Fabric8ConfigUtils] - <Config Map namespace from normalized source or passed directly : default>
[Fabric8ConfigMapPropertySource] - <Loading ConfigMap with name 'cas' in namespace 'default'>
[config.ConfigMapPropertySource] - <The single property with name: [application.properties] will be treated as a properties file>
[Fabric8ConfigUtils] - <config-map with name : 'cas-kubernetes' not present in namespace : 'default'>
[PropertySourceBootstrapConfiguration] - <Located property source: [BootstrapPropertySource {name='bootstrapProperties-configmap.cas.default'}]>
```

...and then finally,

```bash
... <Tomcat started on port(s): 8080 (http) with context path '/cas'>
```

Once more, we can use `kubectl port-forward` to select a matching pod for port-forwarding using our `cas` service in Kubernetes, this time on port `8080`:

```
kubectl port-forward svc/cas 8080:8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

...and then login using our `minikube` user account, over at `http://localhost:8080/cas`, that is now specified via the Kubernetes `ConfigMap`:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/147868717-c0c24569-e92c-49e7-9433-c16a74fdd249.png"
width="70%" title="Apereo CAS in Kubernetes Dashboard" %}

Pretty cool, right? But we are not done yet!

## Kubernetes Secrets

Kubernetes has the notion of [Secret](https://kubernetes.io/docs/concepts/configuration/secret/)s for storing sensitive data such as passwords, etc. Secrets are similar to `ConfigMap`s but are specifically intended to hold confidential data.

For our purposes, we want to consider removing the setting `cas.authn.accept.users=minikube::Mellon` from our deployment descriptor and instead have CAS recognize that as a secret.

Once removed from YAML, we begin by defining the secret:

```bash
kubectl create secret generic cas-users --from-literal=users=minikube::Mellon
```

Then, we get to produce a relevant YAML configuration, put it in a `secrets.yaml` file, and apply that via `kubectl`:
{% include googlead1.html  %}
```bash
kubectl get secrets cas-users -o yaml > secrets.yaml
kubectl apply -f secrets.yaml
```

The YAML snippet sort of looks like this:

```yaml
---
apiVersion: v1
kind: Secret
data:
  users: bWluaWt1YmU6Ok1lbGxvbg==
metadata:
  name: cas-users
  namespace: default
```

Back in the dashboard, we can now confirm the secret is configured in Kubernetes:

{% include image.html img="https://user-images.githubusercontent.com/1205228/147870572-20be3004-3717-4333-8c43-6aca610f3ac0.png"
width="70%" title="Apereo CAS in Kubernetes Dashboard" %}
{% include googlead1.html  %}

Secrets can be created independently of the pods that use them, and now we can modify our deployment to fetch the secret and expose the setting as an environment variable for simplicity. 

We begin by modifying our CAS overlay's `bootstrap.properties` file with the following settings to enable support for Kubernetes secrets:

```properties
spring.cloud.kubernetes.secrets.name=cas
spring.cloud.kubernetes.secrets.enabled=true
spring.cloud.kubernetes.secrets.namespace=default
```


### Environment Variables

Once the CAS overlay and the container image are rebuilt and published again, our YAML descriptor can be modified as such:

```yaml
...
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cas
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: cas
    spec:
      containers:
      - image: mmoayyed/cas:latest
        name: cas
        env:
         - name: CAS_AUTHN_ACCEPT_USERS
           valueFrom:
              secretKeyRef:
                name: cas-users
                key: users 
...
```
{% include googlead1.html  %}
The container is instructed to load the `users` secret and map to an environment variable under `CAS_AUTHN_ACCEPT_USERS`, which is then read by Spring Boot and CAS and ultimately translated to the familiar `cas.authn.accept.users`. At this point and just as before, you can login using the `minikube` user account, over at `http://localhost:8080/cas`.

<div class="alert alert-info">
  <strong>Note</strong><br/>By default, if a container already consumes a secret in an environment variable, a secret update will not be seen by the container unless it is restarted.
</div>

### Volume Mounts

Rather than mapping environment variables, another approach is to let Spring Cloud Kubernetes reading recursively from secrets mounts. To do this, we first begin by removing the mapped secret environment variables, and create a new secret, `cas-users-file`, from the file `/etc/cas/secrets/users` which contains the value `minikube::Mellon`:

```bash
kubectl create secret generic cas-users-file --from-file /etc/cas/secrets/users
```

Just as before, we can use `kubectl` to apply the secret YAML configuration:

{% include googlead1.html  %}
```yaml
---
apiVersion: v1
data:
  cas.authn.accept.users: bWluaWt1YmU6Ok1lbGxvbg==
kind: Secret
metadata:
  name: cas-users-file
  namespace: default
```

Finally, we have to modify the deployment descriptor of our pod to specify the settings for volume mounts, and to also instruct Spring Cloud Kubernetes to load secrets from the mounted paths:

{% include googlead1.html  %}
```yaml
spec:
  template:
    spec:
      containers:
      - image: mmoayyed/cas:latest
        name: cas
        volumeMounts:
          - name: secrets
            mountPath: /etc/cas/secrets
        env:
         - name: ENTRYPOINT_DEBUG
           value: 'true'
         - name: JVM_EXTRA_OPTS
           value: '-Dspring.cloud.kubernetes.secrets.paths=/etc/cas/secrets'
      volumes:     
        - name: secrets
          secret:
            secretName: cas-users-file
```
{% include googlead1.html  %}
The CAS Docker image supports two special environment variables:

- `ENTRYPOINT_DEBUG`: When set to `true`, outputs additional logs to indicate how CAS is started up.
- `JVM_EXTRA_OPTS`: Allows for additional arguments to be passed to the CAS startup command, which is run using `java -jar`. 

`spring.cloud.kubernetes.secrets.paths` is important; It sets the paths for Spring Cloud Kubernetes where secrets are mounted. For its value, we could also `/etc/cas/secrets/users`. Since all our secrets mapped to a common root, here we just specify the path to the secret directory.

...and just as before, don't forget to instruct minikube to handle the volume mount from the host machine:
{% include googlead1.html  %}
```bash
minikube mount /etc/cas/:/etc/cas/
```

At this point and just as before, you can login using the `minikube` user account, over at `http://localhost:8080/cas`.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
