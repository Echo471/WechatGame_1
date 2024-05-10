package com.weGame.zgw;

import com.iohao.game.action.skeleton.annotation.ActionController;
import com.iohao.game.action.skeleton.annotation.ActionMethod;
import com.iohao.game.action.skeleton.core.exception.MsgException;

import java.util.List;
import java.util.stream.IntStream;

/**
 * @BelongsProject: server
 * @BelongsPackage: com.weGame.zgw
 * @author: link_g
 * @date: 2024/5/10 22:05
 * @Description:
 */
@ActionController(DemoCmd.cmd)
public class DemoAction {
    /**
     * 示例 here 方法
     *
     * @param helloReq helloReq
     * @return HelloReq
     */
    @ActionMethod(DemoCmd.here)
    public HelloReq here(HelloReq helloReq) {
        HelloReq newHelloReq = new HelloReq();
        newHelloReq.name = helloReq.name + ", I'm here ";
        return newHelloReq;
    }

    /**
     * 示例 异常机制演示
     *
     * @param helloReq helloReq
     * @return HelloReq
     * @throws MsgException e
     */
    @ActionMethod(DemoCmd.jackson)
    public HelloReq jackson(HelloReq helloReq) {
        String jacksonName = "jackson";
        if (!jacksonName.equals(helloReq.name)) {
            throw new MsgException(100, "异常机制测试，name 必须是 jackson !");
        }

        helloReq.name = helloReq.name + ", hello, jackson !";

        return helloReq;
    }

    /**
     * 示例 返回 List 数据
     *
     * @return list
     */
    @ActionMethod(DemoCmd.list)
    public List<HelloReq> list() {
        // 得到一个 List 列表数据，并返回给请求端
        return IntStream.range(1, 5).mapToObj(id -> {
            HelloReq helloReq = new HelloReq();
            helloReq.name = "data:" + id;
            return helloReq;
        }).toList();
    }
}