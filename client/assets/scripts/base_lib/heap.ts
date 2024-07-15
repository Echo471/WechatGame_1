/*-------------------------------------------------
	-----------------------------------------------
		容器：基于最大堆的优先级队列
		注意：
			1、元素插入时会设置heap_index和insertion_index
				HeapIndex（hi）是元素在堆数组中的索引，插入堆/堆内移动/从堆中移除时都需要维护，移除时置为-1！！！！！！！！！！
				InsertionIndex（ii）表示第几个插入这个堆的元素；相同优先级的，插入越早优先级越高；同时也用于比较函数，永远不会相等。
			2、默认越大优先级越高
				comparer是函数，参数是2个元素。如果前者比后者优先级高，返回1；如果后者比前者优先级高，返回-1；相同，返回0。
	-----------------------------------------------
	-----------------------------------------------*/
    enum HeapParam
    {
        InValidIndex = -1,
    }
    enum HeapCompareResult
    {
        LeftBigger = 0,
        RightBigger = 1,
        UnableJudge = 2,
    }
    enum CheckPriorityMethod
    {
        CPM_CUSTOM = 1,
        CPM_GREATER = 2,
        CPM_LESS = 3,
    }
    
    interface HeapItem
    {
        HeapIndex: number;
        InsertionIndex: number;
    }
    
    class Heap<T extends HeapItem> {
        private Array: Array<T> = new Array<T>();
        private ItemEverEnqueued: number = 0;
        private CheckPriorityFunc: (higher: T, lower: T) => boolean;
        private Comparer: (higher: T, lower: T) => HeapCompareResult;
    
        constructor(cpm: CheckPriorityMethod, comparer: ((higher: T, lower: T) => number))
        {
            switch (cpm)
            {
                case CheckPriorityMethod.CPM_CUSTOM:
                    this.CheckPriorityFunc = this.CheckPriorityByComparer;
                    this.Comparer = comparer;
                    break;
                case CheckPriorityMethod.CPM_GREATER:
                    this.CheckPriorityFunc = this.CheckPriorityByGreater;
                    break;
                case CheckPriorityMethod.CPM_LESS:
                    this.CheckPriorityFunc = this.CheckPriorityByLess;
                    break;
                default:
                    this.CheckPriorityFunc = this.CheckPriorityByGreater;
                    break;
            }
        }
    
        get Size(): number
        {
            return this.Array.length;
        }
    
        //返回最优先的元素
        Peek(): T
        {
            if (this.Array.length > 0)
            {
                return this.Array[0];
            }
            return null;
        }
    
        //插入（如果已经在队列，会变成更新）
        Enqueue(item: T): void
        {
            if (!item)
            {
                return;
            }
            if (item.HeapIndex < 0)
            {
                // 插入时设置
                item.HeapIndex = this.Array.push(item) - 1;
                item.InsertionIndex = ++this.ItemEverEnqueued;
            }
            this.UpdatePriorityByIndex(item.HeapIndex);
        }
    
        //移除最优先的
        Dequeue(): T
        {
            return this.RemoveByIndex(0);
        }
    
        //随意删除（根据元素）
        Remove(item: T): void
        {
            if (item && item.HeapIndex >= 0)
            {
                this.RemoveByIndex(item.HeapIndex);
            }
        }
    
        //随意删除（根据堆索引）
        private RemoveByIndex(index: number): T
        {
            if (!this.ValidIndex(index))
            {
                return null;
            }
            let item = this.Array[index];
            item.HeapIndex = HeapParam.InValidIndex;  // 移除置为不可用的下标
            if (index == this.Array.length - 1)
            {
                this.Array.pop();
            } else
            {
                let temp = this.Array.pop();
                temp.HeapIndex = index; // 移动时维护
                this.Array[index] = temp;
                this.UpdatePriorityByIndex(index);
            }
            return item;
        }
    
        //动态更新（根据堆索引）
        private UpdatePriorityByIndex(index: number): void
        {
            let parent = this.Parent(index);
            if (this.ValidIndex(parent) && this.CheckPriorityFunc(this.Array[index], this.Array[parent]))
            {
                this.CascadeUp(index);
            } else
            {
                this.CascadeDown(index);
            }
        }
    
        //交换
        private Swap(i: number, j: number): void
        {
            let item_i = this.Array[i];
            let item_j = this.Array[j];
            this.Array[i] = item_j;
            this.Array[j] = item_i;
            item_i.HeapIndex = j; // 移动时维护
            item_j.HeapIndex = i; // 移动时维护
        }
    
        //向上调整
        private CascadeUp(index: number)
        {
            let parent = this.Parent(index);
            while (this.ValidIndex(parent) && this.CheckPriorityFunc(this.Array[index], this.Array[parent]))
            {
                this.Swap(index, parent);
                index = parent;
                parent = this.Parent(index);
            }
        }
    
        //向下调整
        private CascadeDown(index: number)
        {
            let l;
            let r;
            let largest = index;
            while (true)
            {
                l = this.Left(index);
                r = this.Right(index);
                if (this.ValidIndex(l) && this.CheckPriorityFunc(this.Array[l], this.Array[largest]))
                {
                    largest = l;
                }
                if (this.ValidIndex(r) && this.CheckPriorityFunc(this.Array[r], this.Array[largest]))
                {
                    largest = r;
                }
                if (largest == index)
                {
                    break;
                }
                this.Swap(index, largest);
                index = largest;
            }
        }
    
        // 取父节点的索引
        private Parent(index: number): number
        {
            return Math.floor(0.5 * (index - 1));
        }
    
        // 取左子节点的索引
        private Left(index: number): number
        {
            return 2 * index + 1;
        }
    
        // 取右子节点的索引
        private Right(index: number): number
        {
            return 2 * index + 2;
        }
    
        private ValidIndex(index: number): boolean
        {
            if (index < 0 || index > this.Array.length - 1)
            {
                return false;
            }
            return true;
        }
    
        //根据元表进行优先级比较，越大优先级越高
        private CheckPriorityByGreater(higher: T, lower: T): boolean
        {
            if (higher > lower)
            {
                return true;
            } else if (higher < lower)
            {
                return false;
            } else
            {
                return higher.InsertionIndex < lower.InsertionIndex;
            }
        }
    
        //根据元表进行优先级比较，越小优先级越高
        private CheckPriorityByLess(higher: T, lower: T): boolean
        {
            if (higher < lower)
            {
                return true;
            } else if (higher > lower)
            {
                return false;
            } else
            {
                return higher.InsertionIndex < lower.InsertionIndex;
            }
        }
    
        //根据自定义比较函数进行优先级比较
        private CheckPriorityByComparer(higher: T, lower: T): boolean
        {
            let result = this.Comparer(higher, lower);
            if (result == HeapCompareResult.LeftBigger)
            {
                return true;
            }
            else if (result == HeapCompareResult.RightBigger)
            {
                return false;
            }
            else
            {
                return higher.InsertionIndex < lower.InsertionIndex;
            }
        }
    }