"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var taskLib = __importStar(require("azure-pipelines-task-lib/task"));
var toolLib = __importStar(require("azure-pipelines-tool-lib/tool"));
var restm = __importStar(require("typed-rest-client/RestClient"));
var os = __importStar(require("os"));
var path = __importStar(require("path"));
var osPlat = os.platform();
var osArch = os.arch();
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var versionSpec, checkLatest, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    versionSpec = taskLib.getInput('versionSpec', true);
                    checkLatest = taskLib.getBoolInput('checkLatest', false);
                    return [4 /*yield*/, getNode(versionSpec, checkLatest)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    taskLib.setResult(taskLib.TaskResult.Failed, error_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//
// Basic pattern:
//      if !checkLatest
//          toolPath = check cache
//      if !toolPath
//          if version is a range
//              match = query nodejs.org
//              if !match
//                  fail
//              toolPath = check cache
//          if !toolPath
//              download, extract, and cache
//              toolPath = cacheDir
//      PATH = cacheDir + PATH
//
function getNode(versionSpec, checkLatest) {
    return __awaiter(this, void 0, void 0, function () {
        var toolPath, version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (toolLib.isExplicitVersion(versionSpec)) {
                        checkLatest = false; // check latest doesn't make sense when explicit version
                    }
                    if (!checkLatest) {
                        toolPath = toolLib.findLocalTool('node', versionSpec);
                    }
                    if (!!toolPath) return [3 /*break*/, 5];
                    version = void 0;
                    if (!toolLib.isExplicitVersion(versionSpec)) return [3 /*break*/, 1];
                    // version to download
                    version = versionSpec;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, queryLatestMatch(versionSpec)];
                case 2:
                    // query nodejs.org for a matching version
                    version = _a.sent();
                    if (!version) {
                        throw new Error("Unable to find Node version '" + versionSpec + "' for platform " + osPlat + " and architecture " + osArch + ".");
                    }
                    // check cache
                    toolPath = toolLib.findLocalTool('node', version);
                    _a.label = 3;
                case 3:
                    if (!!toolPath) return [3 /*break*/, 5];
                    return [4 /*yield*/, acquireNode(version)];
                case 4:
                    // download, extract, cache
                    toolPath = _a.sent();
                    _a.label = 5;
                case 5:
                    //
                    // a tool installer initimately knows details about the layout of that tool
                    // for example, node binary is in the bin folder after the extract on Mac/Linux.
                    // layouts could change by version, by platform etc... but that's the tool installers job
                    //
                    if (osPlat != 'win32') {
                        toolPath = path.join(toolPath, 'bin');
                    }
                    //
                    // prepend the tools path. instructs the agent to prepend for future tasks
                    //
                    toolLib.prependPath(toolPath);
                    return [2 /*return*/];
            }
        });
    });
}
function queryLatestMatch(versionSpec) {
    return __awaiter(this, void 0, void 0, function () {
        var dataFileName, versions, dataUrl, rest, nodeVersions, version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    switch (osPlat) {
                        case "linux":
                            dataFileName = "linux-" + osArch;
                            break;
                        case "darwin":
                            dataFileName = "osx-" + osArch + '-tar';
                            break;
                        case "win32":
                            dataFileName = "win-" + osArch + '-exe';
                            break;
                        default: throw new Error("Unexpected OS '" + osPlat + "'");
                    }
                    versions = [];
                    dataUrl = "https://nodejs.org/dist/index.json";
                    rest = new restm.RestClient('vsts-node-tool');
                    return [4 /*yield*/, rest.get(dataUrl)];
                case 1:
                    nodeVersions = (_a.sent()).result;
                    nodeVersions.forEach(function (nodeVersion) {
                        // ensure this version supports your os and platform
                        if (nodeVersion.files.indexOf(dataFileName) >= 0) {
                            versions.push(nodeVersion.version);
                        }
                    });
                    version = toolLib.evaluateVersions(versions, versionSpec);
                    return [2 /*return*/, version];
            }
        });
    });
}
function acquireNode(version) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, urlFileName, downloadUrl, downloadPath, err_1, extPath, _7zPath, toolRoot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //
                    // Download - a tool installer intimately knows how to get the tool (and construct urls)
                    //
                    version = toolLib.cleanVersion(version);
                    fileName = osPlat == 'win32' ? 'node-v' + version + '-win-' + os.arch() :
                        'node-v' + version + '-' + osPlat + '-' + os.arch();
                    urlFileName = osPlat == 'win32' ? fileName + '.7z' :
                        fileName + '.tar.gz';
                    downloadUrl = 'https://nodejs.org/dist/v' + version + '/' + urlFileName;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 6]);
                    return [4 /*yield*/, toolLib.downloadTool(downloadUrl)];
                case 2:
                    downloadPath = _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    err_1 = _a.sent();
                    if (!(err_1['httpStatusCode'] &&
                        err_1['httpStatusCode'] == 404)) return [3 /*break*/, 5];
                    return [4 /*yield*/, acquireNodeFromFallbackLocation(version)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: throw err_1;
                case 6:
                    if (!(osPlat == 'win32')) return [3 /*break*/, 8];
                    taskLib.assertAgent('2.115.0');
                    extPath = taskLib.getVariable('Agent.TempDirectory');
                    if (!extPath) {
                        throw new Error('Expected Agent.TempDirectory to be set');
                    }
                    _7zPath = path.join(__dirname, '7zr.exe');
                    return [4 /*yield*/, toolLib.extract7z(downloadPath, extPath, _7zPath)];
                case 7:
                    extPath = _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, toolLib.extractTar(downloadPath)];
                case 9:
                    extPath = _a.sent();
                    _a.label = 10;
                case 10:
                    toolRoot = path.join(extPath, fileName);
                    return [4 /*yield*/, toolLib.cacheDir(toolRoot, 'node', version)];
                case 11: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// For non LTS versions of Node, the files we need (for Windows) are sometimes located
// in a different folder than they normally are for other versions.
// Normally the format is similar to: https://nodejs.org/dist/v5.10.1/node-v5.10.1-win-x64.7z
// In this case, there will be two files located at:
//      /dist/v5.10.1/win-x64/node.exe
//      /dist/v5.10.1/win-x64/node.lib
// If this is not the structure, there may also be two files located at:
//      /dist/v0.12.18/node.exe
//      /dist/v0.12.18/node.lib
// This method attempts to download and cache the resources from these alternative locations.
// Note also that the files are normally zipped but in this case they are just an exe
// and lib file in a folder, not zipped.
function acquireNodeFromFallbackLocation(version) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDownloadFolder, tempDir, exeUrl, libUrl, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tempDownloadFolder = 'temp_' + Math.floor(Math.random() * 2000000000);
                    tempDir = path.join(taskLib.getVariable('agent.tempDirectory'), tempDownloadFolder);
                    taskLib.mkdirP(tempDir);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 9]);
                    exeUrl = "https://nodejs.org/dist/v" + version + "/win-" + os.arch() + "/node.exe";
                    libUrl = "https://nodejs.org/dist/v" + version + "/win-" + os.arch() + "/node.lib";
                    return [4 /*yield*/, toolLib.downloadTool(exeUrl, path.join(tempDir, "node.exe"))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, toolLib.downloadTool(libUrl, path.join(tempDir, "node.lib"))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 4:
                    err_2 = _a.sent();
                    if (!(err_2['httpStatusCode'] &&
                        err_2['httpStatusCode'] == 404)) return [3 /*break*/, 7];
                    exeUrl = "https://nodejs.org/dist/v" + version + "/node.exe";
                    libUrl = "https://nodejs.org/dist/v" + version + "/node.lib";
                    return [4 /*yield*/, toolLib.downloadTool(exeUrl, path.join(tempDir, "node.exe"))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, toolLib.downloadTool(libUrl, path.join(tempDir, "node.lib"))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7: throw err_2;
                case 8: return [3 /*break*/, 9];
                case 9: return [4 /*yield*/, toolLib.cacheDir(tempDir, 'node', version)];
                case 10: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
run();
