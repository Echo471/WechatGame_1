enum TaskState
{
	Running = 1,
	Suspend = 2,
	Stop = 3,
}

type CustomGenerator = Generator<CustomGenerator | number | null, void, void>;

class TaskContext
{
	private m_id: number;
	private m_stoppable: boolean;
	private m_state: TaskState = TaskState.Running;
	private m_stack: Array<CustomGenerator> = new Array<CustomGenerator>();
	private m_joinTasks: Set<number>;
	private m_joinedTaskID: number = 0;
	private m_taskManager: TaskManager = null;

	constructor(id: number, taskMng: TaskManager, co_func: CustomGenerator, stoppable: boolean)
	{
		this.m_id = id;
		this.m_stoppable = stoppable;
		this.m_stack.push(co_func);
		this.m_taskManager = taskMng;
	}

	public get ID(): number
	{
		return this.m_id;
	}
	public get Stoppable(): boolean
	{
		return this.m_stoppable;
	}
	public get JoinedTaskID(): number
	{
		return this.m_joinedTaskID;
	}

	public get State(): TaskState
	{
		return this.m_state;
	}
	public set State(state: TaskState)
	{
		this.m_state = state;
	}

	public *Join(id: number): CustomGenerator
	{
		let task = this.m_taskManager.FindTask(id);
		if (!task) return; //如果task是null，不阻塞
		if (!task.m_joinTasks)
		{
			task.m_joinTasks = new Set<number>();
		}
		task.m_joinTasks.add(this.m_id);
		this.m_joinedTaskID = id;
		yield this.m_taskManager.SuspendCurTask();
	}

	public RemoveJoinTask(id: number)
	{
		this.m_joinTasks.delete(id);
	}

	//return task是否还未完成
	Update(): boolean
	{
		while (this.m_stack.length > 0)
		{
			let cur_co_func = this.m_stack[this.m_stack.length - 1];
			let last_task = this.m_taskManager.CurTask; // 此task可能是被另外的task启动的，所以要保存下
			this.m_taskManager.CurTask = this;
			let next_res = cur_co_func.next();
			this.m_taskManager.CurTask = last_task;
			if (next_res.done)
			{
				this.m_stack.pop();
			}
			else
			{
				let yield_return = next_res.value;
				if (yield_return)
				{
					if (typeof yield_return == "number")
					{
						this.m_taskManager.WaitMs(this, yield_return);
					}
					else
					{
						this.m_stack.push(yield_return);
						continue;
					}
				}
				return true; // 释放控制权，等待下帧调用
			}
		}
		if (this.m_joinTasks && this.m_joinTasks.size > 0)
		{
			for (const id of this.m_joinTasks)
			{
				this.m_taskManager.ResumeTask(id);
			}
		}
		this.m_state = TaskState.Stop;

		return false;
	}
}

class TaskManager
{
	private static _instance: TaskManager = new TaskManager();

	private m_tasks: Map<number, TaskContext> = new Map<number, TaskContext>();
	private m_runnings: Array<number> = new Array<number>();
	private m_newRunnings: Array<number> = new Array<number>();
	private m_yieldEvents: Map<number, TimerEvent<() => void>> = new Map<number, TimerEvent<() => void>>();
	private m_cur_task: TaskContext = null;
	private m_seq: number = 0;
	private m_timer: Timer = null;
	private constructor()
	{
	}
	static Instance(): TaskManager
	{
		return TaskManager._instance;
	}

	public Init(timer: Timer): void
	{
		this.m_timer = timer;
	}

	public get CurTask(): TaskContext
	{
		return this.m_cur_task;
	}
	public set CurTask(cur_task: TaskContext)
	{
		this.m_cur_task = cur_task;
	}

	public Update(): void
	{
		if (this.m_newRunnings.length > 0)
		{
			for (const id of this.m_newRunnings)
			{
				this.m_runnings.push(id);
			}
			this.m_newRunnings.splice(0); // clear
		}
		if (this.m_runnings.length > 0)
		{
			let i = 0;
			while (i < this.m_runnings.length)
			{
				let id = this.m_runnings[i];
				let task = this.m_tasks.get(id);
				if (task)
				{
					if (task.Update())
					{
						if (task.State == TaskState.Running)
						{ // 如果被挂起，会从m_runnings删除（只有执行中的task不会被移除，需要增加i）
							++i;
						}
					} else
					{ // 执行完了
						this.m_tasks.delete(id);
						this.m_runnings.splice(i, 1);
					}
				} else
				{ // task已经找不到了
					this.m_runnings.splice(i, 1);
				}
			}
		}
	}

	public FindTask(id: number): TaskContext
	{
		return this.m_tasks.get(id);
	}

	//return task id
	public StartTask(co_func: CustomGenerator): number
	{
		return this.StartTaskInternal(co_func, false);
	}

	//return task id
	public StartStoppableTask(co_func: CustomGenerator): number
	{
		return this.StartTaskInternal(co_func, true);
	}

	// 只允许挂起自己，不能挂起其他task
	public *SuspendCurTask(): CustomGenerator
	{
		if (this.m_cur_task && this.m_cur_task.State == TaskState.Running)
		{
			this.SuspendTask(this.m_cur_task);
			yield;
		}
	}

	//return task是否还在运行
	public ResumeTask(id: number): boolean
	{
		let yieldEvent = this.m_yieldEvents.get(id);
		if (yieldEvent)
		{
			this.m_timer.CancelEvent(yieldEvent);
			this.m_yieldEvents.delete(id);
		}
		let task = this.m_tasks.get(id);
		if (task && task.State == TaskState.Suspend)
		{
			task.State = TaskState.Running;

			// //异步下帧执行
			// this.m_newRunnings.push(id);
			// return true;

			// 同步当帧执行（一次）
			if (task.Update())
			{
				if (task.State == TaskState.Running)
				{ // 有可能一执行就被挂起了，就不用放入m_newRunnings了
					this.m_newRunnings.push(id);
					return true;
				}
			}
			else
			{
				this.m_tasks.delete(id);
			}
		}
		return false;
	}

	public WaitMs(task: TaskContext, ms: number): void
	{
		let id = task.ID;
		let event = this.m_timer.AddLambda(ms, () =>
		{
			this.m_yieldEvents.delete(id);
			this.ResumeTask(id);
		});
		if (!event)
		{
			return;
		}
		if (!this.m_yieldEvents.has(id))
		{
			this.m_yieldEvents.set(id, event);
		} else
		{
			Log.error("TaskManager:ExpirationYield Error, Expiration Yield When Suspend");
		}
		this.SuspendTask(task);
	}

	public StopTaskUnSafe(id: number): boolean
	{
		let task = this.m_tasks.get(id);
		if (!task)
		{
			Log.error("StopTaskUnSafe Error, cannot find task,", id);
			return false;
		}
		if (!task.Stoppable)
		{
			Log.error("StopTaskUnSafe Error, task cannot stop,", id);
			return false;
		}

		let yieldEvent = this.m_yieldEvents.get(id);
		if (yieldEvent)
		{
			this.m_timer.CancelEvent(yieldEvent);
			this.m_yieldEvents.delete(id);
		}

		//从join的task里移除
		let joinedTask = this.m_tasks.get(task.JoinedTaskID);
		if (joinedTask)
		{
			joinedTask.RemoveJoinTask(id);
		}

		task.State = TaskState.Stop;
		this.m_tasks.delete(id);
		this.m_newRunnings.remove(id);

		return true;
	}

	private StartTaskInternal(co_func: CustomGenerator, stoppable: boolean): number
	{
		let new_task = new TaskContext(++this.m_seq, this, co_func, stoppable);
		let e = new CustomError();
		Log.debug("[task] StartTask ",new_task.ID," ",e.stack);
		if (new_task.Update())
		{
			this.m_tasks.set(new_task.ID, new_task);
			if (new_task.State == TaskState.Running)
			{ // 有可能一执行就被挂起了，就不用放入m_newRunnings了
				this.m_newRunnings.push(new_task.ID);
			}
		}
		return new_task.ID;
	}

	private SuspendTask(task: TaskContext): void
	{
		this.m_runnings.remove(task.ID);
		this.m_newRunnings.remove(task.ID);
		task.State = TaskState.Suspend;
	}
}

//region全局方法
/**
 * 启动一个协程
 * @param co_func 启动一个Generator的函数
 * @returns 
 */
function StartTask(co_func: CustomGenerator): number
{
	return TaskManager.Instance().StartTask(co_func);
}
/**
 * 返回一个协程id
 * @returns 协程id
 */
function GetCurTaskId(): number
{
	let task = TaskManager.Instance().CurTask;
	return task ? task.ID : 0;
}

/**
 * 挂起当前协程
 */
function* SUSPEND(): CustomGenerator
{
	yield TaskManager.Instance().SuspendCurTask();
}

/**
 * 重启对应id的协程
 * @param id 协程id
 * @returns 是否成功挂起协程
 */
function RESUME(id: number): boolean
{
	return TaskManager.Instance().ResumeTask(id);
}

/**
 * 将当前协程设置为等待child协程执行完毕
 * @param child 需要等待的协程id
 */
function* JOIN(child: number): CustomGenerator
{
	let task = TaskManager.Instance().CurTask;
	if (task)
	{
		yield task.Join(child);
	}
}
 //endregion