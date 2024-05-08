export class SingleBase<T>{

    static instance: any = null;

    public static GetInstance<T>(c: new () => T): T {
        if (SingleBase.instance == null) {
            SingleBase.instance = new c();
        }
        return SingleBase.instance;
    }
}