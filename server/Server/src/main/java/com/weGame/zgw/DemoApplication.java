package com.weGame.zgw;

import com.iohao.game.action.skeleton.core.doc.BarSkeletonDoc;
import com.iohao.game.external.core.netty.simple.NettySimpleHelper;

import java.util.List;

public class DemoApplication {
    public static void main(String[] args) {

        // 游戏对外服端口
        int port = 10100;

        // 逻辑服
        var demoLogicServer = new DemoLogicServer();

        // 启动游戏对外服、Broker（游戏网关）、游戏逻辑服
        // 这三部分在一个进程中相互使用内存通信
        NettySimpleHelper.run(port, List.of(demoLogicServer));

        // 生成对接文档
        BarSkeletonDoc.me().buildDoc();
    }
}