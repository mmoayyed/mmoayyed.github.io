---
layout:     post
title:      Software Upgrade Failures; Pitfalls to Recognize & Avoid
summary:    A somewhat non-biased and personal take on why software projects typically end up at risk of failure, with particular attention on those that attempt upgrades in the world of open-source identity and access management. 
tags: ["Miscellaneous"]
---

While we could surely sit down and have an objective and reasoned debate on the exact nature and definition of *failure*, I think it would not be unfair to say that most software projects of today, particularly those that attempt upgrades, end up at risk of failure. Whether it's cost and budget, delivery dates, complex or unknown requirements, etc these failures typically show up with early on-set symptoms and in certain lucky scenarios may even be diagnosed relatively quickly and accurately. Of course, problem identification and diagnosis can be seen as easy compared to the solution and depending on how advanced the case may be, it might turn out that in the end, the cure might be worse than the disease.

{% include googlead1.html %}

I have been working as a software engineer for nearly a couple of decades, and throughout this short tenure (or as LinkedIn might categorize it as "*this incredible, adventurous journey*") and particularly while wearing a consultant's hat or working for consulting companies, I have certainly been involved in a few software project failures. As someone who largely deals with project upgrades, I see several failure patterns that seem very common. Admission is the first step to recovery, and in this post, I will review some of these patterns I have seen and learned about throughout the years and will try to offer one-liner solutions...which often are much easier said than done!

{% include googlead1.html %}
So to the matter at hand: why do we *fail*? 

# Resource Starvation

Oftentimes, software maintenance and delivery routines that are managed by one or two people tend to become at risk mainly because the team is resource-starved and wears many related or non-related hats. They handle maintenance, defect resolution, deployments, continuous delivery and integration, support, etc. In these scenarios, the focus of any task and its success status is measured by time to a quick resolution, and not so much on the quality of delivery. *"The road to hell is paved with temporary solutions"*, so to speak. 
{% include googlead1.html %}
# Knowledge Loss

Now imagine the resource-starved team is dismantled for budgetary reasons and/or a key employee who used to handle many critical and sensitive tasks in the organization decides to leave. Of course, answers to the Whys and the Hows are now also gone because not only that person did things unilaterally and with minimal oversight and an anti-sharing policy, but they also did not bother to document those experiences and answers for the next person in line...because of *reasons*. Typically because they either had no time to do it, or it was a quick and dirty solution only to be set in motion temporarily while some other prince-charming solution gets in the works.
{% include googlead1.html %}
# No Documentation

'nuf sed.

The sad irony of this pattern is that often those who complain about the quality of online documentation and are weary of the numerous yet inadequate guides, blogs, and such sometimes happen to be the same folks who often produce next to no documentation for their own projects and tasks. 

I have had this conversation many many times:

> - Excuse us Mr. Consultant. What does X do in project Y?
> - Dear sir/madam. A quick Google search turns up no results for X in project Y. You must have added this change yourself.
> - ...(2 days later) Yes, thank you for setting us on the right path. We found out that this was one of our own customizations. 
> - You're very welcome. That will be $6,000.
> - Of course. As you know, we have certain concerns about contributing funds to project Y to help with its sustainability, but we have no problem paying you to do Google searches for us. Sending the wire as we speak...

{% include googlead1.html %}
Don't do that. Please.

# Unwarranted Creativity

Sometimes a key resource on a project decides that simple isn't simple or better and that things must be made a whole lot more complicated to achieve better flexibility and advanced capability. So processes get way too fancy and code gets way too abstract and uber-optimized. This often paves the way for all other fore-discussed patterns because this kind of unnecessary complexity is just *one more thing to do* that likely is hard to explain, justify, and document.

{% include googlead1.html %}
Also, unwarranted creativity often leads to very expensive troubleshooting sessions. Selfishly, I am a big fan of those.

# Politics

You know what I mean. 

Software technical decisions should ideally be based on technical merit and the unprejudiced applicability of a solution to a real problem. Questions such as *"Who else is doing X? how many times have you seen X? what is the future of X?"* surely have tremendous value, but only when used in the right context and measured in tandem with realistic expectations and engagements. 

{% include googlead1.html %}
You must look for a solution when a problem has been identified. Not the other way around. Usually.

# I Should Test...What Now?

Software projects, and particularly upgrades, tend to take a (very) long time often because there are no automated testing processes in place. Every change has the potential to ricochet and break something else, and there is no verifiable reproducible repeatable process for early detection and prevention. Testing mainly is the process of one or two people interacting with the system manually, clicking links, and checking boxes to report "*It doesn't work*". Once more, the sad irony of this pattern is those sometimes concerned with the *stability* of an upgrade have no way to prove that their existing system is stable other than relying on the number of past incidents and anecdotal evidence. The only process is amateurish hearsay and some 10x developer's gut feeling.

{% include googlead1.html %}
Invest in test automation. A lot. It can be boring and redundant and yet, it will bring you peace of mind, fewer sleepless nights, and an overall healthier and more agile attitude towards upgrades. Furthermore, don't test too late. I have seen many projects where by the time the upgrade and its testing have finished, the software itself has become EOL. These would be the same folks with an uber-sensitive take on stability, and yet somehow have no issue going to production with a version that is declared dead for maintenance. Remember that most projects put out release candidates in the hopes of getting early feedback. If you wait too long, then you will have waited too long. 

{% include googlead1.html %}
Don't wait long.

# Meh...

If you are thinking about and charting a course for a software upgrade, some very legitimate questions to consider might be "*Why are we doing this? What exactly does the upgrade offer? What do we get in return?*". All excellent and very serious questions. Rest assured, there will certainly be a reward in the newer fancier version; features to gain, bug fixes to receive, etc but just like air, not everything that is good for you is immediately tangible. The many small and almost invisible incremental improvements often lead the way for the bigger and louder features and keeping up with the release schedule will only make the adoption of that fancy feature (that you have been waiting for) that much more comfortable. Just as before, if you wait too long the upgrade and maintenance effort will continue to grow along with you.

{% include googlead1.html %}
That's it for now. Good luck to you!

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. 

[Misagh Moayyed](https://fawnoos.com)