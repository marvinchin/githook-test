const GitHub = require("github-api");
const exec = require("child_process").exec;

const gh = new GitHub({
  token: process.env.GITHUB_API_TOKEN,
  //token: '00a1918554b19ebeb396328ba261bc4b65cf2188',
});

function getChangeCommits() {
  return new Promise((resolve, reject) => {
    const commitRange = process.env.TRAVIS_COMMIT_RANGE;
    //const commitRange = '719ce850...2ac24e09d';
    // Prefixed with * to for markdown list
    const command = `git log --pretty="format:* %s [%h by %cn]" ${commitRange}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      }
      else {
        resolve(stdout);
      }
    });
  });
}

function postReleaseDraft (commitLog) {
  `const repoSlug = PROCESS.env.TRAVIS_REPO_SLUG;`
  repoSlug = 'marvinchin/githook-test'
  const repo = gh.getRepo(repoSlug);
  const body = `## Changelog\n${commitLog}`;
  const opts = {
    tag_name: "autochangelog",
    body,
    draft: true,
  }
  return repo.createRelease(opts);
}

const eventType = process.env.TRAVIS_EVENT_TYPE;
const branch = process.env.TRAVIS_BRANCH;

//const eventType = "push";
//const branch = "master";

if ( eventType == "push" && branch == "master") {
  getChangeCommits()
  .then(postReleaseDraft)
  .catch((err) => console.log(err));
}
