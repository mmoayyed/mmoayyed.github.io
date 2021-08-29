---
layout:     post
title:      Apereo CAS - Extending Authentication Webflows
summary:    Learn and master extending Apereo CAS Spring Webflow definitions.
tags:       [CAS]
---

More recent versions of Apereo CAS, specifically starting with CAS 5 and above, attempt to automate all required Spring Webflow changes on a per-module basis. In this new model, all one should have to do is to declare the appropriate module in the build script...and viola! CAS will take care of the rest.

{% include googlead1.html  %}

If you wish to learn how that is done internally and furthermore, how you may take advantage of the same approach to extend CAS webflows and introduce your own, this is the right post for you.

This tutorial specifically requires and focuses on:

- CAS `6.4.x`
- Java 11

This post *might* equally apply to all CAS `6.x` deployments. YMMV. To learn the same answers with CAS `5.0.x`, please [see this post](/2017/10/07/webflow-extcfg/).

# Webflow Configurers

Every CAS module that needs to dynamically augment the Spring Webflow routes simply takes on the following form:

{% include googlead1.html  %}

```java
package com.example.cas;

public class SomethingWebflowConfigurer extends AbstractCasWebflowConfigurer {

    public SomethingWebflowConfigurer(final FlowBuilderServices flowBuilderServices,
                                      final FlowDefinitionRegistry loginFlowDefinitionRegistry,
                                      final ApplicationContext applicationContext,
                                      final CasConfigurationProperties casProperties) {
        super(flowBuilderServices, loginFlowDefinitionRegistry, applicationContext, casProperties);
    }

    @Override
    protected void doInitialize() throws Exception {
        var flow = super.getLoginFlow();
        // Magic happens; Call 'super' to see what you have access to...
    }
}
```

CAS modules register their `WebflowConfigurer` instances in `@Configuration` classes:

{% include googlead1.html  %}

```java
package com.example.cas;

@Configuration("SomethingConfiguration")
public class SomethingConfiguration implements CasWebflowExecutionPlanConfigurer  {

    @Autowired
    @Qualifier("loginFlowRegistry")
    private FlowDefinitionRegistry loginFlowDefinitionRegistry;

    @Autowired
    private FlowBuilderServices flowBuilderServices;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private CasConfigurationProperties casProperties;

    @ConditionalOnMissingBean(name = "somethingWebflowConfigurer")
    @Bean
    public CasWebflowConfigurer somethingWebflowConfigurer() {
        return new SomethingWebflowConfigurer(flowBuilderServices, loginFlowDefinitionRegistry,
            applicationContext, casProperties);
    }
    
    @Override
    public void configureWebflowExecutionPlan(final CasWebflowExecutionPlan plan) {
        plan.registerWebflowConfigurer(somethingWebflowConfigurer());
    }
    
}
```

Note that each `CasWebflowConfigurer` implementation may be assigned a specific *order* which is a numeric weight that determines its execution position once webflow auto-configuration kicks into action.

<div class="alert alert-warning">
  <strong>Remember</strong><br/>If you are looking for XML flow definitions to extend CAS, you are simply holding it wrong. While you may be creative enough to find a solution and make that approach work, it is pretty much guaranteed that your design will break quite quickly in the next upgrade.
</div>

{% include googlead1.html  %}

Next, we just need to ensure that CAS is able to pick up our special configuration. To do so, create a `src/main/resources/META-INF/spring.factories` file and reference the configuration class in it as such:

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.example.cas.SomethingConfiguration
```

...and that should be it.

# Implementation Tips

As noted earlier, the task of dynamically modifying the body of a given flow happens in the following initialization method:

```java
@Override
protected void doInitialize() throws Exception {
    var flow = super.getLoginFlow();
    // Magic happens; Call 'super' to see what you have access to...
}
```

{% include googlead1.html  %}

The parent class, `AbstractCasWebflowConfigurer`, providers a lot of helper methods and utilities in a *DSL-like* fashion to hide the complexity of Spring Webflow APIs to make customization easier. 

Some interesting examples follow.

## Locate States

Locate an action state definition in the flow using the id `stateId`:

```java
var state = getState(flow, "stateId", ActionState.class);
```

## Create View States

Create a view state definition in the flow using the id `stateId` that is tasked to render the `someHtmlViewHere` HTML view:

{% include googlead1.html  %}

```java
var state = createViewState(flow, "stateId", "someHtmlViewHere");
```

## Create Transitions

Create an action state definition in the flow using the id `stateId`. The state will always route to the state id `thenGoHereStateId` as a default *catch all*, if none of its defined transitions can properly handle the step:

```java
var state = createActionState(flow, "stateId", "actionBeanId");
createTransitionForState(handler, "ifThisTransitionHappens", "thenGoHereStateId");
```

{% include googlead1.html  %}

## Create Default Transitions

Create an action state definition in the flow using the id `stateId` that will execute the action identified by `actionBeanId`. The state will always route to the state id `thenGoHereStateId` as a default *catch all*, if none of its defined transitions can properly handle the step:

```java
var state = createActionState(flow, "stateId", "actionBeanId");
createTransitionForState(handler, "ifThisTransitionHappens", "thenGoHereStateId");
createStateDefaultTransition(state, "defaultStateId");
```

The `actionBeanId` itself should be defined as a `@Bean`:

{% include googlead1.html  %}

```java
@Bean
public Action actionBeanId() {
    return new MyCustomAction();
}
```

## Create End States

Create an end state definition in the flow using the id `stateId` that will issue an external 302 redirect to the url identified by the expression `flowScope.url`. Prior to reaching this state, it's expected of the `flowScope` to contain a `url` attribute:

```java
var state = createEndState(flow, "stateId", "flowScope.url", true);
```

## Create Decision States

Create a decision state that will conditionally route to one of two states, based on the outcome of the predicate `flowScope.someValue != null`. If `true`, the flow will resume control at the state `trueStateId`; otherwise it will switch to `falseStateId`.

{% include googlead1.html  %}

```java
createDecisionState(flow, "stateId", "flowScope.someValue != null", "trueStateId", "falseStateId");
```

## Create Global Exception Handlers

If the flow should encounter an uncaught `SomeException`, the control flow will be routed to the state identified by `stateId`:

```java
val h = new TransitionExecutingFlowExecutionExceptionHandler();
h.add(SomeException.class, "stateId");
flow.getExceptionHandlerSet().add(h);
```

{% include googlead1.html  %}
# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html