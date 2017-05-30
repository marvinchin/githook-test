const request = require("superagent");
const exec = require("child_process").exec;

function getChangeCommits() {
  return new Promise((resolve, reject) => {
    const { TRAVIS_COMMIT_RANGE } = process.env;
    // Prefixed with * to for markdown list
    const command = `git log --pretty="format:* %s [%h by %cn]" ${TRAVIS_COMMIT_RANGE}`;
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
  return new Promise((resolve, reject) => {
    const { TRAVIS_REPO_SLUG } = process.env;
    const url = `https://api.github.com/repos/${TRAVIS_REPO_SLUG}/releases`;
    const username = "marvinchin";
    const password = "flymagpi3";
    const body = `## Changelog\n${commitLog}`;
    const data = {
      tag_name: "latest_draft",
      body,
      draft: true,
    };
    request
      .post(url)
      .set("Content-Type", "application/json")
      .auth(username, password)
      .send(data)
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(res.body);
        }
      })
  });
}

const { TRAVIS_EVENT_TYPE, TRAVIS_BRANCH } = process.env;
if ( TRAVIS_EVENT_TYPE == "push" && TRAVIS_BRANCH == "master") {
  getChangeCommits()
  .then(postReleaseDraft)
  .catch((err) => console.log(err));
}