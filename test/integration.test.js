const glob = require("fast-glob");
const path = require("path");
const execa = require("execa");

const registerIntegrationTest = async (configPath) => {
	it(configPath, async () => {
		const fullConfigPath = path.join(__dirname, configPath);
		const integrationTest = require(fullConfigPath);

		const karmaProcess = await execa("karma", ["start", configPath], {
			cwd: __dirname,
			preferLocal: true, // allow executing local karma binary
			reject: false
		});
		// eslint-disable-next-line no-console
		console.log(karmaProcess.all);

		if (integrationTest.shouldFail && !karmaProcess.failed) {
			throw new Error("Karma execution should have failed!");
		}
		if (!integrationTest.shouldFail && karmaProcess.failed) {
			throw new Error("Karma execution should not have failed!");
		}

		if (integrationTest.assertions) {
			integrationTest.assertions({
				expect,
				log: karmaProcess.all
			});
		}
	});
};

// Increase test timeout to 10s (default 5s)
jest.setTimeout(10000);

describe("Integration Tests", () => {
	const configPaths = glob.sync(["integration/*/karma*.conf.js"], {cwd: __dirname});
	// const configPaths = ["integration/application-ui5-tooling-error-handling/karma-testsuite-promise-reject.conf.js"];
	for (const configPath of configPaths) {
		registerIntegrationTest(configPath);
	}
});
