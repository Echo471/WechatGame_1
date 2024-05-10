package com.weGame.zgw;

import com.baidu.bjf.remoting.protobuf.annotation.ProtobufClass;

/**
 * @BelongsProject: server
 * @BelongsPackage: com.weGame.zgw
 * @author: link_g
 * @date: 2024/5/10 22:04
 * @Description:
 */
@ProtobufClass
public class HelloReq {
    public String name;

    @Override
    public String toString() {
        return "HelloReq{name='"+ name  + "'}";
    }
}