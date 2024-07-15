enum Const
{

}

enum ConstStr
{

}

class GameConst
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