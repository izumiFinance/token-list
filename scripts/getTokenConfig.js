const fs = require("fs");
const path = require("path");

const HOST_URL =
  "https://raw.githubusercontent.com/meterio/bridge-tokens/master";
const LOGOS_DIR = "data/resource-logos";

const ETH_TITLE = {
  address: "Ethereum Token Address",
  name: "Ethereum Token Name",
  symbol: "Ethereum Token Symbol",
  resourceId: "Resource ID",
  nativeDecimals: "Ethereum Token Decimals",
};

const METER_TITLE = {
  address: "Meter Token Address",
  name: "Meter Token Name",
  symbol: "Meter Token Symbol",
  resourceId: "Resource ID",
};

const BSC_TITLE = {
  address: "BSC Token Address",
  name: "BSC Token Name",
  symbol: "BSC Token Symbol",
  resourceId: "Resource ID",
  tokenProxy: "BSC Token Proxy",
};

/**
 * copy logo from resource-logos to destDir
 * @param {array} resourceLogoDirs
 * @param {string} resourceId
 * @param {string} destDir
 */
const copy = (resourceLogoDirs, resourceId, destDir) => {
  if (resourceLogoDirs.includes(resourceId)) {
    const readPath = path.join(
      __dirname,
      "..",
      "data/resource-logos",
      resourceId,
      "logo.png"
    );
    const writePath = path.join(__dirname, "..", destDir);

    // if write directory does not exist then mkdir
    const isDirExists = fs.existsSync(writePath);
    isDirExists || fs.mkdirSync(writePath);

    if (!isDirExists) {
      console.log("path: ", writePath, " doesnt exists, will make this dir.");
    } else {
      console.log("path: ", writePath, " exists, skip make.");
    }

    // if logo.png does not exist then copy
    const logoPath = path.join(writePath, "logo.png");
    const isLogoExists = fs.existsSync(logoPath);
    if (!isLogoExists) {
      console.log("logo: ", logoPath, " doesnt exists, will write logo in.");
      const logo = fs.readFileSync(readPath);
      fs.writeFileSync(logoPath, logo);
    } else {
      console.log("logo: ", logoPath, " exists, skip write logo.");
    }
  } else {
    throw new Error(
      "can not find the " + resourceId + " directory in data/resource-logos"
    );
  }
};
/**
 * copy token logo
 * @param {obj[]} tokenMappings
 * @param {[]} resourceLogoDirs
 */
const copyTokenLogo = (tokenMappings, resourceLogoDirs) => {
  tokenMappings.forEach((item) => {
    const resource_id = item["Resource ID"];

    if (item[ETH_TITLE.address] !== "") {
      const eth_dist_dir =
        "tokens/eth/" + item[ETH_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, eth_dist_dir);
    }

    if (item[METER_TITLE.address] !== "") {
      const meter_dist_dir =
        "tokens/meter/" + item[METER_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, meter_dist_dir);
    }

    if (item[BSC_TITLE.address] !== "") {
      const bsc_dist_dir =
        "tokens/bsc/" + item[BSC_TITLE.address].toLowerCase();
      copy(resourceLogoDirs, resource_id, bsc_dist_dir);
    }
  });
};

const loadTokenMappings = () => {
  const pre = path.join(__dirname, "..", "data/token_mappings");
  const tokenListPath = path.join(pre, "token-list.json");
  const tokenList = JSON.parse(fs.readFileSync(tokenListPath));

  const mappings = [];
  for (const token of tokenList) {
    const tokenPath = path.join(pre, `${token}.json`);
    const data = JSON.parse(fs.readFileSync(tokenPath));
    mappings.push(data);
  }

  return mappings;
};

function main() {
  const token_mappings = loadTokenMappings();

  const eth = generate(token_mappings, ETH_TITLE);
  const meter = generate(token_mappings, METER_TITLE);
  const bsc = generate(token_mappings, BSC_TITLE);

  const tokens = {
    ETH: eth.data,
    MTR: meter.data,
    BNB: bsc.data,
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "tokens.json"),
    JSON.stringify(tokens, null, 2)
  );
  console.log("generate tokens.json success.");

  fs.writeFileSync(
    path.join(__dirname, "..", "eth.json"),
    JSON.stringify(eth, null, 2)
  );
  console.log("generate eth.json success.");

  fs.writeFileSync(
    path.join(__dirname, "..", "meter.json"),
    JSON.stringify(meter, null, 2)
  );
  console.log("generate meter.json success.");

  fs.writeFileSync(
    path.join(__dirname, "..", "bsc.json"),
    JSON.stringify(bsc, null, 2)
  );
  console.log("generate bsc.json success.");

  // get resourceId directories
  const resource_logo_dirs = fs.readdirSync(
    path.join(__dirname, "..", "data/resource-logos")
  );

  copyTokenLogo(token_mappings, resource_logo_dirs);
}

main();

/**
 * generate json by mapping and title
 * @param {obj[]} mappings
 * @param {obj} title
 * @returns obj
 */
function generate(mappings, title) {
  let tokens = { data: [] };
  mappings.forEach((item) => {
    let o = {
      address: item[title.address],
      name: item[title.name],
      symbol: item[title.symbol],
      imageUri:
        HOST_URL +
        "/" +
        LOGOS_DIR +
        "/" +
        item[title.resourceId] +
        "/" +
        "logo.png",
      native: false,
      resourceId: item[title.resourceId],
    };
    if (!o.address && !o.name && !o.symbol) {
      // no name, address and symbol, skip
      return;
    }
    if (o.symbol === "ETH") {
      o.native = true;
      o.nativeDecimals = item[title.nativeDecimals];
    }
    if (o.symbol === "UTU") {
      o.tokenProxy = item[title.tokenProxy];
    }
    tokens.data.push(o);
  });

  return tokens;
}