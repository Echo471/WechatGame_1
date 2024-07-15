declare let console_org: Console;

enum BuildVersion//构建版本
{
	Debug = 0,
	Release = 1, //
}

enum ELogLevel
{
	NOLOG = 0,
	ERROR = 1,
	WARN = 2,
	INFO = 3,
	DEBUG = 4,
}

class ILogMonitor
{
	ThrowException(msg: string)
	{

	}
}

function lightAssert(condition: boolean, ...params: any[])
{
	if (GameConst.DebugVersion != BuildVersion.Release) //临时使用这条来作为是否是发布版的判断
	{
		if (!Log.LogMonitor && !Log.CheckLogLevelEnabled(ELogLevel.ERROR))
		{
			return;
		}
		if (condition)
		{
			return;
		}
		let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...params]);
		let error = new Error();
		str += error.stack;
		Log.error(str);
		Log.LogMonitor.ThrowException(str);
	}
}

function strongAssert(condition: boolean, ...params: any[])
{
	if (condition)
	{
		return;
	}
	let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...params]);
	let error = new Error();
	str += "\n" + error.stack;
	Log.error(str);
	Log.LogMonitor.ThrowException(str);
}

class Log
{
    static LogLevel: ELogLevel = ELogLevel.DEBUG;
	static LogMonitor: ILogMonitor = null;

	static Init(LogMonitor: ILogMonitor)
	{
		Log.LogMonitor = LogMonitor;
	}

	static CheckLogLevelEnabled(logLevel: ELogLevel)
	{
		return GameConst.LogLevel >= logLevel;
	}

    
	static debug(...args: any[])
	{
		if (!Log.CheckLogLevelEnabled(ELogLevel.DEBUG))
		{
			return;
		}
		let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...args]);
		console_org.debug(str);
	}

	static info(...args: any[])
	{
		if (!Log.CheckLogLevelEnabled(ELogLevel.INFO))
		{
			return;
		}
		let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...args]);
		console_org.info(str);
	}

	static warn(...args: any[])
	{
		if (!Log.CheckLogLevelEnabled(ELogLevel.WARN))
		{
			return;
		}
		let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...args]);
		console_org.warn(str);
	}

    static error(...args: any[])
	{
        if (!Log.CheckLogLevelEnabled(ELogLevel.ERROR))
            {
                return;
            }
        let str = LogHelper.args2str([LogHelper.getFileAndLine(), '\t', ...args]);
        console_org.error(str);
    }
}

class LogHelper
{
	static getFileAndLine(): [string, string]
	{
		let e = new Error();
		let lines = e.stack.split('\n');
		let targetLine = lines[3].trim().replace("at ", "");
		let file = "", line = "";
		let tsIndex = targetLine.lastIndexOf(".ts:");
		if (tsIndex !== -1)
		{
			file = targetLine.substring(targetLine.lastIndexOf("/") + 1, targetLine.lastIndexOf(".ts") + 3);
			line = targetLine.substring(tsIndex + 4, targetLine.lastIndexOf(")"));
		}
		else
		{
			file = targetLine.substring(targetLine.lastIndexOf("\\") + 1, targetLine.lastIndexOf(".js") + 3);
			line = targetLine.substring(targetLine.lastIndexOf(".js:") + 4, targetLine.lastIndexOf(")"));
		}
		return [file, line];
	}

	static args2str(args: Array<any>)
	{
		return args.join(" ");
	}

	static args2Tlog(args: Array<any>)
	{
		return args.join("|");
	}	
}