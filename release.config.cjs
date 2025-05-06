// configuration file for semantic-release
// this is file is used by github actions
module.exports = {
  branches: [
    "main",
    {
      name: "prod",
      prerelease: true,
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/git",
      {
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["meet_joona.tar.gz"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
        failComment: false,
        labels: ["release"],
      },
    ],
  ],
};
