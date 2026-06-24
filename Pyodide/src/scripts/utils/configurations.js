/**
 * Encapsulates all names and path that are used at runtime to avoid errors and make changes easier.
 */
class Configurations {
    domain = {subdomain: "", secondLevelDomain: ""}
    //this could be a class that returns <path>+/<name> for path and <name> for name but for simplicity’s sake it is not
    //path does include the name
    pyodide = {
        paths : {workingDir: "", circuits: "", simplipfyAPI: "", solutions: "", tutorials: ""},
        names : {circuits: "", simplipfyAPI: "", solutions: ""}
    }
    server = {
        paths : {workingDir: "", circuits: "", simplipfyAPI: "", packages: "", tutorials: ""},
        names : {circuits: "", simplipfyAPI: "", packages: "", tutorials: ""},
    }
    wheatstone = {
        names : {optionsExtension : ""}
    }
    tools = {
        customCircuits: {
            paths: {dir: ""},
            names: {dir: ""}
        },
        svgGen: {
            paths: {dir: ""},
            names: {dir: ""}
        },
        svgScan: {
            paths: {dir: ""},
            names: {dir: "", file: ""}
        },
    }
    page = {
        // time in ms before a page load is aborted
        values: {/** @type {int} */timeout: 20e3}
    }
    worker = {
        request: {/** @type {int} */timeout: 5e3}
    }
    editor = {
        paths : {dir: ""},
        names : {dir: "", file: ""}
    }

    constructor() {
        if (!Configurations.instance) {
            hashObject ??= new HashObject();
            Configurations.instance = this;
        }

        return Configurations.instance
    }

    static async getInstance(){
        return new Configurations();
    }

    async initialize(){
        this.domain.subdomain = window.location.hostname.split('.').slice(0, -2).join('.');
        this.domain.secondLevelDomain = window.location.hostname.replace("\.(io|org)","").split(".")[1] || "";

        let srcRootPath = window.location.pathname;
        if (srcRootPath !== null && srcRootPath.endsWith("index.html")) {
            srcRootPath = srcRootPath.replace("index.html", "");
            if (!srcRootPath.endsWith("/")) {
                srcRootPath += "/";
            }
        }
        this.server.paths.workingDir = srcRootPath;

        let conf = await this.loadConf();

        let circuitsServerName = conf["server.names.circuits"]
        if (!circuitsServerName.endsWith(".zip")) {
            circuitsServerName = circuitsServerName + ".zip";
        }
        this.server.names.circuits = circuitsServerName;

        let tutorialServerName = conf["server.names.tutorials"]
        if (!tutorialServerName.endsWith(".zip")) {
            tutorialServerName = tutorialServerName + ".zip";
        }
        this.server.names.tutorials = tutorialServerName;

        this.server.paths.circuits = this.server.names.circuits;
        this.server.paths.tutorials = this.server.names.tutorials;
        this.server.names.simplipfyAPI = conf["server.names.simplipfyAPI"];
        this.server.paths.simplipfyAPI = this.gitHubProject + this.server.names.simplipfyAPI;
        this.server.names.packages = conf["server.names.packages"];
        this.server.paths.packages = this.server.names.packages + "/";

        this.pyodide.paths.workingDir = conf["pyodide.paths.workingDir"];
        let basePath = this.pyodide.paths.workingDir + "/";

        if(hashObject.hasCustomCircuits){
            this.#replaceSelectCircuits();
        }

        this.pyodide.names.circuits = this.server.names.circuits.replace(".zip", "");
        this.pyodide.paths.circuits = basePath + this.pyodide.names.circuits;
        this.pyodide.names.tutorials = this.server.names.tutorials.replace(".zip", "");
        this.pyodide.paths.tutorials = basePath + this.pyodide.names.tutorials;
        this.pyodide.names.solutions = conf["pyodide.names.solutions"];
        this.pyodide.paths.solutions = basePath + this.pyodide.names.solutions;
        this.pyodide.names.simplipfyAPI = this.server.names.simplipfyAPI;
        this.pyodide.paths.simplipfyAPI = basePath + this.pyodide.names.simplipfyAPI;

        this.wheatstone.names.optionsExtension = conf["wheatstone.names.optionsExtension"];

        // Where uploaded user zip dirs are stored
        this.tools.svgGen.names.dir = conf["tools.svgGen.names.dir"];
        this.tools.svgGen.paths.dir = basePath + this.tools.svgGen.names.dir;
        this.tools.customCircuits.names.dir = conf["tools.customCircuits.names.dir"];
        this.tools.customCircuits.paths.dir = basePath + this.tools.customCircuits.names.dir;
        this.tools.svgScan.names.dir = conf["tools.svgScan.paths.dir"]
        this.tools.svgScan.paths.dir = basePath + this.tools.svgScan.names.dir;
        this.tools.svgScan.names.file = conf["tools.svgScan.names.file"];

        // Where editor tmp files are stored and under which name
        this.editor.names.dir = conf["editor.names.dir"]
        this.editor.names.file = conf["editor.names.file"];
        this.editor.paths.dir = basePath + this.editor.names.dir;

        this.page.values.timeout = Number.parseInt(conf["page.values.timeout"]);
        this.worker.request.timeout = Number.parseInt(conf["worker.request.timeout"]);
    }

    async loadConf() {
        let test = await fetch(this.server.paths.workingDir + "src/conf/conf.json");
        return await test.json();
    }

    get isGitHubPage(){
        return this.domain.secondLevelDomain === "github";
    }

    get gitHubUser() {
        return this.domain.subdomain;
    }

    get gitHubProject() {
        return this.server.paths.workingDir;
    }

    #replaceSelectCircuits(){
        let sourceCircuitPath, pyodideCircuitPath
        // try to solve this with a server rewrite rule
        //the folders lay in the base directiory but the acces would be
        let fileName = hashObject.customCircuits.file;
        if (fileName.endsWith(".zip")) {
            fileName.replace(".zip", "");
        }

        let custCirFolderName = "CustomCircuits/" + hashObject.customCircuits.user + "/";
        this.server.names.circuits = fileName + ".zip";

        this.server.paths.circuits = custCirFolderName + this.server.names.circuits;
    }
}