var keccak = require('keccak');
var { VOID_ETHEREUM_ADDRESS, abi, VOID_BYTES32, blockchainCall, sendBlockchainTransaction, compile, deployContract, abi, MAX_UINT256, web3Utils, fromDecimals, toDecimals } = require('@ethereansos/multiverse');

async function compileWithCreatorAndInitializer(path, name, version) {
    var Creator = await compile('@ethereansos/swissknife/contracts/lib/Creator');

    var path1 = Creator.ast.absolutePath + ":" + Creator.name;
    var key1 = '__$' + keccak('keccak256').update(path1).digest().toString('hex').slice(0, 34) + '$__';

    var Initializer = await compile('@ethereansos/swissknife/contracts/lib/Initializer');
    Initializer.bin = Initializer.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2));

    var path2 = Initializer.ast.absolutePath + ":" + Initializer.name;
    var key2 = '__$' + keccak('keccak256').update(path2).digest().toString('hex').slice(0, 34) + '$__';

    var Contract = await compile(path, name, version);
    Contract.bin = Contract.bin.split(key1).join(web3.currentProvider.knowledgeBase.Creator.substring(2)).split(key2).join(web3.currentProvider.knowledgeBase.Initializer.substring(2));

    return Contract;
}

async function getHardcabledInfoData(addr, method) {
    if(!method) {
        return await Promise.all([
            getHardcabledInfoData(addr, "LABEL"),
            getHardcabledInfoData(addr, "uri")
        ]);
    }
    try {
        var data = await web3.eth.call({
            to : addr,
            data : web3Utils.sha3(method + '()').substring(0, 10)
        });
        var result = abi.decode(["string"], data)[0];
        return result;
    } catch(e) {
        console.log(addr, method, e.message);
    }
    return method;
}

function fillWithZeroes(data, limit) {
    limit = limit || 66
    data = data.startsWith('0x') ? data : ('0x' + data);
    while(data.length < limit) {
        data += '0';
    }
    return data;
}

module.exports = {
    compileWithCreatorAndInitializer,
    getHardcabledInfoData,
    fillWithZeroes
}