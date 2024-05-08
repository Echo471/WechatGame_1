import { _decorator, Component, log, Node } from 'cc';
import { SingleBase } from './util/single_base';

export class GameMgr extends SingleBase<GameMgr> {
    public InitGame() {
        log("GameMgr InitGame");
    }

    public EndGame() {
    }
}


