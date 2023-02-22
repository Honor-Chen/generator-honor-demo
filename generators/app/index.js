"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

const jspkg = require("./templates/javascript/package.json");
const tspkg = require("./templates/typescript/package.json");

// 使用 lodash 中的 extend 来扩展 Generator 的 install 属性
// extends(Generator.prototype, require('yeoman-generator/lib/actions/install'))

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // 全局通过 this.options() 来获取命令行中携带的参数
    this.option("typescript");
    this.option("ts");
    this.option("skip-install"); // 跳过安装
  }
  // prompting: 用户交互的地方（调用this.prompt()，将用户选择的值存在this.prompts）
  prompting() {
    this.log(
      yosay(
        `Welcome to the fabulous ${chalk.red(
          "generator-honor-demo"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "applicationName",
        message: "please input the application name:",
        required: true
      }
      /* {
        type: "confirm", // type: input | confirm | list
        name: "someAnswer",
        message: "Would you like to enable this option?",
        default: true, // default 设置默认值
        store: true // store 为 true，会将上次用户输入值作为新的 default 值，利用记住用户操作
      }, */

      // 测试模板：ejs
      /* {
        type: "input",
        name: "keywords",
        message: "please input the project keywords:",
        default: "javascript,plugin"
      } */
      /* {
        type: "list",
        name: "framework",
        message: "choose framework:",
        choices: ["vue", "react", "typescript"],
        default: "vue"
      } */
    ];

    return this.prompt(prompts).then(props => (this.props = props));
  }

  /* 执行自定义函数 */
  default() {
    // console.log("default....");
  }

  /*
    写文件
    重点关注 writing 方法中的 3 个方法：
      1：this.templatePath() 返回 template 文件夹下的地址
      2：this.destinationPath() 指定加工完成后文件的存放地址，一般是项目目录
      3：this.fs.copy()
      4：this.fs.copyTpl()
  */
  writing() {
    // !：注意：此处是 this.options
    const { typescript, ts } = this.options;

    const { applicationName } = this.props;

    const isTypescript = typescript || ts;
    const templateName = isTypescript ? "Typescript" : "Javascript";
    const pkg = isTypescript ? tspkg : jspkg;
    const path = templateName.toLowerCase();

    const variables = {
      templateName,
      applicationName,
      cmd: "pnpm", // yarn | npm run
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      nodeVersion: "16.13.1",
      packageManagerVersion: "包管理工具版本",
      packageManager: "pnpm" // isYarn ? 'yarn' : 'npm',
    };

    this.fs.copy(
      this.templatePath(`${path}/**/*`),
      this.destinationPath(applicationName),
      {
        globOptions: {
          dot: true, // 是否支持点 开头的文件
          ignore: [
            "**/node_modules",
            "**/package.json",
            "**/package-lock.json",
            "**/yarn.lock",
            "**/index.html",
            "**/README.md",
            "**/.gitignore.sample",
            "**/.npmignore"
          ]
        }
      }
    );

    // Git 忽略项配置
    this.fs.copy(
      this.templatePath(`${path}/.gitignore.sample`),
      this.destinationPath(applicationName, ".gitignore")
    );

    // 写入 package.json
    this._writingFile(
      this.templatePath("common/package.json.template"),
      this.destinationPath(applicationName, "package.json"),
      variables
    );

    // 写入 README.md
    this._writingFile(
      this.templatePath("common/README.md.template"),
      this.destinationPath(applicationName, "README.md"),
      variables
    );

    // 写入 index.html
    this._writingFile(
      this.templatePath("common/index.html.template"),
      this.destinationPath(applicationName, "index.html"),
      variables
    );

    // console.log(process.argv); // eg: yo honor-demo --ts => ['path node.exe', 'xx', 'honor-demo', '--ts']
  }

  _writingFile(templatePath, destinationPath, params) {
    if (!this.fs.exists(destinationPath)) {
      this.fs.copyTpl(templatePath, destinationPath, params);
    }
  }

  _writingPackageJSON() {
    const { applicationName, keywords } = this.props;
    this.fs.copyTpl(
      this.templatePath("_package.json"),
      this.destinationPath("package.json"),
      {
        name: applicationName,
        keywords: keywords.split(",")
      }
    );
  }

  _writingSrc() {
    const { applicationName } = this.props;
    this.fs.copyTpl(
      this.templatePath("src/index.js"),
      this.destinationPath("scr/index.js"),
      {
        name: `${applicationName}-honor`,
        year: new Date().getFullYear()
      }
    );
  }

  install() {
    if (!this.options["skip-install"]) {
      // ... 借助 yarn | npm 安装依赖
    }
  }

  end() {
    const { applicationName } = this.props;
    this.log(
      chalk.yellow(`\n cd ${applicationName} \n pnpm install \n pnpm dev`)
    );
  }
};
