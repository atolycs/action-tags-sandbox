const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const version_tags = core.getInput('alias_version', { required: true });

    const octokit = github.getOctokit(token);
    core.info('==> Accessing Bot User infomation');

    // bot commiter id setup
    //const { data } = await octokit.request('GET /user');
    const data = octokit.rest.users.getAuthenticated();

    core.debug(`User Data\n${data}`);

    const commit_user_id = data.id;
    const commit_user_login = data.login;

    const commit_user = `${commit_user_id}+${commit_user_login}@users.noreply.github.com`;

    // Get alias to version tags
    const getRef_alias = await octokit.rest.git.getRef({
      ...github.context,
      ref: `tags/${version_tags}`,
    });

    const target_sha = getRef_alias.data.object.sha;

    core.debug(`Get ${version_tags} sha ==> ${target_sha}`);

    // setup Major version
    const major_version = version_tags.split('.')[0];

    // Create or Update Tagging Major version tags

    await octokit.rest.git.createTag({
      ...github.context,
      tag: major_version,
      message: `Update Routing ${major_version} to ${version_tags}`,
      object: target_sha,
      type: 'commit',
      tagger: {
        name: commit_user_id,
        email: commit_user,
      },
    });
  } catch (error) {
    core.setFailed(`==> Failed. \n${error}`);
  }
}

run();
