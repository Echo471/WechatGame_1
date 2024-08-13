export abstract class SingleBase<T>
{

    static instance: any = null;

    public static GetInstance<T>(c: new () => T): T {
        if (SingleBase.instance == null) 
        {
            SingleBase.instance = new c();
            SingleBase.instance.OnInit();
        }
        return SingleBase.instance;
    }

    Release(): void 
    {
        if (SingleBase.instance != null) 
        {
            SingleBase.instance.OnRelease();
            SingleBase.instance = null;
        }
    }


    protected abstract OnInit(): void;

    protected abstract OnRelease(): void;
}