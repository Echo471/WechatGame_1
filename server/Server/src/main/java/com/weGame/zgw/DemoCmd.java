package com.weGame.zgw;

/**
 * @BelongsProject: server
 * @BelongsPackage: com.weGame.zgw
 * @author: link_g
 * @date: 2024/5/10 22:05
 * @Description:
 */
public interface DemoCmd {
    /** 主路由 */
    int cmd = 1;
    /** 子路由 here */
    int here = 0;
    /** 子路由 jackson */
    int jackson = 1;
    /** 子路由 list */
    int list = 2;
}