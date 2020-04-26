---
layout:     post
title:      Apereo CAS - Kubernetes Deployments
summary:    Playing around with Kubernetes, Minikube, and friends to demonstrate ideas on how Apereo CAS might be deployed in a containerized and orchestrated fashion. 
published: true
tags:       [CAS]
---

Continuing with Apereo CAS thriving in a [containerized world](http://localhost:4000/2020/01/31/cas6-docker-deployment/) for deployments, this tutorial begins to demonstrate a quick walkthrough on how a CAS container can be deployed and managed by [Kubernetes](https://kubernetes.io/). While a brief introduction of Kubernetes and the surrounding development environment is presented, the main focus of the post is to outline the tricks and tips expected of a CAS deployer for a successful cloud-based deployment.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Our starting position is based on the following:

- CAS `6.2.x`
- Java 11
- [CAS Overlay](https://github.com/apereo/cas-overlay-template) (The `master` branch specifically)
- [Docker](https://www.docker.com/get-started)
- [Minikube](https://github.com/kubernetes/minikube)
- MacOS Mojave
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) `6.1` for MacOS

## Overview

[Kubernetes (K8s)](https://kubernetes.io/) is an open-source system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery, and over the years, it has become quite the popular choice and mainstream for container orchestrations.

The easiest way to start experimenting with Kubernetes is via [Minikube](https://kubernetes.io/). This is a tool that implements a local Kubernetes cluster on your desired OS of choice and its primary goals are to be the best tool for local Kubernetes application development and to support all Kubernetes features that fit. For this tutorial, we will be using a Minikube instance to get Apereo CAS, as a Spring Boot application at its core, deployed as quickly and comfortably as possible.

## Docker Image

You should first begin by producing a [CAS Docker image](https://fawnoos.com/2020/01/31/cas6-docker-deployment/), to be deployed into our Kubernetes cluster. To move things along quickly, I have already produced a [self-contained CAS image](https://hub.docker.com/repository/docker/mmoayyed/cas) that can be used for demo purposes. The image presents a CAS server, backed by an embedded Apache Tomcat instance, and is configured to respond to requests on port `8080` to keep things as simple as possible:

```properties
cas.server.name=http://cas.example.org:8080
cas.server.prefix=${cas.server.name}/cas
server.port=8080
server.ssl.enabled=false
```

## Minikube

To successfully set up a Kubernetes cluster, you do need to have Minikube installed for your OS. I did follow the instructions posted here for [Minikube on MacOS](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-macos) and while the process was relatively simple, I did have to account for the following gotchas:

- Before the installation, it's best to disconnect from all VPN connections.
- Make sure you have a correct and compatible version of VirtualBox installed for your OS.
- If you already have VirtualBox installed, (as I did), do make sure previously-configured networks from VirtualBox are removed and cleaned up.

With the above notes in mind, installing Minikube should be as simple as:

```bash
brew install minikube
```

<div class="alert alert-success">
<strong>Minikube Symlinks</strong><br/>You may need to reset your symlinks via <code>brew link --overwrite minikube</code>
</div>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

You can try to verify the state of your installation via:

```bash
$ minikube version
minikube version: v1.7.2
commit: 50d543b5fcb0e1c0d7c27b1398a9a9790df09dfb

...

$ kubectl version
Client Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", 
GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", 
BuildDate:"2019-12-13T11:51:44Z", GoVersion:"go1.13.4", 
Compiler:"gc", Platform:"darwin/amd64"}
```

Next, you should be able to start the local cluster via:

```bash
$ minikube start

    minikube v1.7.2 on Darwin 10.14.6
    sing the hyperkit driver based on existing profile
    Downloading driver docker-machine-driver-hyperkit:
    ...
    Downloading VM boot image ...
    > minikube-v1.7.0.iso.sha256: 65 B / 65 B [--------------] 100.00% ? p/s 0s
    > minikube-v1.7.0.iso: 166.68 MiB / 166.68 MiB [] 100.00% 10.23 MiB p/s 16s
    Reconfiguring existing host ...
    Starting existing hyperkit VM for "minikube" ...
    ...
    Launching Kubernetes ...
    Enabling addons: default-storageclass, storage-provisioner
    Done! kubectl is now configured to use "minikube"
```

You can always examine the state of your cluster using the dashboard:

```bash
minikube dashboard &
```

![image](https://user-images.githubusercontent.com/1205228/74601036-ba67ff80-50b2-11ea-95b2-e72c661a207d.png)

Great! You now have a running Kubernetes cluster in the terminal. Minikube started a virtual machine for you, and a Kubernetes cluster is now running in that VM.

## Kubectl

Our business with the Minikube local cluster is facilitated by the command-line tool [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/). This tool allows you to verify and manage the state of your cluster. For example, you can ask for the cluster information and details using:

```bash
$ kubectl cluster-info
Kubernetes master is running at https://192.168.64.2:8443
KubeDNS is running at https://192.168.64.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

You could also fetch a list of nodes:

```bash
$ kubectl get nodes
NAME       STATUS   ROLES    AGE   VERSION
minikube   Ready    master   83s   v1.17.2
```

Once you have a running Kubernetes cluster, we can deploy our containerized CAS server on top of it. To do so, we need to create a Kubernetes Deployment configuration. The Deployment instructs Kubernetes on how to create and update instances of CAS. Once you've created a Deployment, the Kubernetes master schedules mentioned application instances onto individual Nodes in the cluster.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

## Deployments

A *Deployment*, in the Kubernetes vernacular, is responsible for creating and updating instances of our CAS server, keeping them running across Nodes Once the CAS server instance is created, a Kubernetes Deployment Controller continuously monitors that instances for failures. If the Node hosting an instance goes down or is deleted, the Deployment controller replaces the instance with an instance on another Node in the cluster. This provides a self-healing mechanism to address machine failure or maintenance.

To begin, let's recall our current collection of nodes:

```bash
$ kubectl get nodes
NAME       STATUS   ROLES    AGE   VERSION
minikube   Ready    master   83s   v1.17.2
```

If you remember, we do have a [self-contained CAS image](https://hub.docker.com/repository/docker/mmoayyed/cas) and the would-be running container based on that image operates on and exposes port `8080`. So, we should be able to describe our container to Kubernetes to run and deploy our application in the cluster using the Kubernetes YAML syntax; To avoid having to look at or edit YAML, we can ask `kubectl` to generate it for us. 

To create a deployment descriptor, we can use the following:

```bash
$ kubectl create deployment cas --image=mmoayyed/cas --dry-run -o=yaml > deployment.yaml
$ echo --- >> deployment.yaml
$ kubectl create service clusterip cas --tcp=8080:8080 --dry-run -o=yaml >> deployment.yaml
```

Let's examine the `deployment.yaml` file to see what we can work with:

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
      - image: mmoayyed/cas
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
  selector:
    app: cas
  type: ClusterIP
status:
  loadBalancer: {}
```

You can see the deployment descriptor listing details about how the container should run, how port-mappings should be handled, etc. Note also that the descriptor is broken down into two categories: The *Deployment* section and the *Service* section each of each are distinguished using the `Kind` flag. In summary, this will allow our CAS deployment to be managed and deployed as a [Service in Kubernetes](https://kubernetes.io/docs/concepts/services-networking/service/). 

## Unleash the YAML

Let's apply our YAML configuration to let Kubernetes begin its magic:

```bash
$ kubectl apply -f deployment.yaml

deployment.apps/cas created
service/cas created
```

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Next, let's check to see if our CAS deployment is running:

```bash
$ kubectl get all

NAME                       READY   STATUS    RESTARTS   AGE
pod/cas-7f97f4844b-b2qc5   1/1     Running   0          44s

NAME                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/cas          ClusterIP   10.108.120.2   <none>        8080/TCP   44s
service/kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP    49d

NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cas   1/1     1            1           44s

NAME                             DESIRED   CURRENT   READY   AGE
replicaset.apps/cas-7f97f4844b   1         1         1       44s
```

<div class="alert alert-success">
<strong>Be Patient</strong><br/>You may need to execute the <code>kubectl get all</code> command a few more times until the pod shows its status as "Running".</div>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Back in the dashboard, you should be able to see the deployment running in all greens:

![image](https://user-images.githubusercontent.com/1205228/74601572-20578580-50b9-11ea-8875-d9061186abd3.png)

Now you need to be able to connect to CAS which is exposed as a [Service in Kubernetes](https://kubernetes.io/docs/concepts/services-networking/service/). We can use `kubectl port-forward` which allows using resource name, such as a pod name, to select a matching pod for port-forwarding. Let's find our CAS pod first:

```bash
$ kubectl get pods
NAME                   READY   STATUS    RESTARTS   AGE
cas-7f97f4844b-b2qc5   1/1     Running   0          15m
```

...and lets establish an SSH tunnel to that pod via:

```bash
$ kubectl port-forward cas-7f97f4844b-b2qc5 8080:8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

...and viola! our CAS server container is available under `http://localhost:8080/cas/login`:

![image](https://user-images.githubusercontent.com/1205228/74601430-d15d2080-50b7-11ea-9425-0315245ead12.png)

We could also create the same tunnel using a Kubernetes deployment reference:

```
kubectl port-forward deployment/cas 8080:8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

...or by referencing our Kubernetes service:

```bash
$ kubectl port-forward svc/cas 8080:8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
