const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const artifact = require("@actions/artifact");

const BuildScheme = core.getInput("BuildScheme");

const BuildProject = `${core.getInput("project")}.xcodeproj`;

const artifactClient = artifact.create();
const artifactName = BuildScheme;

const regex = /TARGET_BUILD_DIR = ([\/-\w]+)\n/;
let buildDirectory = "";
let myError = "";

async function run() {
  try {
    const outputOptions = {};
    outputOptions.listeners = {
      stdout: (data) => {
        buildDirectory += data.toString();
        console.log(regex.exec(buildDirectory));
        buildDirectory = regex.exec(buildDirectory);
      },
      stderr: (data) => {
        myError += data.toString();
      },
    };

    await exec.exec(
      "xcodebuild",
      [
        `-workspace`,
        `${BuildProject}/project.xcworkspace`,
        `-scheme`,
        `${BuildScheme}`,
        `-showBuildSettings`,
      ],
      outputOptions
    );

    await exec.exec("xcodebuild", [
      `-workspace`,
      `${BuildProject}/project.xcworkspace`,
      `-list`,
    ]);

    await exec.exec("xcodebuild", [
      `-workspace`,
      `${BuildProject}/project.xcworkspace`,
      `-scheme`,
      `${BuildScheme}`,
    ]);

    const rootDirectory = ".";
    let reg = /([\w-])+$/
    buildDirectory = reg.exec(buildDirectory)
    console.log(buildDirectory[0])

    console.log(await exec.exec("ls", [`build/${buildDirectory[0]}`]));
    console.log(`build/${buildDirectory[0]}/PopH264_Ios.framework${BuildScheme}.framework`)
    console.log(`build/${buildDirectory[0]}/${BuildScheme}.framework.dSYM`)

    const files = [
      `build/${buildDirectory[0]}/PopH264_Ios.framework`, //${BuildScheme}.framework`,
      `build/${buildDirectory[0]}/PopH264_Ios.framework.dSYM`, //${BuildScheme}.framework.dSYM`,
    ];

    const files = [
      `build/Linux_${architecture}/lib${project}.so`,
      `build/Linux_${architecture}/${project}TestApp`,
      `build/Linux_${architecture}/${project}.h`,
    ];

    const options = {
      continueOnError: true,
    };
    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      files,
      rootDirectory,
      options
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
