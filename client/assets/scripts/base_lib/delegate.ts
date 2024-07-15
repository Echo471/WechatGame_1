enum DelegatePriority
{
	Top = 0,
	Normal = 10000,
	Bottom = 20000,
}
class DelegateInfo
{
	private Func: Function;
	private ThisArg: any;
	private CallPriority: number = DelegatePriority.Normal;

	constructor(func: Function, thisArg: any, priority: number = DelegatePriority.Normal)
	{
		this.Func = func;
		this.ThisArg = thisArg;
		this.CallPriority = priority;
	}

	/**
	 * 执行回调。
	 * @param argArray 回调参数。
	 * @returns
	 */
	Call(...argArray: any[]): void
	{
		if (this.Func)
		{
			this.Func.call(this.ThisArg, ...argArray);
		}
	}

	/**
	 * 对比回调。
	 * @param func 方法。
	 * @param thisArg 参数。
	 * @returns boolean 是否一致
	 */
	Compare(func: Function, thisArg: any): boolean
	{
		if (this.Func == func && this.ThisArg == thisArg)
		{
			return true;
		}
		return false;
	}

	get Priority(): number
	{
		return this.CallPriority;
	}

	IsSame(other: DelegateInfo): boolean
	{
		return this.Func == other.Func && this.ThisArg == other.ThisArg;
	}
}

class MemberFunc
{
	private Func: Function;
	private ThisArg: any;
	private CallPriority = DelegatePriority.Normal;

	constructor(func: Function, thisArg: any, priority: DelegatePriority = DelegatePriority.Normal)
	{
		this.Func = func;
		this.ThisArg = thisArg;
		this.CallPriority = priority;
	}

	Call(...argArray: any[])
	{
		if (this.Func)
		{
			return this.Func.call(this.ThisArg, ...argArray);
		}
		return null;
	}

	get Priority(): number
	{
		return this.CallPriority;
	}

}

class TSuperDelegate<T extends (...args: any[]) => void>
{
	private PriorityList = new Array<Array<DelegateInfo>>();

	//private DelegateList: Array<DelegateInfo> = new Array<DelegateInfo>();
	private InCall: boolean = false;
	private RemoveList: Array<DelegateInfo> = new Array<DelegateInfo>();


	/**
	 * 绑定监听。
	 * @param func 方法。
	 * @param thisArg this参数。
	 * @param priority 优先级。
	 * @returns
	 */
	protected SuperAttach(func: T, thisArg: any, priority: number = DelegatePriority.Normal)
	{
		let delegate = new DelegateInfo(func, thisArg, priority);
		this.AddToPriorityList(delegate);
	}


	private AddToPriorityList(dele: DelegateInfo)
	{
		let priority = dele.Priority;

		let insertIndex = -1;
		for (let i = 0; i < this.PriorityList.length; i++)
		{
			let deles = this.PriorityList[i];
			strongAssert(deles.length != 0);//不允许空槽
			let slotPriority = deles[0].Priority;
			if (slotPriority == priority)
			{
				this.PriorityList[i].push(dele);
				return;
			}
			else if (slotPriority < priority)
			{
				continue;
			}
			else if (slotPriority > priority)
			{
				//找到插入位置
				insertIndex = i;
				break;
			}
		}
		if (insertIndex == -1)
		{
			this.PriorityList.push([dele]);
			return;
		}

		let left = this.PriorityList.splice(insertIndex);
		this.PriorityList.push([dele]);
		this.PriorityList.push(...left);
	}

	/**
	 * 移除监听。
	 * @param func 方法。
	 * @param thisArg this参数。
	 * @returns
	 */
	Remove(func: T, thisArg: any)
	{
		let delegate = new DelegateInfo(func, thisArg);
		this.RemoveDelegate(delegate);
	}

	RemoveDelegateInList(deleList: DelegateInfo[], deleteOne: DelegateInfo)
	{
		for (let index = deleList.length - 1; index >= 0; index--)
		{
			const curDele = deleList[index];
			if (curDele.IsSame(deleteOne))
			{
				if (this.InCall)
				{
					this.RemoveList.push(deleteOne);
					break;
				}
				else
				{
					deleList.remove(curDele);
				}
			}
		}
	}
	RemoveDelegate(delegate: DelegateInfo)
	{
		let delArray = new Array<number>();
		for (let index = this.PriorityList.length - 1; index >= 0; index--)
		{
			let deleList = this.PriorityList[index];
			this.RemoveDelegateInList(deleList, delegate);
			if (deleList.length == 0)
			{
				delArray.push(index);
			}
		}
		for (let nIndex of delArray)
		{
			// 删除nIndex位置的元素
			this.PriorityList.splice(nIndex, 1);
		}

	}

	/**
	 * 移除全部监听。
	 * @returns
	 */
	Clear()
	{
		if (this.InCall)
		{
			for (let deleList of this.PriorityList)
			{
				this.RemoveList = this.RemoveList.concat(deleList);
			}
		}
		else
		{
			// 清空this.PriorityList
			this.PriorityList.length = 0;
			//this.DelegateList.length = 0;
		}
	}

	/**
	 * 执行回调。
	 * @param argArray 回调参数。
	 * @returns
	 */
	Call(...argArray: Parameters<T>): void
	{
		this.InCall = true;

		for (const delegate of this.PriorityList)
		{
			for (const dele of delegate)
			{
				dele.Call(...argArray);
			}
		}

		this.InCall = false;
		for (const delegate of this.RemoveList)
		{
			this.RemoveDelegate(delegate);
		}
		this.RemoveList.length = 0;
	}
	AttachCount(): number
	{
		let count = 0;
		for (let deleList of this.PriorityList)
		{
			count += deleList.length;
		}
		return count;
	}
};

class TDelegate<T extends (...args: any[]) => void> extends TSuperDelegate<T>
{
	/**
	 * 绑定监听。
	 * @param func 方法。
	 * @param thisArg this参数。
	 * @param priority 优先级。
	 * @returns
	 */
	public Attach(func: T, thisArg: any, priority: number = DelegatePriority.Normal)
	{
		this.SuperAttach(func, thisArg, priority);
	}
}

class AutoDelegateInfo
{
	public Delegate: TSuperDelegate<any>;
	public Func: Function;
	public ThisArg: any;
	constructor(Delegate: TSuperDelegate<any>, func: Function, thisArg: any)
	{
		this.Delegate = Delegate;
		this.Func = func;
		this.ThisArg = thisArg;
	}
}

class TLogicDelegate<T extends (...args: any[]) => void> extends TSuperDelegate<T>
{
	/**
	 * 绑定监听。
	 * @param func 方法。
	 * @param thisArg this参数。
	 * @param priority 优先级。
	 * @returns
	 */
	public LogicAttach(func: T, thisArg: any, priority: number = DelegatePriority.Normal)
	{
		this.SuperAttach(func, thisArg, priority);
	}
}


class AutoDelegateMng
{
	private DelegateMap: Map<TSuperDelegate<any>, Array<AutoDelegateInfo>> = new Map<TSuperDelegate<any>, Array<AutoDelegateInfo>>();

	public BindEvent<T extends (...args: any[]) => void>(delegate: TDelegate<T>, func: T, thisArg: any, priority: number = DelegatePriority.Normal): void
	{
		delegate.Attach(func, thisArg, priority);
		let info = new AutoDelegateInfo(delegate, func, thisArg);
		if (!this.DelegateMap.has(delegate))
		{
			this.DelegateMap.set(delegate, []);
		}
		this.DelegateMap.get(delegate).push(info);
	}
	public BindLogicEvent<T extends (...args: any[]) => void>(delegate: TLogicDelegate<T>, func: T, thisArg: any, priority: number = DelegatePriority.Normal): void
	{
		delegate.LogicAttach(func, thisArg, priority);
		let info = new AutoDelegateInfo(delegate, func, thisArg);
		if (!this.DelegateMap.has(delegate))
		{
			this.DelegateMap.set(delegate, []);
		}
		this.DelegateMap.get(delegate).push(info);
	}

	public UnBindEvent<T extends (...args: any[]) => void>(delegate: TSuperDelegate<T>, func: T, thisArg: any): void
	{
		delegate.Remove(func, thisArg);
		let delegateInfos = this.DelegateMap.get(delegate);
		if (delegateInfos)
		{
			for (let i = 0; i < delegateInfos.length; i++)
			{
				if (delegateInfos[i].Func == func && delegateInfos[i].ThisArg == thisArg)
				{
					delegateInfos.splice(i, 1);
					break;
				}
			}
		}
	}
	public UnBindAllEvent(): void
	{
		for (let [delegate, delegateInfos] of this.DelegateMap)
		{
			for (let info of delegateInfos)
			{
				info.Delegate.Remove(info.Func, info.ThisArg);
			}
		}
		this.DelegateMap.clear();
	}
}
/* 使用示例

class TempCustomClass
{

	readonly OnChangeUI = new TDelegate<(param1: string, param2: number) => void>();

	//监听侧
	private CustomFun()
	{

		this.OnChangeUI.Attach(this.ChangeUI, this);
		this.OnChangeUI.Remove(this.ChangeUI, this);

	}

	private ChangeUI(param1: string, param2: number): void
	{
	}


	//执行侧
	private CustomFun2()
	{
		let param1 = "test";
		let param2 = 0;
		this.OnChangeUI.Call(param1, param2);
	}

}

*/