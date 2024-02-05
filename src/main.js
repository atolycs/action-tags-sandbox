const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const version_tags = core.getInput('alias_version', { required: true });

    const commit_user_id = core.getInput('commit-user-id', { required: true });
    const commit_email = core.getInput('commit-email', { required: true });

    const octokit = github.getOctokit(token);

    core.info(`==> Searching tag ${version_tags}`);
    // Get alias to version tags
    // const getRef_alias = await octokit.rest.git.getRef({
    //   ...github.context.repo,
    //   ref: `tags/${version_tags}`
    // });

    core.debug(github.context.repo.owner);
    core.debug(github.context.repo.repo);
    const getRef_alias = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `tags/${version_tags}`,
    });

    const target_sha = getRef_alias.data.object.sha;

    core.info(`Get ${version_tags} sha ==> ${target_sha}`);

    // setup Major version
    const major_version = version_tags.split('.')[0];

    // Create or Update Tagging Major version tags

    await octokit.rest.git.createTag({
      ...github.context.repo,
      tag: major_version,
      message: `Update Routing ${major_version} to ${version_tags}`,
      object: target_sha,
      type: 'commit',
      tagger: {
        name: commit_user_id,
        email: commit_email,
      },
    });
  } catch (error) {
    core.setFailed(`==> Failed. \n${error.message}`);
  }
}

run();
