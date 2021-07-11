---
layout:     post
title:      GitHub Actions - Cleaning Workflow Runs
summary:    Learn how to use the GitHub Actions REST API to clean previous or stale workflow runs.
tags:       [CAS]
---

A while ago, I put together a *quick and dirty* bash function that would allow for cleaning up after Github Actions Workflow Runs, especially those that have completed in either success or failure and have since been surpassed by subsequent workflow runs that contain better and newer changes. 

To successfully use this function, you will need:

{% include googlead1.html  %}

- [GitHub CLI](https://github.com/cli/cli)
- [`jq`](https://stedolan.github.io/jq/)

# Bash Function

The following function will begin to clean up CI jobs starting with the `5th` page where each page may contain `75` workflow runs.

```bash
function ghac() {
  for i in 5 4 3 2 1
  do
    gh api repos/$1/actions/runs\?page=$i\&per_page=75 | \
      jq -r '.workflow_runs[] | select(.conclusion == "success" or .conclusion == "failure" \
                                       or .conclusion == "cancelled" or .conclusion == "skipped") \
                                       | "\(.id)"' | \
      xargs -n1 -I '{}' gh api repos/$1/actions/runs/{} -X DELETE --silent
  done
  gh api repos/$1/actions/runs\?page=1\&per_page=75 \
    |  jq -r '.workflow_runs[] | "\(.id)\t\(.name)\t\(.status)\t\(.event)\t\(.head_sha)"'
}
```

Once you have the function in your `.profile`, you may invoke it anywhere in your terminal as:

{% include googlead1.html  %}

```bash
ghac organization/repository
```

That's all. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)