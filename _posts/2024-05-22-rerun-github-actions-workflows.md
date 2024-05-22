---
layout:     post
title:      GitHub - Rerun Failed Workflow Runs
summary:    A few tips and tricks on how to rerun failed workflow runs in GitHub Actions.
tags: ["Miscellaneous", "Git"]
---


If your project is using GitHub Actions for its continuous integration and continuous delivery (CI/CD) platform, it is likely that your build jobs will fail from time to time. Fear not, as GitHub Actions allows you to re-run failed jobs in a workflow resulting in a new workflow run that will start for all failed jobs and their dependents. You can certainly do so in your web browser using the GitHub Actions UI, but there are faster ways of doing this.

{% include googlead1.html  %}

# GitHub CLI

As documented by GitHub, one can use the [Github CLI](https://github.com/cli/cli#installation) and use the `run rerun` subcommand with the `--failed` flag. You will need to find the *ID* of the run for which you want to re-run failed jobs. If you don't specify an ID, GitHub CLI returns an interactive menu for you to choose a recent failed run.
{% include googlead1.html  %}
```bash
gh run rerun $RUN_ID --failed
```

This works but it's slightly tedious to find the ID. Can we find that automatically?

## Bash Function

The following script attempts to find the latest failed job triggered off of the `master` branch of a GitHub repository. It then tries to find the workflow run identifiers of the failed runs, and then invokes the same command as above to rerun the jobs:
{% include googlead1.html  %}
```bash
function ghrfj() {
  repo=${1:-org/repository}
  branch=${2:-master}
  workflow="$3"

  sha=`gh api "/repos/$repo/branches/$branch" | jq -r '.commit.sha'`
  echo "Latest master commit SHA is $sha for repository: $repo"

  json_data=`gh api "repos/$repo/actions/runs?status=failure&per_page=1&page=1&branch=$branch&head_sha=$sha"`
  fid=$(echo "$json_data" | jq --arg wf "$workflow" -r '.workflow_runs[] | select(.name == $wf) | .id' )
  
  if [ -n "$fid" ]; then
     echo -e "Rerunning failed workflow runs with id $fid"
     gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        /repos/$repo/actions/runs/$fid/rerun-failed-jobs
  else
    echo -e "🍀 $workflow: Passing!"
  fi
}
```

For example, assuming your repository has a single `Build` workflow and to rerun the failed jobs in this workflow you can run:
{% include googlead1.html  %}
```bash
# ghrfj: GitHub Run Failed Jobs
ghrfj org/repository master Build
```

Of course, replace `org/repository` with your own.

# Rerun Workflows

The above approach is certainly a step forward and with small customizations, you can make it a lot more flexible. However, things tend to get slightly complicated when:

- Your repository has multiple workflows
- ...and multiple workflow runs fail
{% include googlead1.html  %}
You'll need to tweak the filtering logic above to find the right workflow runs and IDs. And what's more, you'll have to realize/monitor that a workflow has failed and then invoke the above function manually. That is tedious. Can we automate this process entirely? 

One possible solution would be to define a GitHub Action's workflow whose sole responsibility would be to find failed workflow runs and rerun those. This workflow only needs to run when certain designated workflows have been completed and failed. So it might be something like this:
{% include googlead1.html  %}
```
name: Rerun Workflows
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

on:
  workflow_run:
    workflows:
      - Build
    types:
      - completed
    branches:
      - master

jobs:
  rerun-failed-jobs:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    steps:
      - name: Rerunning ${{ github.event.workflow_run.name }}
        run: |
          echo "Workflow run ID: ${{ github.event.workflow_run.id }}"
          echo "Workflow run Name: ${{ github.event.workflow_run.name }}"
          # Rerun stuff here...
```
{% include googlead1.html  %}
The `github.event.workflow_run.id` is the id of the workflow that in fact has failed, i.e. `Build`. 

Finally, when you rerun the workflow you need to make sure the logic accounts for endless loops. The `Build` workflow can continue to fail and run again endlessly if you're not keeping tabs on the number of retry attempts. Your rerun logic might want to consider the current attempt count via `github.event.workflow_run.run_attempt` and only rerun the job if that number is below a certain threshold.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)