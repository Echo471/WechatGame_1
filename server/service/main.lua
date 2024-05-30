local skynet = require "skynet"
local runconfig = require "run_config"

skynet.start(function()
    --初始化
    skynet.error(runconfig.agentmgr.node)
    --退出自身
    skynet.exit()
end)
 