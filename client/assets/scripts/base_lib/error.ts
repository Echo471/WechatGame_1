class CustomError
{
	private error: Error = null;

	constructor() 
	{
		if (!Log.CheckLogLevelEnabled(ELogLevel.DEBUG))
		{
			return;
		}
		this.error = new Error();
	}

	get stack(): string
	{
		if (this.error)
		{
			return this.error.stack;
		}
		return null;
	}
}