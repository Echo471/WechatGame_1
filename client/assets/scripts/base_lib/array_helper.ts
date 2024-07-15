interface Array<T>
{
	remove(value: T): number;
	shuffle(): void;
}

Array.prototype.remove = function <T>(
	this: T[], value: T
): number
{
	for (let index = 0; index < this.length; index++)
	{
		const element = this[index];
		if (element == value)
		{
			this.splice(index, 1);
			return index;
		}
	}
	return -1;
};

Array.prototype.shuffle = function <T>(
	this: T[]
): void
{
	for (let i = this.length - 1; i > 0; i--) 
	{
		const j = Math.floor(Math.random() * (i + 1));
		[this[i], this[j]] = [this[j], this[i]];
	}
}
function IsArrayNullOrEmpty<T>(testArray: Array<T>)
{
	if(null == testArray)
	{
		return true;
	}
	
	return testArray.length == 0;
}

function IsSetNullOrEmpty<T>(testSet: Set<T>)
{
	if(null == testSet)
	{
		return true;
	}

	return testSet.size == 0;
}
function IsStringNullOrEmpty<T>(testString: string)
{
	if(null == testString)
	{
		return true;
	}

	if("" == testString)
	{
		return true;
	}

	return false;
}
