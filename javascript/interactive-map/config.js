const config = (()=>{
    const K_APIKEY = "apikey";
    const K_IPID = "ipid";
    let _config ={};
    _config.APIKEY = localStorage.getItem(K_APIKEY);
    if (!_config.APIKEY) {
        localStorage.setItem(K_APIKEY, prompt("Your HERE APIKEY"));
        _config.APIKEY = localStorage.getItem(K_APIKEY);
    };
    _config.IDENTITY_POOL_ID = localStorage.getItem(K_IPID);
    if (!_config.IDENTITY_POOL_ID) {
        localStorage.setItem(K_IPID, prompt("Your AWS Identity Pool ID"));
        _config.IDENTITY_POOL_ID = localStorage.getItem(K_IPID);
    };
    return _config;
})();