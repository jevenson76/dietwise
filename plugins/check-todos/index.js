module.exports = {
  onPreBuild: async ({ utils }) => {
    const { execSync } = require('child_process');
    const output = execSync("rg 'TODO|FIXME|BUG|HACK|REFACTOR' || true").toString();

    if (output.trim()) {

      utils.build.failPlugin("Production code still contains TODOs or dev flags.");
    }
  },
};
