const enum TimerConst
{
	UnlimitedExecution = -1,
}

class Timer
{
	private EventQueue: Heap<TimerEvent<CustomFunc>> = new Heap(CheckPriorityMethod.CPM_CUSTOM, TimerEvent.PriorityComparer);
	private NewEventList: Array<TimerEvent<CustomFunc>> = new Array();
	private DelEventList: Array<TimerEvent<CustomFunc>> = new Array();
	private CurTime = 0;
	/**
	 * 简单通过一个lambda表达式启动一个定时任务
	 * @param delayMS 延迟时间
	 * @param lambda lambda表达式
	 * @param argArray 
	 * @returns 
	 */
	public AddLambda<T extends CustomFunc>(delayMS: number, lambda: T, ...argArray: Parameters<T>): TimerEvent<T>
	{
		return this.AddLambdaTimes(delayMS, 1, lambda, ...argArray);
	}
	/**
	 * 通过一个lambda表达式启动多次的定时任务
	 * @param delayMS 延迟时间
	 * @param times 重复次数，传-1时会无限执行直到取消
	 * @param lambda lambda表达式
	 * @param argArray 参数列表
	 * @returns 
	 */
	public AddLambdaTimes<T extends CustomFunc>(delayMS: number, times: number, lambda: T, ...argArray: Parameters<T>): TimerEvent<T>
	{
		let event = new TimerEvent<T>();
		event.InitByLambda(this.GetCurTime(), delayMS, times, lambda, ...argArray);
		this.NewEventList.push(event);
		return event;
	}
	/**
	 * 通过一个成员函数启动一次的定时任务
	 * @param delayMS 延迟时间
	 * @param func 成员函数
	 * @param thisArg 实例
	 * @param argArray 参数列表
	 * @returns 
	 */
	public AddEvent<T extends CustomFunc>(delayMS: number, func: T, thisArg: any, ...argArray: Parameters<T>): TimerEvent<T>
	{
		return this.AddEventTimes(delayMS, 1, func, thisArg, ...argArray);
	}
	/**
	 * 通过一个成员函数启动多次的定时任务
	 * @param delayMS 延迟时间
	 * @param times 执行次数 传-1时会无限执行直到取消
	 * @param func 成员函数
	 * @param thisArg 实例
	 * @param argArray 参数列表
	 * @returns 
	 */
	public AddEventTimes<T extends CustomFunc>(delayMS: number, times: number, func: T, thisArg: any, ...argArray: Parameters<T>): TimerEvent<T>
	{
		let event = new TimerEvent<T>();
		event.InitByMemberFunction(this.GetCurTime(), delayMS, times, func, thisArg, ...argArray);
		this.NewEventList.push(event);
		return event;
	}
	/**
	 * 取消对应的定时任务
	 * @param event 任务
	 */
	public CancelEvent(event: TimerEvent<CustomFunc>): void
	{
		if (this.NewEventList.remove(event) == TimerConst.UnlimitedExecution)
		{
			this.DelEventList.push(event);
		}
	}

	/**
	 * 驱动更新计时器，其他地方不要update
	 * @returns 
	 */
	public Update(): void
	{
		//处理新增
		if (this.NewEventList.length > 0)
		{
			for (const event of this.NewEventList)
			{
				this.EventQueue.Enqueue(event);
			}
			this.NewEventList.splice(0); // clear
		}
		//处理删除
		if (this.DelEventList.length > 0)
		{
			for (const event of this.DelEventList)
			{
				this.EventQueue.Remove(event);
			}
			this.DelEventList.splice(0); // clear
		}

		let queue = this.EventQueue;
		let currentTime = this.GetCurTime();

		while (true)
		{
			let event = queue.Peek();
			if (!event || event.NextExecutionTime > currentTime)
			{
				return;
			}
			queue.Dequeue();
			if (event.IsInFiniteExecution())
			{
				event.Call(...event.InArgArray);
				
				event.Reset(currentTime);
				this.NewEventList.push(event);
			}
			else if (event.CanReduceTimes())
			{

				event.Call(...event.InArgArray);
				event.ReduceTimes();
				event.Reset(currentTime);
				this.NewEventList.push(event);
			}

		}
	}
	public SetCurTime(curTimeMS: number): void
	{
		this.CurTime = curTimeMS;
	}
	protected GetCurTime(): number
	{
		return this.CurTime;
	}
	
	public ClearAll()
	{
		this.NewEventList.splice(0);
		for (const event of this.DelEventList)
		{
			this.EventQueue.Remove(event);
		}

		let peekEvent = this.EventQueue.Peek();
		while (null != peekEvent)
		{
			this.CancelEvent(peekEvent);
			this.EventQueue.Dequeue();
			peekEvent = this.EventQueue.Peek();
		}
	}
}

class TimerEvent<T extends CustomFunc> implements HeapItem
{
	public HeapIndex: number;
	public InsertionIndex: number;
	public NextExecutionTime: number; // 下次执行的时间
	public InArgArray: Parameters<T>;

	private Times: number;
	private AddTime: number; // 进入队列的时间
	private DelayMs: number;
	private Delegate: TDelegate<T>;
	
	public OnAfterCall: (timer: TimerEvent<T>)=>void = null;

	InitByMemberFunction(currentTimeMs: number, delayMS: number, times: number, func: T, thisArg: any, ...argArray: Parameters<T>)
	{
		this.Times = times;
		this.DelayMs = delayMS;
		this.Delegate = new TDelegate<T>();
		this.Delegate.Attach(func, thisArg);
		this.InArgArray = argArray;
		this.Reset(currentTimeMs);
	}
	InitByLambda(currentTime: number, delayMS: number, times: number, func: T, ...argArray: Parameters<T>)
	{
		this.Times = times;
		this.DelayMs = delayMS;
		this.Delegate = new TDelegate<T>();
		this.Delegate.Attach(func, null);
		this.InArgArray = argArray;
		this.Reset(currentTime);
	}

	Reset(currentTime: number): void
	{
		this.HeapIndex = -1;
		this.InsertionIndex = -1;
		this.AddTime = currentTime;
		this.NextExecutionTime = currentTime + this.DelayMs;
	}

	public IsInFiniteExecution(): boolean
	{
		if (this.Times == TimerConst.UnlimitedExecution)
		{
			return true;
		}
		return false;
	}
	public CanReduceTimes(): boolean
	{
		if (this.Times > 0)
		{
			return true;
		}
		return false;
	}

	public ReduceTimes(): void
	{
		if (this.Times == TimerConst.UnlimitedExecution)
		{
			return;
		}
		lightAssert(this.Times > 0, "定时任务当前执行次数不足以减少执行次数", this.Times);
		--this.Times;
	}

	Call(...argArray: Parameters<T>): void
	{
		this.Delegate.Call(...argArray);
		
		if(this.OnAfterCall != null)
		{
			this.OnAfterCall(this);
		}

	}

	static PriorityComparer<T1 extends CustomFunc, T2 extends CustomFunc>(a: TimerEvent<T1>, b: TimerEvent<T2>): HeapCompareResult
	{
		if (a.NextExecutionTime < b.NextExecutionTime)
		{
			return HeapCompareResult.LeftBigger;
		} else if (a.NextExecutionTime > b.NextExecutionTime)
		{
			return HeapCompareResult.RightBigger;
		} else
		{
			return HeapCompareResult.UnableJudge;
		}
	}
}