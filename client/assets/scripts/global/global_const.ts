import { ELogLevel, BuildVersion } from "../define/log_define";

export enum Const
{

}

export enum ConstStr
{

}

export class GameConst
{
	private static logLevel: ELogLevel = undefined;

    static get LogLevel(): ELogLevel
    {
        return GameConst.logLevel;
    }
    
	static get DebugVersion()
	{
		return BuildVersion.Debug;
	}
}